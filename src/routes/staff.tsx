import { createFileRoute } from "@tanstack/react-router";
import { StaffApplications } from "../components/staff-applications";
export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff workspace | Grandline Mobility" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StaffApplications,
});
