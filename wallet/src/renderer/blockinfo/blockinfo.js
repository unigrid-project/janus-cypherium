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


import React from "react";
import RPCClient from "../../common/rpc-client.js";
import Tooltip from "react-simple-tooltip"
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faServer, faLock, faLockOpen, faCoins } from "@fortawesome/free-solid-svg-icons";
import { faSatelliteDish } from "@fortawesome/free-solid-svg-icons";
import './blockinfo.css';
import '../../common/theme.css';
import { fontFamily } from "../../common/theme.js";
import UnlockWallet from "./UnlockWallet.js";
import { ipcRenderer, remote } from "electron";


library.add(faServer, faLock, faLockOpen, faSatelliteDish, faCoins);

export default class BlockInfo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentBlock: 0,
			connections: 0,
			unlocked: true,
			walletMessage: "unlocked",
			staking: false,
			stakingMessage: "Staking inactive",
			connectionLevel: "red",
			toolTipFontSize: "10",
			toolTipFadeIn: 150
		};

		this.getBlockHeight(30000);
		this.updateInfo();

	}
	componentDidMount() {
		ipcRenderer.on("trigger-info-update", (event, message) => {
			this.updateInfo();
		});
	}
	render() {

		const {
			currentBlock,
			connections,
			unlocked,
			walletMessage,
			staking,
			stakingMessage,
			toolTipFontSize,
			toolTipFadeIn
		} = this.state;

		return (
			<div className="container">

				<div style={{ position: "relative" }} >
					<Tooltip
						arrow={5}
						fadeDuration={toolTipFadeIn}
						radius={10}
						fontFamily='Roboto'
						fontSize='5'
						fadeEasing="linear"
						content={walletMessage}
					>
						{unlocked ?
							<FontAwesomeIcon size="sm" icon="lock-open" color="green" onClick={() => this.openWalletUnlock("unlocked")} />
							:
							<FontAwesomeIcon size="sm" icon="lock" color="orange" onClick={() => this.openWalletUnlock("locked")} />
						}
					</Tooltip>
				</div>
				<div style={{ position: "relative" }} >
					<Tooltip
						//customCss={{ position: "absolute", top: "50%", right: "0", height: 20 }}
						fadeDuration={toolTipFadeIn}
						fadeEasing="linear"
						radius={10}
						fontFamily={fontFamily}
						fontSize={toolTipFontSize}
						content={stakingMessage}
					>
						{staking ?
							<FontAwesomeIcon size="sm" icon="coins" color="yellow" />
							:
							<FontAwesomeIcon size="sm" icon="coins" color="grey" />
						}
					</Tooltip>
				</div>
				<div style={{ position: "relative" }} >
					<Tooltip
						//style={{ position: "absolute", top: "50%", right: "0" }}
						fadeDuration={toolTipFadeIn}
						fadeEasing="linear"
						radius={10}
						fontFamily={fontFamily}
						fontSize={toolTipFontSize}
						content={connections}
					>
						{this.getConnectionIcon()}
					</Tooltip>
				</div>
				<div style={{ position: "relative" }} >
					<Tooltip
						//style={{ position: "absolute", top: "50%", right: "0" }}
						fadeDuration={toolTipFadeIn}
						fadeEasing="linear"
						radius={10}
						fontFamily={fontFamily}
						fontSize={toolTipFontSize}
						content={currentBlock}
					>
						<FontAwesomeIcon size="sm" icon="server" className="dish" />
					</Tooltip>
				</div>
				<UnlockWallet
					isChecked={false}
				/>
			</div>
		);
	}

	openWalletUnlock(message) {
		console.log(message);
		if (message === "unlocked") {
			//lock wallet
			this.lockWallet();
		} else {
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "wallet-lock-trigger", message);
		}
	}

	getConnectionIcon() {
		const { connections } = this.state;
		if (connections === 0) {
			return (
				<FontAwesomeIcon size="sm" icon="satellite-dish" color="red" />
			)
		} else if (connections > 0 && this.state.connections < 6) {
			return (
				<FontAwesomeIcon size="sm" icon="satellite-dish" color="orange" />
			)
		} else {
			return (
				<FontAwesomeIcon size="sm" icon="satellite-dish" color="green" />
			)
		}

	}

	async getBlockHeight(interval) {
		var rpcClient = new RPCClient();
		const { unlocked, staking, connections } = this.state;
		setInterval(() => {
			Promise.all([
				rpcClient.getinfo(),
				rpcClient.getStatus(),
				new Promise(resolve => setTimeout(resolve, 500))
			]).then((response) => {
				this.setState({
					currentBlock: response[0].blocks,
					connections: response[0].connections,
					unlocked: response[1].walletunlocked,
					staking: response[1]["staking status"]
				});
				if (response[1].walletunlocked) {
					this.setState({
						walletMessage: "unlocked"
					});
				} else {
					this.setState({
						walletMessage: "locked"
					});
				}
				if (response[1]["staking status"]) {
					this.setState({ stakingMessage: "Staking active" });
				} else {
					this.setState({ stakingMessage: "Staking inactive" });
				}

			}, (stderr) => {
				console.error(stderr);
			});
		}, interval);
	}
	async updateInfo() {
		var rpcClient = new RPCClient();
		console.log("updateInfo");
		const { unlocked, staking, connections } = this.state;
		Promise.all([
			rpcClient.getinfo(),
			rpcClient.getStatus(),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			this.setState({
				currentBlock: response[0].blocks,
				connections: response[0].connections,
				unlocked: response[1].walletunlocked,
				staking: response[1]["staking status"]
			});
			if (response[1].walletunlocked) {
				this.setState({
					walletMessage: "unlocked"
				});
			} else {
				this.setState({
					walletMessage: "locked"
				});
			}
			if (response[1]["staking status"]) {
				this.setState({ stakingMessage: "Staking active" });
			} else {
				this.setState({ stakingMessage: "Staking inactive" });
			}
		}, (stderr) => {
			console.error(stderr);
		});

	}

	async lockWallet() {
		var rpcClient = new RPCClient();
		Promise.all([
			rpcClient.walletLock(),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-info-update");
			console.log("wallet locked");
		}, (stderr) => {
			console.error(stderr);
		});
	}
}

//Synchronization finished<br />up to date<br />Processed 0 blocks of transaction history
/*

<Tooltip tooltip={"Synchronization finished<br />up to date<br />Processed 0 blocks of transaction history"}>
					<FontAwesomeIcon size="lg" icon="server" />
				</Tooltip>
*/
