/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The Swipp developers <info@swippcoin.com>
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

import React, { useState, useEffect, useRef } from "react";
import { ipcRenderer, remote } from "electron";
import "./content.css";

function Content(props) {
	const [element] = useState(props.children[0] == undefined ? props.children : props.children[0]);
	const [active, setActive] = useState(element._owner.pendingProps.active);
	//const container = useRef(props.children);
	useEffect(() => {
		ipcRenderer.on("navigate", (event, source) => {
			setActive(source.toLowerCase().replace(" ", "") == props.id);
			//scrollTo(container);
		});
	}, []);
	/*const scrollTo = (ref) => {
		console.log('container ', ref.current);
		if (ref) {
			ref.current.scrollIntoView();
			//ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}*/

	return (
		<div id={props.id} className={active ? "active " : "inactive " + props.className}>
			{props.children}
		</div>
	);
}

export default Content;

