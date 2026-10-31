import { createFileRoute } from "@tanstack/react-router";
import { StaffRides } from "../components/staff-rides";
export const Route = createFileRoute("/staff-rides")({
  head: () => ({
    meta: [
      { title: "Ride operations | Grandline Mobility" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StaffRides,
});
