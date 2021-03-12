/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The Swipp developers <info@swippcoin.com>
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
import { ipcRenderer, remote, clipboard } from "electron";
import { sendDesktopNotification } from "../../common/components/DesktopNotifications";
import HideZeroAddresses from "../../common/components/HideZeroAddresses";
import Config from "../../common/config";
import File from "../../common/file";
import LanguageSelect from "../../common/languages/LanguageSelect";
import { CHANGE_DEFAULT, COPIED } from "../../common/getTextConsts";
import CustomTooltip from "../../common/components/CustomToolTip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";

var gt = require('electron').remote.getGlobal('gt');
const log = require('electron-log');
const packageJSON = require('../../../package.json');
const store = new Store();
var translations = remote.getGlobal('translations');
const copyToClipboard = gt.gettext("copy to clipboard");

function SettingsContent(props) {
	const confirmCpy = gt.gettext("Confirm");
	const cancelCpy = gt.gettext("Cancel");
	const dumpCpy = gt.gettext("Dump wallet for");
	const backupCpy = gt.gettext("Backup wallet.dat for");
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
	const [renderListKey, setRenderListKey] = useState(Math.random());
	const [renderKey, setRederKey] = useState(Math.random());

	useEffect(() => {
		//console.log("languages: ", store.get("languages"));
		if (Config.isDaemonBased())
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
		<Content id="settings" key={renderKey}>
			{renderVersionNumber()}
			<div className="main--settings-container" >
				{Config.isDaemonBased === true ? renderDaemonBased() : renderDefaultInfo()}

				<div className="fontSmallBold darkCopy language--selection" key={renderListKey}>
					<div className="padding--bottom--five padding--top--five ">
						{CHANGE_DEFAULT}
					</div>
					<LanguageSelect />
				</div>
				<div className="darkCopy fontSmallBold">
					<p>{gt.gettext("The Janus wallet is 100% free to use and there are no hidden transaction fees. If you enjoy using this wallet and would like to support futher development please consider donating.")}</p>
					<div className="align--row--normal padding-ten">
						<div className="padding-five">{gt.gettext("donation address: ")}</div>
						<div className="fontSmallBold darkCopy  align--row--stretch outline--border padding-five">
							<div className="align--center--row">{Config.getDonationAddress()}</div>
							<div className="clipboard">
								<CustomTooltip
									placement="left"
									item={<FontAwesomeIcon size="sm" icon={faClipboard} color="white" onClick={() => copyAddress(Config.getDonationAddress())} />}
									color="var(--dark--green)"
									content={<div className="fontSmallBold">{copyToClipboard}</div>}
								/>
							</div>
						</div>
					</div>
				</div>
				{/*<Button
					handleClick={() => {
						switchTheme()
					}}
					buttonSize="btn--tiny"
				buttonStyle="btn--success--solid">theme</Button>*/}
			</div>
		</Content>
	);

	function switchTheme() {
		ipcRenderer.sendTo(remote.getCurrentWebContents().id, "switch-themes", "DARK");
	}
	function renderDefaultInfo() {
		return (
			<div className="darkCopy fontSmallBold">
				<p>{gt.gettext("This wallet is developed and maintained by a third party ")} <a href="https://www.unigrid.org" target="_blank"><img src={File.get("ugd_logo.png")} className="piclet" />The UNIGRID Organization</a></p>
				<p>{gt.gettext("We are in no way affiliated with the Cypherium team or organization. ")}
					{gt.gettext("For support please visit the")} <a href="https://discord.gg/CRWZ7V5" target="_blank"> discord </a> {gt.gettext("server ")}
					{gt.gettext("and report any issues you may find to ")} <a href={getIssueUrl()} target="_blank">GitHub</a></p>
			</div>
		)
	}

	function getIssueUrl() {
		var owner = packageJSON.build.publish[0].owner;
		var repo = packageJSON.build.publish[0].repo;
		var gitLink = Config.getGithubUrl();
		var link = gitLink.concat(owner).concat("/").concat(repo).concat("/issues");

		return link;
	}
	function renderDaemonBased() {
		return (
			<div>
				<div>{gt.gettext("Settings")}</div>
				<Button
					key={encryptKey}
					handleClick={() => setOpenEncrypt(!openEncrypt)}
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					disabled={isEncrypted}>{gt.gettext("Encrypt Wallet")}</Button>
				<div>
					{renderEncryptWallet()}
				</div>
				<div>
					<HideZeroAddresses />
				</div>
				<Button
					handleClick={() => setOpenCombine(!openCombine)}
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid">{gt.gettext("Combine Rewards")}</Button>
				<div>
					{renderCombine()}
				</div>
				<Button
					handleClick={() => setOpenStakeSplit(!openStakeSplit)}
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid">{gt.gettext("Stake Split Threshold")}</Button>
				<div>
					{renderStakeSplit()}
				</div>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					handleClick={() => openSaveDialog("BACKUP")}>{gt.gettext("Backup Wallet")}</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					handleClick={() => checkIfEncrypted("unlockfordump")}>{gt.gettext("Dump Wallet")}</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					handleClick={() => importKeys()}>{gt.gettext("Import Wallet")}</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					handleClick={() => openConfFile(Config.getConfFile())}>{gt.gettext("Open Config")}</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid"
					handleClick={() => openConfFile(Config.getMasternodeFile())}>{gt.gettext("Open Masternode Config")}</Button>
			</div>
		)
	}

	function copyAddress(v) {
		//responseAddress
		clipboard.writeText(v, 'clipboard')
		console.log(clipboard.readText('clipboard'))
		sendDesktopNotification(`${v} ${COPIED}`);
	}

	function resetPassphraseContainer() {
		setRepeatPassphrase("");
		setPassphrase("");
		setPassKey(Math.random());
		setRepeatKey(Math.random());
	}
	async function submitEncryptWallet() {
		if (passphrase !== repeatPassphrase) {
			setWarningMessage(gt.gettext("Passphrases do not match!"));
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
					<div>{gt.gettext("Enter a passphrase for the wallet.")}</div>
					<div>{gt.gettext("Please use a passphrase of 10 or more random characters or a minimum of 8 random words.")}</div>
					<div>{gt.gettext("After confirming your wallet will be encrypted then auto restarted.")}</div>
					<div className="input--fields">
						<EnterField
							placeHolder={gt.gettext("Passphrase")}
							type={"password"}
							clearField={passphrase}
							myStyle={"medium--input"}
							updateEntry={(v) => setPassphrase(v)} />
						<EnterField
							key={repeatKey}
							placeHolder={gt.gettext("Repeat Passphrase")}
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
							buttonStyle="btn--success--solid">{confirmCpy}</Button>
						<Button
							disabled={encryptingWallet}
							handleClick={() => setOpenEncrypt(!openEncrypt)}
							buttonSize="btn--tiny"
							buttonStyle="btn--warning--solid">{cancelCpy}</Button>
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
					<div>{gt.gettext("Enter a threshold amount.")}</div>
					<br />
					<div>{gt.gettext("The wallet will automatically monitor for any coins with a value below the threshold amount,	and combine them if they reside within the same address.")}</div>
					<br />
					<div>{gt.gettext("When combine rewards runs it will create a transaction, and therefore will be subject to transaction fees.")}</div>
					<div className="input--fields">
						<EnterField
							placeHolder={gt.gettext("Threshold amount")}
							type={"number"}
							clearField={passphrase}
							myStyle={"smallInput"}
							updateEntry={(v) => setThreshold(v)} />
					</div>
					<div className="confirm-btns">
						<Button
							handleClick={() => submitCombineAmount()}
							buttonSize="btn--tiny"
							buttonStyle="btn--success--solid">{confirmCpy}</Button>
						<Button
							handleClick={() => setOpenCombine(!openCombine)}
							buttonSize="btn--tiny"
							buttonStyle="btn--warning--solid">{cancelCpy}</Button>
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
							buttonStyle="btn--success--solid">{confirmCpy}</Button>
						<Button
							handleClick={() => {
								//setStakeSplitThreshold("");
								setOpenStakeSplit(!openStakeSplit)
							}}
							buttonSize="btn--tiny"
							buttonStyle="btn--warning--solid">{cancelCpy}</Button>
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
				title = `${dumpCpy} ${Config.getProjectName()}`;
				defaultName = "wallet-dump.txt";
				break;
			case "BACKUP":
				title = `${backupCpy} ${Config.getProjectName()}`;
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
						sendDesktopNotification(gt.gettext("Saved backup of wallet.dat"));
					}, (stderr) => {
						console.error(stderr);
					});
				} else {
					Promise.all([
						rpcClient.dumpWallet(args),
						new Promise(resolve => setTimeout(resolve, 500))
					]).then((response) => {
						console.log("dump wallet ", response)
						sendDesktopNotification(gt.gettext("Successfuly dumped private keys"));
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
			setWarningMessage(gt.gettext("Please enter a stake split amount!"));
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
			sendDesktopNotification(gt.gettext("Combine rewards enabled"));
			setOpenCombine(!openCombine);
		}, (stderr) => {
			console.error(stderr);
		});
	}

	async function importKeys() {
		const options = {
			title: gt.gettext("Import wallet .txt"),
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
					sendDesktopNotification(gt.gettext("Successfuly imported private keys"));
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
			<div className="version--release darkCopy">
				{coinName.concat("-").concat(coinVersion)}
			</div>
		)
	}
}

export default SettingsContent;


