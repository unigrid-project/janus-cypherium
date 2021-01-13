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

import React, { useEffect, useState, useRef } from "react";
import Store from "electron-store";
import CheckBox from "./CheckBox";
import { ipcRenderer, remote } from "electron";

const store = new Store();

function HideZeroAddresses() {
    const [hideZeroBalances, setHideZeroBalances] = useState(false);

    useEffect(() => {
        checkLocalStore();
        ipcRenderer.on('reload-addresses', (event, message) => {
            store.set("showzerobalance", message);
            setHideZeroBalances(message);
        });
    }, [])

    function onCheckboxClicked(value) {
        ipcRenderer.sendTo(remote.getCurrentWebContents().id, 'reload-addresses', value);
    }

    function checkLocalStore() {
        let v = store.get("showzerobalance");
        if (v === undefined) {
            setHideZeroBalances(true);
        } else {
            setHideZeroBalances(v);
        }
    }

    return (
        <div>
            <CheckBox
                key={hideZeroBalances}
                selected={hideZeroBalances}
                labelTheme="settings--fonts"
                label="Hide zero balance addresses"
                handleCheckBox={(e) => onCheckboxClicked(e.target.checked)} />
        </div>
    )
}

export default HideZeroAddresses;