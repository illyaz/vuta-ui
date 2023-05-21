import { memo } from "react";
import { Text, Card, Flex, Anchor, Divider } from "@mantine/core";
import { SearchResult as SearchResultModel } from "../models/SearchResult";
import Comment from "./Comment";
import {
  List,
  AutoSizer,
  ListRowProps,
  WindowScroller,
} from "react-virtualized";

type SearchResultProps = {
  data?: SearchResultModel;
};

const SearchResult = memo(function SearchResult({ data }: SearchResultProps) {
  function renderItem({ key, index, style }: ListRowProps) {
    const hit = data?.hits[index];
    return (
      hit && (
        <Card
          key={key}
          style={style}
          shadow="sm"
          padding={0}
          radius="md"
          withBorder
          className="max-h-60"
        >
          <Card.Section>
            <Flex direction="row">
              <div
                className="flex-none bg-white bg-cover bg-center"
                style={{
                  width: "10rem",
                  backgroundImage: `url(//i.ytimg.com/vi/${hit.videoId}/mqdefault.jpg)`,
                }}
              ></div>
              <Flex direction="column" className="overflow-hidden m-2">
                <Anchor
                  href={`https://youtube.com/watch?v=${hit.videoId}`}
                  target="_blank"
                  truncate
                >
                  {hit.videoTitle}
                </Anchor>
                <Anchor
                  href={`https://youtube.com/channel/${hit.channelId}`}
                  target="_blank"
                  truncate
                >
                  {hit.channelTitle}
                </Anchor>
                <Text truncate>
                  {hit.videoPublishDate.toLocaleDateString()}
                </Text>
              </Flex>
            </Flex>
            <Divider />
          </Card.Section>
          <Comment key={hit.id} videoId={hit.videoId} text={hit.highlightedText} />
        </Card>
      )
    );
  }
  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <WindowScroller>
          {({ height, isScrolling, onChildScroll, scrollTop }) => (
            <List
              autoHeight
              width={width}
              height={height}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              rowHeight={246}
              rowCount={data?.hits.length ?? 0}
              rowRenderer={renderItem}
              scrollTop={scrollTop}
              overscanRowCount={1}
            ></List>
          )}
        </WindowScroller>
      )}
    </AutoSizer>
    // <>
    //   {data &&
    //     data.hits.map((x) => (
    //       <div key={x.id} className="mb-2">
    //         <SearchResultItem hit={x} />
    //       </div>
    //     ))}
    // </>
  );
});

export default SearchResult;
