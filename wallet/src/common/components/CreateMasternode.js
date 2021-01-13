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
import "./CreateMasternode.css"
import EnterField from "./EnterField";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Expand from "react-expand-animated";
import Button from "./Button";
import RPCClient from "../rpc-client.js";
import { ipcRenderer, remote } from "electron";
import WarningMessage from "./WarningMessage";
import { sendDesktopNotification } from "./DesktopNotifications";
import CheckBox from "./CheckBox";
import Config from "../config";

var fs = require('fs');
var Client = require('ssh2').Client;
var conn;
function CreateMasternode({ copyScript, isVisible, closeMasternodeSetup }) {
    const [showTerminal, setShowTerminal] = useState(false);
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [host, setHost] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [vpsResponse, setVpsResponse] = useState(["Loading..."]);
    const [txidMasternode, setTxidMasternode] = useState("");
    const [connectionReady, setConnectionReady] = useState(false);
    const [masternodeOutput, setMasternodeOutput] = useState("");
    const [terminalKey, setTerminalKey] = useState(1);
    const [responseKey, setResponseKey] = useState(1);
    const [showMasternodeOutput, setShowMasternodeOutput] = useState(false);
    const [showManulaSetup, setShowManualSetup] = useState(false);
    const [debugInfo, setDebugInfo] = useState("");
    const [autoRestart, setAutoRestart] = useState(true);

    useEffect(() => {
        console.log("masternodeOutput ", masternodeOutput);
        if (masternodeOutput !== "")
            addToConfFile(Config.getMasternodeFile());
    }, [masternodeOutput]);
    /*useEffect(() => {
        //console.log("vpsResponse: ", vpsResponse);
    }, [vpsResponse]);*/

    return (
        <Expand open={isVisible}>
            <div className="createMasternodeContainer">
                <h1>Setup a new masternode:</h1>
                <br />
                <h3>To setup a new masternode follow these steps below.</h3>
                <ul>
                    <li>Create a new address and send exactly 3000 UGD.</li>
                    <li>Copy txid from the 3000 sent.</li>
                    <li>There are some options you have to install the masternode.</li>
                    <li>If you know what you are doing it can always be done manually.</li>
                    <li>If you are comfortable with using a Linux VPS you can copy and run our auto script.</li>
                    <li>Lastly you can connect directly to your VPS right from within this wallet. Which will output the info you need to copy and paste into masternode.conf</li>
                </ul>

                <div>
                    <Expand open={!connectionReady}>
                        <div className="masternode--button--padding">
                            <div className="align--row--flexstart">
                                <Button
                                    handleClick={() => {
                                        setShowTerminal(true);
                                        setMasternodeOutput("");
                                        setShowMasternodeOutput(false);
                                        setShowManualSetup(false);
                                    }}
                                    disabled={connectionReady}
                                    buttonSize="btn--tiny"
                                    buttonStyle="btn--success--solid">auto setup</Button>
                                <Button
                                    handleClick={() => {
                                        setShowManualSetup(!showManulaSetup);
                                        setShowTerminal(false);
                                    }}
                                    buttonSize="btn--tiny"
                                    buttonStyle="btn--dark--solid">manual setup</Button>
                            </div>
                        </div>
                    </Expand>
                    {renderConnectInfo()}
                    {renderTerminal()}
                    {renderManualSetup()}
                </div>
                <ul>
                    <li>Once the masternode.conf file is updated and saved you must restart the wallet.</li>
                    <li>After you restart, return to this screen and either start the single masternode or if you have more click on START ALL.</li>
                </ul>
                <div className="close-btn">
                    <div className="align--row--flexstart">
                        {/*<Button
                            handleClick={() => cancelConnection()}
                            buttonSize="btn--tiny"
                        buttonStyle="btn--danger--solid">cancel</Button>*/}
                        <Button
                            handleClick={() => closeMasternodeSetup()}
                            buttonSize="btn--tiny"
                            buttonStyle="btn--warning--solid">close</Button>
                    </div>
                </div>
            </div>
        </Expand>
    )

    async function connectToVPS() {
        if (!host) {
            setWarningMessage("Please enter your VPS host address!");
            return;
        }
        if (!user) {
            setWarningMessage("Please enter your VPS user!");
            return;
        }
        if (!pass) {
            setWarningMessage("Please enter your VPS password!");
            return;
        }
        if (!txidMasternode) {
            setWarningMessage("Please enter your TXID from the 3000 sent!");
            return;
        }

        conn = new Client();
        setIsConnecting(true);

        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
        conn.on('error', (err) => {
            catchConnectionError(err);
            setIsConnecting(false);
            conn.end();
            conn = null;
        });
        conn.on('ready', function () {
            console.log('Client :: ready');
            setShowTerminal(false);
            setIsConnecting(false);
            setConnectionReady(true);
            addDataToResponse("Loading...");
            conn.shell(function (err, stream) {
                if (err) {
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                    setWarningMessage("Error connecting to VPS please check credentials.");
                    throw err;
                }
                stream.on('close', function () {
                    console.log('Stream :: close');
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                    //setIsConnecting(false);
                    setConnectionReady(false);
                    conn.end();
                }).on('data', function (data) {
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                    if(!connectionReady){
                        // exit out
                        stream.end();
                    }
                    const response = data.toString();
                    if (response !== "" && !response.includes("[A")) {
                        addDataToResponse(response);
                    }
                    if (response.includes("[1;7m")) {
                        //remove substring and display output for user to copy
                        var saveResponse = response;
                        //console.log("MASTERNODE OUTPUT: ", saveResponse);
                        var part = saveResponse.substring(
                            saveResponse.lastIndexOf(";") + 3,
                            saveResponse.lastIndexOf("")
                        );
                        //console.log("part ", part);
                        setMasternodeOutput(part);
                        //setMasternodeOutput(saveResponse.substring(6, (saveResponse.length - 5)).replace(/[]/g, ''));
                        setShowMasternodeOutput(true);
                        stream.end();
                        setConnectionReady(false);
                        closeTerminal();
                    }
                    //console.log('OUTPUT: ' + data);
                });
                // TODO figure out how to pass in keyboard inputs
                stream.end(`${Config.getMasternodeSetupScript()}\n${txidMasternode}\n\n\n\n`)
                //stream.end('ls -l\nexit\n');
            });
        }).connect({
            host: host,
            port: 22,
            username: user,
            password: pass,
            tryKeyboard: true,
            readyTimeout: 99999
            //debug: e => showDebugInfo(e)
        });
    }

    function showDebugInfo(e) {
        if (!connectionReady)
            setDebugInfo(e);
    }

    function catchConnectionError(e) {
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
        setWarningMessage(e.toString());
        console.log(e);
    }

    function addDataToResponse(data) {
        //console.log("data: ", data);
        let tmpArr = vpsResponse;
        if (tmpArr.length >= 10) {
            tmpArr.shift();
        }
        tmpArr.push(data);
        setVpsResponse(tmpArr);
        //console.log("tmpArr ", tmpArr)
        setResponseKey(Math.random());
        //setVpsResponse(data);
    }

    function renderConnectInfo() {
        return (
            <Expand open={showTerminal} >
                <div className="display--box--container">
                    <h3>Connect directly to your VPS from here in the wallet. This will run the auto install script for you.</h3>
                    <div key={terminalKey}>
                        <h4>Enter your VPS info below to automatically connect from within the wallet.</h4>
                        <div className="align--row--flexstart">
                            <EnterField
                                type="text"
                                myStyle="xsmallInput"
                                updateEntry={(v) => setHost(v)}
                                clearField={""}
                                placeHolder="vps address"
                            />
                            <EnterField
                                type="text"
                                myStyle="xsmallInput"
                                updateEntry={(v) => setUser(v)}
                                clearField={""}
                                placeHolder="user"
                            />
                            <EnterField
                                type={"password"}
                                myStyle="xsmallInput"
                                updateEntry={(v) => setPass(v)}
                                clearField={""}
                                placeHolder="password"
                            />

                        </div>
                        <div className="align--row--flexstart">
                            <EnterField
                                type={"password"}
                                myStyle="medium--input"
                                updateEntry={(v) => setTxidMasternode(v)}
                                clearField={""}
                                placeHolder="paste your txid here"
                            />
                            <Button
                                key={isConnecting}
                                handleClick={() => connectToVPS()}
                                buttonSize="btn--tiny"
                                disabled={isConnecting}
                                buttonStyle="btn--success--solid">connect</Button>
                            <Button
                                handleClick={() => closeTerminal()}
                                buttonSize="btn--tiny"
                                buttonStyle="btn--warning--solid">cancel</Button>
                        </div>
                        <div className="align--row--flexstart">
                            <CheckBox key={autoRestart}
                                selected={autoRestart}
                                labelTheme="settings--fonts"
                                label=" Auto restart wallet when completed."
                                handleCheckBox={(e) => onCheckboxClicked(e.target.checked)} />
                        </div>
                        {warningMessage !== "" ? renderWarning() : renderDebug()}
                    </div>
                </div>
            </Expand>
        )
    }

    function renderTerminal() {
        return (
            <Expand open={connectionReady}>
                <div className="display--box--container">
                    <div>Please be patient while the script runs its course as this may take a while to complete.
                    Once complete restart your wallet and start the masternode from this page.</div>
                    <br />
                    <div>If you use this auto install script please consider donating to @mcarper for creating this!</div>
                    <br />
                    <div className="masternode--item">
                        <div className="clipboard">
                            <FontAwesomeIcon size="sm" icon={faClipboard} color="white" onClick={() => copyScript(Config.getMasternodeSetupScript())} />
                        </div>
                        <div onClick={() => copyScript("HKSgkhmsbcHLSXHPtLXCFcHuxtCCJjhLFM")}>
                            HKSgkhmsbcHLSXHPtLXCFcHuxtCCJjhLFM</div>
                    </div>
                    <br />
                    <div className="scroll--box" key={responseKey}>
                        {renderTerminalOutput()}
                    </div>
                    <div className="padding">
                        <div className="align--row--flexend">
                            <Button
                                handleClick={() => cancelConnection()}
                                buttonSize="btn--tiny"
                                buttonStyle="btn--danger--solid">cancel</Button>
                        </div>
                    </div>
                </div>

            </Expand>
        )
    }

    function renderTerminalOutput() {
        //render only last items in the array
        return (
            vpsResponse.map((item, i) => {
                return (
                    <div key={i}>{item}</div>
                )
            })
        )
    }
    //
    function closeTerminal() {
        setShowTerminal(false);
        setHost("");
        setUser("");
        setPass("");
        setVpsResponse(["Loading..."]);
        setTxidMasternode("");
        setTerminalKey(Math.random());
        setIsConnecting(false);
        conn = null;
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
    }

    function cancelConnection() {
        setShowTerminal(true);
        setIsConnecting(false);
        setConnectionReady(false);
        setMasternodeOutput("");
        setVpsResponse(["Loading..."]);
        setShowMasternodeOutput(false);
        setShowManualSetup(false);
        conn = null;
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
    }

    function renderManualSetup() {
        return (
            <Expand open={showManulaSetup}>
                <div className="display--box--container">
                    <h3>To manually run setup, copy the below script, login to your VPS, and paste into the terminal.</h3>
                    <div className="masternode--item">
                        <div className="clipboard">
                            <FontAwesomeIcon size="sm" icon={faClipboard} color="white" onClick={() => copyScript(Config.getMasternodeSetupScript())} />
                        </div>
                        <div onClick={() => copyScript(Config.getMasternodeSetupScript())}>
                            Copy script</div>
                    </div>
                    <h4>After completing the above steps open your masternode.conf file and paste in the output from the install script.</h4>
                    <div className="masternode--button--padding">
                        <Button
                            handleClick={() => openConfFile(Config.getMasternodeFile())}
                            buttonSize="btn--tiny"
                            buttonStyle="btn--success--solid">masternode.conf</Button>
                    </div>
                </div>
            </Expand>
        )
    }

    function renderWarning() {
        return (
            <WarningMessage
                message={warningMessage}
                onAnimationComplete={onAnimationComplete}
                startAnimation="error--text-start error--text--animation" />
        )
    }

    function renderDebug() {
        if (isConnecting) {
            return (
                <div className="padding debug--info">Connecting...</div>
            )
        } else {
            return (<div><br /><br /></div>)
        }
    }

    function onCheckboxClicked(value) {
        setAutoRestart(value);
    }

    function onAnimationComplete() {
        setWarningMessage("");
    }

    async function addToConfFile(file) {
        var rpcClient = new RPCClient();
        console.log(file)
        let open = "/".concat(file);
        Promise.all([
            rpcClient.getdatadirectory(),
        ]).then((response) => {
            console.log("local directory: ", response[0]);
            let loc = response[0].directory;
            console.log("adding to conf file: ", masternodeOutput);
            fs.appendFile(loc.concat(open), '\n'.concat(masternodeOutput), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                setMasternodeOutput("");

                if (autoRestart) {
                    sendDesktopNotification("masternode.conf successfully updated! Restarting wallet.");
                    ipcRenderer.send('wallet-restart');
                } else {
                    sendDesktopNotification("masternode.conf successfully updated! Please restart your wallet to start this masternode.");
                }

            });
        }, (stderr) => {
            console.error(stderr);
        });
    }
    async function openConfFile(file) {
        var rpcClient = new RPCClient();
        console.log(file)
        let open = "/".concat(file);
        Promise.all([
            rpcClient.getdatadirectory(),
            new Promise(resolve => setTimeout(resolve, 500))
        ]).then((response) => {
            console.log("local directory: ", response[0]);
            let loc = response[0].directory;
            remote.shell.openPath(loc.concat(open));
        }, (stderr) => {
            console.error(stderr);
        });
    }
}
export default CreateMasternode;