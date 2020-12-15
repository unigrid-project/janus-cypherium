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

import File from "./file";
import Store from "electron-store";

const store = new Store();

export default class Config {
    /* Import default conts from config.json */
    /* That data is then stored in electron-store */
    /* which can be accesed from anywhere without another import */
    static loadAppConfig() {
        const fs = require('fs');
        const path = require('path');
        let config = fs.readFileSync(path.join(__static, '/config.json'))
        let data = JSON.parse(config);
        store.set(data);
    }
}