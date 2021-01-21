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

import React, { useState, useEffect } from "react"; import Content from "../content";
import { ipcRenderer, remote, clipboard } from "electron";
import { faChevronLeft, faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AccountSelection from "../../common/accounts/AccountSelection";
import CreateAccountButton from "../../common/components/CreateAccountButton";
import Config from "../../common/config";
import QRCode from 'qrcode.react';
import File from "../../common/file";
import './receive-content.css';
import CustomTooltip from "../../common/components/CustomToolTip";
import { sendDesktopNotification } from "../../common/components/DesktopNotifications";
import Button from "../../common/components/Button";
import { COPIED, EXPORT_KEYS } from "../../common/getTextConsts";
import Gettext from 'node-gettext';
var gt = require('electron').remote.getGlobal('gt');

const copyToClipboard = gt.gettext("copy to clipboard");
const viewOnExplorer = gt.gettext("View On Explorer");

export default function ReceiveScreen() {

	const [currentSelectedAccount, setCurrentSelectedAccount] = useState(Config.getCurrentAccount());
	const [walletList, setWalletList] = useState(Config.getAccount());
	const [renderListKey, setRenderListKey] = useState(Math.random());
	const [renderKeyQr, setRenderKeyQr] = useState(Math.random());
	useEffect(() => {
		ipcRenderer.on("update-active-account", (event, account) => {
			setCurrentSelectedAccount(account);
			setRenderKeyQr(Math.random());
		});
		ipcRenderer.on("accounts-updated", (event, message) => {
			const accounts = Config.getAccount();
			setWalletList(accounts);
			setRenderListKey(Math.random());
		});
	}, [])
	return (
		<Content id="receive">
			<div>
				<div className="fontSmallBold darkCopy dropdown--selection padding-ten align--row--stretch ">
					<div className="width--ninty" key={renderListKey}>
						<AccountSelection
							key={currentSelectedAccount}
							current={currentSelectedAccount}
							list={walletList}
						/>
					</div>
					<CreateAccountButton key="create" className="button" />
				</div>
				<div key={renderKeyQr}>
					{createQrCode()}
				</div>
				<div className="align--center--row padding-ten">
					<div className="fontSmallBold darkCopy  align--row--stretch outline--border padding-five">
						<div className="align--center--row">{"CPH" + currentSelectedAccount[0].address}</div>
						<div className="clipboard account--item align--center--row">
							<CustomTooltip
								placement="left"
								item={<FontAwesomeIcon size="sm" icon={faClipboard} color="white" onClick={() => copyAddress("CPH" + currentSelectedAccount[0].address)} />}
								color="var(--dark--green)"
								content={<div className="fontSmallBold">{copyToClipboard}</div>}
							/>
						</div>
					</div>
				</div>
				<div className="align--center--row">
					<div className="padding-ten">
						<a
							className="href--links "
							href={Config.getExplorerLink() + "search/CPH" + currentSelectedAccount[0].address} target="_blank">
							<div className="btn--long btn--primary--solid btn">
								{viewOnExplorer}
							</div>
						</a>
					</div>
					<div className="padding-ten">
						<Button
							handleClick={() => null}
							buttonSize="btn--long">{EXPORT_KEYS}</Button>
					</div>
				</div>


			</div>
		</Content>
	);

	function createQrCode() {
		//currentSelectedAccount
		const code = "cph://account/transfer/" + 'CPH' + currentSelectedAccount[0].address;
		const logo = File.get("logo.png");
		return (
			<QRCode value={code}
				size={128}
				bgColor={"#ffffff"}
				fgColor={"#000000"}
				level={"L"}
				includeMargin={false}
				renderAs={"svg"}
				imageSettings={{
					src: logo,
					x: null,
					y: null,
					height: 24,
					width: 24,
					excavate: true,
				}} />
		)
	}

	function copyAddress(v) {
		//responseAddress
		clipboard.writeText(v, 'clipboard')
		console.log(clipboard.readText('clipboard'))
		sendDesktopNotification(`${v} ${COPIED}`);
	}


}

