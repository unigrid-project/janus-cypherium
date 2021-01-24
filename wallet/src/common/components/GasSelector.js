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


import React, { useState, useEffect, useRef } from "react";
import NodeClient from '../../common/node-client';
import Config from "../config";
import { FAST, SLOW, ESTIMATED_FEE } from "../getTextConsts";

const nodeClient = new NodeClient();
const min = 1;
const max = 100;
const defaultValue = 50;

function GasSelector({ onGasUpdate, resetGas }) {
    const [gas, setGas] = useState((50 * 21000 / 1000000000))
    //let price = await this.web3c.cph.gasPrice(); price/1e9;
    const inputRef = useRef(null);
    useEffect(() => {
        onGasUpdate(gas);
    }, [gas])
    useEffect(() => {
        inputRef.current.value = defaultValue;
        setGas((50 * 21000 / 1000000000));
    }, [resetGas])
    return (
        <div className="">
            <h2>
                {ESTIMATED_FEE} {gas}
            </h2>
            <div style={{ width: "100%" }}>

                <input
                    ref={inputRef}
                    defaultValue={defaultValue}
                    type="range"
                    min={min} max={max}
                    className="gas--slider"
                    onChange={(e) => {
                        e.preventDefault();
                        handleChange(e);
                    }} />


                <div className="align--row--space-between darkCopy">
                    <div>{SLOW}</div>
                    <div>{FAST}</div>
                </div>
            </div>
        </div>
    )

    function handleChange(e) {
        // this.range * 21000 / 1000000000
        setGas(e.target.value * 21000 / 1000000000);
    }

}

export default GasSelector;