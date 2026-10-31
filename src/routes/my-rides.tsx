import { createFileRoute } from "@tanstack/react-router";
import { MyRides } from "../components/my-rides";
export const Route = createFileRoute("/my-rides")({
  head: () => ({
    meta: [
      { title: "My ride requests | Grandline Mobility" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MyRides,
});
