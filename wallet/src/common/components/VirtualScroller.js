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

import React, { useState, useEffect, useRef, useCallback } from "react";
import TransactionLong from "./TransactionLong";
import "./VirtualScroller.css";

const SCROLL_UP = "UP";
const SCROLL_DOWN = "DOWN";

function VirtualScroller({ settings, get, dataLoaded, loadedData }) {

    const [viewportHeight, setViewportHeight] = useState(0);
    const [topPaddingHeight, setTopPaddingHeight] = useState(null);
    const [bottomPaddingHeight, setBottomPaddingHeight] = useState(null);
    const [initialPosition, setInitialPosition] = useState(null);
    const [toleranceHeight, setToleranceheight] = useState(settings.tolerance * settings.itemHeight);
    const [totalHeight, setTotalHeight] = useState((settings.maxIndex - settings.minIndex + 1) * settings.itemHeight);
    const [bufferedItems, setBufferedItems] = useState(settings.amount + 2 * settings.tolerance);
    const [startIndex, setStartIndex] = useState(settings.startIndex);
    const [scrollDirection, setScrollDirection] = useState();
    const [data, setData] = useState([]);
    const [triggerCount, setTriggerCount] = useState(settings.tolerance - settings.amount);
    const [previousTrigger, setPreviousTrigger] = useState();
    const [endCall, setEndCall] = useState(null);
    const [startCall, setStartCall] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const viewportElement = useRef(null);
    const [y, setY] = useState();
    const [page, setPage] = useState(1);
    const pageRef = useRef(page);
    useEffect(() => {
        console.log("viewportHeight ", viewportHeight)
        // 1) height of the visible part of the viewport (px)
        setViewportHeight(settings.amount * settings.itemHeight);
        // 2) total height of rendered and virtualized items (px)
        //setTotalHeight((settings.maxIndex - settings.minIndex + 1) * settings.itemHeight);
        // 3) single viewport outlet height, filled with rendered but invisible rows (px)
        //setToleranceheight(settings.tolerance * settings.itemHeight);
        // 4) all rendered rows height, visible part + invisible outlets (px)
        const bufferHeight = viewportHeight + 2 * toleranceHeight;
        // 5) number of items to be rendered, buffered dataset length (pcs)
        // setBufferedItems(settings.amount + 2 * settings.tolerance);
        // 6) how many items will be virtualized above (pcs)
        const itemsAbove = settings.startIndex - settings.tolerance - settings.minIndex;
        // 7) initial height of the top padding element (px)
        setTopPaddingHeight(itemsAbove * settings.itemHeight);
        // 8) initial height of the bottom padding element (px)
        setBottomPaddingHeight(totalHeight - topPaddingHeight);
        // 9) initial scroll position (px)
        setInitialPosition(topPaddingHeight + toleranceHeight);
        setReady(true);
        loadMore(0, settings.startIndex);
    }, []);

    useEffect(() => {
        //setInitialPosition(topPaddingHeight + toleranceHeight);
    }, [topPaddingHeight]);

    useEffect(() => {
        if (viewportElement.current)
            viewportElement.current.scrollTop = initialPosition;
        if (!initialPosition) {
            runScroller({ target: { scrollTop: 0 } })
        }
    }, [initialPosition]);

    useEffect(() => {
        console.log("bufferedItems ", bufferedItems)
    }, [bufferedItems]);

    return (
        <div >
            <div className='infinite--scroll--viewport'
                style={{ height: parseInt(viewportHeight) }}
                onScroll={runScroller}
                onWheel={event => {
                    if (event.nativeEvent.wheelDelta > 0) {
                        //console.log('scroll up');
                        if (scrollDirection !== SCROLL_UP)
                            setScrollDirection(SCROLL_UP);
                    } else {
                        //console.log('scroll down');
                        if (scrollDirection !== SCROLL_DOWN)
                            setScrollDirection(SCROLL_DOWN);
                    }
                }}
                ref={viewportElement}>
                <div style={{
                    height: topPaddingHeight
                }}><div /></div>
                {data ? data.map((item, i) => {
                    return <div key={i}
                        style={{
                            position: "absolute",
                            width: "100%",
                            top: getPosition(i)
                        }}><TransactionLong data={item} index={i} style="" /></div>
                }) : null}
                <div style={{ height: parseInt(bottomPaddingHeight) }}></div>
            </div>
        </div>
    )

    function getPosition(i) {
        return (i * settings.itemHeight) + topPaddingHeight;
    }
    async function runScroller({ target: { scrollTop } }) {
        console.log("scrollTop:", scrollTop);
        //console.log("trigger to load more ", scrollTop >= (20 * page) * settings.itemHeight);
        //if (!bufferedItems)
        console.log("Total height - 14: ", topPaddingHeight + (data.length * 40) - (14 * 40));
        console.log("trigger down stahp : ", (triggerCount * pageRef.current) * settings.itemHeight);
        //console.log("trigger up: ", previousTrigger - (5 * settings.itemHeight));
        //return;
        if (ready) {
            console.log("scrollDirection ", scrollDirection)
            switch (scrollDirection) {
                case SCROLL_UP:
                    if (scrollTop <= previousTrigger - (5 * settings.itemHeight)) {
                        console.log("load up items, ", previousTrigger);
                        console.log("start ", (pageRef.current - 1) * settings.maxIndex)

                        const start = (pageRef.current - 1) * settings.maxIndex;
                        // setPreviousTrigger((triggerCount * page) * settings.itemHeight);
                        /*setPage(page - 1);
                        setStartIndex(start);
                        setReady(false);
                        setIsLoading(true);
                        loadMore(scrollTop, start, scrollDirection);
*/
                    }
                    break;
                case SCROLL_DOWN:
                    if(scrollTop >= topPaddingHeight + (data.length * 40) - (14 * 40)) {
                    //if (scrollTop >= (triggerCount * pageRef.current) * settings.itemHeight) {
                        console.log("loadMore: ");
                        console.log("page ", pageRef.current);
                        console.log("load height ", (triggerCount * page) * settings.itemHeight);
                        console.log("scrollTop ", scrollTop);
                        const start = page === 1 ? page * settings.maxIndex : (page + 1) * settings.maxIndex;
                        console.log("start index: ", start);
                        setPreviousTrigger((triggerCount * (page + 1)) * settings.itemHeight);
                        setPage(page + 1);
                        setStartIndex(start);
                        setReady(false);
                        setIsLoading(true);
                        loadMore(scrollTop, start, scrollDirection);
                    }
                    break;
            }
        }
        // setY(scrollTop);

    }

    async function loadMore(scrollTop, start, scrollDirection = null) {

        console.log("passed ready blocker ", start)
        var itemHeight = settings.itemHeight;
        var minIndex = settings.minIndex;
        const index = minIndex + Math.floor((scrollTop - toleranceHeight) / itemHeight)
        // 
        var startDate = new Date();
        const getTrans = await get(start);
        var endDate = new Date();
        var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
        console.log("It took ", seconds + " to return the data.");
        switch (scrollDirection) {
            case SCROLL_UP:
                var newArr = [...data];
                var amount = newArr.length - 20;
                newArr.splice(newArr.length - amount, newArr.length);
                console.log("spliced array: ", newArr);
                newArr.unshift(...[].concat(getTrans));
                console.log("unshift : ", newArr);
                console.log("page: ", page)
                console.log("TOP PADDING: ", Math.max((page * 20) * itemHeight));

                setTopPaddingHeight(topPaddingHeight - (data.length * itemHeight));


                break;
            case SCROLL_DOWN:
                var newArr = [...data];
                var amount = newArr.length - 20;
                newArr.splice(0, amount);
                console.log("spliced array: ", newArr);
                newArr.push(...[].concat(getTrans))
                console.log("pushedArray : ", newArr);
                console.log("page: ", pageRef.current);
                console.log("TOP PADDING : ", Math.max((page * 20) * itemHeight));
                setTopPaddingHeight(Math.max((page * 20) * itemHeight));
                setTriggerCount(triggerCount + settings.tolerance);
                setData(newArr);
                break;
            default:
                setTopPaddingHeight(0);
                setData(getTrans);
                break;
        }

        setBottomPaddingHeight(Math.max(totalHeight - topPaddingHeight - getTrans.length * itemHeight, 0));
        setIsLoading(false);
        setReady(true);
        console.log("bottomPaddingHeight ", Math.max(totalHeight - topPaddingHeight - getTrans.length * itemHeight, 0));
    }
}
export default VirtualScroller;