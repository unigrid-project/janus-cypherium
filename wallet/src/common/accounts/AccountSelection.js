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
import Select from 'react-dropdown-select';
import { ipcRenderer, remote } from "electron";
import Store from "electron-store";

const store = new Store();

function AccountSelection({ current, list }) {
    const [walletList, setWalletList] = useState(list);
    const [currentActive, setCurrentActive] = useState(current);
    const [renderKey, setRenderKey] = useState(Math.random());
    useEffect(() => {
        ipcRenderer.on("update-active-account", (event, account) => {
            store.set("currentSelectedAccount", account);
            setCurrentActive(account);
            setRenderKey(Math.random());
		});
    }, [])

    return (
        <Select
            searchable={false}
            key={renderKey}
            multi={false}
            values={[]}
            placeholder={currentActive[0].name}
            valueField="name"
            labelField="name"
            options={walletList}
            onChange={(values) => changedAccountSelection(values)}
        />
    )
    function changedAccountSelection(v) {
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, "update-active-account", v);
    }
}

export default AccountSelection;