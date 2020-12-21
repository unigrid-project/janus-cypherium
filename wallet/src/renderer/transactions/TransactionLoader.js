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
import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "./transactions-content.css";
import Transaction from "../../common/components/Transaction";

function TransactionLoader({
    transactions,
    doneLoading,
    readyForMore,
    loadMore,
    scroll
}) {
    useEffect(() => {
        //console.log("loadMore ", transactions)
        if (doneLoading) return
        //console.log("done loading ", doneLoading)
        if (loadMore === false) {
            $("div#transactions").scroll(function () {
                let added = $("div#transactions").scrollTop() + parseInt($("div#transactions").height());
                // console.log("added ", added);
                // console.log("clientHeight ", scroll.current.clientHeight);
                if (parseInt($("div#transactions").scrollTop()) + parseInt($("div#transactions").height())
                    == parseInt(scroll.current.clientHeight)) {
                    //console.log("LOAD MORE DATA")
                    readyForMore();
                }
            });
        }
    })
    return (
        <div>
            {renderTransactions()}
        </div>
    )

    function renderTransactions() {
        //console.log('render transactions', transactions)
        if (!transactions) return null;
        return (
            Object.keys(transactions).map(key => {
                return (
                    <div key={key} className="transaction--item">
                        <Transaction data={transactions[key]} index={key} style="trans--long" />
                    </div>
                )
            })
        )
    }
}

export default TransactionLoader;