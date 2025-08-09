const CHUNK_PUBLIC_PATH = "server/app/api/trpc/[trpc]/route.js";
const runtime = require("../../../../chunks/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/node_modules_next_dist_3b11b81d._.js");
runtime.loadChunk("server/chunks/node_modules_@trpc_server_dist_98f298a8._.js");
runtime.loadChunk("server/chunks/node_modules_zod_a4461a57._.js");
runtime.loadChunk("server/chunks/[root-of-the-server]__4e99ca22._.js");
runtime.getOrInstantiateRuntimeModule("[project]/.next-internal/server/app/api/trpc/[trpc]/route/actions.js [app-rsc] (server actions loader, ecmascript)", CHUNK_PUBLIC_PATH);
runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/app-route.js { INNER_APP_ROUTE => \"[project]/app/api/trpc/[trpc]/route.ts [app-route] (ecmascript)\" } [app-route] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/app-route.js { INNER_APP_ROUTE => \"[project]/app/api/trpc/[trpc]/route.ts [app-route] (ecmascript)\" } [app-route] (ecmascript)", CHUNK_PUBLIC_PATH).exports;
