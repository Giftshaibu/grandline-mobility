import { useInfiniteQuery } from "@tanstack/react-query";
import { directory, type Kind } from "../lib/directory";
import { normalizeSearch, type DirectorySearch } from "../lib/contracts";
import { paths } from "../lib/categories";
import { Availability } from "./availability";
import { MarketplaceHero } from "./marketplace-hero";
import { MobilityCard } from "./mobility-card";
export function MobilityBrowser({
  kind,
  search,
  onSearch,
}: {
  kind: Kind;
  search: DirectorySearch;
  onSearch: (search: DirectorySearch) => void;
}) {
  const path = paths[kind];
  const query = useInfiniteQuery({
    enabled: directory.supported,
    ...(!directory.supported
      ? {
          initialData: {
            pages: [
              { state: "unavailable" } as Awaited<
                ReturnType<typeof directory.list>
              >,
            ],
            pageParams: [undefined],
          },
        }
      : {}),
    queryKey: ["mobility", kind, search],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      directory.list(search, kind, signal, pageParam),
    getNextPageParam: (page) =>
      page.state === "ready" ? (page.data.nextCursor ?? undefined) : undefined,
    retry: false,
  });
  const result = query.data?.pages.at(-1);
  const entries =
    query.data?.pages.flatMap((page) =>
      page.state === "ready" ? page.data.items : [],
    ) ?? [];
  return (
    <>
      <div className="browse-hero">
        <MarketplaceHero
          image={kind === "hire" ? "road" : "truck"}
          title={path.title}
          description={path.description}
        />
      </div>
      <section className="wrap section">
        <form
          key={JSON.stringify(search)}
          className="search-panel"
          aria-label={`Search ${path.title.toLowerCase()}`}
          onSubmit={(event) => {
            event.preventDefault();
            onSearch(
              normalizeSearch(
                Object.fromEntries(new FormData(event.currentTarget)),
              ),
            );
          }}
        >
          <label>
            {kind === "logistics" ? "Transport service" : "Vehicle or provider"}
            <input
              name="q"
              defaultValue={search.q}
              maxLength={120}
              placeholder={
                kind === "logistics" ? "e.g. goods transport" : "e.g. van"
              }
            />
          </label>
          <label>
            {kind === "logistics" ? "Service area" : "Location"}
            <input
              name="location"
              defaultValue={search.location}
              maxLength={120}
              placeholder="Town or district"
            />
          </label>
          <label>
            {kind === "logistics" ? "Service type" : "Vehicle category"}
            <select name="category" defaultValue={search.category || ""}>
              <option value="">All categories</option>
              {path.categories.map(([slug, label]) => (
                <option key={slug} value={slug}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button className="button" type="submit">
            {kind === "logistics" ? "Find transport" : "Explore vehicles"}
          </button>
        </form>
        <p className="criteria">
          {Object.values(search).filter(Boolean).join(" · ") ||
            "All categories"}{" "}
          · <a href={`/${kind}`}>Clear search</a>
        </p>
        <Availability
          result={
            query.isError ? { state: "error", reason: "network" } : result
          }
          pending={query.isPending}
          retry={() => {
            void query.refetch();
          }}
        />
        {result?.state === "ready" &&
          (entries.length ? (
            <>
              <div className="cards">
                {entries.map((entry) => (
                  <MobilityCard key={entry.id} entry={entry} />
                ))}
              </div>
              {query.hasNextPage && (
                <button
                  className="button secondary"
                  disabled={query.isFetchingNextPage}
                  onClick={() => {
                    void query.fetchNextPage();
                  }}
                >
                  Load more
                </button>
              )}
            </>
          ) : (
            <div className="availability">
              <h2>No matches for this search.</h2>
              <p>Try another category or location.</p>
            </div>
          ))}
      </section>
    </>
  );
}
