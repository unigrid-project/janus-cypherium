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

import React, { useState, useEffect, useRef } from "react";
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
import { ADD_RECIPIENT, SEND, TOTAL_COST } from "../getTextConsts";
import NodeClient from "../node-client";

var gt = require('electron').remote.getGlobal('gt');
const store = new Store();
const nodeClient = new NodeClient();

function Send() {
    const [recipients, setRecipients] = useState({ "address1": { "address": "", "amount": 0, "isValid": false } });
    const [rerender, setRerender] = useState(false);
    const [recipientCounter, setRecipientCounter] = useState(2);
    const [disableSendBtn, setDisableSendButton] = useState(false);
    const [sendBtnKey, setSendButtonKey] = useState(1);
    const [hasGas] = useState(Config.getHasGas());
    const copy1 = gt.gettext("Successfully sent");
    const copy2 = gt.gettext("to");
    const [gas, setGas] = useState((50 * 21000 / 1000000000));
    const gasRef = useRef(gas);
    const [gasDefault, setGasDefault] = useState(Math.random());
    const [priceKey, setPriceKey] = useState(Math.random());
    const [amountRenderKey, setAmountRenderKey] = useState(Math.random());
    const [activeAccount, setCurrentActiveAccount] = useState(Config.getCurrentAccount());

    useEffect(() => {
        setSendButtonKey(Math.random());
        //console.log("button state changed ", disableSendBtn)
    }, [disableSendBtn])

    useEffect(() => {
        let onSendCoins = ipcRenderer.on('send-coins', (event, message) => {
            // send back from UnlockWallet
            sendCoins(message);
            message = null;
            return () => {
                ipcRenderer.removeListener('send-coins', onSendCoins);
            }
        });
        ipcRenderer.on('update-amount', (event, message) => {
            setSendAmount(message.amount, message.key);
            setPriceKey(Math.random());
            //console.log("where the fuck is gas? ", gas);
            //console.log("recipients: ", recipients)
        });
        ipcRenderer.on('update-address', (event, message) => {
            setSendAddress(message.address, message.key);
            console.log("recipients: ", recipients)
        });
        ipcRenderer.on("update-active-account", (event, account) => {
            console.log("update-active-account ", account);
            setCurrentActiveAccount(account);
            resetDefaults();
        });

    }, []);

    return (
        <div
            key={Object.keys(recipients).length}
            className="send--inner--container ">
            <div className="send--input--container">
                {createRecipients()}
            </div>

            <div className="padding--top--ten ">
                {hasGas ?
                    <div className="align--row--space--start" style={{ width: "95%" }} >
                        <GasSelector onGasUpdate={e => onGasUpdate(e)} resetGas={gasDefault} />
                        <div className="total--cost" key={priceKey}>
                            <h2>{TOTAL_COST} {totalPrice()}</h2>
                        </div>
                    </div>
                    : null}
            </div>
            <div className="btn--row--send">
                { /*<div className="padding-five">
                    <Button
                        buttonStyle="btn--secondary--solid"
                        buttonSize="btn--small"
                        handleClick={() => addRecipient()}>{ADD_RECIPIENT}</Button>
                </div>*/}
                <div className="padding-five">
                    <Button
                        key={sendBtnKey}
                        buttonStyle="btn--secondary--solid "
                        buttonSize="btn--small"
                        disabled={disableSendBtn}
                        handleClick={() => checkForLockedWallet()}>{SEND}</Button>
                </div>
            </div>
        </div>
    )

    function resetDefaults() {
        setGas(50 * 21000 / 1000000000);
        gasRef.current = (50 * 21000 / 1000000000);
        setGasDefault(Math.random());
        setSendAmount(0, "address1");
        setRecipients({ "address1": { "address": "", "amount": 0, "isValid": false } });
        setAmountRenderKey(Math.random());
    }

    function createRecipient(key) {
        const showRemove = key !== "address1";
        //console.log("render address", recipients[key].address);
        //console.log("render amount", recipients[key].amount);
        const amount = recipients[key].amount;
        const address = recipients[key].address;
        const isValid = recipients[key].isValid;
        return (
            <div key={address}>
                <SendInputs
                    showRemove={showRemove}
                    gas={gas}
                    amountKey={amountRenderKey}
                    removeRecipient={(e) => removeRecipient(e)}
                    setSendAddress={setSendAddress}
                    setIsValid={setAdddressValid}
                    recipientKey={key}
                    inputValueAmount={amount}
                    inputValueAddress={address}
                    isValid={isValid}
                />
            </div>

        )
    }

    function createRecipients() {
        return Object.keys(recipients).map((key) => createRecipient(key))
    }

    function totalPrice() {
        return parseFloat(parseInt(recipients["address1"].amount) + parseFloat(gas)).toFixed(7);
    }

    function onGasUpdate(e) {
        const amount = parseFloat(parseInt(recipients["address1"].amount) + e);
        console.log("amount: ", amount);
        setGas(e);
        gasRef.current = e;
    }

    function checkForLockedWallet() {

        let key = "address1";
        if (!Config.isDaemonBased()) {
            console.log("recipients ", recipients);
            // check address is valid first
            if (!recipients[key].isValid) {
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "on-send-warning", "Send address is not valid!");
                return;
            }
            // check amount is high enough
            if (recipients[key].amount <= 0) {
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "on-send-warning", "Send amount is too low!");
                return;
            }
            console.log("activeAccount[0] ", activeAccount[0])
            let message = {
                command: "unlockfortime",
                alias: activeAccount[0]
            }
            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "wallet-lock-trigger", message);
        } else {
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
    }
    async function sendCoins(data = null) {
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
        if (Config.isDaemonBased()) {
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
                        setRecipients({ "address1": { "address": "", "amount": 0, "isValid": false } });
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
                    sendDesktopNotification(gt.gettext("Successfully sent to many"));
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");

                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-info-update");
                    setRecipients({ "address1": { "address": "", "amount": 0, "isValid": false } });
                }, (stderr) => {
                    console.error(stderr);
                    // send error notification
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                });
            }
        } else {
            // default key
            //console.log("data ", data)
            let key = "address1";
            let obj = {
                fromAddress: data.account.address,
                toAddress: recipients[key].address,
                payAmount: recipients[key].amount,
                gas: gasRef.current,
                privatekey: data.key
            }
            //console.log("Config.getCurrentAccount()[0].address ", Config.getCurrentAccount()[0].address)
            //console.log("data.account.address ", data.account.address)

            // enable once we have access to testnet
            nodeClient.transfer(obj).then((result) => {
                console.log("result: ", result);
                sendDesktopNotification(`${copy1} ${recipients[key].amount} ${Config.getProjectTicker()} ${copy2} ${recipients[key].address}`);
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-info-update");
            }).catch((err) => {
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "on-send-warning", err);
                console.log("error send: ", err)
            })

            /* nodeClient.transfer(obj, (result) => {
                 console.log("result: ", result);
                 sendDesktopNotification(result);
             }, (stderr) => {
                 ipcRenderer.sendTo(remote.getCurrentWebContents().id, "on-send-warning", stderr);
                 console.log("error send: ", stderr)
             });*/
            obj = null;
            data = null;
            //ipcRenderer.sendTo(remote.getCurrentWebContents().id, "on-send-warning", "sending is disabled for now");
            resetDefaults();
            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
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
        setRecipients({ "address1": { "address": "", "amount": 0, "isValid": false } });
        setRecipientCounter(2);
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "cancel-send-operation");
    }
    function addRecipient() {
        const key = "address".concat(recipientCounter);
        setRecipientCounter(recipientCounter + 1);
        setRecipients(Object.assign(recipients, { [key]: { "address": "", "amount": 0, "isValid": false } }));
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
        Object.keys(recipients).map(key => {
            if (key === recipientKey) {
                recipients[key].amount = v;
            }
        })
        //console.log("updateAmount ", recipients);
        updateRecipients(recipients, recipientKey);
    }

    function setAdddressValid(v, recipientKey) {
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
        // setDisableSendButton(unlockButton);
    }


}

export default Send;