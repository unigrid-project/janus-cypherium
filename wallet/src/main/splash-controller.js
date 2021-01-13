/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The Swipp developers <info@swippcoin.com>
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

import { BrowserWindow } from "electron";
import { format as formatUrl } from "url";
import path from "path";
import Daemon from "../common/daemon";
import Explorer from "../common/explorer";
import Version from "../common/version";
import Config from "../common/config";

const log = require('electron-log');
const isDevelopment = process.env.NODE_ENV !== 'production';
const BOOTSTRAP_DOWNLOAD_THRESHOLD_BLOCKS = 20000;

export default class SplashController {
	constructor() {
		this.window = SplashController.create_window();
	}

	static create_window() {
		var window = new BrowserWindow({
			width: 600,
			height: 236,
			frame: false,
			resizable: false,
			show: false,

			webPreferences: {
				nodeIntegration: true,
				webSecurity: false,
				enableRemoteModule: true,
				preload: path.join(__dirname, 'sentry.js')
			}, frame: false // comment this line to get DEV TOOls
		});

		if (isDevelopment) {
			window.webContents.openDevTools({ mode: "detach" });
			window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?route=splash`);
		} else {
			//window.webContents.openDevTools({ mode: "detach" });
			window.loadURL(formatUrl({
				pathname: path.join(__dirname, 'index.html'),
				protocol: "file",
				slashes: true,
				hash: "splash"
			}));
		}

		window.webContents.on("devtools-opened", () => {
			window.focus();
			setImmediate(() => {
				window.focus();
			});
		});

		window.webContents.on("did-finish-load", () => {
			log.info("did-finish-load");
			window.show();
			window.webContents.send("state", "working");
		});

		return window;
	}

	async version_control(rpcClient) {
		return await new Promise((resolve, reject) => {
			rpcClient.getinfo().then((response) => {
				var latest_version = Version.get_cleaned_up(response["latest-version"]);
				if (Version.is_latest(response["version"], latest_version)) {
					resolve();
				} else if (Version.is_latest(latest_version, "unknown")) {
					console.log("github is most likely down ", response["latest-version"]);
					resolve();
				}
				else {
					var errorMessage = "The daemon of this wallet is outdated. " +
						`Please download version ${latest_version}`;

					this.window.webContents.send("fatal-error", errorMessage);
					this.window.webContents.send("state", "idle");
					reject(errorMessage);
				}
			}, (stderr) => {
				reject(stderr);
			});
		});
	}

	async check_first_load() {
		return await new Promise((resolve, reject) => {
			const account = Config.getAccount();
			if(account){
				resolve();
			}else{
				var errorMessage = "It appears this is a first time load. Import or create a new wallet";
				reject(errorMessage);
			}
		}, (stderr) => {
			reject(stderr);
		});
	}

	async handle_synchronization(remoteHeight, rpcClient) {
		var syncing = false;
		var startHeight = -1;
		var localHeight = 0;

		do {
			await new Promise((resolve, reject) => {
				if (syncing) {
					Promise.all([
						rpcClient.getblockcount(),
						new Promise(resolve => setTimeout(resolve, 500))
					]).then((response) => {
						localHeight = response[0];
						log.info("localHeight: ", localHeight);
						if (startHeight == -1) {
							startHeight = localHeight;
						} else if (remoteHeight > startHeight) {
							this.window.webContents.send(
								"progress", localHeight / remoteHeight,
								`Synchronizing block ${localHeight} of ${remoteHeight}...`
							);
						} else if (startHeight >= remoteHeight) {
							log.info("Wallet has fully synced...");

							resolve();
						}

						resolve();
					}, (stderr) => {
						console.error(stderr);
						reject();
					});
				} else {
					Promise.all([
						rpcClient.getinfo(),
						new Promise(resolve => setTimeout(resolve, 500))
					]).then((response) => {
						var progress = response[0].bootstrapping.progress;
						console.log("response[0].bootstrapping.status ", response[0].bootstrapping.status)
						switch (response[0].bootstrapping.status) {
							case "downloading":
								this.window.webContents.send(
									"progress", "indeterminate",
									`Downloading bootstrap archive (${progress.toFixed(2)}%)...`
								);
								break;
							case "unarchiving":
								this.window.webContents.send(
									"progress", "indeterminate",
									`Unarchiving bootstrap archive (${progress.toFixed(2)}%)...`
								);
								break;
							case "syncing":
							case "inactive":
								syncing = true;
								this.window.webContents.send(
									"progress", "indeterminate",
									`Importing blocks...`
								);
								break;
							case "loading":
								this.window.webContents.send(
									"progress", "indeterminate",
									`Loading block index...`
								);
								break;
							case "restart":
								var errorMessage = "There was an error loading the wallet. " +
									`Please close and restart UNIGRID.`;

								this.window.webContents.send("fatal-error", errorMessage);
								this.window.webContents.send("state", "idle");
								reject(errorMessage);
								break;
							default:
								this.window.webContents.send("progress", "indeterminate", "");
						}

						resolve();
					}, (stderr) => {
						console.error(stderr);
						reject();
					});
				}
			});
			console.log("localHeight: ", localHeight);
			console.log("remoteHeight: ", remoteHeight);
		} while (startHeight == -1 || remoteHeight > localHeight);

		console.log("completed synce should move on from here");
	}

	async synchronize_wallet(rpcClient) {
		console.log("synchronize wallet")
		return await new Promise((resolve, reject) => {
			Promise.all([
				rpcClient.getinfo(),
				new Explorer().getblockcount(),
				new Promise(resolve => setTimeout(resolve, 1000))
			]).then((response) => {
				//console.log("sync call response ", response)
				var remoteHeight = response[1];
				/* Should we restart the daemon and download the bootstrap? */
				if (remoteHeight - response[0]["blocks"] > BOOTSTRAP_DOWNLOAD_THRESHOLD_BLOCKS) {
					this.window.webContents.send(
						"progress", "indeterminate", "Preparing sycnhronization... blocks behind: " + (remoteHeight - response[0]["blocks"])
					);

					Promise.all([rpcClient.stop(), Daemon.done()]).then((response) => {
						Daemon.start(this.window, true).then((response) => {
							this.handle_synchronization(remoteHeight, rpcClient).then(() => resolve());
						});
					});
				} else {
					resolve();
				}
			}).catch((reason) => {
				this.window.webContents.send(
					"progress", "indeterminate", reason
				);
				reject();
			});
		});
	}

	async check_errors(rpcClient) {
		var walletStatus = "";
		var count = 1;
		do {
			await new Promise((resolve, reject) => {
				Promise.all([
					rpcClient.getinfo(),
					new Promise(resolve => setTimeout(resolve, 1000))
				]).then((response) => {
					//console.log("errors message: ", response[0]);
					walletStatus = response[0].bootstrapping.walletstatus;
					this.window.webContents.send(
						"progress", "indeterminate", "Checking Wallet.dat... ".concat(walletStatus)
					);
					count++;
					resolve();
				}).catch((reason) => {
					reject();
				});
			});
		} while (walletStatus != "Done loading")
	}

	async daemon_loading(rpcClient) {
		var blockHeight = -1;
		var rpcCallCount = 0;
		do {
			await new Promise((resolve, reject) => {
				Promise.all([
					rpcClient.getinfo(),
					new Promise(resolve => setTimeout(resolve, 1000))
				]).then((response) => {
					this.window.webContents.send(
						"progress", "indeterminate", `${Config.getProjectName()} daemon loading...` + rpcCallCount
					);
					blockHeight = response[0]["blocks"];
					rpcCallCount++;
					resolve();
				}, (stderr) => {
					console.error(stderr);

					reject();
				});
			});
		} while (blockHeight === -1)
		this.window.webContents.send(
			"progress", "indeterminate", "Done loading daemon..."
		);
	}
}

