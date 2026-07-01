/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.ramenhire.com",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
    ],
    additionalSitemaps: [
      "https://www.ramenhire.com/sitemap.xml",
    ],
  },
  changefreq: "weekly",
  priority: 0.7,
  additionalPaths: async () => [
    {
      loc: "/",
      priority: 1.0,
      changefreq: "daily",
      lastmod: new Date().toISOString(),
    },
  ],
};
