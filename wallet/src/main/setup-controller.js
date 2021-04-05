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

import { BrowserWindow, globalShortcut, shell } from "electron";
import { format as formatUrl } from "url";
import * as path from "path";
import electron from "electron";

const isDevelopment = process.env.NODE_ENV !== 'production'

export default class SetupController {
	constructor() {
		this.window = SetupController.create_window();
	}

	static create_window() {
		var window = new BrowserWindow({
			width: parseInt(electron.screen.getPrimaryDisplay().workAreaSize.height / 1.25),
			height: electron.screen.getPrimaryDisplay().workAreaSize.height / 2,
			width: 600,
			height: 500,
			frame: false,
			resizable: false,
			show: false,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
				preload: path.join(__dirname, 'sentry.js'),
				enableRemoteModule: true
			}, frame: false // comment this line to get DEV TOOls
		});

		if (isDevelopment) {
			window.webContents.openDevTools({ mode: "detach" });
			window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?route=setup`);

			globalShortcut.register('f5', function () {
				window.reload();
			});

		} else {
			window.loadURL(formatUrl({
				pathname: path.join(__dirname, "index.html"),
				protocol: "file",
				slashes: true,
				hash: "setup"
			}));

		}

		window.webContents.on("devtools-opened", () => {
			window.focus();
			setImmediate(() => {
				window.focus();
			});
		});

		window.webContents.on("did-finish-load", () => {
			window.show();
		});

		window.webContents.on('new-window', (event, url) => {
			event.preventDefault();
			shell.openExternal(url);
		});
		return window;
	}
}

