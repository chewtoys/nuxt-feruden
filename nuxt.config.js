const _ = require("lodash");
require("dotenv").config();
const client = require("./plugins/contentful");
const fs = require("fs");

module.exports = {
  /*
   ** Headers of the page
   */
  head: {
    htmlAttrs: {
      lang: "ko"
    },
    title: "FERuden | 프론트엔드 개발지식 공유 블로그",
    meta: [
      {
        name: "google-site-verification",
        content: "DFN8ft01giCHJhFJnziWud4POhjvFAcc1NkeT7cbBjE"
      },
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content:
          "프론트엔드 개발지식 나눔 블로그 | javascript, vue, react, es6, webpack, jquery"
      },
      {
        hid: "og:image",
        property: "og:image",
        content: "https://blog.feruden.com/main2.png"
      }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href:
          "https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.min.css"
      }
    ]
  },
  css: [
    "swiper/dist/css/swiper.css",
    {
      src: "~/node_modules/normalize.css",
      lang: "css"
    },
    {
      src: "~/node_modules/highlight.js/styles/atom-one-dark.css",
      lang: "css"
    },
    {
      src: "~/styles/main.scss",
      lang: "scss"
    }
  ],
  /*
   ** Customize the progress bar color
   */
  loading: { color: "#3B8070" },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** Run ESLint on save
     */
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)/
        });
      }
    }
  },
  plugins: [
    "~/plugins/contentful",
    { src: "~plugins/ga.js", ssr: false },
    "~/plugins/disqus",
    { src: "~/plugins/vue-progressive-image", ssr: false },
    { src: "~/plugins/vue-infinite-scroll", ssr: false },
    { src: "~/plugins/nuxt-swiper-plugin.js", ssr: false }
  ],
  modules: [
    "@nuxtjs/dotenv",
    "@nuxtjs/markdownit",
    "@nuxtjs/pwa",
    "@nuxtjs/sitemap",
    "@nuxtjs/google-adsense",
    "@nuxtjs/font-awesome",
    ["nuxt-sass-resources-loader", ["~/styles/main.scss"]]
  ],
  markdownit: {
    injected: true,
    use: ["markdown-it-highlightjs"]
  },
  generate: {
    async routes() {
      const { items } = await client.getEntries({ content_type: "blogPost" });
      const tags = _.uniq(_.flattenDeep(items.map(item => item.fields.tags)));
      const blogPosts = items.map(item => ({
        route: `/blog/${item.fields.slug}`,
        payload: item
      }));
      const tagsPosts = tags.map(item => ({
        route: `/tags/${item}`
      }));

      fs.writeFile("./static/postDic.json", JSON.stringify({ items }), err => {
        console.error(err);
      });

      return [...blogPosts, ...tagsPosts];
    }
  },
  manifest: {
    lang: "ko"
  },
  "google-adsense": {
    id: "ca-pub-2137294472379721",
    pageLevelAds: true
  },
  sitemap: {
    path: "/sitemap.xml",
    generate: true,
    hostname: "https://blog.feruden.com",
    gzip: true,
    async routes() {
      const { items } = await client.getEntries({ content_type: "blogPost" });
      const tags = _.uniq(_.flattenDeep(items.map(item => item.fields.tags)));
      const blogPosts = items.map(item => `/blog/${item.fields.slug}`);
      const tagsPosts = tags.map(item => `/tags/${item}`);

      return [...blogPosts, ...tagsPosts];
    }
  }
};
