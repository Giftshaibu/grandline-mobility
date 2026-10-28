import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Scripts,
  Outlet,
  createRootRouteWithContext,
  Link,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AuthProvider } from "../components/auth";
import { Shell } from "../components/shell";
import appCss from "../styles.css?url";
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Grandline Mobility | grandlineauto" },
        {
          name: "description",
          content:
            "Discover vehicle hire, commercial transport and logistics in Malawi.",
        },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
    }),
    shellComponent: ({ children }: { children: ReactNode }) => (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <AuthProvider>{children}</AuthProvider>
          <Scripts />
        </body>
      </html>
    ),
    component: Root,
    notFoundComponent: () => (
      <section className="wrap section">
        <h1>Page not found</h1>
        <p>This address is unavailable.</p>
        <Link to="/">Go home</Link>
      </section>
    ),
    errorComponent: ({ reset }) => (
      <section className="wrap section" role="alert">
        <h1>This page couldn’t load</h1>
        <p>Please try again.</p>
        <button className="button" onClick={reset}>
          Try again
        </button>
        <a href="/">Go home</a>
      </section>
    ),
  },
);
function Root() {
  useEffect(() => {
    document.documentElement.dataset["appReady"] = "true";
    return () => { delete document.documentElement.dataset["appReady"]; };
  }, []);
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Shell>
        <Outlet />
      </Shell>
    </QueryClientProvider>
  );
}
