/*
 * This file is part of The UNIGRID Wallet
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

import { ipcRenderer, remote } from "electron";
import Config from "../config";
import NodeClient from "../node-client";

const nodeClient = new NodeClient();
const log = require('electron-log');

export default class AccountBalances {

    async getNodeData() {
        //console.log("account to load balance: ", Config.getCurrentAccount())
        let currentAccount = Config.getCurrentAccount();
        nodeClient.getCphBalance(currentAccount[0].address).then((v) => {
            // check if balance is different from last balance first
            if (currentAccount[0].balance !== v) {
                currentAccount[0].balance = v;
                console.log("balance changed for " + currentAccount[0].address + ' balance ' + v)
                // store balance in current account
                
                // trigger a load transaction signal which forces a reload of transactions
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "update-active-account", currentAccount);
            }

            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "account-balance-updated", v);
            //setBalance(v.toString());
        }, (stderr) => {
            log.warn("Error loading balance for address: ", "CPH" + stderr);
        });
    }

}