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
import "./transactions-content.css";
import ExportCSV from "../../common/components/ExportCSV";
import TransactionLoader from "./TransactionLoader";
import _ from "lodash";
import { ipcRenderer, remote } from "electron";

function TransactionsContent(props) {
	const [transactions, setTransactions] = useState({});
	const scroll = useRef(null);
	const [pageCount, setPageCount] = useState(1);
	//const [dataLength, setDataLength] = useState(0);
	const [doneLoading, setDoneLoading] = useState(false);
	const [loadingStatus, setLoadingStatus] = useState("idle");
	const [totalTxCount, setTotalTxCount] = useState();
	const [loadMore, setLoadMore] = useState(false);
	useEffect(() => {
		loadTransactionData(true);
	}, []);

	useEffect(() => {
		// load more transactions 
		loadTransactionData(loadMore);
	}, [loadMore]);

	return (
		<Content id="transactions" >
			<div className="transaction--container transaction--top--item" ref={scroll}>
				<div className="align--row--flexstart">
					<Button handleClick={() => loadTransactionData(false)} buttonSize="btn--small">
						Load Transactions
					</Button>
					<Button handleClick={exportToCSV} buttonSize="btn--small">
						Export CSV
					</Button><div></div>
				</div>
				<div >
					<TransactionLoader
						key={Object.keys(transactions).length}
						loadMore={loadMore}
						transactions={transactions}
						readyForMore={readyForMore}
						scroll={scroll}
						doneLoading={doneLoading} />
				</div>
			</div>
		</Content>
	);
	function readyForMore() {
		console.log("ready for more")
		setLoadMore(true);

	}
	async function loadTransactionData(load) {
		if (load) {
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
			setLoadingStatus("loading");
			//console.log('transactions?')

			var count = 1;
			var startNumber = Object.keys(transactions).length;
			if (pageCount > 1) {
				console.log("startNum ", startNumber)
				count = pageCount + 1;
				setPageCount(count);
				//setLoadCount(startNumber);
			}

			var rpcClient = new RPCClient();
			let args = ["*", parseInt(25), parseInt(startNumber)];

			Promise.all([
				rpcClient.listTransactions(args),
				rpcClient.getwalletinfo(),
				new Promise(resolve => setTimeout(resolve, 500))
			]).then((response) => {
				ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
				console.log("trans res ", response[0]);
				setTotalTxCount(response[1].txcount);
				console.log("total tx count: ", response[1].txcount);
				if (response[0].length === 0) {
					console.log("DONE LOADING ALL TRANSACTIONS!");
					setDoneLoading(true);
					setLoadMore(true);
					return;
				}
				const order = _.orderBy(response[0], ['timereceived'], ['desc']);
				let mergedLength = 0;
				// if loading new data merge transactions here
				if (count > 1) {
					const newOrder = transactions.concat(order);
					setTransactions(newOrder);
					setLoadMore(false);
				} else {
					count = pageCount + 1;
					setPageCount(count);
					setTransactions(order);
					setLoadMore(false);
				}
			}, (stderr) => {
				ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
				console.error(stderr);
			});
		}

	}

	function exportToCSV() {
		var rpcClient = new RPCClient();
		var exportCSV = new ExportCSV();
		let args = ["*", parseInt(10000000), parseInt(0)];
		console.log("time start: ", new Date());
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

}
export default TransactionsContent;

/*

		*/