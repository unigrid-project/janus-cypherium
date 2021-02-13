/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019-2021 The UNIGRID Organization
 *
 * The UNIGRID Wallet is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * The UNIGRID Wallet is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with The UNIGRID Wallet. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState, useEffect } from "react";
import "./Transaction.css";
import { faSignInAlt, faSignOutAlt, faCoins, faClock, faCompass, faCubes, faNetworkWired } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Config from "../config";
import NodeClient from "../../common/node-client";
import TransactionLoading from "./TransactionLoading";

library.add(faSignInAlt, faSignOutAlt, faCoins, faClock, faCubes, faNetworkWired);
const nodeClient = new NodeClient();

function TransactionLong({ data, index, style }) {
    const [amount, setAmount] = useState(nodeClient.getTxValue(data.value));
    const [numWidth, setNumberWidth] = useState("long--div");
    const [largeTrans, setLargeTrans] = useState(true);
    const [promiseComplete, setPromiseComplete] = useState(false);
    const [themeStyle, setThemeStyle] = useState(Config.isDaemonBased() ? "transaction--main" : "transaction--secondary");
    useEffect(() => {
        let isMounted = true;
        Config.isDaemonBased() ? setAmount(data.amount) : nodeClient.getTxValue(data.value).then((r) => {
            if (isMounted) {
                setAmount(parseInt(r).toFixed(10));
                setPromiseComplete(true);
            }
        })
        return () => { isMounted = false };
    }, [])
    if (Config.isDaemonBased()) {
        return (
            <div className={themeStyle} key={index}>
                <div className="trans--item padding--left">
                    {getTimeObject(data.timereceived)}
                </div >
                <div className="trans--item">
                    {getCategoryIcon()}
                </div>
                <div className="trans--item">
                    {setAmountColor()}
                </div>
                <div className="trans--item explorer--button">
                    <a href={Config.getExplorerLink() + "tx/" + data.txid} target="_blank">
                        <FontAwesomeIcon size="lg" icon={faCompass} color="grey" /> </a>
                </div>
                {largeTrans ?
                    <div className="trans--item">
                        {getAccountName(data.account)}
                    </div>
                    : null}
            </div >
        )
    } else {
        return (
            <div>
                {promiseComplete ?
                    <div className={themeStyle} key={index}>
                        <div className="trans--item padding--left">
                            {getTimeObject(parseInt(data.timestamp / 1000000))}
                            {/*data.timestamp */}
                        </div >
                        <div className="trans--item">
                            {getCategoryIcon()}
                        </div>
                        <div className="trans--item">
                            {setAmountColor()}
                        </div>
                        <div className="trans--item explorer--button">
                            <a href={Config.getExplorerLink() + "tx/" + data.tx_hash} target="_blank">
                                <FontAwesomeIcon size="lg" icon={faCompass} color="grey" /> </a>
                        </div>
                        <div className="trans--item">
                            {getToFromAddress(data)}
                        </div>
                    </div > : <TransactionLoading />}
            </div>
        )
    }

    function getTimeObject(epoch) {
        if (largeTrans === true) {
            return calculateDateFromEpoch(epoch);
        } else {
            return <FontAwesomeIcon size="lg" icon={faClock} color="white" />;
        }
    }
    function getBlockCount(conf) {
        return (
            <div>
                <div>{conf}</div>
                <div>confirmations</div>
            </div>
        )

    }
    function getBlockObject(conf) {
        let color = "";
        switch (conf) {
            case 0:
                color = "grey";
                break;
            case 1:
            case 2:
            case 3:
            case 4:
                color = "lightyellow";
                break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                color = "yellow";
                break;

            default:
                color = "lightgreen";
                break;
        }
        return <FontAwesomeIcon size="lg" icon={faCubes} color={color} />;
    }

    function getCategory(data) {
        //console.log("data: ", data)
        if (data.generatedfrom) {
            return data.generatedfrom;
        } else {
            return data.category;
        }
    }

    function setAmountColor() {
        let transType;
        var totalAmount;
        if (Config.isDaemonBased()) {
            transType = data.category === "send" ? "send--color" : "receive--color";
            totalAmount = data.amount;
        } else {
            transType = "receive--color";
            //totalAmount = nodeClient.getTxValue(data.value);
            //console.log(await nodeClient.getTxValue(data.value))
            totalAmount = amount;
        }
        return <div className={numWidth + " " + transType}>{totalAmount}</div>
    }

    function getArrayIndex(num) {
        let newNum = parseInt(num);
        return newNum + 1;
    }

    function getAccountName(account) {
        if (account === "") {
            return <div className="unnamed-account">unnamed account</div>
        } else {
            return <div>{account}</div>
        }
    }

    function calculateDateFromEpoch(epoch) {
        if (Config.isDaemonBased()) {
            var recDate = new Date(epoch * 1000);
            const date = recDate.toISOString().split('T')[0];
            const time = recDate.toTimeString().split(" ")[0];
            return (
                <div>
                    <div>{date}</div>
                    <div>{time}</div>
                </div>
            )
        } else {
            let time = new Date(epoch);
            let year = time.getFullYear();
            let date = ('00' + time.getDate()).slice(-2);
            let month = ('00' + (time.getMonth() + 1)).slice(-2);
            let hour = ('00' + time.getHours()).slice(-2);
            let minute = ('00' + time.getMinutes()).slice(-2);
            let second = ('00' + time.getSeconds()).slice(-2);

            return (
                <div>
                    <div>{[year, month, date].join('.') + ' ' + [hour, minute, second].join(':')}</div>
                </div>
            )
        }
    }

    function getCategoryIcon() {
        if (Config.isDaemonBased()) {
            switch (data.category) {
                case "receive":
                case "immature":
                    if (data.generated) {
                        if (data.generatedfrom === "stake") {
                            return <FontAwesomeIcon size="lg" icon={faCoins} color="rgb(255, 151, 14)" />
                        } else if (data.generatedfrom === "masternode reward") {
                            return <FontAwesomeIcon size="lg" icon={faNetworkWired} color="lightgoldenrodyellow" />
                        }
                    } else {
                        return <FontAwesomeIcon size="lg" icon={faSignInAlt} color="lightgreen" />
                    }
                case "send":
                    return <FontAwesomeIcon size="lg" icon={faSignOutAlt} color="lightsalmon" />
                case "generate":
                    if (data.generatedfrom === "stake") {
                        return <FontAwesomeIcon size="lg" icon={faCoins} color="rgb(255, 151, 14)" />
                    } else if (data.generatedfrom === "masternode reward") {
                        return <FontAwesomeIcon size="lg" icon={faNetworkWired} color="lightgoldenrodyellow" />
                    }

                default:
                    return <FontAwesomeIcon size="lg" icon={faSignInAlt} color="white" />

            }
        } else {
            // cph type 1 = send, type 2 = receive
            switch (data.tx_type) {
                case 1:
                    return <FontAwesomeIcon size="lg" icon={faSignOutAlt} color="lightsalmon" />
                    break;
                case 2:
                    return <FontAwesomeIcon size="lg" icon={faSignInAlt} color="white" />
                    break;
            }
        }

    }

    function getToFromAddress(data) {
        switch (data.tx_type) {
            case 1:
                return (
                    <div>
                        <div>{"to: " + data.to}</div>
                    </div>
                )
            case 2:
                return (
                    <div>
                        <div>{"from: " + data.from}</div>
                    </div>
                )
        }
    }
}
export default TransactionLong;