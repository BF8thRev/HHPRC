import { createRequestHandler } from "react-router";

import { syncSignups } from "../app/lib/gmail-sync";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    return requestHandler(request, { cloudflare: { env, ctx } });
  },

  // Cron Triggers fire in UTC. Jobs added in later phases must convert to
  // America/New_York themselves and handle daylight saving (schedule both
  // UTC offsets and check the local hour before doing work).
  async scheduled(controller, env, ctx) {
    console.log(
      `cron ${controller.cron} fired at ${new Date(controller.scheduledTime).toISOString()}`,
    );
    // Retry any sign-ups that didn't reach the Google Sheet.
    ctx.waitUntil(syncSignups(env));
  },
} satisfies ExportedHandler<Env>;
