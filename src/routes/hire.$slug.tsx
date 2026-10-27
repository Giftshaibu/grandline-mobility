import { createFileRoute } from "@tanstack/react-router";
import { MobilityDetail } from "../components/mobility-detail";
export const Route = createFileRoute("/hire/$slug")({ component: Detail });
function Detail() {
  const { slug } = Route.useParams();
  return <MobilityDetail kind="hire" slug={slug} />;
}
