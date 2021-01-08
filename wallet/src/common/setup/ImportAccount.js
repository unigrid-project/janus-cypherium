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
import './SetupStyles.css';
import SelectionButton from "./SelectionButton";
import EnterField from "../components/EnterField";
import Button from "../components/Button";
import WarningMessage from "../components/WarningMessage";
import { WalletService } from "../walletutils/WalletService";

var _ = require('electron').remote.getGlobal('_');
const log = require('electron-log');

const ImportAccount = (props) => {
    const [selections, setSelections] = useState([
        { name: _("mnemonic"), selected: true, key: 0 },
        { name: _("private key"), selected: false, key: 1 },
        { name: _("keystore"), selected: false, key: 2 }
    ]);
    const walletService = new WalletService();
    const enterMnemonicCopy = _("Please enter your mnemonics in original order, seperated by spaces.");
    const enterWalletName = _("Wallet Name");
    const enterPassword = _("Password");
    const repeatPassword = _("Repeat Password");
    const [warningMessage, setWarningMessage] = useState("");
    const [walletName, setWalletName] = useState("");
    const [mnemonic, setMnemonic] = useState("");
    const [resetMnemonic, setResetMnemonic] = useState("");
    const [passPhrase, setPassphrase] = useState("");
    const [repeatPassphrase, setRepeatPassphrase] = useState("");
    const [resetKey, setResetKey] = useState(Math.random());
    const [buttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {

    }, [])
    useEffect(() => {
        if (warningMessage !== "") {
            setButtonDisabled(true);
        } else {
            setButtonDisabled(false);
        }
        console.log("disabled? ", buttonDisabled);

    }, [warningMessage]);

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
                        <div className="import--box--style">
                            private key
             </div>
                        :
                        null}
                    {selections[2].selected ?
                        <div className="import--box--style">
                            keystore
             </div>
                        :
                        null}
                </div>
            </div>

        </div>
    )

    function onItemClicked(e) {
        console.log("item clicked: ", e)
        var tmpArray = selections.slice(0);
        tmpArray.map((item, key) => {
            console.log("items: ", key);
            if (item.key === e.key) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        })
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
                    <EnterField
                        type={"password"}
                        clearField={passPhrase}
                        updateEntry={(v) => updateInput(v, "PASSPHRASE")}
                        myStyle={"small--input margin--left"}
                        placeHolder={enterPassword}
                    />
                </div>
                <div className="padding--top--five">
                    <div className="fontTiny darkCopy padding--top--left">{repeatPassword}</div>
                    <EnterField
                        type={"password"}
                        clearField={repeatPassphrase}
                        updateEntry={(v) => updateInput(v, "REPEAT")}
                        myStyle={"small--input margin--left"}
                        placeHolder={repeatPassword}
                    />
                </div>
                <div className="padding--top--five align--row--flexend padding--right--twenty ">
                    <Button
                        handleClick={() => {
                            importWallet();
                        }}
                        disabled={buttonDisabled}
                        buttonSize="btn--small"
                        buttonStyle="btn--blue--solid">{_("Import")}</Button>
                </div>
                {warningMessage !== "" ? renderWarning() : null}
            </div>
        )
    }

    function importWallet() {
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
        if (checkMnemonic() === true) {
            console.log("mnemonic is valid")
            if (walletName === "") {
                setWarningMessage("Please enter a wallet name");
            }
            else if (passPhrase == "") {
                setWarningMessage("Please enter a password");
            }
            else if (passPhrase !== repeatPassphrase) {
                setWarningMessage("Passwords do not match");
            }
            else {
                let credentials = {
                    wallet: walletName,
                    password: passPhrase
                }
                walletService.fromMnemonic(mnemonic).then((result) => {
                    let account = result;
                    let obj = {
                        account,
                        credentials
                    }
                    walletService.createNewWallet(obj).then(() => {
                        //console.log("data: ", obj);
                        obj = null;
                        setWalletName("");
                        setPassphrase("");
                        setRepeatPassphrase("");
                        setResetKey(Math.random());
                        ipcRenderer.send('open-main-window');
                    }, (stderr) => {
                        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                        log.error(stderr);
                    });

                });
            }
        }
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");

    }

    function onBackPressed() {
        resetDefaults();
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "go-back-setup", "IMPORT");
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
        }
    }

    function resetDefaults() {
        setWalletName("");
        setMnemonic("");
        setPassphrase("");
        setRepeatPassphrase("");
        setResetMnemonic("");
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
            setWarningMessage("Please enter a mnemonic");
            return false;
        }

        let tmMmnemonic = mnemonic.slice(0).replace(/^\s+|\s+$/, '');
        let mnemonicList = tmMmnemonic.split(/\s+/);
        if (mnemonicList.length !== 12) {
            setWarningMessage(_("Mnemonic length is too short"));
            //let error = await this.helper.getTranslate('MNEMONIC_LENGTH_ERROR');
            //this.mnemonicError = error
            return false;
        }

        if (!walletService.validateMnemonic(mnemonic)) {
            setWarningMessage(_("Invalid mnemonic"));
            return false;
        }
        return true;
    }
}
export default ImportAccount;
