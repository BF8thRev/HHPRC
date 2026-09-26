import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("hours", "routes/hours.tsx"),
  route("events", "routes/events.tsx"),
  route("dues", "routes/dues.tsx"),
  route("rules", "routes/rules.tsx"),
  route("login", "routes/login.tsx"),
  route("healthz", "routes/healthz.ts"),
] satisfies RouteConfig;
