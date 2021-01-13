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
import './MasternodeCard.css';
import { faCheckCircle, faExclamationCircle, faCoins, faClock } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import Tooltip from "react-simple-tooltip"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "./Button";

library.add(faCheckCircle, faExclamationCircle, faCoins, faClock);

function MasternodeCard({ onStartClicked, data, onStopClicked }) {
    return (
        <div className="grid-container">
            <div className="upper-left">
                <Tooltip
                    arrow={10}
                    zIndex={2000}
                    fadeDuration={150}
                    radius={10}
                    placement="right"
                    fontFamily='Roboto'
                    fontSize='5'
                    fadeEasing="linear"
                    background={getStatusColor(data.status)}
                    content={data.status}
                >
                    {getStatusIcon(data.status)}
                </Tooltip>
            </div>
            <div className="title-mid">Alias: {data.alias}</div>
            <div className="upper-right">
                <div className="masternodeHeader">
                    <div className="title">Protocol: {setData(data.version)}</div>
                </div>
            </div>
            <div className="center-right">
                <div className="spacing">{data.privateKey}</div>

                <div>Address: {/*☺☺☺☺☺☺☺☺☺☺☺☺*/}{data.ipaddr}</div>
            </div>
            <div className="middle-right">
                <div>Running: {convertEpochTime(data.activetime)}</div>
            </div>
            <div className="lower-center">Rank: {setData(data.rank)}</div>
            <div className="lower-right">
                <Button
                    handleClick={() => onStartClicked(data.alias)}
                    buttonSize="btn--small">START</Button>
            </div>
        </div>
    )

    function setData(e) {
        if (e === undefined) return "unknown";
        return e;
    }
    function getStatusIcon(status) {
        switch (status) {
            case "ENABLED":
                return <FontAwesomeIcon size="2x" icon={faCheckCircle} color="green" />
                break;
            case "EXPIRED":
                return <FontAwesomeIcon size="2x" icon={faExclamationCircle} color="red" />
                break;
            case "VIN_SPENT":
                return <FontAwesomeIcon size="2x" icon={faExclamationCircle} color="orange" />
                break;
            case "POS_ERROR":
                return <FontAwesomeIcon size="2x" icon={faCoins} color="yellow" />
                break;
            case "REMOVE":
                return <FontAwesomeIcon size="2x" icon={faExclamationCircle} color="red" />
                break;
            case "MISSING":
                return <FontAwesomeIcon size="2x" icon={faExclamationCircle} color="red" />
                break;
            default:
                return <FontAwesomeIcon size="2x" icon={faCoins} color="red" />
                break;

        }
        return status
    }
    function getStatusColor(status) {
        switch (status) {
            case "ENABLED":
                return "green"
                break;
            case "EXPIRED":
                return "red"
                break;
            case "VIN_SPENT":
                return "orange"
                break;
            case "POS_ERROR":
                return "yellow"
                break;
            case "REMOVE":
                return "red"
                break;
            case "MISSING":
                return "red"
                break;
            default:
                return "darkgrey"
                break;
        }
    }

    function convertEpochTime(epoch) {
        //if (!epoch) 
        return "unknown";
        const date_now = Date.now();
        var start_time = new Date(0);
        start_time.setUTCSeconds(epoch);
        var delta = Math.abs(date_now - start_time) / 1000;
        var days = Math.floor(delta / 86400);
        delta -= days * 86400;
        var hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        var minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        var result = days + "d " + hours + ":" + minutes;
        return result;
    }
}

export default MasternodeCard
