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
import Tooltip from "react-simple-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { css } from "styled-components";
import Config from "../config";
import NodeClient from "../../common/node-client";
import CustomTooltip from "./CustomToolTip";
import { BLOCK } from "../getTextConsts";

var gt = require('electron').remote.getGlobal('gt');
library.add(faSignInAlt, faSignOutAlt, faCoins, faClock, faCubes, faNetworkWired);
const nodeClient = new NodeClient();

const showInExplorer = gt.gettext("view in explorer");

function Transaction({ data, index, style }) {
    const [amount, setAmount] = useState(0);
    const [numWidth, setNumberWidth] = useState();
    const [largeTrans, setLargeTrans] = useState(false);
    const [promiseComplete, setPromiseComplete] = useState(false);
    useEffect(() => {
        let isMounted = true;
        if (style === "trans--long") {
            setNumberWidth("long--div");
            setLargeTrans(true);
        } else {
            setNumberWidth("short--div");
            setLargeTrans(false);
        }
        Config.isDaemonBased() ? setAmount(data.amount) : nodeClient.getTxValue(data.value).then((r) => {
            if (isMounted) {
                //setAmount(parseInt(r).toFixed(4));
                setAmount(Number.parseFloat(r).toFixed(4));
                setPromiseComplete(true);
            }
        })
        return () => { isMounted = false };
        //console.log("transaction style: ", style);
    }, []);

    if (Config.isDaemonBased()) {
        return (
            <div className={"transaction--main " + style}>
                <div className="trans--short--item">
                    <div className="circle">
                        {getArrayIndex(index)}
                    </div></div>
                <div className="trans--short--item">
                    <CustomTooltip
                        placement="right"
                        item={getTimeObject(data.timereceived)}
                        color="var(--dark--green)"
                        content={calculateDateTimeFromEpoch(data.timereceived)}
                    />
                </div >
                <div className="trans--short--item">
                    <CustomTooltip
                        placement="right"
                        item={getBlockObject(data.confirmations)}
                        color="var(--dark--green)"
                        content={getBlockCount(data.confirmations)}
                    />
                </div >
                <div className="trans--short--item">
                    <CustomTooltip
                        placement="right"
                        item={getCategoryIcon()}
                        color="var(--dark--green)"
                        content={getCategory()}
                    />
                </div >
                <div className="trans--short--item">
                    <CustomTooltip
                        placement="top"
                        item={setAmountColor()}
                        color="var(--dark--green)"
                        content={data.amount.toFixed(8)}
                    />
                </div >
                <div className="trans--short--item">
                    <div className="explorer--button">
                        <CustomTooltip
                            placement="left"
                            item={<a href={Config.getExplorerLink() + "tx/" + data.txid} target="_blank">
                                <FontAwesomeIcon size="lg" icon={faCompass} color="grey" /> </a>}
                            color="var(--dark--green)"
                            content={<div className="fontSmallBold">{showInExplorer}</div>}
                        />
                    </div>
                </div>
            </div >
        )
    } else {
        if (promiseComplete) {
            return (
                <div className={"transaction--secondary " + style}>
                    <div className="trans--short--item">
                        <div className="circle">
                            {getArrayIndex(index)}
                        </div></div>
                    <div className="trans--short--item">
                        <CustomTooltip
                            placement="right"
                            item={getTimeObject(parseInt(data.timestamp / 1000000))}
                            color="var(--dark--green)"
                            content={<div className="fontSmallBold">{calculateDateTimeFromEpoch(parseInt(data.timestamp / 1000000))}</div>}
                        />
                    </div >
                    <div className="trans--short--item">
                        <CustomTooltip
                            placement="top"
                            item={getBlockObject(data.block_number)}
                            color="var(--dark--green)"
                            content={<div className="fontSmallBold">{getBlockCount(data.block_number)}</div>}
                        />
                    </div >
                    <div className="trans--short--item">
                        <CustomTooltip
                            placement="top"
                            item={getCategoryIcon()}
                            color={getCategoryColor()}
                            content={<div className="fontSmallBold">{getCategory()}</div>}
                        />
                    </div>
                    <div className="trans--short--item">
                        <CustomTooltip
                            placement="top"
                            item={<div className="fontSmallBold lightCopy">{amount}</div>}
                            color={getCategoryColor()}
                            content={<div className="fontSmallBold">{amount}</div>}
                        />
                    </div>
                    <div className="trans--short--item">
                        <div className="explorer--button">
                            <CustomTooltip
                                placement="left"
                                item={<a href={Config.getExplorerLink() + "tx/" + data.tx_hash} target="_blank">
                                    <FontAwesomeIcon size="lg" icon={faCompass} color="grey" /> </a>}
                                color="var(--dark--green)"
                                content={<div className="fontSmallBold">{showInExplorer}</div>}
                            />
                        </div>
                    </div>
                </div >
            )
        }
        else return null

    }

    function getTimeObject(epoch) {
        return <FontAwesomeIcon size="lg" icon={faClock} color="white" />;
    }

    function getBlockCount(conf) {
        if (Config.isDaemonBased()) {
            return (
                <div>
                    <div>{conf}</div>
                    <div>confirmations</div>
                </div>
            )
        } else {
            if (conf == -2) {
                return (
                    <div>{BLOCK}: pending</div>
                )
            } 
            return (
                <div>{BLOCK}: {conf}</div>
            )
        }
    }

    function getBlockObject(conf) {
        let color = "";
        switch (conf) {
            case -2:
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

    function getCategory() {
        //console.log("data: ", data)
        if (Config.isDaemonBased()) {
            if (data.generatedfrom) {
                return data.generatedfrom;
            } else {
                return data.category;
            }
        } else {
            switch (data.tx_type) {
                case 1:
                    return gt.gettext("Send");
                case 2:
                    return gt.gettext("Receive");
            }

        }


    }

    function getCategoryColor() {
        switch (data.tx_type) {
            case 1:
                return "var(--dark--red)";
                break;
            case 2:
                return "var(--dark--green)";
                break;

        }
    }

    function setAmountColor() {
        let transType;
        var totalAmount;
        if (Config.isDaemonBased()) {
            transType = data.category === "send" ? "send--color" : "receive--color";
            totalAmount = data.amount;
        } else {
            transType = data.tx_type === 1 ? "send--color" : "receive--color";
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

    function calculateDateTimeFromEpoch(epoch) {
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
            if (data.block_number == -2) {
                return (
                    <div>pending</div>
                )
            } 
            let time = new Date(epoch);
            let year = time.getFullYear();
            let date = ('00' + time.getDate()).slice(-2);
            let month = ('00' + (time.getMonth() + 1)).slice(-2);
            let hour = ('00' + time.getHours()).slice(-2);
            let minute = ('00' + time.getMinutes()).slice(-2);
            let second = ('00' + time.getSeconds()).slice(-2);
            //return [year, month, date].join('.') + ' ' + [hour, minute, second].join(':');
            //console.log("time: ", recDate.toISOString())
            //const date = recDate.toISOString().split('T')[0];
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
}
export default Transaction;