const Deployer  = require("./deployer");

module.exports = function (args) {
    if (!args.accessKey || !args.secretKey || !args.zone || !args.scope || !args.dirsToRefresh) {
        console.log(`You should configure deployment settings in _config.yml first!\n\n
        Example:\n
          deploy:\n
            type: qiniu\n
            accessKey: <accessKey>\n
            secretKey: <secretKey>\n
            zone: <zone> # 华东: Zone_z0, 华北: Zone_z1, 华南: Zone_z2, 北美: Zone_na0, 东南亚: Zone_as0\n
            scope: <scope> # the name of bucket\n
            expires: [expires] # default is 3600\n
            cover: [true|false] # default is true\n
            refreshCdn: [true|false] # default is false\n
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
