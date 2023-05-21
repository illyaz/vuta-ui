import {
  Badge,
  Container,
  Flex,
  Loader,
  MantineProvider,
  Overlay,
  Pagination,
  Paper,
  Space,
} from "@mantine/core";
import { SearchBox, SortMode } from "./components/SearchBox";
import { useEffect, useRef, useState } from "react";
import {
  Convert,
  SearchResult as SearchResultModel,
} from "./models/SearchResult";
import SearchResult from "./components/SearchResult";
import { useSearchParams } from "react-router-dom";
const baseApiUrl = import.meta.env.VITE_VUTA_API;

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [channelId, setChannelId] = useState(searchParams.get("c") ?? "");
  const [sort, setSort] = useState(
    (SortMode[
      SortMode[Number(searchParams.get("s"))] as never
    ] as never as SortMode) ?? SortMode.Relevance
  );
  const [page, setPage] = useState(() => {
    const p = Math.min(200, Math.max(1, Number(searchParams.get("p") ?? "")));
    return isNaN(p) || !isFinite(p) ? 1 : p;
  });
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [debouncedChannelId, setDebouncedChannelId] = useState(channelId);
  const [data, setData] = useState<SearchResultModel>();
  const [searching, setSearching] = useState(false);
  const paginationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setDebouncedChannelId(channelId);
      setPage(1);
    }, 700);

    return () => clearTimeout(handler);
  }, [query, channelId]);
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setDebouncedQuery(searchParams.get("q") ?? "");
    setChannelId(searchParams.get("c") ?? "");
    setDebouncedChannelId(searchParams.get("c") ?? "");

    if (searchParams.has("p")) {
      const p = Math.min(200, Math.max(1, Number(searchParams.get("p") ?? "")));
      setPage(isNaN(p) || !isFinite(p) ? 1 : p);
    } else setPage(1);

    if (searchParams.has("s"))
      setSort(
        (SortMode[
          SortMode[Number(searchParams.get("s"))] as never
        ] as never as SortMode) ?? SortMode.Relevance
      );
    else setSort(SortMode.Relevance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.set("query", debouncedQuery);
        if (debouncedChannelId) params.set("channelId", debouncedChannelId);
        params.set("page", (page - 1).toString());
        params.set("sort", sort.toString());
        params.set("isUta", "true");
        const result = await fetch(`${baseApiUrl}/search/comments?${params}`)
          .then((r) => r.text())
          .then(Convert.toSearchResult);

        const prevParams = [...searchParams.entries()].reduce(
          (o, [key, value]) => ({ ...o, [key]: value }),
          {} as { [x: string]: string }
        );
        const nextParams: { [x: string]: string } = {};
        if (debouncedQuery) nextParams["q"] = debouncedQuery;
        if (debouncedChannelId) nextParams["c"] = debouncedChannelId;
        if (page > 1) nextParams["p"] = page.toString();
        if (sort !== SortMode.Relevance) nextParams["s"] = sort.toString();
        if (
          prevParams["q"] != nextParams["q"] ||
          prevParams["c"] != nextParams["c"] ||
          prevParams["p"] != nextParams["p"] ||
          prevParams["s"] != nextParams["s"]
        )
          setSearchParams(nextParams);

        setData(result);
      } finally {
        setSearching(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, debouncedChannelId, page, sort]);

  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Space h="xl" />
      <Container>
        <div ref={paginationRef}>
          <SearchBox
            query={query}
            onQueryChanged={setQuery}
            channelId={channelId}
            onChannelIdChanged={(id) => {
              setChannelId(id);
              setPage(1);
            }}
            sort={sort}
            onSortChanged={(id) => {
              console.log("setSort", id);
              setSort(id);
              setPage(1);
            }}
          />
          <Space h="xs" />
          <Flex justify="center" gap="xs">
            {data && !searching ? (
              <>
                <Badge>Total: {data.total}</Badge>
                <Badge>{(data.took / 100)?.toFixed(2)} sec</Badge>
                <Badge>Page: {page}</Badge>
              </>
            ) : (
              <Loader style={{ margin: "0.35rem" }} variant="dots" />
            )}
          </Flex>
        </div>
        <Paper
          className="sticky top-0 shadow-sm"
          radius={0}
          style={{ zIndex: 201 }}
        >
          <Space h="xs" />
          <Flex justify="center">
            <Pagination
              total={(data?.total ?? 0) / 50}
              value={page}
              onChange={(p) => {
                setPage(p);

                const bottom =
                  paginationRef.current?.getBoundingClientRect()?.bottom;
                if (bottom) {
                  const top = bottom + window.scrollY;
                  if (window.scrollY > top) window.scrollTo({ top });
                }
              }}
            />
          </Flex>
          <Space h="xs" />
        </Paper>
        <div>
          {searching && <Overlay blur={2} />}
          <SearchResult data={data} />
        </div>
      </Container>
    </MantineProvider>
  );
}