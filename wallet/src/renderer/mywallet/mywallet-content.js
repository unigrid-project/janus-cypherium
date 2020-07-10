/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The Swipp developers <info@swippcoin.com>
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
import CoinGecko from "common/coingecko.js";
import RPCClient from "common/rpc-client.js";
import Content from "../content";
import "./mywallet-content.css";
import EnterField from "../../common/components/EnterField";
import Button from "../../common/components/Button";
import Transaction from "../../common/components/Transaction";

function MyWalletContent(props) {
	const store = new Store();
	const currency = store.get("currency", "usd");
	const [balance, setBalance] = useState(0);
	const [currencies, setCurrencies] = useState([]);
	const [selectedCurrency, setSelectedCurrency] = useState({ value: currency, label: currency, rate: 0 });
	const [sendAmount, setSendAmount] = useState();
	const [resetValue, setResetValue] = useState();
	const [sendAddress, setSendAddress] = useState();
	const [transactions, setTransactions] = useState();
	useEffect(() => {
		getData();
		getlatestTransactions();
	}, []);

	return (
		<Content id="mywallet">
			<Helmet>
				<script src="https://widgets.coingecko.com/coingecko-coin-price-marquee-widget.js" />
			</Helmet>

			<coingecko-coin-price-marquee-widget coin-ids="unigrid,swipp,bitcoin,litecoin,dogecoin"
				currency={selectedCurrency.value}
				background-color="#000" locale="en" />
			<div>
				<h1>{balance} UGD</h1>
				<h2>
					<span>Valued at {balance * selectedCurrency.rate}</span>
					<Select className="select" classNamePrefix="select" options={currencies}
						value={selectedCurrency} onChange={onChange} />
				</h2>
			</div>
			<div>
				{renderTransactions()}

			</div>
		</Content>
	);

	function renderTransactions(){
		if(!transactions) return null
		return(
			Object.keys(transactions).map(key => {
				return(
					<div key={key}><Transaction data={transactions[key]}/></div>
				)
			})
		)
	}
	async function getData() {
		var coinGecko = new CoinGecko();
		var rpcClient = new RPCClient();

		Promise.all([
			rpcClient.getbalance(),
			coinGecko.getsupported(),
		]).then((response) => {
			coinGecko.getprice("unigrid", response[1]).then((rates) => {
				var currencies = Object.entries(rates.unigrid).map((currency) => {
					var v = { value: currency[0], label: currency[0], rate: currency[1] };

					if (currency[0] == selectedCurrency) {
						this.setState({ selectedCurrency: v });
					}

					return v;
				});
				setBalance(response[0]);
				setCurrencies(currencies)
			});
		});
	}

	async function getlatestTransactions(args) {
		var rpcClient = new RPCClient();
		Promise.all([
			rpcClient.listTransactions(args),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			console.log('send');
			console.log(response);
			setTransactions(response[0]);
			setResetValue("");
		}, (stderr) => {
			console.error(stderr);
		});
	}

	function onChange(e) {
		setSelectedCurrency(e);
		store.set("currency", e.value);
	}


	async function sendCoins() {
		// we need to validate the address first
		// rpcClient.validateAddress(args),
		var rpcClient = new RPCClient();
		const args = [sendAddress, parseInt(sendAmount)];
		Promise.all([
			rpcClient.sendToAddress(args),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			console.log('send');
			console.log(response);
			setResetValue("");
		}, (stderr) => {
			console.error(stderr);
		});
	}

}

export default MyWalletContent;

/*
	<h1>Send UGD</h1>
				<h2>
					<span>Send to:
						<EnterField
							type={"text"}
							clearField={resetValue}
							style={"unlockInput"}
							onChange={v => setSendAddress(v)}
						/>
					</span>
				</h2>
				<h2>
					<span>Amount:
					<EnterField
							type={"tenumberxt"}
							clearField={resetValue}
							style={"unlockInput"}
							onChange={v => setSendAmount(v)} />
					</span>
				</h2>

				<span><Button handleClick={() => sendCoins()}>SEND</Button></span>
				*/