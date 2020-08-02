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

import { app, ipcMain, remote } from "electron";
import * as path from "path";
import { format as formatUrl } from "url";
import Daemon from "../common/daemon";
import RPCClient from "../common/rpc-client.js"
import AsteroidsController from "./asteroids-controller";
import MainController from "./main-controller";
import SplashController from "./splash-controller";
import { Notification } from "electron";
import request from 'request';
import manuallyCheckForUpdates from "../common/components/CheckForUpdates";
import { autoUpdater } from "electron-updater";

const { crashReporter } = require('electron');
const packageJSON = require('../../package.json');
const log = require('electron-log');
const deps = packageJSON.dependencies;


process.on('uncaughtException', (err) => {
	console.log("uncaughtException: ", err)
	request.post('http://crashreports.unigrid.org/POST', {
		form: {
			ver: deps['electron-prebuilt'],
			platform: process.platform,
			process_type: remote ? 'renderer' : 'main',
			version: packageJSON.version,
			productName: packageJSON.productName,
			prod: 'Electron',
			companyName: 'UNIGRID Organization',
			upload_file_minidump: err.stack,
		}
	});
});

crashReporter.start({
	productName: 'UNIGRID Wallet',
	companyName: 'UNIGRID Organization',
	submitURL: 'http://crashreports.unigrid.org/POST',
	uploadToServer: true
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

app.on("activate", () => {
	/*	if (mainWindow === null) {
			mainWindow = createMainWindow();
		}*/
});

ipcMain.on('update-the-wallet', () => {
    console.log("restart and update")
    log.info('Restarting wallet to install the update!');
    if (global.rpcPort != undefined) {
        new RPCClient().stop();
    }
    autoUpdater.quitAndInstall();
})

ipcMain.on("open-asteroids", () => {
	var asteroidsController = new AsteroidsController();
});

const defaultRPCPort = 35075;

app.on("ready", () => {
	var splashController = new SplashController();
	log.info("app ready");
	// for notifications on windows
	app.setAppUserModelId("unigrid-electron");

	splashController.window.webContents.on("did-finish-load", () => {
		log.info("did-finish-load");
		splashController.window.webContents.send("progress", "indeterminate", "Initializing UNIGRID daemon...");
		log.info("Initializing UNIGRID daemon...");
		Daemon.start(splashController.window).then(() => {
			log.info("daemon start...");
			var rpcClient = new RPCClient();
			splashController.version_control(rpcClient).then(() => {
				log.info("version_control");
				splashController.daemon_loading(rpcClient).then(() => {
					log.info("daemon_loading");
					splashController.synchronize_wallet(rpcClient).then(() => {
						log.info("synchronize_wallet");
						splashController.check_errors(rpcClient).then(() => {
							log.info("Load MainController");
							/* If sync was a success, we close the splash and move on to the main wallet window */
							var mainController = new MainController();
							splashController.window.close();
							manuallyCheckForUpdates(mainController.window);
						}, (stderr) => {
							console.error(stderr);
						});
					}, (stderr) => {
						console.error(stderr);
					});
				}, (stderr) => {
					console.error(stderr);
				});
			}, (stderr) => {
				console.error(stderr);
			});
		}, (stderr) => {
			console.error(stderr);
		});
	});
});


