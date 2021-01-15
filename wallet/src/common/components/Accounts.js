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
import "./Accounts.css"
import EnterField from "./EnterField";
import { faClipboard, faTrashAlt, faCompass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "react-simple-tooltip";
import { css } from "styled-components";
import RPCClient from "../rpc-client.js";
import Expand from "react-expand-animated";
import { ipcRenderer, remote } from "electron";
import NodeClient from '../../common/node-client';
import Config from "../config";

const log = require('electron-log');
const nodeClient = new NodeClient();

function Accounts({ data, setAccountName, copyAddress, removeAccount }) {
    const [showInput, setShowInput] = useState(false);
    const [address] = useState(data[0]);
    const [accountName] = useState(data[2]);
    const [changeAcountName, setChangeAccountName] = useState("");
    const [resetInput, setResetInput] = useState();
    const [showInputs, setShowInputs] = useState(false);
    const [addressInputs, setAddressInputs] = useState([]);
    const [balance, setbalance] = useState(0);
    useEffect(() => {
        nodeClient.getCphBalance(data.address).then((v) => {
            setbalance(parseInt(v));
		}, (stderr) => {
			log.warn("Error loading balance for address: ", "CPH" + stderr);
		});
    }, [])
    return (
        <div>
            <div className="accountContainer">
                <div className="chevron account--item">
                    <a href={Config.getExplorerLink() + "search/CPH" + data.address} target="_blank">
                        <FontAwesomeIcon size="sm" icon={faCompass} color="white" onClick={() => openExplorer(data.address)} />
                    </a>
                </div>
                <div className="account--div account--item">
                    {data.address}</div>
                <div className="clipboard account--item">
                    <FontAwesomeIcon size="sm" icon={faClipboard} color="white" onClick={() => copyAddress("CPH"+data.address)} />
                </div>
                <div className="amount account--item">
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
                        content={balance.toFixed(8)}
                        customCss={css`
                    white-space: nowrap;
                  `}
                    >
                        {balance}
                    </Tooltip>
                </div>
                <div className="account account--item">{data.name}</div>
                <div className="delete--icon account--item">
                    <FontAwesomeIcon size="sm" icon={faTrashAlt} color="white" onClick={() => removeAccount(data)} />
                </div>
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

    async function openExplorer(address) {
        let explorer = Config.getExplorerLink();

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

export default Accounts;

//