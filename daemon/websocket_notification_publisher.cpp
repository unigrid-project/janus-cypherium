// Copyright (c) 2018-2020 The UNIGRID organization
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.
#include <boost/asio.hpp>
#include <boost/asio/coroutine.hpp>
#include <boost/asio/strand.hpp>
#include <boost/beast.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <iostream>

using namespace std;

namespace beast = boost::beast;         // from <boost/beast.hpp>
namespace http = beast::http;           // from <boost/beast/http.hpp>
namespace websocket = beast::websocket; // from <boost/beast/websocket.hpp>
namespace net = boost::asio;            // from <boost/asio.hpp>
using tcp = boost::asio::ip::tcp;       // from <boost/asio/ip/tcp.hpp>
// Report a failure
void fail(beast::error_code ec, char const* what)
{
    std::cerr << what << ": " << ec.message() << "\n";
}

class WebSocketNotificationPublisher : public std::enable_shared_from_this<WebSocketNotificationPublisher>
{
    static WebSocketNotificationPublisher* instance;
    int data;
    websocket::stream<beast::tcp_stream> ws_;
    beast::flat_buffer buffer_;
    boost::asio::make_strand(socket.get_executor())
        // Private constructor so that no objects can be created.
        WebSocketNotificationPublisher()
    {
        data = 0;
    }

public:
    static WebSocketNotificationPublisher* getInstance()
    {
        if (!instance)
            instance = new WebSocketNotificationPublisher;
        return instance;
    }
    // Take ownership of the socket
    explicit WebSocketNotificationPublisher(tcp::socket&& socket)
        : ws_(std::move(socket))
    {
    }
    // Start the asynchronous operation
    void
    run()
    {
        // Set suggested timeout settings for the websocket
        ws_.set_option(
            websocket::stream_base::timeout::suggested(
                beast::role_type::server));

        // Set a decorator to change the Server of the handshake
        ws_.set_option(websocket::stream_base::decorator(
            [](websocket::response_type& res) {
                res.set(http::field::server,
                    std::string(BOOST_BEAST_VERSION_STRING) +
                        " unigrid-websocket-session");
            }));

        // Accept the websocket handshake
        ws_.async_accept(
            beast::bind_front_handler(
                &WebSocketNotificationPublisher::on_accept,
                shared_from_this()));
    }
    void
    on_accept(beast::error_code ec)
    {
        if (ec)
            return fail(ec, "accept");

        // Read a message
        do_read();
    }
    void
    do_read()
    {
        // Read a message into our buffer
        ws_.async_read(
            buffer_,
            beast::bind_front_handler(
                &WebSocketNotificationPublisher::on_read,
                shared_from_this()));
    }
    void
    on_read(
        beast::error_code ec,
        std::size_t bytes_transferred)
    {
        boost::ignore_unused(bytes_transferred);

        // This indicates that the session was closed
        if (ec == websocket::error::closed)
            return;

        if (ec)
            fail(ec, "read");

        // Echo the message
        ws_.text(ws_.got_text());
        ws_.async_write(
            buffer_.data(),
            beast::bind_front_handler(
                &WebSocketNotificationPublisher::on_write,
                shared_from_this()));
    }
    void
    on_write(
        beast::error_code ec,
        std::size_t bytes_transferred)
    {
        boost::ignore_unused(bytes_transferred);

        if (ec)
            return fail(ec, "write");

        // Clear the buffer
        buffer_.consume(buffer_.size());

        // Do another read
        do_read();
    }

    int getData()
    {
        return this->data;
    }

    void setData(int data)
    {
        this->data = data;
    }
};

// Accepts incoming connections and launches the sessions
class listener : public std::enable_shared_from_this<listener>
{
    net::io_context& ioc_;
    tcp::acceptor acceptor_;

public:
    listener(
        net::io_context& ioc,
        tcp::endpoint endpoint)
        : ioc_(ioc), acceptor_(ioc)
    {
        beast::error_code ec;

        // Open the acceptor
        acceptor_.open(endpoint.protocol(), ec);
        if (ec) {
            fail(ec, "open");
            return;
        }

        // Allow address reuse
        acceptor_.set_option(net::socket_base::reuse_address(true), ec);
        if (ec) {
            fail(ec, "set_option");
            return;
        }

        // Bind to the server address
        acceptor_.bind(endpoint, ec);
        if (ec) {
            fail(ec, "bind");
            return;
        }

        // Start listening for connections
        acceptor_.listen(
            net::socket_base::max_listen_connections, ec);
        if (ec) {
            fail(ec, "listen");
            return;
        }
    }

    // Start accepting incoming connections
    void
    run()
    {
        do_accept();
    }

private:
    void
    do_accept()
    {
        // The new connection gets its own strand
        acceptor_.async_accept(
            net::make_strand(ioc_),
            beast::bind_front_handler(
                &listener::on_accept,
                shared_from_this()));
    }

    void
    on_accept(beast::error_code ec, tcp::socket socket)
    {
        if (ec) {
            fail(ec, "accept");
        } else {
            // Create the WebSocketNotificationPublisher and run it
            std::make_shared<WebSocketNotificationPublisher>(std::move(socket))->run();
        }

        // Accept another connection
        do_accept();
    }
};

//Initialize pointer to zero so that it can be initialized in first call to getInstance
WebSocketNotificationPublisher* WebSocketNotificationPublisher::instance = 0;

int main()
{
    WebSocketNotificationPublisher* s = s->getInstance();
    cout << s->getData() << endl;
    s->setData(100);
    cout << s->getData() << endl;
    return 0;
}
