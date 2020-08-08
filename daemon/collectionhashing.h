// Copyright (c) 2017-2020 The Swipp developers
// Copyright (c) 2019-2020 The UNIGRID Organization
//
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING.daemon or http://www.opensource.org/licenses/mit-license.php.

#ifndef UNIGRID_COLLECTIONHASHING_H
#define UNIGRID_COLLECTIONHASHING_H

#include <cstddef>
#include <utility>
#include <tr1/functional>
#include <boost/functional/hash.hpp>

#include "robinhood.h"
#include "uint256.h"

namespace std
{
    template<> struct hash<uint256>
    {
        size_t operator()(const uint256& v) const
        {
            return robin_hood::hash_bytes(v.begin(), v.size());
        }
    };
}

#endif