/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The UNIGRID Organization
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

import React, { useState } from "react";
import "./Address.css"
import EnterField from "./EnterField";

function Address({ data, setAccountName }) {
    const [showInput, setShowInput] = useState(false);
    const [address] = useState(data[0]);
    const [accountName] = useState(data[2]);
    const [changeAcountName, setChangeAccountName] = useState("");
    const [resetInput, setResetInput] = useState();
    return (
        <div className="addressContainer">
            <div className="address--div">{data[0]}</div>
            <div className="amount">{data[1]}</div>
            <div className="account">{getAccountField(data[2])}</div>
        </div>
    )
    function getAccountField(account) {
        if (!account) account = "add name";
        return (showInput === true ?
            <EnterField inputType="text"
                inputValue={account} myStyle="xsmallInput"
                updateEntry={updateAccountName}
                clearField={resetInput}
                enterPressed={() => switchInput()} />
            :
            <div onClick={switchInput}>{account}</div>
        )
    }
    function updateAccountName(e) {
        setChangeAccountName(e);
    }
    function switchInput() {
        console.log("switch input");
        let data = [address, changeAcountName];
        if (showInput === true) setAccountName(data);
        setResetInput("");
        setShowInput(!showInput);
    }
}

export default Address;

//