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
import Button from "./Button";
import { ipcRenderer, remote } from "electron";
import RPCClient from "../rpc-client.js";
import "./Send.css"
import SendInputs from "./SendInputs";
import lodash from "lodash";
import Store from "electron-store";
import { sendDesktopNotification } from "./DesktopNotifications";
import Config from "../config";
import GasSelector from "./GasSelector";

const store = new Store();
var _ = require('electron').remote.getGlobal('_');

function Send() {
    const [recipients, setRecipients] = useState({ "address1": { "address": "", "amount": "", "isValid": false } });
    const [rerender, setRerender] = useState(false);
    const [recipientCounter, setRecipientCounter] = useState(2);
    const [disableSendBtn, setDisableSendButton] = useState(true);
    const [sendBtnKey, setSendButtonKey] = useState(1);
    const [hasGas] = useState(Config.getHasGas());
    const copy1 = _("Successfully sent");
    const copy2 = _("to");
    useEffect(() => {
        setSendButtonKey(Math.random());
        console.log("button state changed ", disableSendBtn)
    }, [disableSendBtn])
    useEffect(() => {
        console.log("recipients changed: ", recipients);

    }, [recipients]);
    useEffect(() => {
        console.log("hasGas ", hasGas)
        ipcRenderer.on('send-coins', (event, message) => {
            // send back from UnlockWallet
            console.log("try and send coins ");
            sendCoins();
        });
        ipcRenderer.on('update-amount', (event, message) => {
            setSendAmount(message.amount, message.key);
        });
        ipcRenderer.on('update-address', (event, message) => {
            setSendAddress(message.address, message.key);
        });
    }, []);

    return (
        <div
            key={Object.keys(recipients).length}
            className="send--inner--container">
            {createRecipients()}
            <div className="btn--row--send">
                <Button
                    key={sendBtnKey}
                    buttonStyle="btn--secondary--solid"
                    buttonSize="btn--small"
                    disabled={disableSendBtn}
                    handleClick={() => checkForLockedWallet()}>{_("SEND")}</Button>
                <Button
                    buttonStyle="btn--secondary--solid"
                    buttonSize="btn--small"
                    handleClick={() => onCancelPressed()}>{_("CANCEL")}</Button>
            </div>
            {hasGas ? <GasSelector /> : null}
        </div>
    )
    /* <Button
                   buttonStyle="btn--secondary--solid"
                   buttonSize="btn--small"
                   handleClick={() => addRecipient()}>ADD RECIPIENT</Button> */

    function checkForLockedWallet() {
        setDisableSendButton(true);
        // unlocked_until !== 0 is unlocked
        // unlocked_until = null not encrypted
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
        // for encrypted wallets we should always assume the wallet is locked
        // because if its unlocked for staking checking unlocked_until
        // wont work so its best to just always ask for password
        if (store.get("encrypted")) {
            console.log("wallets is locked")
            //wallet locked
            // call unlock pass message this is for a send
            console.log("recipients at unlock ", recipients);
            let message = {
                command: "unlockfortime",
                alias: null
            }
            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "wallet-lock-trigger", message);
        } else {
            console.log("wallets isnt locked")
            checkSendInputs();
        }

    }
    async function sendCoins() {
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");

        var rpcClient = new RPCClient();

        if (Object.keys(recipients).length === 1) {
            Promise.all([
                rpcClient.setTxFee([0.0000001]),
            ]).then((feeSet) => {
                console.log("feeSet ", feeSet);
                // single send
                const address = recipients["address1"].address;
                const amount = recipients["address1"].amount;
                const args = [address, parseFloat(amount)];
                Promise.all([
                    rpcClient.sendToAddress(args),
                    new Promise(resolve => setTimeout(resolve, 500))
                ]).then((response) => {
                    console.log('send response: ', response[0]);
                    workCompleted();
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "cancel-send-operation");
                    sendDesktopNotification(`${copy1} ${amount} ${Config.getProjectTicker} ${copy2} ${address}`);
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-info-update");
                    setRecipients({ "address1": { "address": "", "amount": "", "isValid": false } });
                }, (stderr) => {
                    console.error(stderr);
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                });
            }, (stderr) => {
                console.error(stderr);
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
            });
        } else {
            // multisend
            const sendObject = new Object();
            Object.keys(recipients).map(key => {
                Object.assign(sendObject, { [recipients[key].address]: parseInt(recipients[key].amount) });
            });
            console.log("sendObject ", JSON.stringify(sendObject))

            Promise.all([
                rpcClient.sendMany("staking_2", sendObject),
                new Promise(resolve => setTimeout(resolve, 500))
            ]).then((response) => {
                console.log('send response: ', response[0]);


                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "cancel-send-operation");
                sendDesktopNotification(_("Successfully sent to many"));
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");

                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-info-update");
                setRecipients({ "address1": { "address": "", "amount": "", "isValid": false } });
            }, (stderr) => {
                console.error(stderr);
                // send error notification
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
            });
        }

    }
    function workCompleted() {
        setDisableSendButton(false);
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
    }
    function checkSendInputs() {
        console.log("recipients ", recipients);
        sendCoins(recipients)
    }
    function onCancelPressed() {
        setRecipients({ "address1": { "address": "", "amount": "", "isValid": false } });
        setRecipientCounter(2);
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "cancel-send-operation");
    }
    function addRecipient() {
        const key = "address".concat(recipientCounter);
        setRecipientCounter(recipientCounter + 1);
        setRecipients(Object.assign(recipients, { [key]: { "address": "", "amount": "", "isValid": false } }));
        setRerender(!rerender);
    }
    function removeRecipient(e) {
        console.log("remove: ", e);
        setRecipients(lodash.omit(recipients, e));
        setRerender(!rerender);
    }
    function setSendAddress(v, recipientKey) {
        //const updateAddress = recipients;
        Object.keys(recipients).map(key => {
            if (key === recipientKey) {
                recipients[key].address = v;
            }
        })
        //console.log("updateAddress ", recipients);
        updateRecipients(recipients, recipientKey);
    }

    function setSendAmount(v, recipientKey) {
        // const updateAmount = recipients;
        Object.keys(recipients).map(key => {
            if (key === recipientKey) {
                recipients[key].amount = v;
            }
        })
        //console.log("updateAmount ", recipients);
        updateRecipients(recipients, recipientKey);
    }

    function setIsValid(v, recipientKey) {
        // const recipients = recipients;
        Object.keys(recipients).map(key => {
            if (key === recipientKey) {
                recipients[key].isValid = v;
            }
        });

        // console.log("recipients ", recipients);
        updateRecipients(recipients, recipientKey);
    }

    function updateRecipients(o, recipientKey) {
        setRecipients(o);
        // check if we can unlock the send button
        // console.log("setting recipients ", o);
        let unlockButton = true;
        Object.keys(o).map(key => {
            if (key === recipientKey) {
                if (o[key].isValid && o[key].amount > 0) {
                    console.log("unlock send button");
                    unlockButton = false;
                }
            }
        });
        setDisableSendButton(unlockButton);
    }

    function createRecipient(key) {
        const showRemove = key !== "address1";
        //console.log("render address", recipients[key].address);
        //console.log("render amount", recipients[key].amount);
        const amount = recipients[key].amount;
        const address = recipients[key].address;
        const isValid = recipients[key].isValid;
        return (
            <SendInputs
                showRemove={showRemove}
                key={key}
                removeRecipient={(e) => removeRecipient(e)}
                setSendAddress={setSendAddress}
                setSendAmount={setSendAmount}
                setIsValid={setIsValid}
                recipientKey={key}
                inputValueAmount={amount}
                inputValueAddress={address}
                isValid={isValid}
            />
        )
    }
    function createRecipients() {
        return Object.keys(recipients).map((key) => createRecipient(key))
    }
}

export default Send;