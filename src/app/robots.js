export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/dashboard",
    },
    sitemap: "https://helixmaps.vercel.app/sitemap.xml",
  };
}
