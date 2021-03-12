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

import React from "react";
import ReactDOM from "react-dom";
import { ipcRenderer } from "electron";
import { Router } from "common/router";
import ControlBar from "./controlbar";
import NavBar from "./navbar";
import Splash from "./splash";
import Setup from "./setup";
import MyWalletContent from "./mywallet/mywallet-content.js";
import TransactionsContent from "./transactions/transactions-content.js";
import AddressesContent from "./addresses/addresses-content.js";
import SettingsContent from "./settings/settings-content.js";
import CLIContent from "./cli/cli-content.js";
import Reacteroids from "./asteroids/reacteroids.js";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faRocket } from "@fortawesome/free-solid-svg-icons";
import "./index.css";
import ReceiveContent from "./receive/receive-content";
import MasternodesContent from "./masternodes/masternodes-content";
import Warning from "./warning/warning";
import Config from "../common/config";
import SendContent from "./send/send-content";

const condition = false;
const style = "LIGHT";
switch (style) {
	case "DARK":
		import("../common/theme_dark.css")
			.then((something) => {
				console.log("style: ", something.something);
			});
		break;
	case "LIGHT":
		import("../common/theme.css")
			.then((something) => {
				console.log("style: ", something.something);
			});
		break;
	case "PINK":
		break;
}
/*
var sheet = document.styleSheets[0];
sheet.insertRule(":root{--app--background--image: -webkit-gradient( linear, left bottom, left top, color-stop(0, #ff00c8), color-stop(1, white));}");
console.log('document.getElementById("app") ', document.getElementById("app"))
ipcRenderer.on("switch-themes", (event, theme) => {
	console.log("theme: ", theme);
	var sheet = document.styleSheets[0];
	sheet.insertRule(":root{ --app--background--image: -webkit-gradient(linear, left bottom, left top, color-stop(0, #303030), color-stop(1, #303030));}");
});*/
/*
if (condition) {
	import("../common/theme_dark.css")
		.then((something) => {
			console.log("style: ", something.something);
		});
} else {
	import("../common/theme.css")
		.then((something) => {
			console.log("style: ", something.something);
		});
}*/

library.add(faRocket);

let onStartGame = () => {
	ipcRenderer.send("open-asteroids");
};

const routes = {
	asteroids: [
		<ControlBar key={1} headerText="Janus Asteroids" fullControls={true} />,
		<Reacteroids key={2} />
	],
	main: [
		<ControlBar key={1} headerText={Config.getProjectName().toUpperCase()} fullControls={true} />,
		<div className="nav" key={2}>
			<NavBar />
			<div id="maincontainer">
				<MyWalletContent key="mywallet-content" active={true} />
				{<AddressesContent key="addressbook-content" />}
				{<TransactionsContent key="transactions-content" />}
				{/*<TransactionsContentTest key="transactions-test-content" />*/}
				{/*getShowMasternode()*/}
				{<ReceiveContent key="receive-content" />}
				<SendContent key="send-content" />
				{<SettingsContent key="settings-content" />}
				{/*<CLIContent key="cli-content" />*/}

			</div>
		</div>
	],
	splash: [
		<ControlBar key={1} className="nobg" fullControls={false} extraButton="rocket"
			extraButtonOnClick={onStartGame} />, <Splash key={2} />
	],
	setup: [
		<ControlBar key={1} headerText={Config.getProjectName().toUpperCase()} fullControls={true} />, <Setup key={2} />
	],
	warning: [
		<ControlBar key={1} className="nobg" fullControls={false} />, <Warning key={2} />
	]
};

function getShowMasternode() {
	if (Config.getStore) {
		return Config.getIsMasternode() ? <MasternodesContent key="masternodes-content" /> : null;
	} else {
		return null;
	}
}


ReactDOM.render(<Router routes={routes} />, document.getElementById("app"));

