const path = require('path');
const glob = require('glob');
let src = './src';
let baseImg = './public/resource';
let commercialModule = './src/commercial-module';
let localUrl = '../neatlogic-web/src/resources';
let pageTitle = 'neatlogic'; //页面标题名称
const { tenantName, urlPrefix } = require('./apiconfig.json');
process.env.VUE_APP_TENANT = tenantName; // 租户名称
process.env.VUE_APP_LOGINTITLE = 'welcome';

function getPages(pageList) {
  const pages = {};
  if (!pageList) {
    const pagePath = glob.sync(src + '/views/pages/*/router.js');
    let importModulePathList = glob.sync(`${commercialModule}/**/router.js`) || [];
    let pagePathList = [...pagePath];

    let defaultModuleList = getAllModuleList([], JSON.parse(JSON.stringify(pagePath)));
    let commercialModuleList = [];
    if (importModulePathList && importModulePathList.length > 0) {
      importModulePathList.forEach(filePath => {
        let moduleName = filePath.match(/\/([a-zA-Z0-9_-]+)\/router\.js$/)[1];
        if (moduleName && !defaultModuleList.includes(getModuleName(moduleName))) {
          // 剔除非模块的情况，如自定义页面或者自定义组件
          pagePathList.push(filePath);
          commercialModuleList.push(getModuleName(moduleName));
        }
      });
    }
    pagePathList.forEach(filePath => {
      let moduleName = filePath.match(/\/([a-zA-Z0-9_-]+)\/router\.js$/)[1];

      const newpage = {};
      let filename = getModuleName(moduleName);
      let pageLogin = `${pageTitle}-${filename}`;
      if (`${filename}` == 'login') {
        pageLogin = `${pageTitle}`;
      }
      newpage[filename] = {
        entry: commercialModuleList.includes(filename) ? `${commercialModule}/${moduleName}/${filename}.js` : `${src}/views/pages/${filename}/${filename}.js`,
        template: `public/index.html`,
        filename: `${filename}.html`,
        title: pageLogin, // 标题名称+参数
        chunks: [`chunk-vendors`, `chunk-common`, filename]
      };
      Object.assign(pages, newpage);
    });
  } else {
    //eg:['process','dashboard']
    let list = typeof pageList == 'string' ? JSON.parse(pageList) : pageList;
    list.forEach(filePath => {
      const newpage = {};
      newpage[filePath] = {
        entry: `${src}/views/pages/${filePath}/${filePath}.js`,
        template: `public/index.html`,
        filename: `${filePath}.html`,
        title: `${pageTitle}-${filePath}`, // 标题名称+参数
        chunks: [`chunk-vendors`, `chunk-common`, filePath]
      };
      Object.assign(pages, newpage);
    });
  }
  return pages;
}
function getModuleName(moduleName) {
  // 截取neatlofic-web-xxx xxx值
  let currentModuleName = moduleName ? JSON.parse(JSON.stringify(moduleName)) : '';
  return (currentModuleName && currentModuleName.split('-') && currentModuleName.split('-').pop()) || currentModuleName;
}
function getAllModuleList(defaultModuleList, modulePathList = []) {
  // 获取所有非自定义模块
  let moduleList = [];
  modulePathList.forEach(filePath => {
    if (filePath) {
      const moduleName = filePath.match(/\/([a-zA-Z0-9_-]+)\/router\.js$/)[1];
      if (moduleName && getModuleName(moduleName) && !defaultModuleList.includes(getModuleName(moduleName))) {
        moduleList.push(getModuleName(moduleName));
      }
    }
  });
  return moduleList;
}

function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
          globalVars: {
            'top-height': '50px',
            'actionbar-height': '50px',
            'space-normal': '16px',
            'space-md': '12px',
            'space-sm': '10px',
            'space-icon': '3px'
          }
        }
      }
    }
  },
  publicPath: process.env.NODE_ENV === 'development' ? '/' + tenantName + '/' : '/', // 修复打包不需要带租户的问题
  assetsDir: 'resource',
  productionSourceMap: false,
  runtimeCompiler: true,
  pages: getPages(process.env.VUE_APP_PAGE_LIST),
  configureWebpack: {
    performance: {
      hints: false
    }
  },
  chainWebpack: config => {
    config.module.rule('vue').use('vue-path-injector').loader(require.resolve('./vue-path-injector.js')).after('vue-loader').end();
    config.resolve.alias.set('@', resolve(src));
    config.resolve.alias.set('base-module', resolve(localUrl));
    config.resolve.alias.set('img-module', resolve(baseImg));
    config.resolve.alias.set('assets', resolve(src + '/resources/assets'));
    config.resolve.alias.set('publics', resolve('./public/resource'));
    config.resolve.alias.set('components', resolve(src + '/resources/components'));
    config.resolve.alias.set('pages', resolve(src + '/views/pages'));
    config.resolve.alias.set('api', resolve(src + '/resources/api'));
    config.resolve.alias.set('css-module', resolve(src + '/resources/assets/css'));
    // config.plugins.delete('prefetch');
    // config.plugins.delete('preload');

    // if (process.env.NODE_ENV === 'production') {
    //   config.optimization.minimize(true);
    //   config.optimization.splitChunks({
    //     chunks:'all',
    //     cacheGroups: {
    //       libs: {
    //         name: 'chunk-libs',
    //         test: /[\\/]node_modules[\\/]/,
    //         priority: 10,
    //         chunks: 'initial'
    //       },
    //       antv:{
    //         name: 'chunk-antv',
    //         priority: 20,
    //         test: /[\\/]node_modules[\\/]_?@antv(.*)/
    //       },
    //       tsUI: {
    //         name: 'chunk-tsUI',
    //         priority: 21,
    //         test: /[\\/]node_modules[\\/]_?neatlogic-ui(.*)/
    //       },
    //       lodash: {
    //         name: 'chunk-lodash',
    //         priority: 22,
    //         test: /[\\/]node_modules[\\/]_?lodash(.*)/
    //       }
    //     }
    //   });
    // }
  },
  devServer: {
    open: true,
    port: '8081',
    https: false,
    hot: true,
    client: {
      overlay: false
    },
    //disableHostCheck: true,
    proxy: {
      '/([^/]+)/anonymous/api/': {
        target: urlPrefix,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/([^/]+)/anonymous/api/(.*)': '/neatlogic/anonymous/api/$2'
        }
      },
      '/([^/]+)/public/api/': {
        target: urlPrefix,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/([^/]+)/public/api/(.*)': '/neatlogic/public/api/$2'
        },
        headers: {
          Tenant: tenantName
        }
      },
      '/([^/]+)/api/': {
        target: urlPrefix,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/([^/]+)/api/(.*)': '/neatlogic/api/$2'
        },
        headers: {
          Tenant: tenantName
        }
      },
      '/([^/]+)/([^/]+)/check': {
        target: urlPrefix,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/([^/]+)/([^/]+)/check$': '/neatlogic/$2/check/$1'
        },
        headers: {
          Tenant: tenantName,
          Env: 'uat'
        }
      }
    }
    // ,
    // progress:false
  },
  // 将less挂到全局
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: []
      // patterns: [path.resolve(__dirname, "./src/resources/assets/css/variable.less")]
    }
  }
};
