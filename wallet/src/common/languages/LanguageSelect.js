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
import Select from 'react-dropdown-select';
import { ipcRenderer } from "electron";
import Config from "../config";
import { FlagIcon } from "react-flag-kit";

const languages = Config.getLanguages();
const currentLocale = Config.getLocale();
const currentIndex = languages.findIndex(item => item.language === currentLocale);

export default function LanguageSelect() {

    const [renderKey, setRenderKey] = useState(Math.random());
    const [languageList, setlanguageList] = useState([]);
    const [currentLanguage, setCurrentLanguage] = useState(languages);

    useEffect(() => {
        //console.log("languages: ", languages);
        //console.log("current locale ", currentLocale)
        //console.log("currentIndex locale ", currentIndex)

        setlanguageList(languages);
    }, [])

    return (
        <Select
            searchable={false}
            key={renderKey}
            multi={false}
            values={[]}
            placeholder={getPlaceholder()}
            itemRenderer={customItemRenderer}
            valueField="name"
            labelField="name"
            options={languages}
            onChange={(values) => changedAccountSelection(values)}
        />
    )

    function customItemRenderer({ item, itemIndex, props, state, methods }) {
        return (
            <div className="padding-ten country--select" onClick={() => methods.addItem(item)}>
                <div className="align--row--normal">
                    <FlagIcon code={item.flag} size={30} />{" "}
                    <div className="padding--left--ten">
                        {item.name}
                    </div>
                </div>
            </div>
        );
    }

    function changedAccountSelection(v) {
        //console.log("change language ", v);
        ipcRenderer.send("change-locale", v[0].language);
        setCurrentLanguage(v);
    }

    function getPlaceholder() {
        let index = 0;
        if (currentIndex !== -1) {
            index = currentIndex;
        } else {
            index = languages.findIndex(item => item.language === 'en')
        }
        return languages[index].name;
    }

    function findMatch(item) {
        const isLargeNumber = (element) => element === item;
    }
}