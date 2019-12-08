# hexo-deployer-qiniucloud2

[Hexo](http://hexo.io/) 上的七牛云部署器。

## 安装

```bash
npm install hexo-deployer-qiniucloud2 --save
```

## 使用

1. 注册并登录[七牛云](https://portal.qiniu.com/qvm/active?code=13820695516qDb)
2. 新建[存储空间](https://portal.qiniu.com/bucket/create)
3. 获取[密钥(Access/Secret Key)](https://portal.qiniu.com/user/key)
4. 编辑`_config.yml`文件

    ```yaml
    deploy:
       type: qiniu
       accessKey: <accessKey>
       secretKey: <secretKey>
       # 华东: Zone_z0, 华北: Zone_z1, 华南: Zone_z2, 北美: Zone_na0, 东南亚: Zone_as0
       zone: <zone>
       # the name of bucket
       scope: <scope>
       # example http://www.a.com/,http://www.b.cn/
       dirsToRefresh: <dirsToRefresh> 
       # default is 3600
       expires: [expires]
       # default is true
       cover: [true|false]
       # default is false
       refreshCdn:  [true|false]
    ```

5. 部署

    ```bash
    hexo deploy
    ```

6. [绑定域名](https://portal.qiniu.com/cdn/domain/create)。

## 许可证

MIT
