/*
 * This file is part of The UNIGRID Wallet
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


import React, { useState, useEffect } from "react";
import NodeClient from '../../common/node-client';
import Config from "../config";

const nodeClient = new NodeClient(Config.getNodeInfo());

function GasSelector() {
    const [gas, setGas] = useState((18 * 21000 / 1000000000))
    useEffect(() => {
        nodeClient.getGasPrice().then((r) => {
            console.log("gas: ", r)
        })
    }, [])
    return (
        <div>
            <div>
                Estimated transaction fee: { }
            </div>
            <input type="range" min="1" max="500" />
        </div>

    )

}

export default GasSelector;