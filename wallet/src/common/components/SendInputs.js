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
import EnterField from "./EnterField";
import Button from "./Button";
import "./Send.css"

import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RPCClient from "common/rpc-client.js";
import { ipcRenderer, remote } from "electron";
import Config from "../config";
import NodeClient from "../node-client";
import { WalletService } from "../walletutils/WalletService";
import { ADDRESS, MAX, AMOUNT, INVALID_ADDRESS } from "../getTextConsts";

const nodeClient = new NodeClient();
const walletService = new WalletService();
library.add(faTimesCircle);

function SendInputs({
    inputValueAmount,
    inputValueAddress,
    setSendAddress,
    showRemove,
    recipientKey,
    removeRecipient,
    setIsValid,
    gas
}) {
    const [balance, setBalance] = useState(0);
    const [updateValue, setUpdateValue] = useState(0);
    useEffect(() => {
        ipcRenderer.on("account-balance-updated", (event, balance) => {
            setBalance(balance.toString());
        })
    }, [])
    return (
        <div className="max--width">
            <div className="align--row--inputs" style={{ width: "95%" }}>
                <EnterField
                    key={inputValueAddress + "address"}
                    type={"text"}
                    clearField={inputValueAddress}
                    myStyle={"dynamic--input"}
                    onBlurOut={onBlurOutAddress}
                    placeHolder={ADDRESS}
                    updateEntry={(v) => sendAddressChangeSignal(v)}
                />

                <EnterField
                    placeHolder={AMOUNT}
                    
                    type={"number"}
                    shouldAutoFocus={true}
                    clearField={inputValueAmount}
                    myStyle={"number--input"}
                    updateEntry={(v) => sendAmountChangeSignal(v)}
                />

                <div style={{ justifySelf: 'flex-end' }}>
                    {showRemove === true ?
                        <div onClick={() => removeRecipient(recipientKey)}>
                            <FontAwesomeIcon
                                size="lg"
                                icon={faTimesCircle} color="red" />
                        </div>
                        :
                        null}
                </div>
            </div>
        </div>
    )
    /*
    <Button
                                buttonStyle="btn--secondary--solid"
                                buttonSize="btn--small"
                                handleClick={() => setMaxValue()}>{MAX}</Button>
    */
    function setMaxValue() {
        console.log("balance input: ", (parseFloat(balance) - parseFloat(gas)));
        setUpdateValue(balance);
    }

    function sendAmountChangeSignal(v) {
        let obj = {
            amount: v,
            key: recipientKey
        };

        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "update-amount", obj);
    }
    function sendAddressChangeSignal(v) {
        let obj = {
            address: v,
            key: recipientKey
        };
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "update-address", obj);
    }


    function onBlurOutAmount(e) {
        //updateEntry={(a) => setSendAmount(a, recipientKey)}
        let amount = e.target.value;
        //setSendAmount(amount, recipientKey)
    }
    async function onBlurOutAddress(e) {
        console.log(e.target.value);
        if (Config.isDaemonBased()) {
            var rpcClient = new RPCClient();
            const address = e.target.value;
            Promise.all([
                rpcClient.validateAddress([address]),
                new Promise(resolve => setTimeout(resolve, 500))
            ]).then((response) => {
                setIsValid(response[0].isvalid, recipientKey);
                if (!response[0].isvalid) {
                    //setWarningMessage("Address is not valid!");
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "on-send-warning", INVALID_ADDRESS);
                    // make sure send button is disabled until 
                    // it's valid
                }
            }, (stderr) => {
                console.error(stderr);
            });
        } else {
            // handle checking address with cph/eth
            const address = walletService.convertAddr(e.target.value);
            nodeClient.validateAddress(address, (res) => {
                console.log("valid: ", res)
                setIsValid(res, recipientKey);
                if (!res) {
                    //setWarningMessage("Address is not valid!");
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "on-send-warning", INVALID_ADDRESS);
                }
            })
        }

    }

}

export default SendInputs;