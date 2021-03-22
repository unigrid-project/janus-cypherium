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
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./UnlockWallet.css";
import Button from "./Button";
import RPCClient from "../rpc-client.js";
import { ipcRenderer, remote } from "electron";
import Config from "../config";
import { WalletService } from "../walletutils/WalletService";
import { CANCEL, PASSPHRASE_ERROR, UNLOCK } from "../getTextConsts";
import ExportKeys from "../export/ExportKeys";
var gt = require('electron').remote.getGlobal('gt');


const removeMsgOne = gt.gettext("Unlock wallet to remove ");
const removeMdgTwo = gt.gettext(" from stored keys");
const exportKeys = new ExportKeys();

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
    const [account, setAccount] = useState();
    const [passwordShown, setPasswordShown] = useState(false);
    useEffect(() => {
        ipcRenderer.on('wallet-lock-trigger', (event, message) => {
            console.log("wallet-lock-trigger: ", message)
            switch (message.command) {
                case "unlockfortime":
                    setInfoCopy(gt.gettext("Unlock wallet for transactions"));
                    setUnlockFor("SEND");
                    setAccount(message.alias);
                    break;
                case "unlockfordump":
                    setInfoCopy(gt.gettext("Unlock wallet for maintenance"));
                    setUnlockFor("DUMP");
                    break;
                case "unlockforsplit":
                    setInfoCopy(gt.gettext("Unlock wallet for maintenance"));
                    setUnlockFor("SPLIT");
                    break;
                case "STARTALL":
                    setInfoCopy(gt.gettext("Unlock wallet for masternodes"));
                    setUnlockFor("STARTALL");
                    break;
                case "MISSING":
                    setInfoCopy(gt.gettext("Unlock wallet for masternodes"));
                    setUnlockFor("MISSING");
                    break;
                case "ALIAS":
                    console.log("alias passed into unlock: ", message.alias)
                    setInfoCopy(gt.gettext("Unlock wallet for masternodes"));
                    setUnlockFor("ALIAS");
                    setMasternodeAlias(message.alias);
                    break;
                case "REMOVE_ACCOUNT":
                    console.log("alias passed into unlock: ", message.alias)
                    setInfoCopy(removeMsgOne + message.alias.name + removeMdgTwo);
                    setUnlockFor("REMOVE_ACCOUNT");
                    setAccount(message.alias);
                    break;
                case "EXPORT_KEYS":
                    setInfoCopy(gt.gettext("Unlock wallet for export"));
                    setUnlockFor("EXPORT_KEYS");
                    setAccount(message.alias);
                    break;
                case "EXPORT_KEYSTORE":
                    setInfoCopy(gt.gettext("Unlock wallet for export"));
                    setUnlockFor("EXPORT_KEYSTORE");
                    setAccount(message.alias);
                    break;
                default:
                    setInfoCopy(gt.gettext("Unlock wallet for staking"));
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
            <div className="copy--align ">
                <div className="fontRegularBold padding">{infoCopy}</div>
                <div className={errorClasses} onAnimationEnd={onErrorEnd}> <div className="error--text padding">{PASSPHRASE_ERROR}</div></div>
            </div>

            <div className="align--row--normal">
                <EnterField
                    key={passwordShown}
                    type={passwordShown ? "text" : "password"}
                    clearField={passPhrase}
                    updateEntry={textInputChange}
                    myStyle={"unlockInput"}
                />
                <div className="padding--left--five showpass">
                    <FontAwesomeIcon size="sm"
                        color="white"
                        onClick={() => onShowPasswordClicked("PASSPHRASE")}
                        className="showpass--unlock"
                        icon={faEye} />
                </div>
            </div>
            <div className="buttonContainer">
                <div className="padding">
                    <Button
                        name="unlock"
                        handleClick={(v) => clickListener(v)}
                        titleStyle="fontSmallBold"
                        buttonStyle="btn--dark--solid"
                        buttonSize="btn--medium"
                    >
                        {UNLOCK}
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
                        {CANCEL}
                    </Button>
                </div>

            </div>
        </div>
    );

    function onShowPasswordClicked(which) {
        switch (which) {
            case "PASSPHRASE":
                setPasswordShown(passwordShown ? false : true);
                break;
        }
    }

    async function sendPassphrase(args) {

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
            case "REMOVE_ACCOUNT":
            case "EXPORT_KEYS":
            case "EXPORT_KEYSTORE":
                sendArgs = args;
            default:
                sendArgs = [args, 30];
                break;
        }
        if (!Config.isDaemonBased()) {
            if (args === "" || args === undefined) {
                errorPassphrase();
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                return;
            }
            //console.log("account.password ", account.password)
            let walletService = new WalletService();
            const isValidPassword = walletService.checkPasswordHash(args, account.password);

            if (isValidPassword) {
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                switch (unlockFor) {
                    case "SEND":
                        walletService.decryptData(args, account.privateKey).then((key) => {
                            console.log("account in send: ", account)
                            let sendData = {
                                account: account,
                                key: key
                            }
                            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "send-coins", sendData);
                            sendData = null;
                            closeWindow();
                        });
                        break;
                    case "REMOVE_ACCOUNT":
                        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-delete-account", account);
                        walletService = null;
                        closeWindow();
                        break;
                    case "EXPORT_KEYS":
                        walletService.decryptData(args, account.privateKey).then((key) => {
                            let output = "Address: ".concat("CPH").concat(account.address).concat('\n').concat("key: ").concat(key);
                            key = "";
                            exportKeys.export(output, "PRIVATE_KEYS").then((result) => {
                                output = "";
                                walletService = null;
                                closeWindow();
                            })
                        });
                        break;
                    case "EXPORT_KEYSTORE":
                        walletService.decryptData(args, account.privateKey).then((key) => {
                            let keystore = walletService.exportKeystore(key, args);
                            console.log("keystore: ", keystore);
                            exportKeys.export(keystore, "KEYSTORE").then((result) => {
                                keystore = null;
                                key = null;
                                walletService = null;
                                closeWindow();
                            })
                        });
                        break;
                }


            } else {
                errorPassphrase();
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                return;
            }
        } else {
            var rpcClient = new RPCClient();
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