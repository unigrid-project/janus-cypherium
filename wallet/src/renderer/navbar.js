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

import React from "react";
import { ipcRenderer } from "electron";
import MyWallet from "./mywallet/mywallet.js";
import Transactions from "./transactions/transactions.js";
import Addresses from "./addresses/addresses.js";
import Settings from "./settings/settings.js";
import CLI from "./cli/cli.js";
import "./navbar.css"
import BlockInfo from "./blockinfo/blockinfo.js";
import Masternodes from "./masternodes/masternodes.js";
import TransactionsTest from "./transactions/transactions-test.js";
import { isDaemonLocal, isMasternode } from "../common/consts.js";

export default class NavBar extends React.Component {
	render() {
		return (
			<nav>
				<ul>
					<MyWallet key="mywallet" active={true} />
					<Addresses key="addressbook" />
					{isMasternode === true ? <Masternodes key="masternodes" /> : null}
					<Transactions key="transactions" />
					{/*<TransactionsTest key="test-transactions" />*/}
				</ul>
				<ul className="settings--container" >
					<Settings key="settings" />
					<CLI key="cli" />
				</ul>
				<ul>
					{isDaemonLocal ? <BlockInfo className="blockInfo" /> : null}
				</ul>
			</nav>
		);
	}
}
