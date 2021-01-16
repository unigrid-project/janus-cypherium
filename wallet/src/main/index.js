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

import { app, ipcMain, remote, powerMonitor } from "electron";
import Daemon from "../common/daemon";
import RPCClient from "../common/rpc-client.js"
import AsteroidsController from "./asteroids-controller";
import MainController from "./main-controller";
import SplashController from "./splash-controller";
import SetupController from "./setup-controller";
import { autoUpdater } from "electron-updater";
import WarningController from "./warning-controller";
import * as Sentry from "@sentry/electron";
import Config from "../common/config";
import NodeClient from "../common/node-client";
import Store from "electron-store";

import { crashReporter } from 'electron';
const packageJSON = require('../../package.json');
const log = require('electron-log');
const store = new Store();
//const deps = packageJSON.dependencies;
const isDevelopment = process.env.NODE_ENV !== 'production';

autoUpdater.autoDownload = true;
autoUpdater.allowPrerelease = true;
let testing = false;
var configError;
/* Initialize consts from config.json */
Config.start().then(() => {
	configError = "";
}, (stderr) => {
	configError = stderr;
});

Sentry.init({
	dsn: "https://63a0ca962c17402dbe42a4b68251eb7d@o266736.ingest.sentry.io/5594296",
	release: 'janus-cypherium@' + process.env.npm_package_version,
});

var mainWindow;
var warningWindow;
var setupWindow;
var isWarningOpen = false;
var isSetupOpen = false;
var trackRejectUpdates = 0;
var skipTimesAllocated = 20;
const checkForUpdateTime = 180000;


const fs = require('fs');
const path = require('path');
//let enPo = fs.readFileSync(path.join(__static, '/home/evan/work/Janus/wallet/locale/en/messages.po'));
var gettext = require('electron-gettext');
var _ = gettext.gettext;

gettext.loadLanguageFile('locale/en/messages.po', 'en', (msg) => {
	//setLocale()
});
gettext.loadLanguageFile('locale/sp/messages.po', 'sp', (msg) => {
	setLocale()
});
const setLocale = () => {
	if (Config.getLocale()) {
		console.log(" Config.getLocale() ", Config.getLocale())
		gettext.setlocale('LC_ALL', Config.getLocale());
	} else {
		console.log("en ", Config.getLocale())
		gettext.setlocale('LC_ALL', 'en');
	}
	global._ = _;
}

ipcMain.on("change-locale", (event, msg) => {
	console.log("Locale was changed to ", msg)
	Config.setLocale(msg);
	if (global.rpcPort != undefined) {
		new RPCClient().stop();
	}
	app.relaunch();
	app.quit();
	//gettext.setlocale('LC_ALL', msg);
});

crashReporter.start({
	productName: 'UNIGRID Wallet',
	companyName: 'UNIGRID Organization',
	submitURL: 'http://crashreports.unigrid.org/POST',
	uploadToServer: true,
	compress: true
});

app.whenReady().then(() => {
	powerMonitor.on('suspend', () => {
		console.log('The system is going to sleep')
	});

	powerMonitor.on('resume', () => {
		console.log('The system is waking up from sleep');
		mainWindow.webContents.send("trigger-info-update");
	});
});

global.isDevelopment = process.env.NODE_ENV !== "production";

if (app.getGPUFeatureStatus().gpu_compositing.includes("disabled")) {
	app.disableHardwareAcceleration();
}

app.on("window-all-closed", () => {
	if (global.rpcPort != undefined) {
		new RPCClient().stop();
	}
	app.quit();
});

ipcMain.on("wallet-restart", () => {
	console.log('calling relaunch app')
	if (global.rpcPort != undefined) {
		new RPCClient().stop();
	}
	app.relaunch();
	app.quit();
});

ipcMain.on('update-the-wallet', () => {
	console.log("restart and update")
	log.info('Restarting wallet to install the update!');
	if (global.rpcPort != undefined) {
		new RPCClient().stop();
	}
	autoUpdater.quitAndInstall();
});

ipcMain.on("open-asteroids", () => {
	var asteroidsController = new AsteroidsController();
});

ipcMain.on("import-new-wallet", () => {
	if (!isSetupOpen) {
		isSetupOpen = true;
		const setupController = new SetupController();
		setupController.window.on('close', () => {
			isSetupOpen = false;
		});
		setupController.window.webContents.on("did-finish-load", () => {
			setupController.window.webContents.send('setup-controller-type', "NEW_WALLET");
			ipcMain.on("close-setup-window", () => {
				mainWindow.webContents.send("accounts-updated", "ADDED");
			})
		});
	}
})

const defaultRPCPort = 51992;

app.on("ready", () => {
	var splashController = new SplashController();
	log.info("app ready");
	// for notifications on windows
	app.setAppUserModelId(Config.getUserModelId());
	splashController.window.webContents.on("did-finish-load", () => {
		log.info("Splash screen loaded");
		if (configError != "") {
			splashController.window.webContents.send("fatal-error", configError);
			splashController.window.webContents.send("state", "idle");
		} else {
			Config.checkStore(splashController.window).then(() => {
				log.info("local store has been loaded");
				log.info(`Initializing ${Config.getProjectName()} daemon...`);
				if (!Config.isDaemonBased()) {
					log.info("Node is server based, skip trying to load a local daemon");
					var nodeClient = new NodeClient();
					nodeClient.start().then((r) => {
						log.info("successfuly connected to the cph network");
						splashController.window.webContents.send("progress", "indeterminate", `successfuly connected to the eth network`);
						splashController.check_first_load().then(() => {
							var mainController = new MainController();
							mainWindow = mainController.window;
							splashController.window.close();
							manuallyCheckForUpdates(mainWindow);
						}, (stderr) => {
							var setupController = new SetupController();
							splashController.window.close();
							setupController.window.webContents.on("did-finish-load", () => {
								setupController.window.webContents.send('setup-controller-type', "FIRST_RUN");
								ipcMain.on("open-main-window", () => {
									//let accArr = [data];
									//store.set('account', accArr);
									var mainController = new MainController();
									mainWindow = mainController.window;
									manuallyCheckForUpdates(mainWindow);
									setupController.window.close();
								});

								log.info("Loaded account setup window");
							})
						});
					}, (stderr) => {
						splashController.window.webContents.send("fatal-error", stderr.toString());
						splashController.window.webContents.send("state", "idle");
						log.warn(stderr);
					});
				} else {
					splashController.window.webContents.send("progress", "indeterminate", `Initializing ${Config.getProjectName()} daemon...`);
					Daemon.start(splashController.window).then(() => {
						log.info("daemon started...");
						var rpcClient = new RPCClient();
						splashController.version_control(rpcClient).then(() => {
							log.info("Checking version");
							splashController.daemon_loading(rpcClient).then(() => {
								log.info("Loading daemon");
								splashController.synchronize_wallet(rpcClient).then(() => {
									log.info("Synchronizing wallet");
									splashController.check_errors(rpcClient).then(() => {
										log.info("Load MainController");
										/* If sync was a success, we close the splash and move on to the main wallet window */
										var mainController = new MainController();
										mainWindow = mainController.window;
										splashController.window.close();
										manuallyCheckForUpdates(mainWindow);
									}, (stderr) => {
										log.warn(stderr);
									});
								}, (stderr) => {
									log.warn(stderr);
								});
							}, (stderr) => {
								log.warn(stderr);
							});
						}, (stderr) => {
							log.warn(stderr);
						});
					}, (stderr) => {
						console.log("error daemon: ", stderr)
						log.warn(stderr);
					});
				}

			}, (stderr) => {
				console.log("error config: ", stderr)
				log.warn(stderr);
			});
		}

	});
});

autoUpdater.on('checking-for-update', function () {
	//log.info("Checking for a new wallet release.");
	if (testing) {
		var vCurr = '2.0.14';
		var nVer = '2.0.15';
		var currentVersion = vCurr.split('.');
		var newVersion = nVer.split('.');

		log.info("currentVersion ", currentVersion[1]);
		log.info("newVersion ", newVersion[1]);
		// testing === for prod <
		if (currentVersion[1] === newVersion[1]) {
			let message = {
				title: "WARNING!",
				version: '2.0.15',
				message: `There is a new wallet release with a protocol change. This update is manadatory! 
                Please update now to get on the latest version 2.0.15 of ${packageJSON.name}.`
			}
			log.info("SEND WARNING UPDATE MESSAGE!");
			openwarningWindow(message);
		}
	}
});

autoUpdater.on('update-available', function (info) {
	log.info('Update available.');
});

autoUpdater.on('update-not-available', function (info) {
	//log.info('Update not available.');
});

autoUpdater.on('error', function (err) {
	log.warn("Auto Updater: ", err);
});

autoUpdater.on('download-progress', function (progressObj) {
	let log_message = "Download speed: " + progressObj.bytesPerSecond;
	log_message = log_message + ' - Downloaded ' + parseInt(progressObj.percent) + '%';
	log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
	log.info(log_message);
});

autoUpdater.on('update-downloaded', function (info) {
	log.info('Download complete: ', info);
	var currentVersion = packageJSON.version.split('.');
	var newVersion = info.version.split('.');
	log.info("currentVersion ", currentVersion[1]);
	log.info("newVersion ", newVersion[1]);
	// testing === for prod <
	if (currentVersion[1] < newVersion[1] || currentVersion[0] < newVersion[0]) {
		log.info("Your wallet daemon needs updating!");
		let message = {
			title: "WARNING!",
			version: info.version,
			message: `There is a new wallet release with a protocol change. This update is manadatory! 
            Please update now to get on the latest version ${info.version} of ${packageJSON.name}.`
		}
		openwarningWindow(message);
	}
	mainWindow.webContents.send("wallet-update-available", info);
});

const openwarningWindow = (data) => {
	if (!isWarningOpen) {
		var warningController = new WarningController();
		warningWindow = warningController.window;
		warningController.window.webContents.on("did-finish-load", () => {
			warningController.window.webContents.send("warning-data", data);
		});
		isWarningOpen = true;
		warningController.window.on('close', function () { isWarningOpen = false });
	}
}

ipcMain.on("close-warning-window", () => {
	trackRejectUpdates++;
	if (trackRejectUpdates > skipTimesAllocated) dancingPickles();
	warningWindow.close();
});

function dancingPickles() {

}

function manuallyCheckForUpdates(mainWindow) {
	//window = mainWindow;
	autoUpdater.checkForUpdates();
	autoCheckForUpdates;
}

const autoCheckForUpdates = setInterval(() => {
	if (isDevelopment) return;// || !navigator.onLine // navigator is NOT available in main disabling and should be removed
	autoUpdater.checkForUpdates();
}, checkForUpdateTime);


