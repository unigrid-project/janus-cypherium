/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The UNIGRID Organization
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

import React, { useState, useEffect } from "react";

import { app, ipcMain, remote } from "electron";
import { autoUpdater } from "electron-updater";
import RPCClient from "../rpc-client";
const log = require('electron-log');
var window;
autoUpdater.autoDownload = true;
autoUpdater.allowPrerelease = true;
// auto updater status signals
autoUpdater.on('checking-for-update', function () {
    log.info('Checking for update...');
});

autoUpdater.on('update-available', function (info) {
    log.info('Update available.');
});

autoUpdater.on('update-not-available', function (info) {
    log.info('Update not available.');
});

autoUpdater.on('error', function (err) {
    log.warn("Update error: ", err);
});

autoUpdater.on('download-progress', function (progressObj) {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + parseInt(progressObj.percent) + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    log.info(log_message);
});

autoUpdater.on('update-downloaded', function (info) {
    log.info('Download complete: ', info);

    window.webContents.send("wallet-update-available");

});

function manuallyCheckForUpdates(mainWindow) {
    window = mainWindow;
    autoUpdater.checkForUpdates();
}

export default manuallyCheckForUpdates;