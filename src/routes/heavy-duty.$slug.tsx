import { createFileRoute } from "@tanstack/react-router";
import { MobilityDetail } from "../components/mobility-detail";
export const Route = createFileRoute("/heavy-duty/$slug")({
  component: Detail,
});
function Detail() {
  const { slug } = Route.useParams();
  return <MobilityDetail kind="heavy-duty" slug={slug} />;
}
