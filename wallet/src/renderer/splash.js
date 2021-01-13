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
import { ipcRenderer } from "electron";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import File from "common/file";
import "./splash.css"
import Store from "electron-store";
import Config from "../common/config";

const store = new Store();
library.add(faSpinner, faTimes);

export default class Splash extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			infoMessage: null,
			errorMessage: null,
			totalConnections: null,
			percentage: "indeterminate"
		};

		ipcRenderer.on("fatal-error", (event, message) => {
			this.setState({ infoMessage: null, errorMessage: message });
		});

		ipcRenderer.on("progress", (event, percentage, message) => {
			this.setState({ infoMessage: message, errorMessage: null, percentage: percentage });
		});
	}
	getData() {

		return JSON.parse(JSON.stringify(Config.getSplashHTML()));
	}
	render() {
		return (
			<div className="splash">
				<img className="logo" src={File.get("logo.png")}></img>
				<div>
					<div dangerouslySetInnerHTML={{ __html: this.getData() }}></div>
					<div className="error">{this.state.errorMessage}</div>
					{this.state.infoMessage != null && this.state.percentage == "indeterminate" &&
						<progress />
					}
					{this.state.infoMessage != null && this.state.percentage != "indeterminate" &&
						<progress value={this.state.percentage} />
					}
					<p>{this.state.infoMessage}</p>
				</div>

			</div>
		);
	}
}