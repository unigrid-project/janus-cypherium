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

import Config from "./config";
import Web3c from '@cypherium/web3c';
import * as CypheriumTx from 'cypheriumjs-tx';
//import { BALANCE_INSUFFICIENT, NONCE_ERROR, TRANSACTION_FAILED } from "./getTextConsts";

const log = require('electron-log');
const axios = require('axios');
let blockNum = 0;
export default class NodeClient {

    constructor() {
        this.cphNode = Config.getEnvironment();
        this.amount = "";
        this.provider = new Web3c.providers.HttpProvider(this.cphNode.cypherium.provider);
        this.web3c = new Web3c(this.provider);
        this.state = {
            isConncted: false
        };
    }

    async getTransactionList(page, pageSize, account) {
        const options = {
            headers: { 'Content-Type': 'application/json; charset=UTF-8' }
        };
        let data;
        console.log("loading address: ", account)
        try {
            await axios({
                method: 'post',
                url: this.cphNode.appServerUrl + this.cphNode.getTransList,
                data: {
                    addr: "0x" + account,
                    txType: 0,
                    pageIndex: page,
                    pageSize: pageSize
                }
            }, options).then((response) => {
                data = response.data.transactions;

            });
            //console.log("transactions: ", data)
            return data;
        } catch (err) {
            console.log(err.message);
        }
    }

    async checkBlock() {
        //let block = await this.web3c.cph.block();
        ///var walletAmount = await this.web3c.getCphBalance("");
        console.log("providers ", this.web3c.providers)
    }

    async isConnected() {
        return await this.provider.isConnected();
    }

    async getBlockHeight() {
        let height = await this.web3c.cph.txBlockNumber;
        return height;
    }

    async getKeyBlockHeight() {
        let height = await this.web3c.cph.keyBlockNumber;
        return height;
    }

    async getTxValue(value) {
        let result = await this.web3c.fromWei(value, 'cpher');
        //console.log("value: ", result);
        return result;
    }

    async getGasPrice() {
        let gasPrice = await this.web3c.cph.getGasPrice();
        //console.log("gasPrice: ", gasPrice)
        return gasPrice;
    }

    async getWalletInfo(addr) {
        this.getCphBalance(addr, (v) => {
            if (v !== undefined) {
                this.amount = v;
                console.log("balance: ", v.toString())
                //this.global.gWalletList[this.global.currentWalletIndex].amount = this.amount;
                //this.helper.saveWallet();
                return v.toNumber();
            }
        });
    }

    async validateAddress(addr, callback) {
        let result = await this.web3c.isAddress(addr);
        callback(result);
    }

    async getCphBalance(userAddr, pending = false) {
        //console.log('getCphBalance ', userAddr);
        return await new Promise((resolve, reject) => {
            try {
                let balance = this.web3c.cph.getBalance(userAddr).toNumber();
                if (balance !== undefined) {
                    let value = this.web3c.fromWei(balance);
                    resolve(value);
                } else {
                    reject(userAddr);
                }
            } catch {
                reject(userAddr);
            }
        });
    }

    async transfer(data) {
        let address = this.convertAddr(data.toAddress);
        let fromAddress = this.convertAddr(data.fromAddress);
        //let fromAddress = data.fromAddress;
        console.log("converted address from: ", fromAddress);
        console.log("converted address to: ", address);
        //this.web3c.transferCph(sendingFrom, sendintTo, amount, gas, privateKey)

        this.transferCph(fromAddress, address, data.payAmount, data.gas, data.privatekey, async (err, tx) => {
            console.log("Transaction callback.......", err, tx);
            if (err === null) {
                // resolve(tx);
                console.log("transaction success ", tx);
                let navigationExtras = {
                    state: {
                        tx: tx,
                        status: 1 //0- success, 1: packed, 2: failure
                    }
                };
                data = null;
                // Go to the transaction results page
                //this.router.navigate(['transaction-result'], navigationExtras);
            } else {
                let message = TRANSACTION_FAILED;
                if (err.message.toLowerCase().indexOf('insufficient funds for gas') > -1) {
                    message = BALANCE_INSUFFICIENT;
                } else if (err.message.toLowerCase().indexOf('replacement transaction underpriced') > -1) {
                    message = NONCE_ERROR;
                } else {
                    message = message + ': ' + err.message;
                }
                console.log("error: ", message)
                data = null;
                //this.helper.toast(message)
            }
        })
    }

    async transferCph(from, to, value, gasPrice, privateKey, callback) {
        console.log(`initiate transfer----from:${from},to:${to},value:${value}`);
        value = this.web3c.toWei(value, 'cpher');
        gasPrice = this.web3c.toWei(gasPrice + "", 'gwei');
        let tx = await this.generateCphTx(from, to, value, gasPrice, privateKey);
        console.log("Transaction signature：", tx)
        const serializedTx = tx.serialize();
        this.web3c.cph.sendRawTransaction('0x' + serializedTx.toString('hex'), callback);
        privateKey = null;
    }

    _hexStringToBytes(hexStr) {
        let result = [];
        while (hexStr.length >= 2) {
            result.push(parseInt(hexStr.substring(0, 2), 16));
            hexStr = hexStr.substring(2, hexStr.length);
        }
        return result;
    }

    async generateCphTx(
        from,
        to,
        value,
        gasPrice,
        privateKey, //Account private key, used for signing
        contractName = "",
        funcname = "",
        params = null
    ) {
        let data = "";
        if (params) {
            var thisobj = this[contractName].methods[funcname]; //Extract the function from the target contract object
            data = thisobj.apply(thisobj, params).encodeABI(); //Encapsulate parameters as contract parameters
        }

        try {
            var nonce = await this.web3c.cph.getTransactionCount('0x' + from.toLowerCase().replace('0x', ''), 'pending'); //Get the address of the user's walletnonce
        } catch (error) {
            var nonce = await this.web3c.cph.getTransactionCount('0x' + from.toLowerCase().replace('0x', '')); //Get the address of the user's walletnonce
        }
        console.log("Nonce: " + nonce);
        // let gasLimit = await this.web3c.cph.estimateGas({
        //     "from": '0x'+from,
        //     "nonce": nonce,
        //     "to": to,
        //     "data": data
        // })

        //let chainId = await this.web3c.cph.net.getId();

        let txParams = {
            version: '0x122',
            senderKey: '0x' + privateKey.substring(64, 128).replace('0x', ''),
            from: '0x' + from.toLowerCase().replace('0x', ''),
            nonce: nonce,
            // gas: this.convert10to16(gasLimit),
            gasLimit: '0x5208',
            gasPrice: this.convert10to16(gasPrice),
            to: '0x' + to.replace('0x', ''),
            data: data,
            value: this.convert10to16(value)
            //chainId: chainId
        };

        console.log("Transfer parameters：" + JSON.stringify(txParams));
        // return this.web3c.cph.accounts.signTransaction(txParams, privateKey);

        const tx = new CypheriumTx.Transaction(txParams, {
            //chain: "testnet"
        });
        console.log("tx: ", tx)


        // let privateKeyBuffer = Buffer.from(privateKey, 'hex');
        // tx.sign(privateKeyBuffer);

        var p = new Uint8Array(this._hexStringToBytes(privateKey));
        var k = new Uint8Array(this._hexStringToBytes(privateKey.substring(64, 128)));
        privateKey = null;
        txParams = null;
        tx.signWith25519(p, k);
        return tx;
    }

    convertAddr(addr) {
        let lowecaseAddress = addr.toLowerCase();
        if (lowecaseAddress.substring(0, 3) === "cph") {
            return lowecaseAddress.replace('cph', '0x');
        } else if (addr.substring(0, 2) === "0x") {
            return addr;
        } else if (addr.substring(0, 2) !== "0x" && addr.substring(0, 3) !== "cph") {
            return "0x".concat(lowecaseAddress);
        }
        return addr;
    }

    convert10to16(n) {
        if (typeof n !== 'string') {
            n = n.toString();
        }
        if (n.startsWith('0x')) {
            return n;
        }
        return this.web3c.toHex(n);
    }

    async run() {
        let addresses = {}

        while (true) {
            let blck = blockNum++
            let block = await this.web3c.cph.getTxBlockByNumber(blck, true)
            if (!block)
                break

            console.log('block', blck, 'transactions', block.transactions.length)
            for (let i = 0; i < block.transactions.length; i++) {
                let tx = await this.web3c.cph.getTransaction(block.transactions[i])
                console.log(block)
                if (parseInt(tx.value) > 0) {

                    addresses[tx.to] = true
                }
            }
        }

        let positiveAddresses = []
        for (address in addresses) {
            try {
                let balance = await web3c.cph.getBalance(address)
                if (balance > 0) {
                    positiveAddresses.push(address)
                }
            } catch (err) {
                console.log(err)
            }
        }
        console.log(positiveAddresses)
        return true;
    }
}