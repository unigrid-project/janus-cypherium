/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The Swipp developers <info@swippcoin.com>
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

import { Client } from "node-json-rpc2";
import { remote } from "electron";

export default class RPCClient {
	constructor() {
		var credentials = global.credentials == undefined ? remote.getGlobal("credentials") : global.credentials;
		var rpcPort = global.rpcPort == undefined ? remote.getGlobal("rpcPort") : global.rpcPort;

		this.client = new Client({
			user: credentials.user,
			password: credentials.password,
			port: rpcPort, /* Should have been initialized by daemon */
			//method: "POST" //is 
		});

		this.send_command = (command, args = []) => {
			return new Promise((resolve, reject) => {
				this.client.call({ method: command, params: args }, (err, response) => {

					if (err) {

						reject(err);
					} else {

						resolve(response.result);
					}
				});
			});
		}
		/*let origreq = rpcClient.agent.request;
		rpcClient.agent.request = (options) => {
			if (origreq != rpcClient.agent.request) {
				options.headers['Connection'] = 'Close';
				origreq(options);
			}
		};*/

	}

	async raw_command(command, args) {
		return await this.send_command(command, args);
	}

	async autocombinerewards(args) {
		return await this.send_command("autocombinerewards", args);
	}

	async backupWallet(args) {
		//backupwallet "destination"
		return await this.send_command("backupwallet", args);
	}

	async dumpWallet(args) {
		return await this.send_command("dumpwallet", args);
	}

	async encryptWallet(args) {
		return await this.send_command("encryptwallet", args);
	}

	async getbalance() {
		return await this.send_command("getbalance");
	}

	async getblockcount() {
		return await this.send_command("getblockcount");
	}

	async getdatadirectory() {
		return await this.send_command("getdatadirectory");
	}

	async getconnectioncount() {
		return await this.send_command("getconnectioncount");
	}

	async getinfo() {
		return await this.send_command("getinfo");
	}

	async getwalletinfo() {
		return await this.send_command("getwalletinfo");
	}

	async getstakesplitthreshold() {
		return await this.send_command("getstakesplitthreshold");
	}

	async getStatus() {
		return await this.send_command("getstakingstatus");
	}

	async help() {
		return await this.send_command("help");
	}

	async importwallet(args) {
		return await this.send_command("importwallet", args);
	}

	async listTransactions(args = []) {
		return await this.send_command("listtransactions", args);
	}

	async listunspent(args = []) {
		return await this.send_command("listunspent", args);
	}

	async walletLock() {
		return await this.send_command("walletlock");
	}

	async masternodeCommand(args) {
		return await this.send_command("masternode", args);
	}

	async setAccountName(args) {
		return await this.send_command("setaccount", args);
	}

	async setstakesplitthreshold(args) {
		return await this.send_command("setstakesplitthreshold", args);
	}

	async setTxFee(args) {
		return await this.send_command("settxfee", args);
	}

	async startMasternodeCommand(args) {
		//start-all start-many start-missing
		// start-all "0"
		return await this.send_command("startmasternode", args);
	}

	async generateNewAddress(args) {
		// args = string of account name can be null
		return await this.send_command("getnewaddress", args);
	}

	async sendToAddress(args) {
		//sendtoaddress "SMJRSsuU9zfyrvxVaAEFQqK4MxZg6vgeS6" 0.1
		return await this.send_command("sendtoaddress", args);
	}

	async sendMany(account, args) {
		//sendmany "account" "{"address":0.01,"addres":0.02}" 6 "message"
		const send = [account, args, parseInt(6), "sendmany"];
		return await this.send_command("sendmany", send);
	}

	async stop() {
		return await this.send_command("stop");
	}

	async unlockWallet(args) {
		return await this.send_command("walletpassphrase", args);
	}

	async listAddressGroupings() {
		const args = [parseInt(0), Boolean(true), Boolean(true)];
		return await this.send_command("listaddressgroupings");
	}

	async validateAddress(args) {
		return await this.send_command("validateaddress", args);
	}
}

