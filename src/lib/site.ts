/**
 * Centralized site config — NO hardcoded brand strings anywhere else.
 *
 * Domain split (Winston, 2026-06-19):
 *   - publicDomain → user-facing pre-sales marketing site
 *   - opsDomain    → email addresses, hub login, auth
 *
 * Contact + social are PLACEHOLDERS pending Collie / the developer. Marked TODO.
 */
export const SITE = {
  name: "The Palms at Island Moorings",
  shortName: "The Palms",
  tagline: "The last homesites in Island Moorings — Port Aransas' original marina community.",
  location: "Island Moorings · Port Aransas, Texas",

  publicDomain: "thepalmsatislandmoorings.com",
  opsDomain: "thepalms.dev",
  url: "https://thepalmsatislandmoorings.com",

  // TODO(confirm): inbound interest address on the ops domain.
  contactEmail: "info@thepalms.dev",
} as const;

export type SiteConfig = typeof SITE;
