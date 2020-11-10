import React, { useRef, useEffect } from "react";
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from "react-window-infinite-loader";
import TransactionLoading from "./TransactionLoading";
import "./InfiniteLoadWrapper.css";
import TransactionLong from "./TransactionLong";

function InfiniteLoadWrapper({
    hasNextPage,
    isNextPageLoading,
    items,
    loadNextPage,
    height,
    width,
    scrollTo
}) {

    const listRef = useRef(null);
    // If there are more items to be loaded then add an extra row to hold a loading indicator.
    const itemCount = hasNextPage ? items.length + 1 : items.length;

    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const loadMoreItems = isNextPageLoading ? () => { } : loadNextPage;

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = index => !hasNextPage || index < items.length;

    // Render an item or a loading indicator.
    const Item = ({ index, style }) => {
        let content;
        if (!isItemLoaded(index)) {
            content = <TransactionLoading style="trans--long" />
        } else {
            content = <TransactionLong data={items[index]} index={index} style={style} />;
        }
        return <div style={style}>{content}</div>;
    };
    useEffect(() => {
        if (listRef.current !== null) {
            listRef.current.scrollToItem(scrollTo);
        }
        console.log("should be scrolling to :", scrollTo)
    }, [scrollTo]);

    return (

        <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}

        >

            {({ onItemsRendered }) => (
                <div>
                    <List
                        itemCount={itemCount}
                        onItemsRendered={onItemsRendered}
                        ref={listRef}
                        overscanCount={30}
                        height={height}
                        width={width}
                        itemSize={40}
                        className="infinite--scroller"
                    >
                        {Item}
                    </List>
                </div>
            )}
        </InfiniteLoader>
    )
}

export default InfiniteLoadWrapper;