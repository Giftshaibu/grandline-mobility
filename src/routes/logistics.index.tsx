import { createFileRoute } from "@tanstack/react-router";
import { normalizeSearch } from "../lib/contracts";
import { MobilityBrowser } from "../components/mobility-browser";
export const Route = createFileRoute("/logistics/")({
  validateSearch: normalizeSearch,
  component: Browse,
});
function Browse() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <MobilityBrowser
      kind="logistics"
      search={search}
      onSearch={(search) => {
        void navigate({ search });
      }}
    />
  );
}
