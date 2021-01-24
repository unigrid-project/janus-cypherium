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
        console.log("account to load balance: ", Config.getCurrentAccount())
        nodeClient.getCphBalance(Config.getCurrentAccount()[0].address).then((v) => {
            // send signal balance was updated
            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "account-balance-updated", v);
            //setBalance(v.toString());
        }, (stderr) => {
            log.warn("Error loading balance for address: ", "CPH" + stderr);
        });
    }

}