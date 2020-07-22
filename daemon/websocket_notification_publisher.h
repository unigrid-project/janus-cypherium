// Copyright (c) 2018-2020 The UNIGRID organization
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#ifndef UNIGRID_WEBSOCKET_H
#define UNIGRID_WEBSOCKET_H

#include <boost/asio.hpp>
#include <boost/asio/coroutine.hpp>
#include <boost/asio/strand.hpp>
#include <boost/beast.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <iostream>

class WebSocketNotificationPublisher;

class WebSocketNotificationPublisher : public std::enable_shared_from_this<WebSocketNotificationPublisher>
{
}



#endif