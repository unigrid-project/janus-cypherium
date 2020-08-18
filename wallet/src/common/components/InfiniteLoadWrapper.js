import React from "react";
import { FixedSizeList } from "react-window";
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
    width
}) {
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

    return (

        <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
        >
            {({ onItemsRendered, ref }) => (
                <FixedSizeList
                    itemCount={itemCount}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    overscanCount={30}
                    height={height}
                    width={width}
                    itemSize={40}
                >
                    {Item}
                </FixedSizeList>
            )}
        </InfiniteLoader>
    )
}

export default InfiniteLoadWrapper;