/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The UNIGRID Organization
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
import "./Address.css"
import EnterField from "./EnterField";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "react-simple-tooltip";
import { css } from "styled-components";

function Address({ data, setAccountName, copyAddress }) {
    const [showInput, setShowInput] = useState(false);
    const [address] = useState(data[0]);
    const [accountName] = useState(data[2]);
    const [changeAcountName, setChangeAccountName] = useState("");
    const [resetInput, setResetInput] = useState();

    return (
        <div className="addressContainer">
            <div className="address--div address--item">
                {data[0]}</div>
            <div className="clipboard address--item">
                <FontAwesomeIcon size="sm" icon={faClipboard} color="white" onClick={() => copyAddress(data[0])} />
            </div>
            <div className="amount address--item">
                <Tooltip
                    arrow={10}
                    zIndex={200}
                    fadeDuration={150}
                    radius={10}
                    fontFamily='Roboto'
                    fontSize='5'
                    fadeEasing="linear"
                    background={css`
                    var(--success)
                  `}
                    content={data[1].toFixed(8)}
                    customCss={css`
                    white-space: nowrap;
                  `}
                >
                    {data[1]}
                </Tooltip>
            </div>
            <div className="account address--item">{getAccountField(data[2])}</div>
        </div>
    )
    function getAccountField(account) {
        if (!account || account === " ") account = "add name";

        return (showInput === true ?
            <EnterField
                inputType="text"
                inputValue={account} myStyle="xsmallInput"
                updateEntry={updateAccountName}
                clearField={resetInput}
                placeHolder="Enter Name"
                onBlurOut={() => switchInput()}
                enterPressed={() => switchInput()} />
            :
            <div className={account === "add name" ? "noaccountname" : "accountname"}
                onClick={switchInput}>{account}</div>
        )
    }

    function updateAccountName(e) {
        setChangeAccountName(e);
    }

    function switchInput() {
        console.log("switch input: ", address , " ", changeAcountName);
        let data = [address, changeAcountName];
        if (showInput === true) setAccountName(data);
        setResetInput("");
        setChangeAccountName("");
        setShowInput(!showInput);
    }
}

export default Address;

//