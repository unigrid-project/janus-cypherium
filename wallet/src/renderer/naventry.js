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
import { ipcRenderer, remote } from "electron";
import "./naventry.css"

function NavEntry(props) {
	var element = props.children[0] == undefined ? props.children : props.children[0];
	const [active, setActive] = useState();
	const [type, setType] = useState();
	const [name, setName] = useState();

	useEffect(() => {

		setType(element._owner.pendingProps.type)
		setActive(element._owner.pendingProps.active);
		setName(element._owner.pendingProps.name);
		ipcRenderer.on("navigate", (event, source) => {
			if (source != element._owner.key) {
				setActive(false);
			}else if(source === element._owner.key && source === element._owner.pendingProps.name){
				// this allows for non navbar buttons to activate a navbar section
				// just add a name to the element that matches the key
				setActive(true);
			}
			
		});
		setActive(element._owner.pendingProps.active);
	}, []);

	function onClick(e) {
		ipcRenderer.sendTo(remote.getCurrentWebContents().id, "navigate", element._owner.key);
		setActive(true);
	}

	if (type === "button") {
		return (
			<div onClick={onClick} className={active ? "active " + props.className : "inactive " + props.className}>
				{props.children}
			</div>
		)

	} else {
		return (
			<li onClick={onClick} className={active ? "active " + props.className : "inactive " + props.className}>
				{props.children}
			</li>
		)
	}


}

export default NavEntry;

