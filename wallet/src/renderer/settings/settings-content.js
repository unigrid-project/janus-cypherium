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

import React, { useEffect, useState } from "react";
import Content from "../content";
import Store from "electron-store";
import Button from "../../common/components/Button";
import WarningMessage from "../../common/components/WarningMessage";
import Expand from "react-expand-animated";
import EnterField from "../../common/components/EnterField";
import "./settings-content.css";
import RPCClient from "../../common/rpc-client.js";
import { ipcRenderer, remote } from "electron";
import { sendDesktopNotification } from "../../common/components/DesktopNotifications";

const store = new Store();

function SettingsContent(props) {
	const [isEncrypted, setIsEncrypted] = useState(false);
	const [openEncrypt, setOpenEncrypt] = useState(false);
	const [passphrase, setPassphrase] = useState("");
	const [repeatPassphrase, setRepeatPassphrase] = useState("");
	const [warningMessage, setWarningMessage] = useState("");
	const [passKey, setPassKey] = useState();
	const [repeatKey, setRepeatKey] = useState();
	const [encryptKey, setEncryptKey] = useState();
	const [encryptingWallet, setEncryptingWallet] = useState(false);
	useEffect(() => {
		console.log("getting store: ");
		setIsEncrypted(store.get("encrypted"));
	}, [])
	useEffect(() => {
		console.log("isEncrypted: ", isEncrypted);

		setEncryptKey(Math.random());
	}, [isEncrypted])
	useEffect(() => {
		resetPassphraseContainer();
	}, [openEncrypt, encryptingWallet])

	return (
		<Content id="settings">
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

				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid">Backup Wallet</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid">Dump Wallet</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid">Dump Private Key</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid">Open Configuration</Button>
				<Button
					buttonSize="btn--tiny"
					buttonStyle="btn--secondary--solid">Open Masternode Configuration</Button>
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
		if (!openEncrypt) return null
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
}

export default SettingsContent;

