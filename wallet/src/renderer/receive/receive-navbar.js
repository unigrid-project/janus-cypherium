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
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchangeAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import NavEntry from "../naventry";
import Button from "../../common/components/Button";

var gt = require('@electron/remote').getGlobal('gt');
library.add(faExchangeAlt, faChevronRight);

export default class ReceiveNavBar extends React.Component {
	render() {
		return (
			<NavEntry>
				<div className="menu-title">{gt.gettext("Receive")}</div>
				<div className="menu--icon"><FontAwesomeIcon size="sm" icon={faChevronRight} /></div>
			</NavEntry>
		);
	}
}

