export default function sitemap() {
  return [
    {
      url: "https://helixmaps.vercel.app",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "https://helixmaps.vercel.app/sign-in",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://helixmaps.vercel.app/sign-up",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
