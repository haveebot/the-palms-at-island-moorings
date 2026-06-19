import type { MetadataRoute } from "next";

/*
 * PRE-SALES: disallow all crawling until public launch. This is an unlaunched
 * placeholder shell. At launch, flip to `allow: "/"` and remove the layout
 * `robots: { index:false }` override.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
