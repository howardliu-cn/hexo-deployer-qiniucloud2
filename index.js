/* global hexo */
'use strict';

hexo.extend.deployer.register('qiniu', require('./lib/main'));
