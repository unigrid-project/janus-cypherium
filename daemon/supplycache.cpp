// Copyright (c) 2018-2019 The UNIGRID organization
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "supplycache.h"
#include "primitives/block.h"
#include "clientversion.h"
#include "hash.h"
#include "spork.h"
#include "streams.h"
#include "util.h"
#include "uint256.h"

CCriticalSection cs_supplycache;

void SupplyCache::Initialize()
{
	LOCK(cs_supplycache);
    pathDB = GetDataDir() / "supplycache.dat";
    strMagicMessage = "SupplyCache";
    RefreshReferenceBlackList();

    CTxDestination oldDevAddress;
    ExtractDestination(CScript() << ParseHex(Params().OldDevPubKey().c_str()) << OP_CHECKSIG, oldDevAddress);

    CTxDestination devAddress;
    ExtractDestination(CScript() << ParseHex(Params().DevPubKey().c_str()) << OP_CHECKSIG, devAddress);

    governanceAddresses.insert(CBitcoinAddress(oldDevAddress));
    governanceAddresses.insert(CBitcoinAddress(devAddress));

    // Extra
    governanceAddresses.insert(CBitcoinAddress("H7bEB2nv8PADro1iLmdrCBRH7GwP4anUXi"));
}

bool SupplyCache::IsInitialized()
{
    return !pathDB.empty();
}

bool SupplyCache::HasReferenceList()
{
    return !blacklistedAddresses.empty();
}

void SupplyCache::RefreshReferenceBlackList()
{
    blacklistedAddresses.clear();

    if (IsSporkActive(SPORK_18_BLACKLIST_BLOCK_REFERENCE)) {
        CBlock referenceBlock;
        sporkValue = GetSporkValue(SPORK_18_BLACKLIST_BLOCK_REFERENCE);
        uint64_t sporkBlockValue = (sporkValue >> 16) & 0xffffffffffff; // 48-bit
        CBlockIndex *referenceIndex = chainActive[sporkBlockValue];

		if (referenceIndex != NULL) {
            assert(ReadBlockFromDisk(referenceBlock, referenceIndex));
            int sporkTransactionMask = sporkValue & 0xffff; // 16-bit

            // Create a list of all blacklisted addresses
            for (unsigned int i = 0; i < referenceBlock.vtx.size(); i++) {
                // The mask can support up to 16 transaction indexes (as it is 16-bit)
                if (((sporkTransactionMask >> i) & 0x1) != 0) {
                    for (unsigned int j = 0; j < referenceBlock.vtx[i].vout.size(); j++) {
                        CScript devScriptPubKey = CScript() << ParseHex(Params().ActiveDevPubKey().c_str()) << OP_CHECKSIG;

                        if (referenceBlock.vtx[i].vout[j].nValue > 0 && devScriptPubKey != referenceBlock.vtx[i].vout[j].scriptPubKey) {
                            CTxDestination address;
                            ExtractDestination(referenceBlock.vtx[i].vout[j].scriptPubKey, address);
                            blacklistedAddresses.insert(CBitcoinAddress(address));
                        }
                    }
                }
            }
        }
    }
}

void SupplyCache::AddBlackListed(CAmount amount)
{
	LOCK(cs_supplycache);
	blackListedSum += amount;
}

CAmount SupplyCache::GetBlackListedSum()
{
    return blackListedSum;
}

void SupplyCache::AddGovernance(CAmount amount)
{
	LOCK(cs_supplycache);
	governanceSum += amount;
}

CAmount SupplyCache::GetGovernanceSum()
{
    return governanceSum;
}

void SupplyCache::SumNonCirculatingAmounts(CBlock& block, CAmount& blackListedAmount, CAmount& governanceAmount)
{
    for (unsigned int i = 0; i < block.vtx.size(); i++) {
        /* receving addresses */
        for (unsigned int j = 0; j < block.vtx[i].vout.size(); j++) {
            CTxDestination address;
            ExtractDestination(block.vtx[i].vout[j].scriptPubKey, address);

            if (IsSporkActive(SPORK_18_BLACKLIST_BLOCK_REFERENCE) &&
                blacklistedAddresses.count(address) == 1) {
                blackListedAmount += block.vtx[i].vout[j].nValue;
            } else if (governanceAddresses.count(address) == 1) {
                governanceAmount += block.vtx[i].vout[j].nValue;
            }
        }

        /* spending addresses */
        for (unsigned int j = 0; j < block.vtx[i].vin.size(); j++) {
            CTransaction prevoutTx;
            uint256 prevoutHashBlock;

            if (GetTransaction(block.vtx[i].vin[j].prevout.hash, prevoutTx, prevoutHashBlock)) {
                CTxDestination address;
                ExtractDestination(prevoutTx.vout[block.vtx[i].vin[j].prevout.n].scriptPubKey, address);

                if (IsSporkActive(SPORK_18_BLACKLIST_BLOCK_REFERENCE) &&
                    blacklistedAddresses.count(address) == 1) {
                    blackListedAmount -= prevoutTx.vout[block.vtx[i].vin[j].prevout.n].nValue;
                } else if (governanceAddresses.count(address) == 1) {
                    governanceAmount -= prevoutTx.vout[block.vtx[i].vin[j].prevout.n].nValue;
                }
            }
        }
    }
}

void SupplyCache::SumNonCirculatingAmounts()
{
    {
        LOCK(cs_supplycache);
        blackListedSum = 0;
        governanceSum = 0;
    }

    RefreshReferenceBlackList();
    CBlock block;

    for (int i = 1; i < chainActive.Height(); i++) {
        ReadBlockFromDisk(block, chainActive[i]);
        {
            LOCK(cs_supplycache);
            SumNonCirculatingAmounts(block, blackListedSum, governanceSum);
        }
    }
}

bool SupplyCache::IsDirty()
{
	uint64_t v = 0;

    if (IsSporkActive(SPORK_18_BLACKLIST_BLOCK_REFERENCE)) {
        v = GetSporkValue(SPORK_18_BLACKLIST_BLOCK_REFERENCE);
    }

	return v != sporkValue;
}

bool SupplyCache::Write()
{
	LOCK(cs_supplycache);
    int64_t nStart = GetTimeMillis();

    // serialize, checksum data up to that point, then append checksum
    CDataStream ssObj(SER_DISK, CLIENT_VERSION);
    ssObj << strMagicMessage;
    ssObj << blackListedSum;
    ssObj << governanceSum;
    ssObj << sporkValue;

    uint256 hash = Hash(ssObj.begin(), ssObj.end());
    ssObj << hash;

    // open output file, and associate with CAutoFile
    FILE* file = fopen(pathDB.string().c_str(), "wb");
    CAutoFile fileout(file, SER_DISK, CLIENT_VERSION);

    if (fileout.IsNull()) {
        return error("%s : failed to open file %s", __func__, pathDB.string());
    }

    try {
        fileout << ssObj;
    } catch (std::exception& e) {
        return error("%s : serialize or I/O error - %s", __func__, e.what());
    }

    fileout.fclose();
    LogPrint("supplycache", "written info to supplycache.dat  %dms\n", GetTimeMillis() - nStart);
    return true;
}

SupplyCache::ReadResult SupplyCache::Read(CAmount& blackListedSum, CAmount& governanceSum, uint64_t& sporkValue)
{
    int64_t nStart = GetTimeMillis();

    // open input file, and associate with CAutoFile
    FILE* file = fopen(pathDB.string().c_str(), "rb");
    CAutoFile filein(file, SER_DISK, CLIENT_VERSION);

    if (filein.IsNull()) {
        error("%s : failed to open file %s", __func__, pathDB.string());
        return FileError;
    }

    // use file size to size memory buffer
    int fileSize = boost::filesystem::file_size(pathDB);
    int dataSize = fileSize - sizeof(uint256);

    // Don't try to resize to a negative number if file is small
    if (dataSize < 0) {
        dataSize = 0;
    }

    vector<unsigned char> vchData;
    vchData.resize(dataSize);
    uint256 hashIn;

    try {
        filein.read((char*)&vchData[0], dataSize);
        filein >> hashIn;
    } catch (std::exception& e) {
        error("%s : deserialize or I/O error - %s", __func__, e.what());
        return HashReadError;
    }

    filein.fclose();
    CDataStream ssObj(vchData, SER_DISK, CLIENT_VERSION);

    uint256 hashTmp = Hash(ssObj.begin(), ssObj.end());
    std::string strMagicMessageTmp;

    // verify stored checksum matches input data
    if (hashIn != hashTmp) {
        error("%s : checksum mismatch, data corrupted", __func__);
        return IncorrectHash;
    }

    try {
        ssObj >> strMagicMessageTmp;

        // verify the message matches predefined one
        if (strMagicMessage != strMagicMessageTmp) {
            error("%s : invalid supply cache magic message", __func__);
            return IncorrectMagicMessage;
        }

        ssObj >> blackListedSum;
        ssObj >> governanceSum;
        ssObj >> sporkValue;
    } catch (std::exception& e) {
        error("%s : deserialize or I/O error - %s", __func__, e.what());
        return IncorrectFormat;
    }

    LogPrint("supplycache","Loaded info from supplycache.dat  %dms\n", GetTimeMillis() - nStart);
    LogPrint("supplycache (blacklisted): ","  %ld\n", blackListedSum);
    LogPrint("supplycache (governance): ","  %ld\n", governanceSum);

    return Ok;
}

SupplyCache::ReadResult SupplyCache::Read()
{
	LOCK(cs_supplycache);
	return Read(blackListedSum, governanceSum, sporkValue);
}

