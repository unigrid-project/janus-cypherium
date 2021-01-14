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
import Select from "react-select";
import Store from "electron-store";
import { Helmet } from "react-helmet";
import CoinGecko from "../../common/coingecko.js";
import RPCClient from "../../common/rpc-client.js";
import Content from "../content";
import "./mywallet-content.css";
import Button from "../../common/components/Button";
import Transaction from "../../common/components/Transaction";
import lodash from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faDiscord, faTelegram } from "@fortawesome/free-brands-svg-icons";
import Tooltip from "react-simple-tooltip";
import { css } from "styled-components";
//import { sendDesktopNotification } from "../../common/components/DesktopNotifications";
import { ipcRenderer, remote } from "electron";
import Send from "../../common/components/Send";
import Config from "../../common/config.js";
import NodeClient from '../../common/node-client';
import { WalletService } from "../../common/walletutils/WalletService.js";
import AccountSelection from "../../common/accounts/AccountSelection.js";
import CreateAccountButton from "../../common/components/CreateAccountButton.js";
var _ = require('electron').remote.getGlobal('_');

const log = require('electron-log');
const walletService = new WalletService();
const nodeClient = new NodeClient(Config.getNodeInfo());
const store = new Store();
const currency = store.get("currency", "usd");


function MyWalletContent(props) {
	const [currentSelectedAccount, setCurrentSelectedAccount] = useState(Config.getCurrentAccount());
	const [balance, setBalance] = useState(0);
	const [currencies, setCurrencies] = useState([]);
	const [selectedCurrency, setSelectedCurrency] = useState({ value: currency, label: currency, rate: 0 });
	const [transactions, setTransactions] = useState();
	const [sendKey, setSendKey] = useState();
	const [renderKey, setRenderKey] = useState(Math.random());
	const [sendState, setSendState] = useState(false);
	const [transactionClasses, setTransactionClasses] = useState("transaction--container--start");
	const [sendClasses, setSendClasses] = useState("send--container--start");
	const [passwordEntry, setpasswordEntry] = useState("");
	const [clearPassword, setClearPassword] = useState("");
	const [renderPWkey, setRenderPWKey] = useState(Math.random());
	const [walletList, setWalletList] = useState(Config.getAccount());
	const [renderListKey, setRenderListKey] = useState(Math.random());
	useEffect(() => {
		nodeClient.subscribeToBlocks();
		nodeClient.start();
		if (Config.isDaemonBased()) {
			getDataLocal();
		} else {
			getNodeData();
		}
		ipcRenderer.on("cancel-send-operation", (event, message) => {
			console.log("cencel send ");
			cancelSendOperation();
		});
		ipcRenderer.on("update-active-account", (event, account) => {
			setCurrentSelectedAccount(account);
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-info-update");
		});
		ipcRenderer.on("trigger-info-update", (event, message) => {
			if (Config.isDaemonBased()) {
				getDataLocal();
			} else {
				getNodeData();
			}
		});
		ipcRenderer.on("new-transactions-loaded", (event, obj) => {
			setTransactions(obj.transactions);
			setRenderKey(Math.random());
		});

		ipcRenderer.on("accounts-updated", (event, message) => {
			const accounts = Config.getAccount();
			setWalletList(accounts);
		});

		const interval = setInterval(() => {
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-info-update");
		}, 10000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		setRenderListKey(Math.random());
	}, [walletList]);
	return (
		<Content id="mywallet" className="allow-scroll" active={props.active} >
			{renderWidget()}
			<div>
				<div>
					<div className="fontSmallBold darkCopy dropdown--selection padding-ten align--row--stretch ">
						<div className="width--ninty" key={renderListKey}>
							<AccountSelection
								key={currentSelectedAccount}
								current={currentSelectedAccount}
								list={walletList}
							/>
						</div>
						<CreateAccountButton key="create" className="button" />
					</div>
					<div className="currency--send padding-ten">
						<h1>{balance} {Config.getProjectTicker()}</h1>
						<div className="btn--send">
							<Button
								buttonStyle="btn--secondary--solid"
								handleClick={() => onSendClicked()}
								buttonSize="btn--small">{_("SEND")}</Button>
						</div>

					</div>
				</div>
				
				<div className={transactionClasses}
					onAnimationEnd={onTransactionAnimationEnd}
					onAnimationStart={onTransactionAnimationStart}>
					<div className="cardGridContainer" key={renderKey}>
						{renderTransactions()}
					</div>
				</div>

				<div className={sendClasses}
					onAnimationEnd={onSendAnimationEnd}>
					<Send />
				</div>
				{renderSocial()}
			</div>
		</Content>
	);

	function renderWidget() {
		if (Config.getShowWidget()) {
			return (<Helmet>
				<script src="https://widgets.coingecko.com/coingecko-coin-price-marquee-widget.js" />
			</Helmet>)
		}
		return null;
	}

	function testDecrypt() {
		setClearPassword("");
		setRenderPWKey(Math.random());
		// create hash from password
		const hashedPassword = walletService.createHashFromKey(passwordEntry);
		// get local store accounts
		const walletList = store.get("walletList");
		const storedPassword = walletList[0].password;
		// checksum on both hashed password and stored hashed pw to see if they match
		if (walletService.checksum(hashedPassword) === walletService.checksum(storedPassword)) {
			console.log("Password matches!");
			walletService.decryptData(passwordEntry, walletList[0].privateKey).then((result) => {
				console.log("decrypted key: ", result)
			})
			setpasswordEntry("");
		} else {
			console.log("Password does not match!")
			setpasswordEntry("");
		}
		// if match then decrypt
		console.log("password", clearPassword);
	}

	function cancelSendOperation() {
		setSendState(false);
		setTransactionClasses("transaction--openposition close--animation");
		setSendClasses("send--close--animation send--container--open");
	}

	function onSendClicked() {
		setSendKey(Math.random());
		if (sendState === false) {
			// set this to true so you cant keep opening the send window
			setSendState(true);
			setTransactionClasses("transaction--container--start transaction--open--animation");
			setSendClasses("send--container--start send--open--animation");
		}
	}

	function onTransactionAnimationEnd() {
		if (transactionClasses === "transaction--container--start transaction--open--animation") {
			setTransactionClasses("transaction--openposition");
		} else if (transactionClasses === "transaction--openposition close--animation") {
			setTransactionClasses("transaction--container--start");
			// back to false so we can open again
			setSendState(false);
		}
	}

	function onSendAnimationEnd() {
		if (sendClasses === "send--container--start send--open--animation") {
			setSendClasses("send--container--open");
		} else if (sendClasses === "transaction--openposition close--animation") {
			setSendClasses("transaction--container--start");
			setSendState(false);
		}
	}
	function onTransactionAnimationStart() {
		console.log("onAnimationStart");
	}
	function renderSocial() {
		return (
			<div className="align--row social--conatiner">
				{Config.getTwitterLink() === "" ? null :
					<div className="social--padding">
						<a href={Config.getTwitterLink()} target="_blank">
							<Tooltip
								arrow={10}
								zIndex={200}
								fadeDuration={150}
								radius={10}
								fontFamily='Roboto'
								fontSize='5'
								fadeEasing="linear"
								content={_("Follow us")}
								customCss={css`white-space: nowrap;`}
							>
								<FontAwesomeIcon size="lg" icon={faTwitter} color="var(--social-icons)" />
							</Tooltip>
						</a>
					</div>
				}
				{Config.getDiscordLink() === "" ? null :
					<div className="social--padding">
						<a href={Config.getDiscordLink()} target="_blank">
							<Tooltip
								arrow={10}
								zIndex={200}
								fadeDuration={150}
								radius={10}
								fontFamily='Roboto'
								fontSize='5'
								fadeEasing="linear"
								content={_("Join discord")}
								customCss={css`white-space: nowrap;`}
							>
								<FontAwesomeIcon size="lg" icon={faDiscord} color="var(--social-icons)" />
							</Tooltip>
						</a>
					</div>}
				{Config.getTelegramLink() === "" ? null :
					<div className="social--padding">
						<a href={Config.getTelegramLink()} target="_blank">
							<Tooltip
								arrow={10}
								zIndex={200}
								fadeDuration={150}
								radius={10}
								fontFamily='Roboto'
								fontSize='5'
								fadeEasing="linear"
								content={_("Join telegram")}
								customCss={css`white-space: nowrap;`}
							>
								<FontAwesomeIcon size="lg" icon={faTelegram} color="var(--social-icons)" />
							</Tooltip>
						</a>
					</div>
				}
			</div>
		)
	}
	function renderTransactions() {
		//console.log("new transactions to render:", transactions)
		if (!transactions) return null
		// maybe change this size on window resizes
		let newArr = transactions.slice(0, 10);
		return (
			Object.keys(newArr).map(key => {
				return (
					<div key={key} className="cellPadding">
						<Transaction data={newArr[key]} index={key} style="trans--short" />
					</div>
				)
			})
		)
	}

	async function getDataLocal() {
		var coinGecko = new CoinGecko();
		var rpcClient = new RPCClient();
		var args = ["*", 10, 0, true];
		Promise.all([
			rpcClient.getbalance(),
			coinGecko.getsupported(),
			rpcClient.listTransactions(args),
		]).then((response) => {
			setBalance(response[0]);
			const order = lodash.orderBy(response[2], ['timereceived'], ['desc']);
			setTransactions(order);
			// TODO this should be coming from websockets
			// for now we can pass new incoming transactions in this signal
			// transactions-content can listen for this
			// if it finds new transactions add them to the display list on that screen
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "wallet-checked-transactions", order);
			coinGecko.getprice(Config.getCoinGeckoId(), response[1]).then((rates) => {
				var currencies = Object.entries(rates.unigrid).map((currency) => {
					var v = { value: currency[0], label: currency[0], rate: currency[1] };

					if (currency[0] == selectedCurrency) {
						this.setState({ selectedCurrency: v });
					}
					return v;
				});
				setCurrencies(currencies);
			});
		});
	}

	async function getNodeData() {
		console.log("account to load balance: ", Config.getCurrentAccount())
		nodeClient.getCphBalance(Config.getCurrentAccount()[0].address, (v) => {
			setBalance(v.toString());
		});
	}

	function onChange(e) {
		setSelectedCurrency(e);
		store.set("currency", e.value);
	}
}

export default MyWalletContent;