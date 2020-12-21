import React, { useState, useEffect } from "react";

const SelectionButton = (props) => {
    const [item] = useState(props.item);
    const [labelTheme, setLabelTheme] = useState(props.unSelectedStyle);
    const [isSelected, setIsSelected] = useState(props.changeSelection);
    const [selectedStyle] = useState(props.selectedStyle);
    const [unSelectedStyle] = useState(props.unSelectedStyle);
    //const [changeSelection, setChangeSelection] = useState(props.changeSelection);
    const [disabled, setDisabled] = useState(false);
    const [canBeDisabled] = useState(props.canBedisabled);
    useEffect(() => {
        isSelected ? setLabelTheme(selectedStyle) : setLabelTheme(unSelectedStyle);
    }, [isSelected]);
    useEffect(() => {
        setIsSelected(props.changeSelection);
    }, [props.changeSelection]);

    function handleOnClick(item) {
        setIsSelected(!isSelected);

        if (canBeDisabled)
            setDisabled(true);
        if (props.handleClick) props.handleClick(item);
    }

    return (
        <div key={item}>
            <button
                disabled={disabled}
                key={isSelected}
                onClick={(e) => {
                    e.preventDefault();
                    handleOnClick(item);
                }}
                className={`"selectable--btn" ${labelTheme}`}>
                <div>{item.name}</div>
            </button>
        </div>

    )
}
export default SelectionButton;