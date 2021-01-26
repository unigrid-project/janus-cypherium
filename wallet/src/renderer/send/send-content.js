import React, { useState, useEffect } from "react";
import AccountSelection from "../../common/accounts/AccountSelection";
import { ipcRenderer } from "electron";
import CreateAccountButton from "../../common/components/CreateAccountButton";
import Config from "../../common/config";
import Content from "../content";
import Send from "../../common/components/Send";
import './send-content.css';
import WarningMessage from "../../common/components/WarningMessage";

export default function SendContent() {
    const [currentSelectedAccount, setCurrentSelectedAccount] = useState(Config.getCurrentAccount());
    const [renderListKey, setRenderListKey] = useState(Math.random());
    const [walletList, setWalletList] = useState(Config.getAccount());
    const [balance, setBalance] = useState(0);
    const [warningMessage, setWarningMessage] = useState("");

    useEffect(() => {
        ipcRenderer.on("update-active-account", (event, account) => {
            setCurrentSelectedAccount(account);
        });
        ipcRenderer.on("accounts-updated", (event, message) => {
            const accounts = Config.getAccount();
            setWalletList(accounts);
            setRenderListKey(Math.random());
        });
        ipcRenderer.on("account-balance-updated", (event, balance) => {
            setBalance(balance.toString());
        })
        ipcRenderer.on("on-send-warning", (event, msg) => {
            //console.log("msg: ", msg)
            setWarningMessage(msg);
        })
    }, [])
    return (
        <Content id="send">
            <div>
                <div className="fontSmallBold darkCopy dropdown--selection padding-ten align--row--stretch ">
                    <div className="width--ninty" key={renderListKey}>
                        <AccountSelection
                            key={currentSelectedAccount}
                            current={currentSelectedAccount}
                            list={walletList}
                        />
                    </div>
                    <CreateAccountButton key="create" className="button" />
                </div>
                <div className="align--row--normal padding-ten ">
                    <div className="fontRegularBold darkCopy">
                      {balance} {Config.getProjectTicker()}
                    </div>
                    {warningMessage !== "" ? renderWarning() : <div className="empty--div" >&nbsp;</div>}
                </div>
                <div>
                    <Send />
                </div>
            </div>

        </Content>
    )

    function renderWarning() {
        return (
            <WarningMessage
                message={warningMessage}
                onAnimationComplete={onAnimationComplete}
                startAnimation="error--text-start error--text--animation" />
        )
    }
    function onAnimationComplete() {
        setWarningMessage("");
    }
}