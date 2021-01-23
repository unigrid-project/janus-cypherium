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

import React, { useState, useEffect, useRef } from "react";
import { ipcRenderer, remote } from "electron";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import File from "common/file";
import "./setup.css"
import Store from "electron-store";
import Config from "../common/config";
import Button from "../common/components/Button";
//import SetupControls from "../main/setup/SetupControls";
import ImportAccount from "../common/setup/ImportAccount";
import CreateAccount from "../common/setup/CreateAccount";

var gt = require('electron').remote.getGlobal('gt');
const store = new Store();
library.add(faSpinner, faTimes);



const firstRunCopy = gt.gettext("It appears this is the first time you are starting up the wallet. You can either create a new account or import from your keys.");
const createWalletCopy = gt.gettext("Please select an option below to either import or create another wallet. This will not replace your current wallet.");
function Setup(props) {
	const [active, setActive] = useState();
	//const container = useRef(props.children);
	const [setupClasses, setSetupClasses] = useState("setup--container--start");
	const [importClasses, setImportClasses] = useState("import--container--start");
	const [createClasses, setCreateClasses] = useState("create--container--start");
	const [importState, setImportState] = useState(false);
	const [createState, setCreateState] = useState(false);
	const [renderKey, setRenderKey] = useState(Math.random());
	const [firstRun, setFirstRun] = useState();
	const [handleClose, sethandleClose] = useState("");
	//const setupControls = new SetupControls();
	useEffect(() => {
		// init
		ipcRenderer.on("go-back-setup", (event, message) => {
			console.log("go back setup ", message);
			onGoBack(message);
		});
		ipcRenderer.on("setup-controller-type", (event, message) => {
			console.log("message ", message);
			sethandleClose(message)
			switch (message) {
				case "FIRST_RUN":
					setFirstRun(true);
				case "NEW_WALLET":
					setFirstRun(false);
			}
		});

	}, []);

	useEffect(() => {
		ipcRenderer.on("handle-wallet-creation", (event, account) => {
			switch (handleClose) {
				case "FIRST_RUN":
					// set default account in store
					store.set("currentSelectedAccount", [account]);
					ipcRenderer.send('open-main-window');
				case "NEW_WALLET":
					ipcRenderer.send('close-setup-window');
					remote.getCurrentWindow().close();
			}
		});
	}, [handleClose])

	return (
		<div key={renderKey}>
			<div className={setupClasses}
				onAnimationEnd={onSetupAnimationEnd}
				onAnimationStart={onSetupAnimationStart}>
				<div className="setup">
					<div >
						<div>
							<div className="fontRegularBold darkCopy">{firstRun ? firstRunCopy : createWalletCopy}</div>
						</div>
					</div>
					<div className="align--row">
						<div className="padding-ten">
							<Button
								handleClick={() => {
									importAccount();
								}}
								buttonSize="btn--small"
								buttonStyle="btn--blue--solid">{gt.gettext("Import")}</Button>
						</div>
						<div className="padding-ten">
							<Button
								handleClick={() => {
									createAccount();
								}}
								buttonSize="btn--small"
								buttonStyle="btn--blue--solid">{gt.gettext("Create")}</Button>
						</div>
						{/*<div className="padding-ten">
							<Button
								handleClick={() => {
									testChangeLocale();
								}}
								buttonSize="btn--small"
								buttonStyle="btn--blue--solid">Change</Button>
							</div>*/}
					</div>
				</div>
			</div>
			<div className={importClasses}>
				<ImportAccount />
			</div>
			<div className={createClasses}>
				<CreateAccount />
			</div>
		</div>
	);

	function testChangeLocale() {

	}

	function onSetupAnimationStart() {
		console.log("onAnimationStart");
	}

	function onSetupAnimationEnd() {
		if (setupClasses === "setup--container--start setup--open--animation") {
			setSetupClasses("setup--openposition");
		} else if (setupClasses === "setup--openposition close--animation") {
			setSetupClasses("setup--container--start");
			// back to false so we can open again
			setImportState(false);
		}
	}

	function importAccount() {
		console.log("handle import");
		if (importState === false) {
			// set this to true so you cant keep opening the import window
			setImportState(true);
			setSetupClasses("setup--container--start setup--open--animation");
			setImportClasses("import--container--start import--open--animation");
		}
	}

	function createAccount() {
		console.log("handle create");
		if (createState === false) {
			// set this to true so you cant keep opening the import window
			setCreateState(true);
			setSetupClasses("setup--container--start setup--open--animation");
			setCreateClasses("create--container--start create--open--animation");
		}
	}

	function onGoBack(msg) {
		if (msg === "IMPORT") {
			setImportState(false);
			setImportClasses("import--close--animation send--container--open");
		}
		if (msg === "CREATE") {
			setCreateState(false);
			setCreateClasses("create--close--animation create--container--open");
		}
		setSetupClasses("setup--openposition close--animation");
	}
}
export default Setup;