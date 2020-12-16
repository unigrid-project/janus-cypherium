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

import Store from "electron-store";

const store = new Store();

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
        const fs = require('fs');
        const path = require('path');
        let config = fs.readFileSync(path.join(__static, '/config.json'));
        let data = JSON.parse(config);
        store.set(data);
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

    static getProjectName() {
        return this.getStore().projectName;
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

    static getIsDaemonLocal() {
        return this.getStore().isDaemonLocal;
    }

    static getSplashHTML() {
        return this.getStore().splashInfo.html;
    }

    static getUserModelId() {
        return this.getStore().userModelId;
    }

    static getMasternodeSetupScript() {
        return `bash -ic "$(wget -4qO- -o- raw.githubusercontent.com/unigrid-project/masternode-setup/master/unigridd.sh)" ; source ~/.bashrc`;
    }
}