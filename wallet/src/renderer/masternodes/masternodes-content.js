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

import React, { useState, useEffect } from "react";
import Content from "../content";
import RPCClient from "../../common/rpc-client.js";
import Button from "../../common/components/Button";
import './masternodes-content.css';
import MasternodeCard from "../../common/components/MasternodeCard";
import path from "path";
import notifier from 'node-notifier';
import lodash from 'lodash';
import Store from "electron-store";
import { sendDesktopNotification } from "../../common/components/DesktopNotifications";
import { ipcRenderer, remote, clipboard } from "electron";
import CreateMasternode from "../../common/components/CreateMasternode";

const store = new Store();
var _ = require('electron').remote.getGlobal('_');

function MasternodesContent(props) {
	const [masternodeList, setMasternodeList] = useState({});
	const [listMasternodes, setListMasternodes] = useState({});
	const [filteredList, setFilteredList] = useState({});
	const [uniqueTxhashes, setUniqueTxashes] = useState({});
	const [currentAlias, setCurrentAlias] = useState();
	const [isEncrypted, setIsEncrypted] = useState(false);
	const [showCreateMasternode, setShowCreateMasternode] = useState(false);

	useEffect(() => {
		setIsEncrypted(store.get("encrypted"));
		var rpcClient = new RPCClient();
		getMasternodeList();
		ipcRenderer.on("trigger-start-masternode", (event, message) => {
			// sent back from UnlockWallet
			switch (message.command) {
				case "MISSING":
				case "STARTALL":
					masternodeCommand(message.command);
					break;
				case "ALIAS":
					console.log("alias passed into start: ", message.alias)
					startMasternodeAlias(message.alias);
					break;
				default:
					break;
			}
		});
		//update masternode info every 60 seconds
		const interval = setInterval(() => {
			getMasternodeList();
		}, 60000);
		return () => clearInterval(interval);
	}, []);

	return (
		<Content id="masternodes">
			<div className="topButtons">
				<Button handleClick={() => getMasternodeList()} buttonSize="btn--small">{_("REFRESH")}</Button >
				<Button handleClick={() => checkIfEncryptedStart("MISSING", null)} buttonSize="btn--small">{_("START MISSING")}</Button >
				<Button handleClick={() => checkIfEncryptedStart("STARTALL", null)} buttonSize="btn--small">{_("START ALL")}</Button >
				<Button handleClick={() => setShowCreateMasternode(true)} buttonSize="btn--small">{_("CREATE")}</Button >
			</div>

			<CreateMasternode isVisible={showCreateMasternode} copyScript={(v) => copyToClipboard(v)}
				closeMasternodeSetup={() => setShowCreateMasternode(false)} />

			<div className="cardGridContainer" key={showCreateMasternode}>
				{renderGrid()}
			</div>
		</Content>
	);
	function renderGrid() {
		if (filteredList) {
			return (
				Object.keys(filteredList).map(item => {
					return (
						<MasternodeCard className="cellPadding" key={item} data={filteredList[item]}
							onStartClicked={(e) => checkIfEncryptedStart("ALIAS", e)}
						/>
					)
				})
			)
		} else return null
	}

	function copyToClipboard(v) {
		clipboard.writeText(v, 'clipboard')
		console.log(clipboard.readText('clipboard'))
		sendDesktopNotification(`${v} ${_("copied to clipboard")}`);
	}

	async function debugMasternode() {

		var rpcClient = new RPCClient();
		const args = ["outputs"];
		Promise.all([
			rpcClient.masternodeCommand(args),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {

			console.log("masternode outputs: ", response[0]);

		}, (stderr) => {
			console.error(stderr);
		});
	}
	async function startMasternodeAlias(alias) {
		//"alias" "0" "my_mn"
		//console.log("start ", alias);
		setCurrentAlias(alias);
		var rpcClient = new RPCClient();
		const args = ["start-alias", "0", alias];
		Promise.all([
			rpcClient.masternodeCommand(args),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			// usuaully enough info
			// response[0].overall
			// more info on errors
			// response[0].detail[0] 
			sendDesktopNotification(response[0].overall)
			console.log("start masternode ", response[0]);
			getMasternodeList();
		}, (stderr) => {
			console.error(stderr);
		});
	}

	function checkIfEncryptedStart(cmd, node) {
		//setDisableDumpButton(true);

		let message = {
			command: cmd,
			alias: node
		}
		if (isEncrypted === true) {
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "wallet-lock-trigger", message);
		} else {
			if (cmd === "ALIAS") startMasternodeAlias(node);
			masternodeCommand(cmd);
		}
	}

	async function masternodeCommand(command) {
		var rpcClient = new RPCClient();
		switch (command) {
			case "STARTALL":
				Promise.all([
					rpcClient.masternodeCommand(["start-many", "0"]),
					new Promise(resolve => setTimeout(resolve, 500))
				]).then((response) => {
					console.log(response);
					sendDesktopNotification(response[0].overall);
					getMasternodeList();
				}, (stderr) => {
					console.error(stderr);
				});
				break;
			case "ALIAS":
				Promise.all([
					rpcClient.startMastrernodeAlias(currentAlias),
					new Promise(resolve => setTimeout(resolve, 500))
				]).then((response) => {
					console.log(response);
				}, (stderr) => {
					console.error(stderr);
				});
				break;
			case "MISSING":
				Promise.all([
					rpcClient.masternodeCommand(["start-missing", "0"]),
					new Promise(resolve => setTimeout(resolve, 500))
				]).then((response) => {
					console.log(response);
					sendDesktopNotification(response[0].overall);
					getMasternodeList();
				}, (stderr) => {
					console.error(stderr);
				});
				break;
			default:
				break;
		}
	}

	async function getMasternodeList() {
		var rpcClient = new RPCClient();
		Promise.all([
			rpcClient.masternodeCommand(["list-conf"]),
			rpcClient.masternodeCommand(["list"]),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			setMasternodeList(response[0]);
			setListMasternodes(response[1]);
			//console.log('nodes: ', response[1])
			filterMasternodeData(response[1], response[0]);
		}, (stderr) => {
			console.error(stderr);
		});
	}

	function filterMasternodeData(allNodes, localNodes) {
		let filtered = [];
		// filter through all active nodes
		// find matches with txhash and ipaddress
		Object.keys(allNodes).map(obj => {
			localNodes.map((key, i) => {
				if (allNodes[obj].txhash === localNodes[i].txHash
					&& allNodes[obj].ipaddr == localNodes[i].address) {
					//console.log("pushing: ", allNodes[obj])
					filtered.push(allNodes[obj]);
				}
			});
		});

		// merge new data with conf data by ipaddress
		const res = filtered.map(x => Object.assign(x, localNodes.find(y => y.address == x.ipaddr)));
		// add nodes from conf if they are missing or not yet activated
		Object.keys(localNodes).map(ln => {
			//console.log("res ", localNodes[ln])
			if (!lodash.find(res, { ipaddr: localNodes[ln].address })) {
				//console.log('did not find ', localNodes[ln].address)
				res.push(localNodes[ln]);
			} else {
				//console.log("found ip address do nothing ", localNodes[ln].address)
			}
		});

		//console.log("newFilter length" + Object.keys(res).length);
		//console.log("newFilter", res);

		setFilteredList(res);
	}
}

export default MasternodesContent;
