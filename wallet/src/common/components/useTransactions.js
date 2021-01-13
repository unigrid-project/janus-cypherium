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

import React, { useState, useEffect } from "react";
import RPCClient from "../rpc-client.js";
import lodash from "lodash";
import { ipcRenderer, remote } from "electron";

function useTransactions({ load, offset, limit, SETTINGS }) {
    //const [status, setStatus] = useState('idle');
    console.log("SETTINGS: ", SETTINGS);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!load) return;
        const getTransactions = async () => {
            ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "working");
            //setStatus("loading");
            const data = [];
            const start = Math.max(SETTINGS.minIndex, offset);
            const end = Math.min(offset + limit - 1, SETTINGS.maxIndex);
            /* if (start <= end) {
                 for (let i = start; i <= end; i++) {
                     data.push({ index: i, text: `item ${i}` })
                 }
             }*/

            var rpcClient = new RPCClient();
            let args = ["*", SETTINGS.maxIndex, start];

            Promise.all([
                rpcClient.listTransactions(args)
            ]).then((response) => {
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                const order = lodash.orderBy(response[0], ['timereceived'], ['desc']);
                let mergedLength = 0;
                setData(order);
            }, (stderr) => {
                ipcRenderer.sendTo(remote.getCurrentWebContents().id, "state", "completed");
                console.error(stderr);
            });
        }
        getTransactions();
    }, [load]);

    return { data };
};
export default useTransactions;