// Copyright (c) 2012-2014 The Bitcoin developers
// Copyright (c) 2014-2015 The Dash developers
// Copyright (c) 2015-2018 The PIVX developers
// Copyright (c) 2018-2020 The UNIGRID organization
// Copyright (c) 2017-2018 The Swipp developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#ifndef BITCOIN_VERSION_H
#define BITCOIN_VERSION_H

#include "clientversion.h"
#include <string>
#include <sstream>
/**
 * network protocol versioning
 */

static const int PROTOCOL_VERSION = 70930;

//! initial proto version, to be increased after version/verack negotiation
static const int INIT_PROTO_VERSION = 209;

//! In this version, 'getheaders' was introduced.
static const int GETHEADERS_VERSION = 70077;

//! disconnect from peers older than this proto version
static const int MIN_PEER_PROTO_VERSION_BEFORE_ENFORCEMENT = 70921;
static const int MIN_PEER_PROTO_VERSION_AFTER_ENFORCEMENT = 70930;

//! masternodes older than this proto version use old strMessage format for mnannounce
static const int MIN_PEER_MNANNOUNCE = 70913;

//! nTime field added to CAddress, starting with this version;
//! if possible, avoid requesting addresses nodes older than this
static const int CADDR_TIME_VERSION = 31402;

//! BIP 0031, pong message, is enabled for all versions AFTER this one
static const int BIP0031_VERSION = 60000;

//! "mempool" command, enhanced "getdata" behavior starts with this version
static const int MEMPOOL_GD_VERSION = 60002;

//! "filter*" commands are disabled without NODE_BLOOM after and including this version
static const int NO_BLOOM_VERSION = 70005;

struct ComparableVersion
{
    int major = 0, minor = 0, revision = 0, build = 0;

    ComparableVersion(std::string version)
    {
        std::sscanf(version.c_str(), "%d.%d.%d.%d", &major, &minor, &revision, &build);
    }

    bool operator < (const ComparableVersion& other) const
    {
        if (major < other.major)
            return true;
        else if (minor < other.minor)
            return true;
        else if (revision < other.revision)
            return true;
        else if (build < other.build)
            return true;
        return false;
    }

    bool operator == (const ComparableVersion& other)
    {
        return major == other.major
            && minor == other.minor
            && revision == other.revision
            && build == other.build;
    }

    friend std::ostream& operator << (std::ostream& stream, const ComparableVersion& ver)
    {
        stream << ver.major;
        stream << '.';
        stream << ver.minor;
        stream << '.';
        stream << ver.revision;
        stream << '.';
        stream << ver.build;
        return stream;
    }

    std::string ToString() const
    {
        std::stringstream s;
        s << major << "." << minor << "." << revision << "." << build;
        return s.str();
    }
};
#endif // BITCOIN_VERSION_H
