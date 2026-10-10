import type { MetadataRoute } from "next";
import { NO_INDEX, SITE_URL } from "@/lib/site";

/**
 * Staging-first: while NO_INDEX is on (vercel.app stage), the entire
 * site is disallowed so Google never indexes staging URLs.
 * Flip NEXT_PUBLIC_NO_INDEX=false + redeploy when the custom domain
 * goes live — then this serves allow + the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  if (NO_INDEX) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
