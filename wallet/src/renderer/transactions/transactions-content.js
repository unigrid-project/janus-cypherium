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

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import Content from "../content";
import Button from "../../common/components/Button";
import RPCClient from "../../common/rpc-client.js";
import Transaction from "../../common/components/Transaction";
import "./transactions-content.css";
import _ from "lodash";
import ExportCSV from "../../common/components/ExportCSV";

function TransactionsContent(props) {
	const [transactions, setTransactions] = useState(null);
	const ref = useRef(props.current);
	useEffect(() => {
		loadTransactionData();
	}, []);

	return (
		<Content id="transactions" >
			<div className="transaction--container transaction--top--item">
				<div className="align--row--flexstart">
					<Button handleClick={loadTransactionData} buttonSize="btn--small">
						Load Transactions
					</Button>
					<Button handleClick={exportToCSV} buttonSize="btn--small">
						Export CSV
					</Button><div></div>
				</div>

				<div>{transactions !== null ? renderTransactions() : null}</div>
			</div>
		</Content>
	);

	function loadTransactionData() {
		//console.log('transactions?')
		var rpcClient = new RPCClient();
		let args = ["*", parseInt(50), parseInt(0)];
		Promise.all([
			rpcClient.listTransactions(args),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			console.log("trans res ", response)
			const order = _.orderBy(response[0], ['timereceived'], ['desc']);
			setTransactions(order);
			console.log("transactions ", order)
		}, (stderr) => {
			console.error(stderr);
		});
	}
	function exportToCSV() {
		var rpcClient = new RPCClient();
		var exportCSV = new ExportCSV();
		let args = ["*", parseInt(10000000), parseInt(0)];
		console.log("time start: ",new Date());
		Promise.all([
			rpcClient.listTransactions(args),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			console.log("export CSV ", response[0])
			exportCSV.convert(response[0]);
		}, (stderr) => {
			console.error(stderr);
		});
	}
	function renderTransactions() {
		//console.log('render transactions', transactions)
		if (!transactions) return null;
		return (
			Object.keys(transactions).map(key => {
				return (
					<div key={key} className="transaction--item">
						<Transaction data={transactions[key]} index={key} style="trans--long" />
					</div>
				)
			})
		)
	}
}
export default TransactionsContent;

