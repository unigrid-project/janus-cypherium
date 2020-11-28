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
import Select from "react-select";
import Store from "electron-store";
import { Helmet } from "react-helmet";
import CoinGecko from "../../common/coingecko.js";
import RPCClient from "../../common/rpc-client.js";
import Content from "../content";
import "./mywallet-content.css";
import Button from "../../common/components/Button";
import Transaction from "../../common/components/Transaction";
import _ from "lodash";
import path from "path";
import { discordLink, twitterLink, telegramLink } from "../../common/consts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faDiscord, faTelegram } from "@fortawesome/free-brands-svg-icons";
import Tooltip from "react-simple-tooltip";
import { css } from "styled-components";
import { sendDesktopNotification } from "../../common/components/DesktopNotifications";
import { ipcRenderer, remote } from "electron";
import Send from "../../common/components/Send";


function MyWalletContent(props) {
	const store = new Store();
	const currency = store.get("currency", "usd");
	const [balance, setBalance] = useState(0);
	const [currencies, setCurrencies] = useState([]);
	const [selectedCurrency, setSelectedCurrency] = useState({ value: currency, label: currency, rate: 0 });
	const [transactions, setTransactions] = useState();
	const [sendKey, setSendKey] = useState();
	const [sendState, setSendState] = useState(false);
	const [transactionClasses, setTransactionClasses] = useState("transaction--container--start");
	const [sendClasses, setSendClasses] = useState("send--container--start");
	useEffect(() => {
		// testing mini-breakpad crash reports
		//process.crash();
		getData();
		ipcRenderer.on("cancel-send-operation", (event, message) => {
			console.log("cencel send ");
			cancelSendOperation();
		});

		ipcRenderer.on("trigger-info-update", (event, message) => {
			getData();
		});
		// get data every 30 seconds for now
		// this will be converted to a websocket 
		// in the future
		const interval = setInterval(() => {
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "trigger-info-update");
		}, 30000);
		return () => clearInterval(interval);
	}, []);

	return (
		<Content id="mywallet" className="allow-scroll" active={props.active}>
			<Helmet>
				<script src="https://widgets.coingecko.com/coingecko-coin-price-marquee-widget.js" />
			</Helmet>

			<coingecko-coin-price-marquee-widget coin-ids="unigrid,swipp,bitcoin,litecoin,dogecoin"
				currency={selectedCurrency.value}
				background-color="#000" locale="en" />
			<div>
				<div>
					<div className="currency--send">
						<h1>{balance} UGD</h1>
						<div className="btn--send">
							<Button
								buttonStyle="btn--secondary--solid"
								handleClick={() => onSendClicked()}
								buttonSize="btn--small">Send</Button>

						</div>
					</div>
					<h2>
						<span>Valued at {balance * selectedCurrency.rate}</span>
						<Select className="select" classNamePrefix="select" options={currencies}
							value={selectedCurrency} onChange={onChange} />
					</h2>
				</div>
				<div className={transactionClasses}
					onAnimationEnd={onTransactionAnimationEnd}
					onAnimationStart={onTransactionAnimationStart}>
					<div className="cardGridContainer">
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
		//console.log('discord ', discordLink)
		return (
			<div className="align--row social--conatiner">
				<div className="social--padding">
					<a href={twitterLink} target="_blank">
						<Tooltip
							arrow={10}
							zIndex={200}
							fadeDuration={150}
							radius={10}
							fontFamily='Roboto'
							fontSize='5'
							fadeEasing="linear"

							content="Follow us"
							customCss={css`
                    white-space: nowrap;
                  `}
						>
							<FontAwesomeIcon size="lg" icon={faTwitter} color="#1DA1F3" />
						</Tooltip>
					</a>
				</div>
				<div className="social--padding">
					<a href={discordLink} target="_blank">
						<Tooltip
							arrow={10}
							zIndex={200}
							fadeDuration={150}
							radius={10}
							fontFamily='Roboto'
							fontSize='5'
							fadeEasing="linear"

							content="Join discord"
							customCss={css`
                    white-space: nowrap;
                  `}
						>
							<FontAwesomeIcon size="lg" icon={faDiscord} color="#7289DA" />
						</Tooltip>
					</a>
				</div>
				<div className="social--padding">
					<a href={telegramLink} target="_blank">
						<Tooltip
							arrow={10}
							zIndex={200}
							fadeDuration={150}
							radius={10}
							fontFamily='Roboto'
							fontSize='5'
							fadeEasing="linear"

							content="Join telegram"
							customCss={css`
                    white-space: nowrap;
                  `}
						>
							<FontAwesomeIcon size="lg" icon={faTelegram} color="#24A1DE" />
						</Tooltip>
					</a>
				</div>
			</div>
		)
	}
	function renderTransactions() {
		if (!transactions) return null
		return (
			Object.keys(transactions).map(key => {
				return (
					<div key={key} className="cellPadding">
						<Transaction data={transactions[key]} index={key} style="trans--short" />
					</div>
				)
			})
		)
	}
	async function getData() {
		var coinGecko = new CoinGecko();
		var rpcClient = new RPCClient();
		var args = ["*", 10, 0, true];
		Promise.all([
			rpcClient.getbalance(),
			coinGecko.getsupported(),
			rpcClient.listTransactions(args),
		]).then((response) => {
			setBalance(response[0]);
			const order = _.orderBy(response[2], ['timereceived'], ['desc']);
			setTransactions(order);
			// TODO this should be coming from websockets
			// for now we can pass new incoming transactions in this signal
			// transactions-content can listen for this
			// if it finds new transactions add them to the display list on that screen
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "wallet-checked-transactions", order);
			coinGecko.getprice("unigrid", response[1]).then((rates) => {
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

	function onChange(e) {
		setSelectedCurrency(e);
		store.set("currency", e.value);
	}
}

export default MyWalletContent;