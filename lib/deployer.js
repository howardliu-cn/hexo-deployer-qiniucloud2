'use strict';

const fs = require('hexo-fs');
const qiniu = require('qiniu');
const pathlib = require("path");

const traversal = function (src, cb) {
    let queue = [];
    let stat = fs.statSync(src);
    if (stat.isFile()) {
        queue.push(cb(src));
    } else if (stat.isDirectory()) {
        for (let path of fs.readdirSync(src)) {
            queue.push(...traversal(pathlib.join(src, path), cb));
        }
    }
    return queue;
};

module.exports = class Deployer {
    constructor(options) {
        this.options = {
            mac: null,
            accessKey: null,
            secretKey: null,
            dirsToRefresh: [],
            tokenOptions: {
                scope: null
            },
            configOptions: {
                zone: null
            },
            cover: false,
            refreshCdn: false
        };
        Object.assign(this.options, options);

        this.options.mac = new qiniu.auth.digest.Mac(options.accessKey, options.secretKey);
        this.options.configOptions.zone = qiniu.zone[options.configOptions.zone];
    }

    createCdnManager(mac) {
        return new qiniu.cdn.CdnManager(mac);
    }

    createUploadToken(mac, putPolicyOptions) {
        return new qiniu.rs.PutPolicy(putPolicyOptions).uploadToken(mac);
    }

    createConfig(configOptions) {
        let config = new qiniu.conf.Config();
        return Object.assign(config, configOptions);
    }

    deploy(publicDir) {
        let that = this;
        return new Promise((resolve, reject) => {
            Promise.all(
                traversal(publicDir, src => {
                    const key = pathlib.win32.relative(publicDir, src).replace(/\\/g, "/");
                    that.upload(src, key).finally(() => {
                        console.log(key);
                    });
                    if (key.endsWith('index.html')) {
                        const noIndex = key.substr(0, key.length - 10);
                        if (noIndex == '') {
                            that.upload(src, '/').finally(() => {
                                console.log('/');
                            });
                        } else {
                            that.upload(src, noIndex).finally(() => {
                                console.log(noIndex);
                            });
                            const noIndex2 = key.substr(0, key.length - 11);
                            that.upload(src, noIndex2).finally(() => {
                                console.log(noIndex2);
                            });
                            const noIndexWithFix = noIndex2 + '.html';
                            that.upload(src, noIndexWithFix).finally(() => {
                                console.log(noIndexWithFix);
                            });
                        }
                    }
                })
            ).then(() => {
                console.log("upload to qiniu finished!");
                if (that.options.refreshCdn) {
                    that.createCdnManager(this.options.mac)
                        .refreshDirs(that.options.dirsToRefresh, (respErr, respBody, respInfo) => {
                            if (respInfo.statusCode === 200) {
                                resolve(respErr, respBody, respInfo);
                            } else {
                                reject(respErr, respBody, respInfo);
                            }
                        });
                }
            }).catch((e) => {
                console.log("upload to qiniu fail!", e);
            });
        }).then((data) => {
            console.log("refresh qiniu finished!", data);
        }).catch((e) => {
            console.log("refresh qiniu fail!", e);
        });
    }

    upload(src, key, tokenOptions, configOptions) {
        let uploadToken = this.createUploadToken(this.options.mac, Object.assign({}, this.options.tokenOptions, tokenOptions, this.options.cover ? { scope: this.options.tokenOptions.scope + ":" + key } : {}));
        let formUploader = new qiniu.form_up.FormUploader(this.createConfig(Object.assign({}, this.options.configOptions, configOptions)));
        let putExtra = new qiniu.form_up.PutExtra();
        return new Promise((resolve, reject) => {
            formUploader.putFile(uploadToken, key, src, putExtra, (respErr, respBody, respInfo) => {
                if (respInfo.statusCode === 200) {
                    resolve(respErr, respBody, respInfo);
                } else {
                    reject(respErr, respBody, respInfo);
                }
            });
        });
    }
};
