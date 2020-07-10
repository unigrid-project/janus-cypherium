/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The Swipp developers <info@swippcoin.com>
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

import React, { useState } from "react";
import "./Transaction.css";
import { faSignInAlt, faSignOutAlt, faCoins, faClock, faCompass } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import Tooltip from "react-simple-tooltip"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { css } from "styled-components"
library.add(faSignInAlt, faSignOutAlt, faCoins, faClock);

function Transaction({ data, index }) {
    const [amount] = useState(data.amount);

    return (
        <div className="transaction--main">
            <div className="">
                <div className="circle">
                    {getArrayIndex(index)}
                </div></div>
            <div className="pad--divs">
                <Tooltip
                    arrow={10}
                    zIndex={200}
                    fadeDuration={150}
                    radius={10}
                    fontFamily='Roboto'
                    fontSize='5'
                    fadeEasing="linear"
                    background="rgba(0, 0, 0, 0.85)"
                    content={calculateDateFromEpoch(data.timereceived)}
                    customCss={css`
                    white-space: nowrap;
                  `}
                >
                    <FontAwesomeIcon size="lg" icon={faClock} color="white" />
                </Tooltip>
            </div >
            <div className="pad--divs">
                <Tooltip
                    arrow={10}
                    zIndex={200}
                    fadeDuration={150}
                    radius={10}
                    fontFamily='Roboto'
                    fontSize='5'
                    fadeEasing="linear"
                    background="rgba(0, 0, 0, 0.85)"
                    content={getCategory(data.category)}
                >{getCategroyIcon(data.category)}
                </Tooltip>

            </div>
            <div className="pad--divs">{data.amount}</div>
            <div className="pad--divs">
                <Tooltip
                    arrow={10}
                    zIndex={200}
                    fadeDuration={150}
                    radius={10}
                    fontFamily='Roboto'
                    fontSize='5'
                    fadeEasing="linear"
                    background="rgba(0, 0, 0, 0.85)"
                    content="Show in explorer"
                    customCss={css`
                    white-space: nowrap;
                  `}
                >
                    <a href={"http://explorer.unigrid.org/tx/" + data.txid} target="_blank"><FontAwesomeIcon size="lg" icon={faCompass} color="grey" /> </a>
                </Tooltip>
            </div>
        </div >
    )
    function getCategory(cat) {
        return cat;
    }
    function getArrayIndex(num) {
        let newNum = parseInt(num);
        return newNum + 1;
    }
    function calculateDateFromEpoch(epoch) {
        var recDate = new Date(epoch * 1000);
        const date = recDate.toISOString().split('T')[0];
        const time = recDate.toTimeString().split(" ")[0];

        return (
            <div>
                <div>{date}</div>
                <div>{time}</div>
            </div>
        )
    }
    function getCategroyIcon(category) {
        switch (category) {
            case "receive":
                return <FontAwesomeIcon size="lg" icon={faSignInAlt} color="lightgreen" />
                break;
            case "send":
                return <FontAwesomeIcon size="lg" icon={faSignOutAlt} color="lightsalmon" />
                break;
            case "stake":
                return <FontAwesomeIcon size="lg" icon={faCoins} color="white" />
                break;
            default:
                return <FontAwesomeIcon size="lg" icon={faSignInAlt} color="white" />
                break;
        }
    }
}
export default Transaction;