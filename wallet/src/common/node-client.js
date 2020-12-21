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

import Config from "./config";
const Web3c = require('@cypherium/web3c');


const Web3 = require("web3");
const log = require('electron-log');
const axios = require('axios');


export default class NodeClient {

    constructor(nodeInfo) {
        this.nodeInfo = Config.getNodeInfo();
        this.cphNode = Config.getEnvironment();
        console.log(this.cphNode);
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(nodeInfo.url));
        //this.web3c = new Web3c(new Web3c.providers.HttpProvider(this.cphNode.cypherium.provider));
        this.web3c = new Web3c(new Web3c.providers.HttpProvider(this.cphNode.appServerUrl));
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

    async checkBlock() {
        console.log("web3c: ", this.web3c);
        console.log("web3: ", this.web3);
        //let block = await this.web3c.cph.block();
        // var walletAmount = await this.web3c.getCphBalance("<address>");
        /*var walletAmount = this.web3c.getCphBalance("<address>")
            .then(console.log);*/
        /*var walletAmount = this.web3c.getCphBalance("<address>", function (error, result) {

            if (error) {
                console.log(error)
            }
            else {
                console.log(result)
            }
        });*/

        return walletAmount;
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
    async subscribeToBlocks() {
        const subscription = this.web3c.cph.subscribe('newBlockHeaders', (error, blockHeader) => {
            if (error) return log.error(error);
            log.info("BlockHeader: ", blockHeader)
        })
    }
}