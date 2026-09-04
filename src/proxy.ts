import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16 renamed the `middleware` convention to `proxy`; the handler is the same.
export default createMiddleware(routing);

export const config = {
  // match everything except api, next internals, and files with an extension
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
