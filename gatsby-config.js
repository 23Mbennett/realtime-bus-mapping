module.exports = {
  pathPrefix: "/realtime-bus-mapping",
  siteMetadata: {
    title: `Realtime Calgary Transit Bus Locations`,
    description: `Realtime Calgary Transit Bus Locations`,
    author: `@saadiqmohiuddin`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-emotion`
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // 'gatsby-plugin-offline',
  ],
}
