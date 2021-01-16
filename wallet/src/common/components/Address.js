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

import React, { useState } from "react";
import "./Address.css"
import EnterField from "./EnterField";
import { faClipboard, faChevronCircleRight, faChevronCircleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "react-simple-tooltip";
import { css } from "styled-components";
import RPCClient from "../../common/rpc-client.js";
import Expand from "react-expand-animated";
import { ipcRenderer, remote } from "electron";

function Address({ data, setAccountName, copyAddress }) {
    const [showInput, setShowInput] = useState(false);
    const [address] = useState(data[0]);
    const [accountName] = useState(data[2]);
    const [changeAcountName, setChangeAccountName] = useState("");
    const [resetInput, setResetInput] = useState();
    const [showInputs, setShowInputs] = useState(false);
    const [addressInputs, setAddressInputs] = useState([]);

    return (
        <div>
            <div className="addressContainer">
                <div className="chevron address--item">
                    <FontAwesomeIcon size="sm" icon={showInputs ? faChevronCircleDown : faChevronCircleRight} color="white" onClick={() => getAddressUnspent(data[0])} />
                </div>
                <div className="address--div address--item" onClick={() => getAddressUnspent(data[0])}>
                    {data[0]}</div>
                <div className="clipboard address--item">
                    <FontAwesomeIcon size="sm" icon={faClipboard} color="white" onClick={() => copyAddress(data[0])} />
                </div>
                <div className="amount address--item">
                    <Tooltip
                        placement="left"
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
            {renderInputs()}
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

    async function getAddressUnspent(address) {
        if (showInputs) {
            setShowInputs(false)
            return;
        }
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
        var rpcClient = new RPCClient();
        var args = [1, 9999999, [address]];
        Promise.all([
            rpcClient.listunspent(args),
        ]).then((response) => {
            setShowInputs(true);
            setAddressInputs(response[0]);
            console.log("Address unspent: ", response);
            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
        }, (stderr) => {
            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
            console.error(stderr);
        });
    }

    function renderInputs() {
        var minHeight = 0;
        if (showInputs)
            minHeight = showInputs.length * 50;
        return (
            <Expand open={showInputs}>
                <div className="address--inputs">
                    {addressInputs.map((item, i) => {
                        return singleInput(item, i);
                    })}
                </div>

            </Expand >
        )
    }

    function singleInput(item, i) {
        //console.log("item ", item);
        return (
            <div className="address--inputs--container" key={i}>
                <div >input amount: {item.amount}</div>
            </div>
        )
    }

    function updateAccountName(e) {
        setChangeAccountName(e);
    }

    function switchInput() {
        console.log("switch input: ", address, " ", changeAcountName);
        let data = [address, changeAcountName];
        if (showInput === true) setAccountName(data);
        setResetInput("");
        setChangeAccountName("");
        setShowInput(!showInput);
    }
}

export default Address;

//