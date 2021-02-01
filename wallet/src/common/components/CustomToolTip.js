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

import React, { useEffect } from "react";
import Tooltip from "react-simple-tooltip";
import { css } from "styled-components";

function CustomTooltip(props) {

    return (
        <div className={props.fontStyle ? props.fontStyle : null}>
            <Tooltip
                placement={props.placement}
                fadeDuration={150}
                radius={10}
                fontFamily='Roboto'
                fontSize='20'
                fadeEasing="linear"
                background={props.color}
                content={props.content}
                customCss={css`white-space: nowrap; color: black;`}
            >
                {props.item}
            </Tooltip>
        </div>
    )
}

export default CustomTooltip;