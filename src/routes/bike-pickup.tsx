import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/bike-pickup")({
  beforeLoad: () => {
    throw redirect({ to: "/ride", search: { type: "bike" }, statusCode: 302 });
  },
});
