import { Autocomplete, Flex, Select } from "@mantine/core";
import { memo } from "react";

export enum SortMode {
  Relevance = 0,
  Newest = 1,
  Oldest = -1,
}

export type SearchBoxProps = {
  query: string;
  onQueryChanged?: (query: string) => void;
  channelId: string;
  onChannelIdChanged?: (channelId: string) => void;
  sort: SortMode;
  onSortChanged?: (sort: SortMode) => void;
};
export const SearchBox = memo(function SearchBox({
  query,
  onQueryChanged,
  channelId,
  onChannelIdChanged,
  sort,
  onSortChanged,
}: SearchBoxProps) {
  return (
    <>
      <Flex gap="xs">
        <Autocomplete
          className="flex-grow"
          value={query}
          onChange={onQueryChanged}
          placeholder="Type here ..."
          data={[]}
        />
        <Autocomplete
          value={channelId}
          onChange={onChannelIdChanged}
          placeholder="ChannelID"
          data={[]}
        />
        <Select
          value={SortMode[sort]}
          onChange={(x) =>
            onSortChanged &&
            onSortChanged(
              x
                ? (SortMode[x as unknown as SortMode] as unknown as SortMode)
                : SortMode.Relevance
            )
          }
          data={Object.values(SortMode)
            .filter((x) => typeof x === "string")
            .map((x) => x.toString())}
        ></Select>
      </Flex>
    </>
  );
});
