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
import CheckBox from "./CheckBox";
import EnterField from "./EnterField";
import "../theme.css";
import "./UnlockWallet.css";
import Button from "./Button";
import RPCClient from "../rpc-client.js";
import { ipcRenderer, remote } from "electron";

function UnlockWallet(props) {
    const [isStaking, setIsStaking] = useState(props.isChecked);
    const [passPhrase, setPassPhrase] = useState();
    const [keyContainer, setKeyContainer] = useState();
    const [errorClasses, setErrorClasses] = useState("error--text-start");
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [animationFinished, setIsAnimationFinished] = useState(true);
    const [infoCopy, setInfoCopy] = useState();
    const [classNames, setClassNames] = useState("unlock--container--start");
    const [unlockFor, setUnlockFor] = useState("");
    const [masternodeAlias, setMasternodeAlias] = useState();
    useEffect(() => {
        ipcRenderer.on('wallet-lock-trigger', (event, message) => {
            //console.log("wallet-lock-trigger: " + message)
            switch (message.command) {
                case "unlockfortime":
                    setInfoCopy("Unlock wallet for transactions");
                    setUnlockFor("SEND");
                    break;
                case "unlockfordump":
                    setInfoCopy("Unlock wallet for maintenance");
                    setUnlockFor("DUMP");
                    break;
                case "unlockforsplit":
                    setInfoCopy("Unlock wallet for maintenance");
                    setUnlockFor("SPLIT");
                    break;
                case "STARTALL":
                    setInfoCopy("Unlock wallet for masternodes");
                    setUnlockFor("STARTALL");
                    break;
                case "MISSING":
                    setInfoCopy("Unlock wallet for masternodes");
                    setUnlockFor("MISSING");
                    break;
                case "ALIAS":
                    console.log("alias passed into unlock: ", message.alias)
                    setInfoCopy("Unlock wallet for masternodes");
                    setUnlockFor("ALIAS");
                    setMasternodeAlias(message.alias);
                    break;
                default:
                    setInfoCopy("Unlock wallet for staking");
                    setUnlockFor("STAKE");
                    break;
            }
            openWindow();
        });
    }, []);
    useEffect(() => {
        setKeyContainer(Math.random());
        console.log("classNames ", classNames)
    }, [classNames])

    function openWindow() {
        setIsWindowOpen(true);
        console.log("open window ");
        setKeyContainer(Math.random());
        setClassNames("unlock--container--start open--animation");
    }

    function closeWindow() {
        setIsWindowOpen(false);
        setPassPhrase("");
        setErrorClasses("error--text-start");
        setClassNames("unlock--container--openposition close--unlock--animation");
    }

    function errorPassphrase() {
        setClassNames("unlock--container--openposition error-animation");
        setErrorClasses("error--text--animation");
    }

    function onAnimationEnd() {
        if (classNames === "unlock--container--openposition error-animation") {
            setClassNames("unlock--container--openposition");
        } else if (classNames === "unlock--container--openposition close--unlock--animation") {
            setClassNames("unlock--container--start");
            setKeyContainer(Math.random());
        }
        setIsAnimationFinished(true);
    }

    function onErrorEnd() {
        setErrorClasses("error--text-start");
    }

    function onAnimationStart() {
        console.log("onAnimationStart");
    }

    function handleCheckBox(event) {
        setIsStaking(event.target.value);
    }

    function textInputChange(value) {
        //console.log("text: " + value);
        setPassPhrase(value);
    }

    function clickListener(button) {
        //console.log(button);
        switch (button) {
            case "unlock":
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
                const args = passPhrase;
                sendPassphrase(args);

                // call RPC walletpassphrase passPhrase 0 isStaking 
                // wait for response
                // if error show
                // else
                // reset values close
                break;
            case "cancel":
                console.log("close");
                closeWindow();
                // close and reset values
                break;
            default:
                break;
        }
    }
    return (
        <div
            className={classNames}
            key={keyContainer}
            onAnimationEnd={onAnimationEnd}
            onAnimationStart={onAnimationStart}
        >
            <div className="copy--align">
                <div className="fontRegularBold padding">{infoCopy}</div>
                <div className={errorClasses} onAnimationEnd={onErrorEnd}> <div className="error--text padding">Passphrase Error!</div></div>
            </div>

            <EnterField
                type={"password"}
                clearField={passPhrase}
                updateEntry={textInputChange}
                myStyle={"unlockInput"}
            />
            <div className="buttonContainer">
                <div className="padding">
                    <Button
                        name="unlock"
                        handleClick={(v) => clickListener(v)}
                        titleStyle="fontSmallBold"
                        buttonStyle="btn--dark--solid"
                        buttonSize="btn--medium"
                    >
                        Unlock
            </Button>
                </div>
                <div className="padding">
                    <Button
                        name="cancel"
                        handleClick={(v) => clickListener(v)}
                        titleStyle="fontSmallBold"
                        buttonStyle="btn--warning--solid"
                        buttonSize="btn--medium"
                    >
                        Cancel
            </Button>
                </div>

            </div>
        </div>
    );

    async function sendPassphrase(args) {
        var rpcClient = new RPCClient();
        let sendArgs = [];
        console.log("send? ", unlockFor)
        switch (unlockFor) {
            case "SEND":
            case "STARTALL":
            case "MISSING":
                sendArgs = [args, 30];
                break;
            case "STAKE":
                sendArgs = [args, 0, true];
                break;
            case "DUMP":
            case "SPLIT":
                sendArgs = [args, 30];
                break;
            default:
                sendArgs = [args, 30];
                break;
        }

        Promise.all([
            rpcClient.unlockWallet(sendArgs),
            //rpcClient.raw_command("walletpassphrase", args),
            new Promise(resolve => setTimeout(resolve, 500))
        ]).then((response) => {
            let message = {
                command: "",
                alias: null
            }
            switch (unlockFor) {
                case "SEND":
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "send-coins");
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-unlock-wallet", "sending");
                    break;
                case "DUMP":
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-unlock-wallet", "dump");
                    break;
                case "SPLIT":
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-unlock-wallet", "split");
                    break;
                case "STAKE":
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-unlock-wallet", "staking");
                    break;
                case "STARTALL":
                    message.command = unlockFor;
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-start-masternode", message);
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-unlock-wallet", "masternode");
                    break;
                case "MISSING":
                    message.command = unlockFor;
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-start-masternode", message);
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-unlock-wallet", "masternode");
                    break;
                case "ALIAS":
                    message.command = unlockFor;
                    message.alias = masternodeAlias;
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-start-masternode", message);
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-unlock-wallet", "masternode");
                    break;
                default:
                    break;
            }

            console.log("should update info");
            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-info-update");
            closeWindow();
        }).catch((error) => {
            errorPassphrase();
            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
            console.log("wallet unlock error");
            console.error(error.message);
        });
    }
}

export default UnlockWallet;

/*
 <div>
                <CheckBox
                    label="Unlock for staking only:"
                    labelTheme="fontSmallBold"
                    selected={isStaking}
                    handleCheckBox={handleCheckBox}
                />
            </div>
*/