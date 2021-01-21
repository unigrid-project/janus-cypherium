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

import { faChevronLeft, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ipcRenderer, remote } from "electron";
import React, { useState, useEffect } from "react";
import './SetupStyles.css';
import SelectionButton from "./SelectionButton";
import EnterField from "../components/EnterField";
import Button from "../components/Button";
import WarningMessage from "../components/WarningMessage";
import { WalletService } from "../walletutils/WalletService";
import NodeClient from "../node-client";
import Config from "../config";
import Gettext from 'node-gettext';
var gt = require('electron').remote.getGlobal('gt');

const log = require('electron-log');
const walletService = new WalletService();
const enterMnemonicCopy = gt.gettext("Please enter your mnemonics in original order, seperated by spaces.");
const privateKeyCopy = gt.gettext("Please enter your private key.");
const testingCopy = gt.gettext("Please enter any address to create a testing account. Preferably use one with many transactions.");
const enterWalletName = gt.gettext("Wallet Name");
const enterPassword = gt.gettext("Password");
const repeatPassword = gt.gettext("Repeat Password");
const nodeClient = new NodeClient();

const ImportAccount = (props) => {
    const [selections, setSelections] = useState([
        { name: gt.gettext("mnemonic"), selected: true, key: 0 },
        { name: gt.gettext("private key"), selected: false, key: 1 },
        { name: gt.gettext("testing"), selected: false, key: 2 }
    ]);
    const [warningMessage, setWarningMessage] = useState("");
    const [walletName, setWalletName] = useState("");
    const [mnemonic, setMnemonic] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [resetMnemonic, setResetMnemonic] = useState("");
    const [resetPrivateKey, setResetPrivateKey] = useState("");
    const [passPhrase, setPassphrase] = useState("");
    const [repeatPassphrase, setRepeatPassphrase] = useState("");
    const [resetKey, setResetKey] = useState(Math.random());
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [addressEntered, setAddressEntered] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);
    const [repeatShown, setRepeatShown] = useState(false);
    useEffect(() => {
        if (warningMessage !== "") {
            setButtonDisabled(true);
        } else {
            setButtonDisabled(false);
        }
        console.log("disabled? ", buttonDisabled);

    }, [warningMessage]);

    useEffect(() => {
        console.log("passwordShown ", passwordShown)
    }, [passwordShown])
    useEffect(() => {
        console.log("repeatShown ", repeatShown)
    }, [repeatShown])

    return (
        <div key={resetKey}>
            <div className="importaccount">
                <div className="padding-ten">
                    <FontAwesomeIcon size="lg"
                        onClick={() => onBackPressed()}
                        className="back"
                        icon={faChevronLeft} />
                </div>
            </div>

            <div className="align--center">
                <div className="offset--container">
                    <div
                        key={selections}
                        className="align--row--space-between button--container--width">
                        {selections.map((obj, i) => {
                            return (
                                <SelectionButton
                                    key={i}
                                    item={obj}
                                    selectedStyle="import--clickable--selected"
                                    unSelectedStyle="import--clickable"
                                    canBeDisabled={true}
                                    changeSelection={obj.selected}
                                    handleClick={(item) => onItemClicked(item)}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="align--center">
                <div className="offset--large--container">
                    {selections[0].selected ?
                        renderMnemonicContainer()
                        :
                        null}
                    {selections[1].selected ?
                        renderPrivateKeyContainer()
                        :
                        null}
                    {selections[2].selected ?
                        renderTestingConainer()
                        :
                        null}
                </div>
            </div>

        </div>
    )

    function onItemClicked(e) {
        //console.log("item clicked: ", e)
        var tmpArray = selections.slice(0);
        tmpArray.map((item, key) => {
            //console.log("items: ", key);
            if (item.key === e.key) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        })
        resetDefaults();
        setSelections(tmpArray);
    }

    function renderMnemonicContainer() {
        return (
            <div className="import--box--style">
                <div className="fontTiny darkCopy padding--top--left">
                    {enterMnemonicCopy}
                </div>

                <EnterField
                    type="text"
                    updateEntry={(v) => updateInput(v, "MNEMONIC")}
                    myStyle="mnemonic--import"
                    clearField={resetMnemonic}
                    disabled={false}
                />
                <div className="padding--top--five">
                    <div className="fontTiny darkCopy padding--top--left">{enterWalletName}</div>
                    <EnterField
                        type="text"
                        updateEntry={(v) => updateInput(v, "WALLET")}
                        myStyle={"small--input margin--left"}
                        placeHolder={enterWalletName}
                        clearField={walletName}
                    />
                </div>
                <div className="padding--top--five">
                    <div className="fontTiny darkCopy padding--top--left">{enterPassword}</div>
                    <div className="align--row--normal">
                        <EnterField
                            key={passwordShown}
                            type={passwordShown ? "text" : "password"}
                            clearField={passPhrase}
                            updateEntry={(v) => updateInput(v, "PASSPHRASE")}
                            myStyle={"small--input margin--left"}
                            placeHolder={enterPassword}
                        />
                        <div className="padding--left--five showpass">
                            <FontAwesomeIcon size="lg"
                                onClick={() => onShowPasswordClicked("PASSPHRASE")}
                                className="showpass"
                                icon={faEye} />
                        </div>
                    </div>
                </div>
                <div className="padding--top--five">
                    <div className="fontTiny darkCopy padding--top--left">{repeatPassword}</div>
                    <div className="align--row--normal">
                        <EnterField
                            key={repeatShown}
                            type={repeatShown ? "text" : "password"}
                            clearField={repeatPassphrase}
                            updateEntry={(v) => updateInput(v, "REPEAT")}
                            myStyle={"small--input margin--left"}
                            placeHolder={repeatPassword}
                        />
                        <div className="padding--left--five showpass">
                            <FontAwesomeIcon size="lg"
                                onClick={() => onShowPasswordClicked("REPEAT")}
                                className="showpass"
                                icon={faEye} />
                        </div>
                    </div>
                </div>
                <div className="padding--top--five align--row--flexend padding--right--twenty ">
                    <Button
                        handleClick={() => {
                            importWallet("MNEMONIC");
                        }}
                        disabled={buttonDisabled}
                        buttonSize="btn--small"
                        buttonStyle="btn--blue--solid">{gt.gettext("Import")}</Button>
                </div>
                {warningMessage !== "" ? renderWarning() : null}
            </div>
        )
    }

    function renderPrivateKeyContainer() {
        return (
            <div className="import--box--style">
                <div className="fontTiny darkCopy padding--top--left">
                    {privateKeyCopy}
                </div>

                <EnterField
                    type="text"
                    updateEntry={(v) => updateInput(v, "PRIVATEKEY")}
                    myStyle="mnemonic--import"
                    clearField={resetPrivateKey}
                    disabled={false}
                />
                <div className="padding--top--five">
                    <div className="fontTiny darkCopy padding--top--left">{enterWalletName}</div>
                    <EnterField
                        type="text"
                        updateEntry={(v) => updateInput(v, "WALLET")}
                        myStyle={"small--input margin--left"}
                        placeHolder={enterWalletName}
                        clearField={walletName}
                    />
                </div>
                <div className="padding--top--five">
                    <div className="fontTiny darkCopy padding--top--left">{enterPassword}</div>
                    <div className="align--row--normal">
                        <EnterField
                            key={passwordShown}
                            type={passwordShown ? "text" : "password"}
                            clearField={passPhrase}
                            updateEntry={(v) => updateInput(v, "PASSPHRASE")}
                            myStyle={"small--input margin--left"}
                            placeHolder={enterPassword}
                        />
                        <div className="padding--left--five showpass">
                            <FontAwesomeIcon size="lg"
                                onClick={() => onShowPasswordClicked("PASSPHRASE")}
                                className="showpass"
                                icon={faEye} />
                        </div>
                    </div>
                </div>
                <div className="padding--top--five">
                    <div className="fontTiny darkCopy padding--top--left">{repeatPassword}</div>
                    <div className="align--row--normal">
                        <EnterField
                            key={repeatShown}
                            type={repeatShown ? "text" : "password"}
                            clearField={repeatPassphrase}
                            updateEntry={(v) => updateInput(v, "REPEAT")}
                            myStyle={"small--input margin--left"}
                            placeHolder={repeatPassword}
                        />
                        <div className="padding--left--five showpass">
                            <FontAwesomeIcon size="lg"
                                onClick={() => onShowPasswordClicked("REPEAT")}
                                className="showpass"
                                icon={faEye} />
                        </div>
                    </div>
                </div>
                <div className="padding--top--five align--row--flexend padding--right--twenty ">
                    <Button
                        handleClick={() => {
                            importWallet("PRIVATE_KEY");
                        }}
                        disabled={buttonDisabled}
                        buttonSize="btn--small"
                        buttonStyle="btn--blue--solid">{gt.gettext("Import")}</Button>
                </div>
                {warningMessage !== "" ? renderWarning() : null}
            </div>
        )
    }

    function renderTestingConainer() {
        return (
            <div className="import--box--style">
                <div className="fontTiny darkCopy padding--top--left">
                    {testingCopy}
                </div>

                <EnterField
                    type="text"
                    updateEntry={(v) => updateInput(v, "TESTING")}
                    myStyle="mnemonic--import"
                    clearField={resetPrivateKey}
                    disabled={false}
                />
                <div className="padding--top--five">
                    <div className="fontTiny darkCopy padding--top--left">{enterWalletName}</div>
                    <EnterField
                        type="text"
                        updateEntry={(v) => updateInput(v, "WALLET")}
                        myStyle={"small--input margin--left"}
                        placeHolder={enterWalletName}
                        clearField={walletName}
                    />
                </div>

                <div className="padding--top--five align--row--flexend padding--right--twenty ">
                    <Button
                        handleClick={() => {
                            importWallet("TESTING");
                        }}
                        disabled={buttonDisabled}
                        buttonSize="btn--small"
                        buttonStyle="btn--blue--solid">{gt.gettext("Import")}</Button>
                </div>
                {warningMessage !== "" ? renderWarning() : null}
            </div>
        )
    }


    async function importWallet(type) {
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
        let checkValid = false;
        switch (type) {
            case "MNEMONIC":
                checkValid = checkMnemonic();
                break;
            case "PRIVATE_KEY":
                checkValid = checkPrivateKey();
                break;
            case "TESTING":
                await checkAddress().then((r) => {
                    checkValid = r;
                });
                break;
        }

        if (checkValid === true) {
            if (checkWalletName()) {
                if (passPhrase == "" && type !== 'TESTING') {
                    setWarningMessage(gt.gettext("Please enter a password"));
                }
                else if (passPhrase.length < 8 && type !== 'TESTING') {
                    setWarningMessage(gt.gettext("Password is too short enter a minimum of 8 characters."));
                }
                else if (passPhrase !== repeatPassphrase && type !== 'TESTING') {
                    setWarningMessage(gt.gettext("Passwords do not match"));
                }
                else {
                    let credentials = {
                        wallet: walletName,
                        password: passPhrase
                    }
                    switch (type) {
                        case "MNEMONIC":
                            walletService.fromMnemonic(mnemonic).then((result) => {
                                let account = result;
                                let obj = {
                                    account,
                                    credentials
                                }
                                walletService.createNewWallet(obj).then((account) => {
                                    //console.log("data: ", obj);
                                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "handle-wallet-creation", account);
                                    obj = null;
                                    resetDefaults();
                                    setResetKey(Math.random());
                                }, (stderr) => {
                                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                                    log.error(stderr);
                                });

                            });
                            break;
                        case "PRIVATE_KEY":
                            walletService.fromPrivateKey(privateKey).then((result) => {
                                let account = result;
                                let obj = {
                                    account,
                                    credentials
                                }
                                walletService.createNewWallet(obj).then((account) => {
                                    //console.log("data: ", obj);
                                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "handle-wallet-creation", account);
                                    obj = null;
                                    resetDefaults();
                                    setResetKey(Math.random());

                                }, (stderr) => {
                                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                                    log.error(stderr);
                                });
                            });
                            break;
                        case "TESTING":
                            let addressConverted = walletService.convertAddr(addressEntered);
                            let obj = {
                                account: {
                                    privateKey: "CDA6FE7C1CBB7B50BE779A04432B6EBT1F1494D3C8252C4D34164791D3AFF6E72BF2D489606F6805905CBABF3341C3714B1D6DC7AABFA80DA268C3BAC05F88549",
                                    address: addressConverted,
                                    publicKey: "BF2D489606F6805905CBABF3341C3514B1D6DC7AABFA80DA368C3B6C05F88549"
                                },
                                credentials: {
                                    password: "1234",
                                    wallet: walletName
                                }
                            }

                            walletService.createNewWallet(obj).then((account) => {
                                console.log("created new wallet: ", obj);
                                obj = null;
                                resetDefaults();
                                setResetKey(Math.random());
                                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "handle-wallet-creation", account);
                            }, (stderr) => {
                                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                                log.error(stderr);
                            });
                            break;
                    }
                }
            }
        }
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");

    }

    function onBackPressed() {
        resetDefaults();
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "go-back-setup", "IMPORT");
    }

    function onShowPasswordClicked(which) {
        switch (which) {
            case "PASSPHRASE":
                setPasswordShown(passwordShown ? false : true);
                break;
            case "REPEAT":
                setRepeatShown(repeatShown ? false : true);
                break;
        }setRepeatShown
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
            case "MNEMONIC":
                setMnemonic(v);
                break;
            case "PRIVATEKEY":
                setPrivateKey(v);
            case "TESTING":
                setAddressEntered(v);
        }
    }

    function resetDefaults() {
        setWalletName("");
        setMnemonic("");
        setPassphrase("");
        setPrivateKey("");
        setRepeatPassphrase("");
        setResetMnemonic("");
        setResetPrivateKey("");
        setPasswordShown(false);
        setRepeatShown(false);
        setResetKey(Math.random());
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

    function checkMnemonic() {
        if (mnemonic === "") {
            //let error = await this.helper.getTranslate('MNEMONIC_EMPTY');
            //this.mnemonicError = error
            setWarningMessage(gt.gettext("Please enter a mnemonic"));
            return false;
        }

        let tmMmnemonic = mnemonic.slice(0).replace(/^\s+|\s+$/, '');
        let mnemonicList = tmMmnemonic.split(/\s+/);
        if (mnemonicList.length !== 12) {
            setWarningMessage(gt.gettext("Mnemonic length is too short"));
            //let error = await this.helper.getTranslate('MNEMONIC_LENGTH_ERROR');
            //this.mnemonicError = error
            return false;
        }

        if (!walletService.validateMnemonic(mnemonic)) {
            setWarningMessage(gt.gettext("Invalid mnemonic"));
            return false;
        }
        return true;
    }

    function checkPrivateKey() {
        if (privateKey === "") {
            //let error = await this.helper.getTranslate('MNEMONIC_EMPTY');
            //this.mnemonicError = error
            setWarningMessage(gt.gettext("Please enter a private key"));
            return false;
        }
        if (privateKey.length !== 128) {
            setWarningMessage(gt.gettext("The length of PrivateKey must be 128"));
            return false;
        }
        if (!walletService.validatePrivate(privateKey)) {
            setWarningMessage(gt.gettext("Invalid private key"));
            return false;
        }
        return true;

    }

    function checkWalletName() {
        const accounts = Config.getAccount();
        if (walletName === "") {
            setWarningMessage(gt.gettext("Please enter a wallet name"));
            return false;
        }
        let match;
        if (accounts) {
            match = accounts.find(element => element.name === walletName);
            if (match) {
                setWarningMessage(gt.gettext("Please enter a unique wallet name"));
                return false;
            }
        }

        return true;

    }

    async function checkAddress() {
        let addressConverted = walletService.convertAddr(addressEntered);
        console.log("checkAddress ", addressConverted)

        if (addressConverted === "") {
            setWarningMessage(gt.gettext("Please enter an address"));
            return false;
        }

        await nodeClient.validateAddress(addressConverted, (v) => {
            if (v === false) {
                setWarningMessage(gt.gettext("The address you enetered is not valid. Please enter a valid address."));
                return false;
            } else {
                console.log('valid ', v)
            }
        });
        return true;
    }
}
export default ImportAccount;
