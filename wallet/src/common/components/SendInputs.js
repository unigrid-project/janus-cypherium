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
import WarningMessage from "./WarningMessage";
import { ipcRenderer, remote } from "electron";

library.add(faTimesCircle);

function SendInputs({
    inputValueAmount,
    inputValueAddress,
    setSendAddress,
    showRemove,
    setSendAmount,
    recipientKey,
    removeRecipient,
    setIsValid
}) {
    const [warningMessage, setWarningMessage] = useState("");

    return (
        <div className="send--input--container">
            <div>
                <EnterField
                    key={inputValueAddress + "address"}
                    type={"text"}
                    clearField={inputValueAddress}
                    myStyle={"medium--input"}
                    onBlurOut={onBlurOutAddress}
                    placeHolder="Address"
                    updateEntry={(v) => sendAddressChangeSignal(v)}
                />
                <EnterField
                    placeHolder="Amount"
                    key={inputValueAmount + "amount"}
                    type={"number"}
                    clearField={inputValueAmount}
                    myStyle={"smallInput"}
                    updateEntry={(v) => sendAmountChangeSignal(v)}
                />
                {showRemove === true ?
                    <div onClick={() => removeRecipient(recipientKey)}>
                        <FontAwesomeIcon
                            size="lg"
                            icon={faTimesCircle} color="red" />
                    </div>
                    :
                    null}
            </div>
            {warningMessage !== "" ? renderWarning() : null}

        </div>
    )

    function sendAmountChangeSignal(v) {
        //console.log("amount: ", v);
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
    function renderWarning() {
        return (
            <WarningMessage
                message={warningMessage}
                onAnimationComplete={onAnimationComplete}
                startAnimation="error--text-start error--text--animation" />
        )
    }
    function onAnimationComplete() {
        setWarningMessage("");
    }

    function onBlurOutAmount(e) {
        //updateEntry={(a) => setSendAmount(a, recipientKey)}
        let amount = e.target.value;
        setSendAmount(amount, recipientKey)
    }
    async function onBlurOutAddress(e) {
        console.log(e.target.value);
        var rpcClient = new RPCClient();
        const address = e.target.value;
        Promise.all([
            rpcClient.validateAddress([address]),
            new Promise(resolve => setTimeout(resolve, 500))
        ]).then((response) => {
            setIsValid(response[0].isvalid, recipientKey);
            if (!response[0].isvalid) {
                setWarningMessage("Address is not valid!");
                // make sure send button is disabled until 
                // it's valid
            }
        }, (stderr) => {
            console.error(stderr);
        });
    }

}

export default SendInputs;