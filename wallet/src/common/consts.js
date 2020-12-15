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

import Store from "electron-store";

const store = new Store();
const data = store.get('janusConfirguration');

export const discordLink = data.discordLink;

export const twitterLink = data.twitterLink;

export const telegramLink = data.telegramLink;

export const explorerLink = data.explorerLink;

export const homePage = data.homePage;

export const githubLink = data.githubLink;

export const projectName = data.projectName;

export const confFile = data.confFile;

export const masternodeFile = data.masternodeFile;

export const isMasternode = data.isMasternode;

export const hasStaking = data.hasStaking;

export const isDaemonLocal = data.isDaemonLocal;

export const splashHTML = data.splashInfo;

export const userModelId = data.userModelId;

export const masternodeSetupScript = `bash -ic "$(wget -4qO- -o- raw.githubusercontent.com/unigrid-project/masternode-setup/master/unigridd.sh)" ; source ~/.bashrc`;


