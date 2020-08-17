/*
 * This file is part of The UNIGRID Wallet
 * Copyright (C) 2019 The UNIGRID Organization
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

import React, { useState } from "react";
import "./CreateMasternode.css"
import EnterField from "./EnterField";
import { faClipboard, faChevronCircleRight, faChevronCircleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Expand from "react-expand-animated";
import { remote } from "electron";
import { masternodeSetupScript, masternodeFile } from "../consts";
import Button from "./Button";
import RPCClient from "../rpc-client.js";

function CreateMasternode({ copyScript, isVisible, closeMasternodeSetup }) {
    return (
        <Expand open={isVisible}>
            <div className="createMasternodeContainer">
                <h1>Setup a new masternode:</h1>
                <div>To setup a new masternode follow these steps below.</div>
                <ul>
                    <li>Create a new address and send exactly 3000 UGD.</li>
                    <li>Copy txid from the 3000 sent.</li>
                    <li>Run the below script on your vps machine. When Promted paste the txid to setup the configuration.</li>
                </ul>
                <div className="masternode--item">
                    <div className="clipboard">
                        <FontAwesomeIcon size="sm" icon={faClipboard} color="white" onClick={() => copyScript(masternodeSetupScript)} />
                    </div>
                    <div onClick={() => getAddressUnspent(data[0])}>
                        Copy script</div>
                </div>
                <ul>
                    <li>Once completed this will give you the information to paste into masternode.conf file.</li>
                    <div className="masternode--button--padding">
                        <Button
                            handleClick={() => openConfFile(masternodeFile)}
                            buttonSize="btn--tiny"
                            buttonStyle="btn--success--solid">masternode.conf</Button>
                    </div>

                    <li>Once the masternode.conf file is updated and saved you must restart the wallet.</li>
                    <li>After you restart, return to this screen and either start the single masternode or if you have more click on START ALL.</li>
                </ul>
                <div className="close-btn">
                    <Button
                        handleClick={() => closeMasternodeSetup()}
                        buttonSize="btn--tiny"
                        buttonStyle="btn--warning--solid">Close</Button>
                </div>
            </div>
        </Expand>
    )

    async function openConfFile(file) {
        var rpcClient = new RPCClient();
        console.log(file)
        let open = "/".concat(file);
        Promise.all([
            rpcClient.getdatadirectory(),
            new Promise(resolve => setTimeout(resolve, 500))
        ]).then((response) => {
            console.log("local directory: ", response[0], " ", SHITPICKLE);
            let loc = response[0].directory;
            remote.shell.openPath(loc.concat(open));
        }, (stderr) => {
            console.error(stderr);
        });
    }
}
export default CreateMasternode;