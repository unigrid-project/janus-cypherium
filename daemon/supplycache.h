// Copyright (c) 2018-2019 The UNIGRID organization
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#ifndef SUPPLY_CACHE_H
#define SUPPLY_CACHE_H

#include <boost/filesystem.hpp>
#include "amount.h"
#include "base58.h"
#include "primitives/block.h"

#define GOVERNANCE_SET

class SupplyCache
{
private:
    std::set<CBitcoinAddress> blacklistedAddresses;
    std::set<CBitcoinAddress> governanceAddresses;
    boost::filesystem::path pathDB;
    std::string strMagicMessage;
    CAmount blackListedSum;
    CAmount governanceSum;
    uint64_t sporkValue;

public:
    enum ReadResult {
        Ok,
        FileError,
        HashReadError,
        IncorrectHash,
        IncorrectMagicMessage,
        IncorrectFormat
    };

    void Initialize();
    bool IsInitialized();
    bool HasReferenceList();
    void RefreshReferenceBlackList();
    void AddBlackListed(CAmount amount);
    CAmount GetBlackListedSum();
    void AddGovernance(CAmount amount);
    CAmount GetGovernanceSum();
    void SumNonCirculatingAmounts(CBlock& block, CAmount& blackListedAmount, CAmount& governanceAmount);
    void SumNonCirculatingAmounts();
    bool IsDirty();
    bool Write();
    ReadResult Read(CAmount& blackListedSum, CAmount& governanceSum, uint64_t& sporkValue);
    ReadResult Read();
};

#endif // BLACKLIST_CACHE_H

