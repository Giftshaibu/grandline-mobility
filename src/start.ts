import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createStart, createCsrfMiddleware } from "@tanstack/react-start";
const publicKey = process.env["VITE_CLERK_PUBLISHABLE_KEY"]?.trim();
const secretKey = process.env["CLERK_SECRET_KEY"]?.trim();
if (Boolean(publicKey) !== Boolean(secretKey))
  throw new Error(
    "Configure both Clerk keys or leave both empty for public browsing.",
  );
export const startInstance = createStart(() => ({
  requestMiddleware: [
    ...(publicKey && secretKey ? [clerkMiddleware()] : []),
    createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === "serverFn" }),
  ],
}));
