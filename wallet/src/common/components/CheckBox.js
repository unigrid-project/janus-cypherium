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

import React, { useState, useEffect } from "react";

const CheckBox = (props) => {
    const [isChecked, setIschecked] = useState(props.selected);
    const [label, setLabel] = useState(props.label);
    const [labelTheme] = useState(props.labelTheme);
    function handleOnChange(event) {
        setIschecked(event.target.checked);
        if (props.handleCheckBox) props.handleCheckBox(event);
    }

    return (
        <div>
            <label className={labelTheme}>
                {label}
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleOnChange} />
            </label>
        </div>
    )
}
export default CheckBox;