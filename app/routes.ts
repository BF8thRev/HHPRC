import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("hours", "routes/hours.tsx"),
  route("events", "routes/events.tsx"),
  route("dues", "routes/dues.tsx"),
  route("rules", "routes/rules.tsx"),
  route("about", "routes/about.tsx"),
  route("login", "routes/login.tsx"),
  route("healthz", "routes/healthz.ts"),
  route("meeting.ics", "routes/meeting-ics.ts"),
] satisfies RouteConfig;
