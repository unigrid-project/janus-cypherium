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
import RPCClient from "../../common/rpc-client.js";
import "./transactions-content.css";
import { faChevronCircleDown, faChevronCircleUp, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExportCSV from "../../common/components/ExportCSV";
import lodash from "lodash";
import { ipcRenderer, remote } from "electron";
import InfiniteLoadWrapper from "../../common/components/InfiniteLoadWrapper";
import Config from "../../common/config";
import NodeClient from "../../common/node-client";
import Store from "electron-store";
import AccountSelection from "../../common/accounts/AccountSelection";

var _ = require('electron').remote.getGlobal('_');
const nodeClient = new NodeClient(Config.getNodeInfo());
const store = new Store();

function TransactionsContent(props) {
	const [transactions, setTransactions] = useState({});
	const scroll = useRef(null);
	const [pageCount, setPageCount] = useState(1);
	const [doneLoading, setDoneLoading] = useState(false);
	const [loadingStatus, setLoadingStatus] = useState("idle");
	const [txHeight, setTxHeight] = useState(455);
	const [txWidth, setTxWidth] = useState(695);
	const [loadMore, setLoadMore] = useState(true);
	const transactionContainer = useRef(null);
	const [hasNextPage, setHasNextPage] = useState(true);
	const [isNextPageLoading, setIsNextPageLoading] = useState(false);
	const [items, setItems] = useState([]);
	const [itemsKey, setItemsKey] = useState(1);
	const itemsRef = useRef();
	const txToLoad = 60;
	const window = remote.getCurrentWindow();
	const [scrollTo, setScrollTo] = useState(0);
	const [chevronColor, setChevronColor] = useState("white");
	const [walletList, setWalletList] = useState(Config.getAccount());
	const [currentSelectedAccount, setCurrentSelectedAccount] = useState(Config.getCurrentAccount());
	const [renderListKey, setRenderListKey] = useState(Math.random());
	itemsRef.current = items;
	const loadNextPage = (...args) => {
		console.log("loadNextPage", ...args);
		setIsNextPageLoading(true);
		setTimeout(() => {
			setHasNextPage(items.length < 10000);
			setIsNextPageLoading(false);
			loadTransactionData(true);
		}, 100);
	};
	useEffect(() => {
		//store.set("currentSelectedAccount", {});
		console.log("default account: ", store.get("currentSelectedAccount"))
		ipcRenderer.on("update-active-account", (event, account) => {
			console.log('resetting page count ', account)
			setItems([]);
			setPageCount(1);
			setCurrentSelectedAccount(account);
		});
		if (Config.isDaemonBased()) {
			setChevronColor("white");
		} else {
			setChevronColor("grey");
		}
		window.on('resize', lodash.debounce(function () {
			let height = transactionContainer.current.offsetHeight - 50;
			let width = transactionContainer.current.offsetWidth - 20;
			//console.log("height ", height);
			//console.log("width ", width);
			setTxHeight(height);
			setTxWidth(width);
		}, 0));
		ipcRenderer.on("wallet-checked-transactions", (event, message) => {
			checkForNewTransactions(message);
		});
		ipcRenderer.on("accounts-updated", (event, message) => {			
			setWalletList(Config.getAccount());
			refreshTransactions();
		});
	}, []);
	useEffect(() => {
		setRenderListKey(Math.random());
	}, [walletList]);
	useEffect(() => {

		refreshTransactions();
		console.log("reload transactions");
	}, [currentSelectedAccount])

	useEffect(() => {
		// load more transactions 
		if (loadMore === true)
			loadTransactionData(loadMore);
	}, [loadMore]);



	return (
		<Content id="transactions" >
			<div className="transaction--container transaction--top--item" ref={transactionContainer}>
				<div className="align--row--space-between transaction--padding">
					{/*<Button handleClick={exportToCSV} buttonSize="btn--small">
						{_("Export CSV")}
					</Button>*/}
					<div className="scroll--nav--buttons align--row--flexstart">
						<div className="chevron address--item">
							<FontAwesomeIcon size="sm" icon={faSyncAlt}
								color={chevronColor} onClick={() => refreshTransactions()} />
						</div>
						{walletList.length > 1 ?
							<div className="fontSmallBold darkCopy dropdown--selection" key={renderListKey}>
								<AccountSelection
									key={currentSelectedAccount}
									current={currentSelectedAccount}
									list={walletList}
								/>
							</div>
							: null}
					</div>
					<div className="scroll--nav--buttons align--row--flexstart">
						<div className="chevron address--item">
							<FontAwesomeIcon size="sm" icon={faChevronCircleDown}
								color={chevronColor} onClick={() => setScrollTo(items.length)} />
						</div>
						<div className="chevron address--item">
							<FontAwesomeIcon size="sm" icon={faChevronCircleUp}
								color={chevronColor} onClick={() => setScrollTo(0)} />
						</div>
					</div>
				</div>
				<div className="transaction--item">
					<InfiniteLoadWrapper
						key={itemsKey}
						hasNextPage={hasNextPage}
						isNextPageLoading={isNextPageLoading}
						items={items}
						loadNextPage={loadNextPage}
						height={txHeight}
						width={txWidth}
						scrollTo={scrollTo}
					/>
				</div>


			</div>
		</Content>
	);

	function refreshTransactions() {
		loadTransactionData(true);
	}
	async function loadTransactionData(load) {
		if (load) {
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
			setLoadingStatus("loading");
			var count = 1;
			//var startNumber = Object.keys(transactions).length;
			var startNumber = items.length;
			if (Config.isDaemonBased === true) {
				var rpcClient = new RPCClient();
				let args = ["*", parseInt(txToLoad), parseInt(startNumber)];
				Promise.all([
					rpcClient.listTransactions(args)
					//rpcClient.getwalletinfo(),
					//new Promise(resolve => setTimeout(resolve, 500))
				]).then((response) => {
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
					console.log("trans res ", response[0]);
					//console.log("total tx count: ", response[1].txcount);
					if (response[0].length === 0) {
						setHasNextPage(false);
						setIsNextPageLoading(false);
						setDoneLoading(true);
						setLoadMore(true);
						return;
					}
					const order = lodash.orderBy(response[0], ['timereceived'], ['desc']);
					let mergedLength = 0;
					// if loading new data merge transactions here
					if (pageCount > 1) {
						//const newOrder = transactions.concat(order);
						const newOrder = items.concat(order);
						//setTransactions(newOrder);
						setItems(newOrder);
						//console.log("newOrder ", newOrder)
						setLoadMore(false);
					} else {

						//setTransactions(order);
						setItems(order);
						//console.log("order ", order)
						setLoadMore(false);
					}
					count = pageCount + 1;
					setPageCount(count);
				}, (stderr) => {
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
					console.error(stderr);
				});
			} else {
				console.log("page count: ", pageCount);
				console.log("selected account to load: ", currentSelectedAccount)
				const txList = await nodeClient.getTransactionList(pageCount, txToLoad, currentSelectedAccount[0].address);
				ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
				if (txList === null) {
					setHasNextPage(false);
					setIsNextPageLoading(false);
					setDoneLoading(true);
					setLoadMore(true);
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "new-transactions-loaded", items);
					return;
				}
				const order = txList;
				if (order.length < txToLoad)
					setHasNextPage(false);
				if (pageCount > 1) {
					console.log("pageCount: ", pageCount);
					const newOrder = items.concat(order);
					console.log("transactions: ", newOrder)
					setItems(newOrder);
					setLoadMore(false);
				} else {
					setItems(order);
					setLoadMore(false);
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "new-transactions-loaded", order);
				}
				count = pageCount + 1;
				setPageCount(count);
			}

		}
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
