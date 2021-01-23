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

import React, { useState, useEffect } from "react";
import { ipcRenderer, shell } from "electron";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import File from "../../common/file";
import "./warning.css"
import Button from '../../common/components/Button';
import Config from "../../common/config";

var gt = require('electron').remote.getGlobal('gt');
const log = require('electron-log');

library.add(faSpinner, faTimes);



function Warning() {
	const [message, setMessage] = useState();
	const [version, setVersion] = useState();
	const [urlLink, setUrlLink] = useState();
	const [title, setTitle] = useState();
	useEffect(() => {
		ipcRenderer.on("warning-data", (event, data) => {
			log.info("warning-data ", data);
			setVersion(data.version);
			setMessage(data.message);
			setTitle(data.title);
			setUrlLink(Config.getGithubLink().concat("/releases/tag/v").concat(data.version));
		});
	}, []);

	return (
		<div className="warning-modal">
			<div className="align--row--flexstart">
				<img className="logo" src={File.get("logo.png")}></img>
				<h1>{title}</h1>
			</div>

			<div>
				<div className="wanring--message">
					<div className="message--copy">{message}</div>
				</div>

				<div className="button--spacer">
					<Button
						handleClick={() => updateWallet()}
						buttonSize="btn--tiny"
						buttonStyle="btn--success--solid">{gt.gettext("Update")}</Button>
					<Button
						handleClick={() => openGitURL(urlLink)}
						buttonSize="btn--tiny"
						buttonStyle="btn--secondary--solid">{gt.gettext("Info")}</Button>

					<Button handleClick={() => onCancelPressed()}
						buttonSize="btn--tiny"
						buttonStyle="btn--danger--solid">{gt.gettext("Cancel")}</Button>
				</div>
			</div>

		</div>
	);

	function onCancelPressed(){
		//close-warning-window
		ipcRenderer.send("close-warning-window");
	}
	function openGitURL(url) {
		log.info("url ", url)
		shell.openExternal(url);
	}
	function updateWallet() {
		ipcRenderer.send("update-the-wallet");
	}

}

export default Warning;

