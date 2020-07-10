/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The Swipp developers <info@swippcoin.com>
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
import Content from "../content";
import Button from "../../common/components/Button";
import RPCClient from "../../common/rpc-client.js";
import EnterField from "../../common/components/EnterField";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clipboard } from "electron";

library.add(faClipboard);

function AddressesContent() {
	const [addressName, setAddressName] = useState("");
	const [clearField, setClearField] = useState();
	const [responseAddress, setResponseAddress] = useState();
	const [localAddresses, setLocaAddresses] = useState();
	useEffect(() => {
		var rpcClient = new RPCClient();
		Promise.all([
			rpcClient.listAddressGroupings(),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			console.log('address groupings', response[0]);
			setLocaAddresses(response[0][0]);
		}, (stderr) => {
			console.error(stderr);
		});
	}, []);
	return (
		<Content id="addressbook">
			<h1>Enter Address Name:</h1>
			<EnterField
				key={clearField}
				type={"text"}
				clearField={clearField}
				style={"unlockInput"}
				onChage={(v) => setAddressName(v)} />
			<Button handleClick={() => onGenerateNewAddressClicked()}>Generate Address</Button>
			<span>
				{responseAddress}
				<FontAwesomeIcon size="2x" icon={faClipboard} color="white" onClick={copyToClipboard} />
			</span>
			<Button handleClick={() => listAddressGroupings()}>Address Groupings</Button>
			<div>{getLocalAddresses()}</div>
		</Content>
	);

	function getLocalAddresses() {
		// address, amount, account
		if (!localAddresses) return null;
		return (
			Object.keys(localAddresses).map(key => {
				return (
					<div key={key}>
						<div className="cellPadding">{localAddresses[key][0]}</div>
						<div className="cellPadding">{localAddresses[key][1]}</div>
						<div className="cellPadding">{localAddresses[key][2]}</div>
					</div>
				)
			})
		)
	}

	function copyToClipboard() {
		clipboard.writeText(responseAddress, 'selection')
		console.log(clipboard.readText('selection'))
	}

	async function listAddressGroupings() {
		var rpcClient = new RPCClient();
		Promise.all([
			rpcClient.listAddressGroupings(),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			console.log('address groupings', response[0][0]);
			setLocaAddresses(response[0][0]);
		}, (stderr) => {
			console.error(stderr);
		});
	}
	async function onGenerateNewAddressClicked() {
		console.log("addres name: " + addressName);
		var rpcClient = new RPCClient();
		Promise.all([
			rpcClient.generateNewAddress([addressName]),
			new Promise(resolve => setTimeout(resolve, 500))
		]).then((response) => {
			console.log('address');
			console.log(response);
			setClearField("");
			setResponseAddress(response[0]);
		}, (stderr) => {
			console.error(stderr);
		});
	}
}

export default AddressesContent;

