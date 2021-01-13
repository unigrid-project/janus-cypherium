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
import "./content.css";

function Content(props) {
	//var element = props.children[0] == undefined ? props.children : props.children[0];
	const [active, setActive] = useState();
	//const container = useRef(props.children);
	useEffect(() => {
		ipcRenderer.on("navigate", (event, source) => {
			setActive(source.toLowerCase().replace(" ", "") == props.id);
			//scrollTo(container);
		});
		// passing the active through content now
		// i dont think _owner.pendingProps is available outside dev mode
		if(props.active === undefined){
			setActive(false);
		}else{
			setActive(props.active);
		}
		//setActive(element._owner.pendingProps.active);
	}, []);

	return (
		<div id={props.id} className={active ? "active " : "inactive " + props.className}>
			{props.children}
		</div>
	);
}

export default Content;
