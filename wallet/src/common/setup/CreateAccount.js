/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2020 The UNIGRID Organization
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

import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ipcRenderer, remote } from "electron";
import React, { useState, useEffect } from "react";
import EnterField from '../components/EnterField';
import Button from "../components/Button";
import WarningMessage from "../components/WarningMessage";
import Expand from "react-expand-animated";
import { WalletService } from "../walletutils/WalletService";
import SelectionButton from "./SelectionButton";
import './SetupStyles.css';

var _ = require('electron').remote.getGlobal('_');
const log = require('electron-log');
const walletService = new WalletService();
const enterWalletName = _("Wallet Name");
const enterPassword = _("Password");
const repeatPassword = _("Repeat Password");

const CreateAccount = (props) => {
    const [clearField, setClearField] = useState("");
    const [walletName, setWalletName] = useState("");
    const [passPhrase, setPassphrase] = useState("");
    const [repeatPassphrase, setRepeatPassphrase] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [showStart, setShowStart] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [resetKey, setResetKey] = useState(Math.random());
    const [mnemonic, setMnemonic] = useState([]);
    const [mnemonicChallenge, setMnemonicChallenge] = useState([]);
    const [checkLength, setCheckLength] = useState(Math.random());
    const [showConfirmButton, setShowConfirmButton] = useState(false);
    const [mnemonicDisplay, setMnemonicDisplay] = useState("");
    const [originalMnemonic, setOriginalMnemonic] = useState("");
    useEffect(() => {
        if (warningMessage !== "") {
            setButtonDisabled(true);
        } else {
            setButtonDisabled(false);
        }
        console.log("disabled? ", buttonDisabled);

    }, [warningMessage]);

    useEffect(() => {
        setShowConfirmButton(mnemonicChallenge.length === mnemonic.length);
        var s = mnemonicChallenge.slice(0, mnemonicChallenge.length - 1).join(' ') + " " + mnemonicChallenge.slice(-1);
        setMnemonicDisplay(s);
        if (mnemonicChallenge.length === mnemonic.length)
            console.log("legnth matches");
    }, [checkLength]);

    return (
        <div>
            <div className="importaccount">
                <div className="padding-ten">
                    <FontAwesomeIcon size="lg"
                        onClick={() => onBackPressed()}
                        className="back"
                        icon={faChevronLeft} />
                </div>
            </div>
            <Expand open={showStart}>
                <div className="align--column--space-between">
                    <div className="fontSmallBold darkCopy">{_("Create a new CPH wallet")}</div>
                    <div key={resetKey}>
                        <div className="padding--top--five">
                            <div className="fontSmall darkCopy padding--left--five">{enterWalletName}</div>
                            <EnterField
                                type="text"
                                updateEntry={(v) => updateInput(v, "WALLET")}
                                myStyle={"medium--input--no--padding"}
                                placeHolder={enterWalletName}
                                clearField={walletName}
                            />
                        </div>
                        <div className="padding--top--five">
                            <div className="fontSmall darkCopy padding--left--five">{enterPassword}</div>
                            <EnterField
                                type={"password"}
                                clearField={passPhrase}
                                updateEntry={(v) => updateInput(v, "PASSPHRASE")}
                                myStyle={"medium--input--no--padding"}
                                placeHolder={enterPassword}
                            />
                        </div>
                        <div className="padding--top--five">
                            <div className="fontSmall darkCopy padding--left--five">{repeatPassword}</div>
                            <EnterField
                                type={"password"}
                                clearField={repeatPassphrase}
                                updateEntry={(v) => updateInput(v, "REPEAT")}
                                myStyle={"medium--input--no--padding"}
                                placeHolder={repeatPassword}
                            />
                        </div>
                        <div className="padding--top--five align--row--flexend">
                            <Button
                                handleClick={() => {
                                    onContiuePressed();
                                }}
                                disabled={buttonDisabled}
                                buttonSize="btn--small"
                                buttonStyle="btn--blue--solid">{_("Continue")}</Button>

                        </div>
                        {warningMessage !== "" ? renderWarning() : null}
                    </div>
                </div>
            </Expand>
            {renderCreateWallet()}
            {renderConfirmMnemonic()}
        </div>
    )

    function renderCreateWallet() {
        return (
            <Expand open={showCreate}>
                <div className="create--copy">
                    <div className="darkCopy">{_("This mnemonic phrase is uniquely generated, and grants you access to your wallet. Do NOT screenshot this page. Carefully write down your mnemonic phrase from left to right on a piece of paper, and save a copy offline. Don’t share your unique phrase with ANYONE. CAUTION: The Cypherium Team can NOT recover your funds if you lose your mnemonic phrase.")}</div>
                </div>
                <div className="align--center">
                    <div className="mnemonicContainer">{renderMnemonic(mnemonic)}</div>
                </div>
                <div className="padding--twenty align--row--flexend">
                    <Button
                        handleClick={() => {
                            onConntinueConfirmPressed();
                        }}
                        disabled={buttonDisabled}
                        buttonSize="btn--small"
                        buttonStyle="btn--blue--solid">{_("Continue")}</Button>

                </div>
            </Expand>

        )
    }

    function renderConfirmMnemonic() {
        return (
            <Expand open={showConfirm}>
                <div className="create--copy align--center">
                    <div className="darkCopy">{_("Please click the mnemonics by original order")}</div>
                </div>
                <div className="align--center" key={mnemonicDisplay}>
                    <EnterField
                        type="text"
                        clearField={mnemonicDisplay}
                        myStyle="mnemonic--challenge"
                        disabled={true}
                    />
                </div>
                <div className="align--center" key={resetKey}>
                    <div className="mnemonicContainer"> {renderMnemonic(shuffle(), true)}</div>
                </div>
                <div className="padding--twenty align--row--flexend ">
                    <div className="padding--twenty">
                        <Button
                            handleClick={() => {
                                onResetPressed();
                            }}
                            disabled={false}
                            buttonSize="btn--small"
                            buttonStyle="btn--blue--solid">{_("Reset")}</Button>
                    </div>
                    <div className="padding--twenty">
                        <Button
                            handleClick={() => {
                                onConfirmPressed();
                            }}
                            disabled={showConfirmButton}
                            buttonSize="btn--small"
                            buttonStyle="btn--blue--solid">{_("Confirm")}</Button>
                    </div>

                </div>
                {warningMessage !== "" ? renderWarning() : null}
            </Expand>
        )
    }

    function renderMnemonic(arr, clickable = false) {
        return (
            arr.map((item, i) => {
                return (
                    <div key={i}>
                        {clickable ?
                            <div className="padding-ten">
                                <SelectionButton
                                    canBeDisabled={false}
                                    item={item}
                                    selectedStyle="mnemonic--clickable--selected"
                                    unSelectedStyle="mnemonic--clickable"
                                    changeSelection={false}
                                    handleClick={(e) => onMnemonicClicked(e)}
                                />
                            </div>
                            :
                            <div className="padding-ten">
                                <div
                                    className="mnemonic--white "
                                >{item}</div>
                            </div>
                        }
                    </div>

                )
            })
        )
    }

    function shuffle() {
        let tmpArr = mnemonic.slice(0);
        var currentIndex = tmpArr.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = tmpArr[currentIndex];
            tmpArr[currentIndex] = tmpArr[randomIndex];
            tmpArr[randomIndex] = temporaryValue;
        }
        //console.log("shuffle: ", tmpArr);
        console.log("original: ", mnemonic);
        return tmpArr;
    }

    function onBackPressed() {
        resetDefaults();
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "go-back-setup", "CREATE");
    }

    function resetDefaults() {
        setShowCreate(false);
        setShowStart(true);
        setShowConfirm(false);
        setWalletName("");
        setPassphrase("");
        setRepeatPassphrase("");
        setClearField("");
        setMnemonic([]);
        setMnemonicDisplay([]);
        setMnemonicChallenge([]);
        setOriginalMnemonic("");
        setResetKey(Math.random());
    }

    function updateInput(v, from) {
        switch (from) {
            case "WALLET":
                setWalletName(v);
                break;
            case "PASSPHRASE":
                setPassphrase(v);
                break;
            case "REPEAT":
                setRepeatPassphrase(v);
                break;
        }
    }

    function onContiuePressed() {
        //setWarningMessage("WARNING DANGER WILL ROBINSON!~!!")
        if (walletName === "") {
            setWarningMessage(_("Please enter a wallet name"));
        }
        else if (passPhrase == "") {
            setWarningMessage(_("Please enter a password"));
        }
        else if (passPhrase !== repeatPassphrase) {
            setWarningMessage(_("Passwords do not match"));
        } else {
            setShowCreate(true);
            setShowStart(false);
            var generateMnemonic = walletService.generateRandomMnemonic();
            setOriginalMnemonic(generateMnemonic);
            var mnemonicArray = generateMnemonic.split(" ");
            setMnemonic(mnemonicArray);
            console.log("CONTINUE!", mnemonicArray.length)
        }
    }

    function onConfirmPressed() {
        //console.log("mnemonicDisplay ", mnemonicDisplay);
        //console.log("originalMnemonic ", originalMnemonic);
        if (mnemonicDisplay === originalMnemonic) {
            console.log("everything matches!");
            let credentials = {
                "wallet": walletName,
                "password": passPhrase
            }
            walletService.fromMnemonic(originalMnemonic).then((result) => {
                let account = result;
                let obj = {
                    account,
                    credentials
                }
                walletService.createNewWallet(obj).then(() => {
                    //console.log("data: ", obj);
                    obj = null;
                    resetDefaults();
                    setResetKey(Math.random());
                    ipcRenderer.send('open-main-window');
                }, (stderr) => {
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                    log.error(stderr);
                });
            });
        } else {
            setWarningMessage(_("mnemonic does not match please try again"));
        }
    }

    function onResetPressed() {
        setMnemonicDisplay([]);
        setMnemonicChallenge([]);
        setResetKey(Math.random());
    }

    function onConntinueConfirmPressed() {
        setShowCreate(false);
        setShowConfirm(true);
    }

    function renderWarning() {
        return (
            <WarningMessage
                message={warningMessage}
                onAnimationComplete={onAnimationComplete}
                startAnimation="error--text-start error--text--animation" />
        )
    }

    function onMnemonicClicked(i) {
        var tmpArray = mnemonicChallenge;
        if (!tmpArray.includes(i)) {
            tmpArray.push(i);
        } else {
            const filteredItems = tmpArray.filter(item => item !== i);
            tmpArray = filteredItems;
        }

        setMnemonicChallenge(tmpArray);
        setCheckLength(Math.random());
        //console.log("mnemonicChallenge: ", mnemonicChallenge);
        //console.log("mnemonicChallenge: ", mnemonicChallenge.length);
        //console.log("tmpArray: ", tmpArray);
        //console.log("item: ", i);
    }

    function onAnimationComplete() {
        setWarningMessage("");
    }
}
export default CreateAccount;