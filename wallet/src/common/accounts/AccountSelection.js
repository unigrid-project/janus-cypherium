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
//import Select from 'react-dropdown-select';
import Dropdown from 'react-dropdown';
import { ipcRenderer } from "electron";
import * as remote from '@electron/remote';
import Store from "electron-store";
import NodeClient from "../node-client";
import Config from "../config";

const nodeClient = new NodeClient();
const store = new Store();

function AccountSelection(props) {
    let [walletList] = useState(props.list.map((wallet, index) => ({ ...wallet, id: index })));
    let [currentActive, setCurrentActive] = useState(props.current);
    let [renderKey, setRenderKey] = useState(Math.random());
    useEffect(() => {
        console.log("AccountSelection useEffect: ", walletList);
        let isMounted = true;
        ipcRenderer.on("update-active-account", (event, account) => {
            if (isMounted) {
                store.set("currentSelectedAccount", account);
                setCurrentActive(account);
                setRenderKey(Math.random());
            }
        });
        return () => { isMounted = false };
    }, [])

    return (
        <Dropdown
            options={walletList.map(wallet => ({ value: wallet.id, label: wallet.name, address: wallet.address }))}
            onChange={(values) => changedAccountSelection(values)}
            key="dropdown"
            value={currentActive[0].name}
        />
    )

    async function changedAccountSelection(values) {
        console.log("changedAccountSelection: ", values);
        const selectedValue = values.value; // get the selected value
        const selectedWallet = walletList.find(wallet => wallet.id === selectedValue); // find the matching wallet object
        if (selectedWallet) {
            const address = selectedWallet.address; // get the address from the wallet object
            try {
                const balance = await nodeClient.getCphBalance(address); // get the balance
                if (balance !== selectedWallet.balance) {
                    // if balance has changed trigger a load transaction signal
                    // send signal balance was updated
                    selectedWallet.balance = balance; // store the balance in the wallet object
                    ipcRenderer.sendTo(remote.getCurrentWebContents().id, "update-active-account", [selectedWallet]); // send the updated wallet object to the main process
                    console.log("account with balance: ", selectedWallet);
                }
            } catch (error) {
                console.warn(`Error loading balance for address ${address}: ${error}`);
            }
        } else {
            console.warn(`Could not find wallet with id ${selectedValue}`);
        }
    }
    
}

export default AccountSelection;