import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("/about", "routes/about.tsx"),
  route("/book-appointment", "routes/book-appointment.tsx"),
  route("/book-cleaning", "routes/book-cleaning.tsx"),
  route("/contact", "routes/contact.tsx"),
] satisfies RouteConfig;
