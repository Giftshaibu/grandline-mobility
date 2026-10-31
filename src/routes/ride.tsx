import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { RideJourney } from "../components/ride-journey";
const search = z.object({
  type: z.enum(["bike", "taxi"]).catch("bike"),
  request: z.string().uuid().optional().catch(undefined),
});
export const Route = createFileRoute("/ride")({
  validateSearch: (input) => search.parse(input),
  head: () => ({
    meta: [
      { title: "Request a bike or taxi | Grandline Mobility" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Journey,
});
function Journey() {
  const values = Route.useSearch(),
    navigate = Route.useNavigate();
  return (
    <RideJourney
      key={`${values.type}:${values.request ?? "new"}`}
      kind={values.type}
      requestId={values.request}
      select={(request, type) => {
        void navigate({ search: { type, ...(request ? { request } : {}) } });
      }}
    />
  );
}
