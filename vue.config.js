module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  devServer: {
    host: "audiomixer-local.tvunetworks.com",
  },
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "Audio Mix Panel";
      return args;
    });
  },
};
