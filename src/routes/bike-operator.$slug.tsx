import { createFileRoute } from "@tanstack/react-router";
import { MobilityDetail } from "../components/mobility-detail";
export const Route = createFileRoute("/bike-operator/$slug")({
  head: ({ params }) =>
    params.slug.startsWith("sample-")
      ? { meta: [{ name: "robots", content: "noindex,nofollow" }] }
      : {},
  component: Detail,
});
function Detail() {
  const { slug } = Route.useParams();
  return <MobilityDetail kind="bike-operator" slug={slug} />;
}
