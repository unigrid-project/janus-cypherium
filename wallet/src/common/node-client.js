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
//const Web3c = require('@cypherium/web3c');


//const Web3 = require("web3");
const log = require('electron-log');
const axios = require('axios');


export default class NodeClient {

    constructor(nodeInfo) {
        this.nodeInfo = Config.getNodeInfo();
        this.cphNode = Config.getEnvironment();
        this.amount = "";
        console.log("cphNode ", this.cphNode);
        //this.web3 = new Web3(new Web3.providers.WebsocketProvider(nodeInfo.url));
        this.web3c = new Web3c(new Web3c.providers.HttpProvider(this.cphNode.cypherium.provider));
    }

    async getCurrentGasPrices() {
        let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
        let prices = {
            low: response.data.safeLow / 10,
            medium: response.data.average / 10,
            high: response.data.fast / 10
        };

        console.log("\r\n");
        log.info(`Current ETH Gas Prices (in GWEI):`);
        console.log("\r\n");
        log.info(`Low: ${prices.low} (transaction completes in < 30 minutes)`);
        log.info(`Standard: ${prices.medium} (transaction completes in < 5 minutes)`);
        log.info(`Fast: ${prices.high} (transaction completes in < 2 minutes)`);
        console.log("\r\n");
        return prices;
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
            return data;
        } catch (err) {
            console.log(err.message);
        }
        /*await axios({
            method: 'post',
            url: this.cphNode.appServerUrl + this.cphNode.getTransList,
            data: {
                addr: "",
                txType: 0,
                pageIndex: 1,
                pageSize: 20
            }
        }, options).then((response) => {
            console.log("transactions: ", response.data.transactions)
            return response.data.transactions;
        });*/
    }

    async checkBlock() {
        //let block = await this.web3c.cph.block();
        ///var walletAmount = await this.web3c.getCphBalance("");
        console.log("providers ", this.web3c.providers)
    }
    async start(window, nodeInfo) {
        console.log(nodeInfo)
        //this.web3 = new Web3(new Web3.providers.WebsocketProvider(nodeInfo.url));
        //let block = await this.web3.eth.getBlock('latest');
        //log.info("Eth Block: ", block);
        /*let latestBlock = await this.web3.eth.getBlockNumber().then((result) => {
            log.info("Latest Ethereum Block is: ", result);
        });*/
        //console.log("CPH Node: ", this.web3c);
        /*this.web3c.cph.getBalance("<address>").then((result) => {
            var balance = result;
            //balance = this.web3c.toDecimal(balance);
            console.log("balance: ", balance);
        }); //Will give value in.
*/
        this.getCurrentGasPrices();
        return this.web3c;
        //return latestBlock;
        /*var p;
        if (isDevelopment) {
            p = await node.execute(window, nodeInfo);
        } else {
            p = await node.execute(window, nodeInfo);
        }
        return p;*/
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

    async subscribeToBlocks() {
        /* const subscription = this.web3.eth.subscribe('newBlockHeaders', (error, blockHeader) => {
             if (error) return log.error(error);
             //log.info("BlockHeader: ", blockHeader)
         })*/
    }

    async getGasPrice() {
        let gasPrice = await this.web3c.cph.getGasPrice();
        console.log("gasPrice: ", gasPrice)
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

    async getCphBalance(userAddr, callback, pending = false) {
        console.log('getCphBalance ', userAddr);
        this.web3c.cph.getBalance(userAddr, pending ? 'pending' : 'latest', (e, v) => {
            console.log("e: ", e)
            if (!e) {
                // console.log('!e');
                // console.log("Invoked param:-----------------------------------", userAddr, v);
                // console.log(`wallet${userAddr}'s balance${v}`);
                let value = this.web3c.fromWei(v, 'cpher');
                //console.log("fromWei: ", value)
                callback(value);
            } else {
                console.log('read from local ', v);
                /*
                                console.log('read from local');
                                if (this.global.currentWalletIndex !== undefined) {
                                    callback(this.global.gWalletList[this.global.currentWalletIndex].amount);
                                } else {
                                    callback(0);
                                }*/
                // let error = await this.helper.getTranslate('MNEMONIC_WRONG');
                // this.helper.toast(error);

            }
        });
    }
}