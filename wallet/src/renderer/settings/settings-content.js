/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The Swipp developers <info@swippcoin.com>
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

import React, { useEffect, useState, useRef } from "react";
import Content from "../content";
import Store from "electron-store";
import Button from "../../common/components/Button";
import CheckBox from "../../common/components/CheckBox";
import WarningMessage from "../../common/components/WarningMessage";
import Expand from "react-expand-animated";
import EnterField from "../../common/components/EnterField";
import "./settings-content.css";
import RPCClient from "../../common/rpc-client.js";
import { ipcRenderer, remote } from "electron";
import { sendDesktopNotification } from "../../common/components/DesktopNotifications";
import { projectName, confFile, masternodeFile } from "../../common/consts";
import HideZeroAddresses from "../../common/components/HideZeroAddresses";

const log = require('electron-log');
const packageJSON = require('../../../package.json');
const store = new Store();

function SettingsContent(props) {
	const [isEncrypted, setIsEncrypted] = useState(false);
	const [openEncrypt, setOpenEncrypt] = useState(false);
	const [openCombine, setOpenCombine] = useState(false);
	const [openStakeSplit, setOpenStakeSplit] = useState(false);
	const [passphrase, setPassphrase] = useState("");
	const [threshold, setThreshold] = useState(0);
	const [repeatPassphrase, setRepeatPassphrase] = useState("");
	const [warningMessage, setWarningMessage] = useState("");
	const [passKey, setPassKey] = useState();
	const [repeatKey, setRepeatKey] = useState();
	const [encryptKey, setEncryptKey] = useState();
	const [stakeSplitThreshold, setStakeSplitThreshold] = useState();
	const stakeSplitRef = useRef({});
	stakeSplitRef.current = stakeSplitThreshold;
	const [defaultStakeSplitThreshold, setDefaultStakeSplitThreshold] = useState();
	const [encryptingWallet, setEncryptingWallet] = useState(false);
	const [stakeSplitKey, setStakeSplitKey] = useState(Math.random());

	useEffect(() => {
		getStakeSplitThreshold();
		setIsEncrypted(store.get("encrypted"));
		ipcRenderer.on('trigger-unlock-wallet', (event, message) => {
			// sent back from UnlockWallet
			if (message === "dump") openSaveDialog("DUMP");
			if (message === "split") setSplitThreshold();
		});
	}, []);
	useEffect(() => {
		console.log("isEncrypted: ", isEncrypted);
		setEncryptKey(Math.random());
	}, [isEncrypted]);
	useEffect(() => {
		resetPassphraseContainer();
	}, [openEncrypt, encryptingWallet]);
	useEffect(() => {
		setStakeSplitKey(Math.random());
	}, [openStakeSplit]);

	return (
		<Content id="settings">
			{renderVersionNumber()}
			<div className="main--settings-container" >
				<div>Settings</div>
				<Button
					key={encryptKey}
					handleClick={() => setOpenEncrypt(!openEncrypt)}
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					disabled={isEncrypted}>Encrypt Wallet</Button>
				<div>
					{renderEncryptWallet()}
				</div>
				<div>
					<HideZeroAddresses />
				</div>
				<Button
					handleClick={() => setOpenCombine(!openCombine)}
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
				>Combine Rewards</Button>
				<div>
					{renderCombine()}
				</div>
				<Button
					handleClick={() => setOpenStakeSplit(!openStakeSplit)}
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
				>Stake Split Threshold</Button>
				<div>
					{renderStakeSplit()}
				</div>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					handleClick={() => openSaveDialog("BACKUP")}
				>Backup Wallet</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					handleClick={() => checkIfEncrypted("unlockfordump")}
				>Dump Wallet</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					handleClick={() => importKeys()}
				>Import Wallet</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					handleClick={() => openConfFile(confFile)}

				>Open Configuration</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					handleClick={() => openConfFile(masternodeFile)}
				>Open Masternode Configuration</Button>
			</div>
		</Content>
	);

	function resetPassphraseContainer() {
		setRepeatPassphrase("");
		setPassphrase("");
		setPassKey(Math.random());
		setRepeatKey(Math.random());
	}
	async function submitEncryptWallet() {
		if (passphrase !== repeatPassphrase) {
			setWarningMessage("Passphrases do not match!");
			setRepeatPassphrase("");
			setPassphrase("");
			setPassKey(Math.random());
			setRepeatKey(Math.random());
			return;
		}

		ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
		setEncryptingWallet(!encryptingWallet);
		var rpcClient = new RPCClient();
		Promise.all([
			rpcClient.encryptWallet([passphrase]),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {

			sendDesktopNotification(response[0]);
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
			setEncryptingWallet(!encryptingWallet);
			ipcRenderer.send("wallet-restart");

		}).catch((error) => {
			console.log("encryptWallet error")
			console.error(error.message);
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
			setEncryptingWallet(!encryptingWallet);
		});
	}

	function renderEncryptWallet() {
		//if (!openEncrypt) return <div/>
		return (
			<Expand open={openEncrypt}>
				<div className="input--container" key={passKey}>
					<div>Enter a passphrase for the wallet.</div>
					<div>Please use a passphrase of 10 or more random characters or a minimum of 8 random words.</div>
					<div>After confirming your wallet will be encrypted then auto restarted.</div>
					<div className="input--fields">
						<EnterField
							placeHolder="Passphrase"
							type={"password"}
							clearField={passphrase}
							myStyle={"medium--input"}
							updateEntry={(v) => setPassphrase(v)} />
						<EnterField
							key={repeatKey}
							placeHolder="Repeat Passphrase"
							type={"password"}
							clearField={repeatPassphrase}
							myStyle={"medium--input"}
							updateEntry={(v) => setRepeatPassphrase(v)} />
					</div>
					<div className="confirm-btns">
						<Button
							disabled={encryptingWallet}
							handleClick={() => submitEncryptWallet()}
							buttonSize="btn--tiny"
							buttonStyle="btn--success--solid">Confirm</Button>
						<Button
							disabled={encryptingWallet}
							handleClick={() => setOpenEncrypt(!openEncrypt)}
							buttonSize="btn--tiny"
							buttonStyle="btn--warning--solid">Cancel</Button>
						{warningMessage !== "" ? renderWarning() : null}
					</div>
				</div>
			</Expand >
		)
	}

	function renderCombine() {
		//if (!openEncrypt) return <div/>
		return (
			<Expand open={openCombine}>
				<div className="input--container" key={passKey}>
					<div>Enter a threshold amount.</div>
					<br />
					<div>The wallet will automatically monitor for any coins with a value below the threshold amount,
						and combine them if they reside within the same address.</div>
					<br />
					<div>When combine rewards runs it will create a transaction, and therefore will be subject to transaction fees.</div>
					<div className="input--fields">
						<EnterField
							placeHolder="Threshold amount"
							type={"number"}
							clearField={passphrase}
							myStyle={"smallInput"}
							updateEntry={(v) => setThreshold(v)} />
					</div>
					<div className="confirm-btns">
						<Button
							handleClick={() => submitCombineAmount()}
							buttonSize="btn--tiny"
							buttonStyle="btn--success--solid">Confirm</Button>
						<Button
							handleClick={() => setOpenCombine(!openCombine)}
							buttonSize="btn--tiny"
							buttonStyle="btn--warning--solid">Cancel</Button>
						{warningMessage !== "" ? renderWarning() : null}
					</div>
				</div>
			</Expand >
		)
	}

	function renderStakeSplit() {
		//if (!openEncrypt) return <div/>
		return (
			<Expand open={openStakeSplit}>
				<div className="input--container" key={passKey}>
					<div>Enter a stake split threshold amount.</div>
					<br />
					<div>This will set the output size of your stakes to never be below this number</div>
					<br />
					<div className="warning--message">Warning: this will restart your wallet.</div>
					<br />
					<div className="input--fields">
						<EnterField
							key={stakeSplitKey}
							placeHolder={defaultStakeSplitThreshold}
							type={"number"}
							myStyle={"smallInput"}
							updateEntry={(v) => {
								setStakeSplitThreshold(v)
							}} />
					</div>
					<div className="confirm-btns">
						<Button
							handleClick={() => checkIfEncrypted("unlockforsplit")}
							buttonSize="btn--tiny"
							buttonStyle="btn--success--solid">Confirm</Button>
						<Button
							handleClick={() => {
								//setStakeSplitThreshold("");
								setOpenStakeSplit(!openStakeSplit)
							}}
							buttonSize="btn--tiny"
							buttonStyle="btn--warning--solid">Cancel</Button>
						{warningMessage !== "" ? renderWarning() : null}
					</div>
				</div>
			</Expand >
		)
	}

	async function openSaveDialog(cmd) {
		//const savePath = remote.dialog.showSaveDialog(null);
		let title = "";
		let defaultName = "";
		switch (cmd) {
			case "DUMP":
				title = `Dump wallet for ${projectName}`;
				defaultName = "wallet-dump.txt";
				break;
			case "BACKUP":
				title = `Backup wallet.dat for ${projectName}`;
				defaultName = "wallet-backup.dat";
				break;
			default:
				break;
		}

		const options = {
			title: title,
			defaultPath: defaultName
		};

		remote.dialog.showSaveDialog(null, options, {})
			.then(result => {
				// pass filepath over to backupwallet rpc
				console.log("filename ", result.filePath);
				var rpcClient = new RPCClient();
				let args = [result.filePath];
				console.log("time start: ", new Date());
				if (cmd === "BACKUP") {
					Promise.all([
						rpcClient.backupWallet(args),
						rpcClient.getdatadirectory(),
						new Promise(resolve => setTimeout(resolve, 500))
					]).then((response) => {
						console.log("local directory: ", response);
						sendDesktopNotification("Saved backup of wallet.dat");
					}, (stderr) => {
						console.error(stderr);
					});
				} else {
					Promise.all([
						rpcClient.dumpWallet(args),
						new Promise(resolve => setTimeout(resolve, 500))
					]).then((response) => {
						console.log("dump wallet ", response)
						sendDesktopNotification("Successfuly dumped private keys");
					}, (stderr) => {
						console.error(stderr);
					});
				}
			}).catch(err => {
				console.log(err)
			})
	}

	function checkIfEncrypted(check) {
		//setDisableDumpButton(true);
		if (check === "unlockforsplit" && !stakeSplitThreshold) {
			setWarningMessage("Please enter a stake split amount!");
			return;
		}

		let message = {
			command: check,
			alias: null
		}
		if (isEncrypted === true) {
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "wallet-lock-trigger", message);
		} else {
			console.log("wallet isnt locked");
			switch (check) {
				case "unlockfordump":
					openSaveDialog("DUMP");
					break;
				case "unlockforsplit":
					setSplitThreshold();
					break;
			}

		}
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

	async function submitCombineAmount() {
		console.log("threshold ", threshold);
		var rpcClient = new RPCClient();

		let args = [Boolean(true), parseInt(threshold)];
		Promise.all([
			rpcClient.autocombinerewards(args),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			console.log("combine rewards: ", response[0]);
			sendDesktopNotification("Combine rewards enabled");
			setOpenCombine(!openCombine);
		}, (stderr) => {
			console.error(stderr);
		});
	}

	async function importKeys() {
		const options = {
			title: "Import wallet .txt",
		};
		remote.dialog.showOpenDialog(null, options, {})
			.then(result => {
				ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
				console.log("import keys ", result.filePaths[0]);
				var rpcClient = new RPCClient();
				let args = [result.filePaths[0]];
				Promise.all([
					rpcClient.importwallet(args),
					new Promise(resolve => setTimeout(resolve, 500))
				]).then((response) => {
					console.log("import result: ", response);
					sendDesktopNotification("Successfuly imported private keys");
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-info-update");
				}, (stderr) => {
					console.error(stderr);
				});
			}).catch(err => {
				console.log(err)
			})
	}

	function getStakeSplitThreshold() {
		var rpcClient = new RPCClient();
		Promise.all([
			rpcClient.getstakesplitthreshold(),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			log.info("Current stake split threshold set at: ", response[0])
			setDefaultStakeSplitThreshold(response[0]);
		}).catch((error) => {
			log.warn(error);
			console.error(error.message);
		});
	}

	function setSplitThreshold() {
		var rpcClient = new RPCClient();
		var args = [parseInt(stakeSplitRef.current)];
		ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
		Promise.all([
			rpcClient.setstakesplitthreshold(args),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			log.info("Stake split threshold was changed to: ", response[0].threshold);
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
			ipcRenderer.send("wallet-restart");
		}).catch((error) => {
			log.warn(error);
			setWarningMessage(error);
			console.error(error.message);
		});
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

	function renderVersionNumber() {
		var coinName = packageJSON.name;
		var coinVersion = packageJSON.version;

		return (
			<div className="version--release">
				{coinName.concat("-").concat(coinVersion)}
			</div>
		)
	}
}

export default SettingsContent;


