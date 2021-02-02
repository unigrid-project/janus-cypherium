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

import Store from "electron-store";
import LocalePath from "./loaclePath";
const log = require('electron-log');
const store = new Store();
const isDevelopment = process.env.NODE_ENV !== 'production';
const fs = require('fs');
const path = require('path');

export default class Config {

    /* Import default conts from config.json */
    /* That data is then stored in electron-store */
    /* which can be accesed from anywhere without another import */
    //static random = "somerandomshit";

    static loadStore(window) {
        return new Promise((resolve, reject) => {
            try {
                if (this.getStore()) {
                    return resolve();
                } else {
                    window.webContents.send("fatal-error", "Error loading config file");
                    window.webContents.send("state", "idle");
                    reject("Error loading config file");
                }
            } catch {
                window.webContents.send("fatal-error", "Error loading config file");
                window.webContents.send("state", "idle");
                reject("Error loading config file");
            }
        });
    }

    static init() {
        return new Promise((resolve, reject) => {
            try {                
                const join = isDevelopment ? (path.join(process.env.INIT_CWD, '../config.json')) : './config.json';
                const loaclPath = LocalePath.get(join);
                let config = fs.readFileSync(loaclPath);
                let data = JSON.parse(config);
                store.set(data);
                resolve();
            } catch {
                // log error message 
                log.warn("Error initializing config.json");
                reject("Error initializing config.json");
            }
        });

    }

    static async start() {
        var p;
        p = await Config.init();
        return p;
    }

    static async checkStore(window) {
        var p;
        p = await Config.loadStore(window);
        return p;
    }

    static getStore() {
        let localStore = store.get("janusConfirguration");
        if (localStore) {
            return localStore;
        } else {
            return null;
        }
    }

    static setLocale(locale) {
        store.set('locale', locale);
    }

    static getLocale() {
        return store.get('locale');
    }

    static getAccount() {
        return store.get('walletList');
    }

    static getLanguages() {
        return store.get('languages');
    }

    static getCurrentAccount() {
        return store.get("currentSelectedAccount")
    }

    static getEnvironment() {
        if (this.getStore().testing)
            return this.getStore().test_environment
        return this.getStore().environment;
    }

    static getNodeInfo() {
        return this.getStore().nodeInfo;
    }

    static getCoinGeckoId() {
        return this.getStore().coindGeckoId;
    }

    static getDiscordLink() {
        return this.getStore().discordLink;
    }

    static getTwitterLink() {
        return this.getStore().twitterLink;
    }

    static getTelegramLink() {
        return this.getStore().telegramLink;
    }

    static getExplorerLink() {
        return this.getStore().explorerLink;
    }

    static getHomepage() {
        return this.getStore().homePage;
    }

    static getGithubLink() {
        return this.getStore().githubLink;
    }

    static getGithubUrl() {
        return this.getStore().githubUrl;
    }

    static getProjectName() {
        return this.getStore().projectName;
    }

    static getProjectTicker() {
        return this.getStore().projectTicker;
    }

    static getConfFile() {
        return this.getStore().confFile;
    }

    static getMasternodeFile() {
        return this.getStore().masternodeFile;
    }

    static getIsMasternode() {
        return this.getStore().isMasternode;
    }

    static getHasStaking() {
        return this.getStore().hasStaking;
    }

    static isDaemonBased() {
        return this.getStore().isDaemonLocal;
    }

    static getHasGas() {
        return this.getStore().hasGas;
    }

    static getSplashHTML() {
        return this.getStore().splashInfo.html;
    }

    static getUserModelId() {
        return this.getStore().userModelId;
    }

    static getShowWidget() {
        return this.getStore().showWidget;
    }

    static getMasternodeSetupScript() {
        return `bash -ic "$(wget -4qO- -o- raw.githubusercontent.com/unigrid-project/masternode-setup/master/unigridd.sh)" ; source ~/.bashrc`;
    }
}
