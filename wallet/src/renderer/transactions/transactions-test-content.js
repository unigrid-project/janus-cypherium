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

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import Content from "../content";
import Button from "../../common/components/Button";
import RPCClient from "../../common/rpc-client.js";
import "./transactions-content.css";
import { faChevronCircleDown, faChevronCircleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExportCSV from "../../common/components/ExportCSV";
import TransactionLoader from "./TransactionLoader";
import lodash from "lodash";
import { ipcRenderer } from "electron";
import * as remote from '@electron/remote';
import InfiniteLoadWrapper from "../../common/components/InfiniteLoadWrapper";
import VirtualScroller from "../../common/components/VirtualScroller";
import TransactionLong from "../../common/components/TransactionLong";
import useTransactions from "../../common/components/useTransactions";
import Config from "../../common/config";

function TransactionsContentTest(props) {
	const [transactions, setTransactions] = useState({});
	const scroll = useRef(null);
	const [pageCount, setPageCount] = useState(1);
	const [doneLoading, setDoneLoading] = useState(false);
	const [loadingStatus, setLoadingStatus] = useState("idle");
	const [txHeight, setTxHeight] = useState(531);
	const [txWidth, setTxWidth] = useState(610);
	const [loadMore, setLoadMore] = useState(false);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [data, setData] = useState(null);
	const transactionContainer = useRef(null);
	const [hasNextPage, setHasNextPage] = useState(true);
	const [isNextPageLoading, setIsNextPageLoading] = useState(false);
	const [items, setItems] = useState([]);
	const [itemsKey, setItemsKey] = useState(1);
	const itemsRef = useRef();
	const SETTINGS = {
		minIndex: 0,
		maxIndex: 40,
		startIndex: 0,
		itemHeight: 40,
		amount: 14,
		tolerance: 39
	}
	const window = remote.getCurrentWindow();
	const [scrollTo, setScrollTo] = useState(0);
	itemsRef.current = items;
	const loadNextPage = (...args) => {
		console.log("loadNextPage ", ...args);
		setIsNextPageLoading(true);
		setTimeout(() => {
			setHasNextPage(items.length < 10000);
			setIsNextPageLoading(false);
			loadTransactionData(true);
		}, 100);
	};

	useEffect(() => {
		window.on('resize', lodash.debounce(function () {
			let height = transactionContainer.current.offsetHeight - 50;
			let width = transactionContainer.current.offsetWidth - 20;
			console.log("height ", height);
			console.log("width ", width);
			setTxHeight(height);
			setTxWidth(width);
		}, 100));

		ipcRenderer.on("wallet-checked-transactions", (event, message) => {
			checkForNewTransactions(message);
		});
	}, []);

	useEffect(() => {
		// load more transactions 
		if (loadMore === true)
			loadTransactionData(loadMore);
	}, [loadMore]);
	/*useEffect(() => {
		console.log("items updated: ", items)
	}, [items]);*/

	return (
		<Content id="test-transactions" >
			<div className="transaction--container transaction--top--item" ref={transactionContainer}>
				<div className="align--row--space-between transaction--padding">
					<Button handleClick={exportToCSV} buttonSize="btn--small">
						Export CSV
					</Button>
					<div className="scroll--nav--buttons align--row--flexstart">
						<div className="chevron address--item">
							<FontAwesomeIcon size="sm" icon={faChevronCircleDown}
								color="white" onClick={() => setScrollTo(items.length)} />
						</div>
						<div className="chevron address--item">
							<FontAwesomeIcon size="sm" icon={faChevronCircleUp}
								color="white" onClick={() => setScrollTo(0)} />
						</div>
					</div>
				</div>
				<VirtualScroller settings={SETTINGS} get={getTransactions} dataLoaded={dataLoaded} loadedData={data}/>
			</div>
		</Content>
	);

	async function loadTransactionData(load) {
		if (load) {
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
			setLoadingStatus("loading");
			//console.log('transactions?')

			var count = 1;
			console.log('transactions? ', count)
			if(Config.isDaemonBased()){
				var startNumber = items.length;
				if (pageCount > 1) {
					console.log("startNum ", startNumber)
					count = pageCount + 1;
					setPageCount(count);
					//setLoadCount(startNumber);
				}
	
				var rpcClient = new RPCClient();
				let args = ["*", parseInt(40), parseInt(startNumber)];
	
				Promise.all([
					rpcClient.listTransactions(args)
					//rpcClient.getwalletinfo(),
					//new Promise(resolve => setTimeout(resolve, 500))
				]).then((response) => {
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
					//console.log("trans res ", response[0]);
					//console.log("total tx count: ", response[1].txcount);
					if (response[0].length === 0) {
						console.log("DONE LOADING ALL TRANSACTIONS!");
						setHasNextPage(false);
						setIsNextPageLoading(false);
						setDoneLoading(true);
						setLoadMore(true);
						return;
					}
					const order = lodash.orderBy(response[0], ['timereceived'], ['desc']);
					let mergedLength = 0;
					// if loading new data merge transactions here
					if (count > 1) {
						//const newOrder = transactions.concat(order);
						const newOrder = items.concat(order);
						//setTransactions(newOrder);
						setItems(newOrder);
						//console.log("newOrder ", newOrder)
						setLoadMore(false);
					} else {
						count = pageCount + 1;
						setPageCount(count);
						//setTransactions(order);
						setItems(order);
						//console.log("order ", order)
						setLoadMore(false);
					}
				}, (stderr) => {
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
					console.error(stderr);
				});
			}else{
				
			}
			
		}
	}

	async function getTransactions( offset ) {

		console.log("Trying to load transactions")
		ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
		//setStatus("loading");
		var data = [];
		const start = Math.max(SETTINGS.minIndex, offset);
		//const end = Math.min(offset + limit - 1, SETTINGS.maxIndex);
		/* if (start <= end) {
			 for (let i = start; i <= end; i++) {
				 data.push({ index: i, text: `item ${i}` })
			 }
		 }*/

		var rpcClient = new RPCClient();
		let args = ["*", SETTINGS.maxIndex, start];
		const getResponse = await new Promise((resolve, reject) => {
			Promise.all([
				rpcClient.listTransactions(args)
			]).then((response) => {
				ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
				const order = lodash.orderBy(response[0], ['timereceived'], ['desc']);
				let mergedLength = 0;
				data = order;
				console.log("data test: ", data)
				setDataLoaded(true);
				resolve();
				setData(data);
			}, (stderr) => {
				ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
				console.error(stderr);
				reject();
			});
			
		});
		return data;
	}
	function checkForNewTransactions(newTransactions) {
		var shortListTransactions = itemsRef.current;
		//console.log("newTransactions: ", newTransactions);
		//console.log("shortListTransactions: ", shortListTransactions)
		let result = newTransactions.filter(o1 => !shortListTransactions.some(o2 => o1.blockhash === o2.blockhash));
		if (result.length > 0) {
			//console.log("results to add: ", result);
			result.forEach(element => shortListTransactions.unshift(element));
			//console.log("new items added: ", itemsRef.current);
			setItems(shortListTransactions);
			setItemsKey(Math.random());
		}
	}

	function exportToCSV() {
		var rpcClient = new RPCClient();
		var exportCSV = new ExportCSV();
		let args = ["*", parseInt(100000000), parseInt(0)];
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
export default TransactionsContentTest;
