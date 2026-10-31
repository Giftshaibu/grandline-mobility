import { createFileRoute } from "@tanstack/react-router";
import { BusinessDashboard } from "../components/business-dashboard";
export const Route = createFileRoute("/my-businesses")({
  head: () => ({
    meta: [
      { title: "My businesses | Grandline Mobility" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: BusinessDashboard,
});
