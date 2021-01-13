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

import React, { useState, useEffect } from "react";
import Content from "../content";
import Button from "../../common/components/Button";
import RPCClient from "../../common/rpc-client.js";
import EnterField from "../../common/components/EnterField";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clipboard } from "electron";
import lodash from 'lodash';
import Address from "../../common/components/Address";
import Accounts from "../../common/components/Accounts";
import { sendDesktopNotification } from "../../common/components/DesktopNotifications";
import "./addresses-content.css"
import { ipcRenderer, remote } from "electron";
import Store from "electron-store";
import HideZeroAddresses from "../../common/components/HideZeroAddresses";
import Config from "../../common/config";
import WarningMessage from "../../common/components/WarningMessage";

const store = new Store();
library.add(faClipboard);

function AddressesContent() {
	const [addressName, setAddressName] = useState("");
	const [clearField, setClearField] = useState("");
	const [responseAddress, setResponseAddress] = useState();
	const [localAddresses, setLocaAddresses] = useState();
	const [renderBool, setRenderBool] = useState(false);
	const [addressClipboard, setAddressClipboard] = useState("address-clipboard--hidden");
	const [renderKey, setRenderKey] = useState(Math.random());
	const [warningMessage, setWarningMessage] = useState("");
	useEffect(() => {
		listAddressGroupings();
		ipcRenderer.on('reload-addresses', (event, message) => {
			listAddressGroupings();
		});
		ipcRenderer.on("trigger-info-update", (event, message) => {
			listAddressGroupings();
		});
		ipcRenderer.on("accounts-updated", (event, message) => {
			const accounts = Config.getAccount();
			setLocaAddresses(accounts);
			setRenderKey(Math.random());
			if (message === "REMOVED") {
				ipcRenderer.sendTo(remote.getCurrentWebContents().id, "update-active-account", [accounts[0]]);
			}
		});
	}, []);

	return (
		<Content id="addressbook">
			{(Config.isDaemonBased()) ?
				<div>
					<div className="align--row--flexstart address--top--item">
						<EnterField
							key={renderBool}
							type={"text"}
							clearField={clearField}
							myStyle="accountNameInput"
							placeHolder="Enter Address Name:"
							updateEntry={onAddressChange} />
						<Button
							buttonStyle="btn--secondary--solid"
							buttonSize="btn--small"
							handleClick={() => onGenerateNewAddressClicked()}>Generate Address</Button>
					</div>
					<div>
						<div className={addressClipboard}>
							<div className="align--row--flexstart address--top--item">
								{responseAddress}
								<div>
									<FontAwesomeIcon size="lg" icon={faClipboard} color="white" onClick={copyToClipboardAndHide} />
								</div>
							</div>
						</div>
					</div>

					<div />
					<div>
						<div className="content--title">
							<HideZeroAddresses />
						</div>
					</div>
				</div>

				: null}

			<div>
				{warningMessage !== "" ? renderWarning() : <div className="error--text-start padding" >gap</div>}
				<div className="address--item" key={renderKey}>{getLocalAddresses()}</div>
			</div>

		</Content>
	);

	function removeAccount(account) {
		var accounts = Config.getAccount();
		if (accounts.length <= 1) {
			setWarningMessage("You must have at least one account in the wallet.");
		} else {
			const updatedArray = accounts.filter(function (obj) {
				return obj.name !== account.name;
			});

			store.delete("walletList");
			store.set("walletList", updatedArray);
			setLocaAddresses(updatedArray);
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "accounts-updated", "REMOVED");
		}

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

	function onAddressChange(v) {
		setAddressName(v);
		setClearField(v);
	}
	function getLocalAddresses() {
		// address, amount, account
		if (!localAddresses) return null;
		if (Config.isDaemonBased()) {
			return (
				Object.keys(localAddresses).map(key => {
					return (
						<Address
							key={key}
							data={localAddresses[key]}
							copyAddress={(v) => copyToClipboard(v)}
							setAccountName={(e) => updateAccountName(e)} />
					)
				})
			)
		} else {
			return (
				Object.keys(localAddresses).map(key => {
					return (
						<Accounts
							key={key}
							removeAccount={removeAccount}
							data={localAddresses[key]}
							copyAddress={(v) => copyToClipboard(v)}
							setAccountName={(e) => updateAccountName(e)} />
					)
				})
			)
		}

	}

	function updateAccountName(data) {
		var rpcClient = new RPCClient();
		let args = [data[0], data[1]];
		Promise.all([
			rpcClient.setAccountName(args),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			//console.log("updating account name ", data[0])
			listAddressGroupings();
		}, (stderr) => {
			console.error(stderr);
		});
	}

	function copyToClipboardAndHide() {
		clipboard.writeText(responseAddress, 'clipboard');
		console.log(clipboard.readText('clipboard'));
		sendDesktopNotification(`${responseAddress} copied to clipboard`);
		setAddressClipboard("address-clipboard--hidden");
	}
	function copyToClipboard(v) {
		//responseAddress
		clipboard.writeText(v, 'clipboard')
		console.log(clipboard.readText('clipboard'))
		sendDesktopNotification(`${v} copied to clipboard`);
	}

	async function listAddressGroupings() {

		if (Config.isDaemonBased()) {
			var rpcClient = new RPCClient();
			let showZeroBalanceAddresses = store.get("showzerobalance");
			Promise.all([
				rpcClient.listAddressGroupings(),
				new Promise(resolve => setTimeout(resolve, 500))
			]).then((response) => {

				let flat = lodash.flatten(response[0]);
				let order = []
				if (showZeroBalanceAddresses) {
					var filterArr = [];
					flat.forEach((address) => {
						if (address[1] != 0) {
							filterArr.push(address);
						}
					})
					order = lodash.orderBy(filterArr, [1], ['desc']);
					//console.log("omit 0 ", order);
				} else {
					order = lodash.orderBy(flat, [1], ['desc']);
				}

				setLocaAddresses(order);
			}, (stderr) => {
				console.error(stderr);
			});
		} else {
			var accounts = Config.getAccount();
			console.log("accounts: ", accounts)
			setLocaAddresses(accounts);
		}

	}
	async function onGenerateNewAddressClicked() {
		var rpcClient = new RPCClient();
		Promise.all([
			rpcClient.generateNewAddress([addressName]),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			setClearField("");
			setRenderBool(!renderBool);
			setAddressClipboard("address-clipboard--shown");
			setResponseAddress(response[0]);
		}, (stderr) => {
			console.error(stderr);
		});
	}
}

export default AddressesContent;

