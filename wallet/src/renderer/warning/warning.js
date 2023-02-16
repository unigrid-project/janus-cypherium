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
import { CANCEL, INFO, UPDATE } from "../../common/getTextConsts";
import Config from "../../common/config";

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
			setUrlLink('https://t.me/cypherium_supergroup');
		});
	}, []);

	return (
		<div className="warning-modal">
			<div className="align--row--flexstart padding-ten">
				<img className="warningLogo" src={File.get("logo.png")}></img>
				<h1>{title}</h1>
			</div>

			<div>
				<div className="warning--message">
					<div className="message--copy">{message}</div>
				</div>
				<div className="align--center">
					<div className="button--spacer">
						<Button
							handleClick={() => openGitURL(urlLink)}
							buttonSize="btn--small"
							buttonStyle="btn--success--solid">{UPDATE}</Button>
						<Button
							handleClick={() => openGitURL(urlLink)}
							buttonSize="btn--small"
							buttonStyle="btn--secondary--solid">{INFO}</Button>

						<Button handleClick={() => onCancelPressed()}
							buttonSize="btn--small"
							buttonStyle="btn--danger--solid">{CANCEL}</Button>
					</div>
				</div>

			</div>

		</div>
	);

	function onCancelPressed() {
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

