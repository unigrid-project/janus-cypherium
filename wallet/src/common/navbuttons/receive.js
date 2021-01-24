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
import { faExchangeAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import NavEntry from "../../renderer/naventry";
import Button from "../components/Button";
import { RECEIVE } from "../getTextConsts";

library.add(faExchangeAlt, faChevronRight);

export default class Receive extends React.Component {
	render() {
		return (
			<NavEntry>
				<Button
					buttonStyle="btn--success--solid"
					handleClick={() => null}
					buttonSize="btn--small">{RECEIVE}</Button>
			</NavEntry>
		);
	}
}

