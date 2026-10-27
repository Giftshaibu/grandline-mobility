for (const name of ["VITE_HUB_URL", "VITE_SERVICES_URL", "VITE_MOBILITY_URL", "VITE_API_BASE_URL"]) {
 const value=process.env[name]?.trim(); if (!value) continue;
 let url; try { url=new URL(value); } catch { throw new Error(`${name} must be an absolute HTTP(S) URL`); }
 if (!["https:","http:"].includes(url.protocol) || url.username || url.password) throw new Error(`${name} must be a public HTTP(S) URL without credentials`);
}
if (Boolean(process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim()) !== Boolean(process.env.CLERK_SECRET_KEY?.trim())) throw new Error("Configure both Clerk keys or leave both empty for public browsing");
