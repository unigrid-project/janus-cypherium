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

import React, { useState, useEffect, useRef } from "react";
import Content from "../content";
import RPCClient from "../../common/rpc-client.js";
import "./transactions-content.css";
import { faChevronCircleDown, faChevronCircleUp, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExportCSV from "../../common/components/ExportCSV";
import lodash from "lodash";
import { ipcRenderer, remote } from "electron";
import Config from "../../common/config";
import NodeClient from "../../common/node-client";
import Store from "electron-store";
import AccountSelection from "../../common/accounts/AccountSelection";
import InfiniteLoading from "react-simple-infinite-loading";
import TransactionLong from "../../common/components/TransactionLong";
import TransactionLoading from "../../common/components/TransactionLoading";

var gt = require('electron').remote.getGlobal('gt');

const nodeClient = new NodeClient();
const store = new Store();

function TransactionsContent(props) {
	const [pageCount, setPageCount] = useState(1);
	const [txHeight, setTxHeight] = useState(506);
	const [loadMore, setLoadMore] = useState(true);
	const [doneLoading, setDoneLoading] = useState(true);
	const transactionContainer = useRef(null);
	const [items, setItems] = useState([]);
	const itemsRef = useRef();
	const ref = useRef();
	const txToLoad = 60;
	const window = remote.getCurrentWindow();
	const [chevronColor, setChevronColor] = useState("white");
	const [walletList, setWalletList] = useState(Config.getAccount());
	const [currentSelectedAccount, setCurrentSelectedAccount] = useState(Config.getCurrentAccount());
	const [renderListKey, setRenderListKey] = useState(Math.random());
	const [renderItemsKey, setRenderItemsKey] = useState(Math.random());
	const [hasNextPage, setHasNextPage] = useState(true);

	itemsRef.current = items;

	const loadMoreItems = () => {
		return new Promise(resolve => {
			setTimeout(() => {
				loadTransactionData(true);
				resolve();
			}, 300);
		});
	};
	useEffect(() => {
		ipcRenderer.on("update-active-account", (event, account) => {
			setPageCount(1);
			setCurrentSelectedAccount(account);
			setItems([]);
			console.log("update-active-account", account)
			//setLoadMore(true);
			//setHasNextPage(true);
		});
		if (Config.isDaemonBased()) {
			setChevronColor("white");
		} else {
			setChevronColor("grey");
		}
		window.on('resize', lodash.debounce(function () {
			if (transactionContainer) {
				let height = transactionContainer.current.offsetHeight - 50;
				//let width = transactionContainer.current.offsetWidth - 20;
				setTxHeight(height);
				//setTxWidth(width);
				setRenderItemsKey(Math.random());
			}
		}, 50));
		ipcRenderer.on("wallet-checked-transactions", (event, message) => {
			checkForNewTransactions(message);
		});
		ipcRenderer.on("accounts-updated", (event, message) => {
			setWalletList(Config.getAccount());
			//refreshTransactions();
		});
		ipcRenderer.on("new-transactions-loaded", (event, obj) => {
			if (obj.count !== 0)
				setPageCount(obj.count);

		})
	}, []);
	useEffect(() => {
		loadTransactionData(true);
	}, [currentSelectedAccount]);

	useEffect(() => {
		setRenderListKey(Math.random());
	}, [walletList]);

	/*useEffect(() => {
		// load more transactions 
		if (loadMore === true)
			loadTransactionData(loadMore);
	}, [loadMore]);*/

	useEffect(() => {
		console.log("has next page: ", hasNextPage)
	}, [hasNextPage])
	const scrollToTop = () => {
		if (ref.current) {
			ref.current.scrollTo(0)
		}
	}
	const scrollToItem = (item) => {
		if (ref.current) {
			ref.current.scrollToItem(item)
		}
	}
	return (
		<Content id="transactions" >
			<div className="transaction--container transaction--top--item" ref={transactionContainer}>
				<div className="align--row--space-between transaction--padding">
					{/*<Button handleClick={exportToCSV} buttonSize="btn--small">
						{gt.gettext("Export CSV")}
					</Button>*/}
					<div className="scroll--nav--buttons align--row--flexstart">
						<div className="chevron address--item">
							<FontAwesomeIcon size="sm" icon={faSyncAlt}
								color={chevronColor} onClick={() => refreshTransactions()} />
						</div>
						<div className="fontSmallBold darkCopy dropdown--selection" key={renderListKey}>
							<AccountSelection
								key={currentSelectedAccount}
								current={currentSelectedAccount}
								list={walletList}
							/>
						</div>
					</div>
					<div className="scroll--nav--buttons align--row--flexstart">
						<div className="chevron address--item">
							<FontAwesomeIcon size="sm" icon={faChevronCircleDown}
								color={chevronColor} onClick={() => scrollToItem(items.length)} />
						</div>
						<div className="chevron address--item">
							<FontAwesomeIcon size="sm" icon={faChevronCircleUp}
								color={chevronColor} onClick={() => scrollToTop()} />
						</div>
					</div>
				</div>
				<div style={{ width: '100%', height: txHeight, minHeight: 506 }}>
					<InfiniteLoading
						key={renderItemsKey}
						hasMoreItems={hasNextPage}
						itemHeight={40}
						loadMoreItems={loadMoreItems}
						ref={ref}
						placeholder={<TransactionLoading style="trans--long" />}
					>
						{items.map((item, index) => (
							<div key={item}>
								<TransactionLong data={items[index]} index={index} style="trans--long" />
							</div>
						))}
					</InfiniteLoading>
				</div>
			</div>
		</Content>
	);

	function refreshTransactions() {
		ipcRenderer.sendTo(remote.getCurrentWebContents().id, "update-active-account", currentSelectedAccount);
	}

	async function loadTransactionData(load) {
		if (!doneLoading)
			return
		if (load) {
			setDoneLoading(false);
			ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
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
						//setIsNextPageLoading(false);
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
				const address = currentSelectedAccount[0].address;
				const txList = await nodeClient.getTransactionList(pageCount, txToLoad, address);
				ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
				
				let obj = {}
				if (txList === null) {
					setLoadMore(true);
					obj.count = 0;
					obj.transactions = items;
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "new-transactions-loaded", obj);
					setDoneLoading(true);
					setHasNextPage(false);
					return;
				}
				const order = txList;
				//console.log("transactions: ", txList)
				if (pageCount > 1) {
					const newOrder = items.concat(order);
					setItems(newOrder);
					setLoadMore(false);
					obj.count = pageCount + 1;
					obj.transactions = newOrder;
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "new-transactions-loaded", obj);
				} else {
					setItems(order);
					setLoadMore(false);
					obj.count = pageCount + 1;
					obj.transactions = order;
					ipcRenderer.sendTo(remote.getCurrentWebContents().id, "new-transactions-loaded", obj);
				}
				if (order.length < txToLoad) {
					setHasNextPage(false);
				} else {
					setHasNextPage(true);
				}
				setDoneLoading(true);
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
			//setItemsKey(Math.random());
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
