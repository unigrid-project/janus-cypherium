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
import Expand from "react-expand-animated";
import EnterField from "./EnterField";
import Button from "./Button";
import "./Send.css"
import SendInputs from "./SendInputs";
import _ from "lodash";

function Send({
    setSendAddress,
    sendCoins,
    cancelSendOperation,
    resetState,
    setSendAmount,
    defaultValues
}) {
    const [inputValues, setInputValues] = useState({});
    const [recipients, setRecipients] = useState(defaultValues);
    const [rerender, setRerender] = useState(false);
    const [recipientCounter, setRecipientCounter] = useState(2);

    useEffect(() => {
        setRecipients(defaultValues);
    }, [defaultValues]);
    return (
        <div
            key={Object.keys(recipients).length}
            className="send--inner--container">
            {createRecipients()}
            <div className="btn--row--send">
                <Button
                    buttonStyle="btn--secondary--solid"
                    buttonSize="btn--small"
                    handleClick={() => checkSendInputs()}>SEND</Button>
                <Button
                    buttonStyle="btn--secondary--solid"
                    buttonSize="btn--small"
                    handleClick={() => onCancelPressed()}>CANCEL</Button>
            </div>
        </div>
    )
    /* <Button
                   buttonStyle="btn--secondary--solid"
                   buttonSize="btn--small"
                   handleClick={() => addRecipient()}>ADD RECIPIENT</Button> */
    function checkSendInputs() {
        sendCoins(recipients)
    }
    function onCancelPressed() {
        setRecipients({ "address1": { "address": "", "amount": "", "isValid": false } });
        setRecipientCounter(2);
        cancelSendOperation();
    }
    function addRecipient() {
        const key = "address".concat(recipientCounter);
        setRecipientCounter(recipientCounter + 1);
        setRecipients(Object.assign(recipients, { [key]: { "address": "", "amount": "", "isValid": false } }));
        setRerender(!rerender);
    }
    function removeRecipient(e) {
        console.log("remove: ", e);
        setRecipients(_.omit(recipients, e));
        setRerender(!rerender);
    }
    function setSendAddress(v, recipientKey) {
        const updateAddress = recipients;
        Object.keys(updateAddress).map(key => {
            if (key === recipientKey) {
                updateAddress[key].address = v;
            }
        })
        // console.log("updateAddress ", updateAddress);
        setRecipients(updateAddress);
    }

    function setSendAmount(v, recipientKey) {
        const updateAmount = recipients;
        Object.keys(updateAmount).map(key => {
            if (key === recipientKey) {
                updateAmount[key].amount = v;
            }
        })
        // console.log("updateAmount ", updateAmount);
        setRecipients(updateAmount);
    }

    function setIsValid(v, recipientKey) {
        const updateValid = recipients;
        Object.keys(updateValid).map(key => {
            if (key === recipientKey) {
                updateValid[key].isValid = v;
            }
        })
        console.log("updateValid ", updateValid);
        setRecipients(updateValid);
    }

    function createRecipient(key) {
        const showRemove = key !== "address1";
        //console.log("render address", recipients[key].address);
        //console.log("render amount", recipients[key].amount);
        const amount = recipients[key].amount;
        const address = recipients[key].address;
        const isValid = recipients[key].isValid;
        return (
            <SendInputs
                showRemove={showRemove}
                key={key}
                removeRecipient={(e) => removeRecipient(e)}
                setSendAddress={setSendAddress}
                setSendAmount={setSendAmount}
                setIsValid={setIsValid}
                recipientKey={key}
                inputValueAmount={amount}
                inputValueAddress={address}
                isValid={isValid}
            />
        )
    }
    function createRecipients() {
        return Object.keys(recipients).map((key) => createRecipient(key))
    }
}

export default Send;