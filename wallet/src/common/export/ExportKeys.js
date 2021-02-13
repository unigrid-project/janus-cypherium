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

import { remote } from "electron";

const fs = require('fs');

export default class ExportKeys {
    async export(data, type) {
        let options = {};
        switch (type) {
            case "PRIVATE_KEYS":
                // Save to file:
                options = {
                    title: "Export private key",
                    defaultPath: "CPH-privatekey.txt",
                    buttonLabel: 'Save',
                    filters: [
                        {
                            name: 'Text Files',
                            extensions: ['txt', 'docx']
                        },]
                };

                remote.dialog.showSaveDialog(null, options)
                    .then(file => {
                        fs.writeFile(file.filePath.toString(),
                            data, function (err) {
                                if (err) throw err;
                                console.log('Saved!');
                                data = "";
                            });
                    }
                    ).catch(err => {
                        data = "";
                        console.log(err)
                    })
                break;
            case "KEYSTORE":
                // Save to file:
                options = {
                    title: "Export keystore",
                    defaultPath: "CPH-keystore.keystore",
                    buttonLabel: 'Save',
                    filters: [
                        {
                            name: 'Text Files',
                            extensions: ['keystore']
                        },]
                };

                remote.dialog.showSaveDialog(null, options)
                    .then(file => {
                        console.log("JSON.stringify(data) ", JSON.stringify(data));
                        fs.writeFile(file.filePath.toString(),
                            JSON.stringify(data), function (err) {
                                if (err) throw err;
                                console.log('Saved!');
                                data = "";
                            });
                    }
                    ).catch(err => {
                        data = "";
                        console.log(err)
                    })
                break;
        }

    }
}

