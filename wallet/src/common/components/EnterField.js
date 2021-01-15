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
import './EnterField.css';

function EnterField({
  updateEntry,
  type,
  clearField,
  myStyle,
  enterPressed,
  placeHolder,
  onBlurOut,
  disabled
}) {
  const [inputType] = useState(type)
  const [inputValue, setInputValue] = useState(clearField);
  const [style] = useState(myStyle);
  const [isDisabled] = useState(disabled);
  const [placeValue] = useState(placeHolder);
  function handleChange(event) {
    setInputValue(event.target.value);
    if (updateEntry) updateEntry(event.target.value)
  }
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      console.log('do validate');
      if (enterPressed) enterPressed();
    }
  }

  return (
    <div className="">
      <input
        type={inputType}
        disabled={isDisabled}
        autoFocus={false}
        value={inputValue}
        name="input-form"
        onChange={(e) => {
          e.preventDefault();
          handleChange(e);
        }}
        step="0.01"
        onKeyDown={handleKeyDown}
        onBlur={onBlurOut}
        placeholder={placeValue}
        precision={8}
        className={style} />
    </div>
  );

}
export default EnterField;