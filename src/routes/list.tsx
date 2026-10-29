import { createFileRoute } from "@tanstack/react-router";
import { MobilityApplicationFlow } from "../components/mobility-application";
export const Route = createFileRoute("/list")({
  head: () => ({
    meta: [
      { title: "List your transport offering — Grandline Mobility" },
      {
        name: "description",
        content:
          "Prepare a hire, transport, logistics or bike-operator application. Submission is not yet available.",
      },
    ],
  }),
  component: MobilityApplicationFlow,
});
