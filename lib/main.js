const Deployer  = require("./deployer");

module.exports = function (args) {
    if (!args.accessKey || !args.secretKey || !args.zone || !args.scope || !args.dirsToRefresh) {
        console.log(`You should configure deployment settings in _config.yml first!\n\n
        Example:\n
          deploy:\n
            type: qiniu\n
            accessKey: <accessKey>\n
            secretKey: <secretKey>\n
            zone: <zone>\n
            scope: <scope>\n
            expires: [expires]\n
            cover: [true|false]\n
            refreshCdn: [true|false]\n
        For more help, you can check the docs: ' http://hexo.io/docs/deployment.html'`);
        return;
    }
    const publicDir = this.public_dir;
    const deployer = new Deployer({
        accessKey: args.accessKey,
        secretKey: args.secretKey,
        dirsToRefresh: args.dirsToRefresh.split(","),
        tokenOptions: {
            scope: args.scope,
            expires: args.expires
        },
        configOptions: {
            zone: args.zone
        },
        cover: args.cover ? args.cover : true,
        refreshCdn: args.refreshCdn ? args.refreshCdn : true
    });
    return deployer.deploy(publicDir);
};
