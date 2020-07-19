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

import React, { useState, useEffect } from "react";
import CheckBox from "../../common/components/CheckBox";
import EnterField from "../../common/components/EnterField";
import "../../common/theme.css";
import "./UnlockWallet.css";
import Button from "../../common/components/Button";
import RPCClient from "../../common/rpc-client.js";
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
    const [isSend, setIsSend] = useState(false);
    useEffect(() => {
        ipcRenderer.on('wallet-lock-trigger', (event, message) => {
            //console.log("wallet-lock-trigger: " + message)
            if (message === "unlockfortime") {
                // set params for unlock time 
                console.log("unlock for send");
                setInfoCopy("Unlock wallet for transactions");
                setIsSend(true);
            } else {
                setInfoCopy("Unlock wallet for staking");
                setIsSend(false);
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
        console.log("send? ", isSend)
        if (isSend) {
            //const args = [passPhrase, 0, true];
            sendArgs = [args, 5];
        } else {
            sendArgs = [args, 0, true];
        }

        Promise.all([
            rpcClient.unlockWallet(sendArgs),
            //rpcClient.raw_command("walletpassphrase", args),
            new Promise(resolve => setTimeout(resolve, 500))
        ]).then((response) => {
            if (isSend) {
                console.log("unlock response ", response);
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "send-coins");
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-unlock-wallet", "sending");
            } else {
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-unlock-wallet", "staking");
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