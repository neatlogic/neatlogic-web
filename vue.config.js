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
    let pagePathList = [...pagePath];
    let importModuleList = [];
    let customPagePath = [];
    let importModulePathList;
    importModulePathList = glob.sync(`${commercialModule}/**/router.js`);
    if (importModulePathList && importModulePathList.length > 0 && process.env.neatlogic_version == 'commercial') {
      customPagePath.push(...importModulePathList);
      pagePathList.push(...customPagePath);
    } else {
      commercialModule = './src/community-module';
    }
    pagePathList.forEach(p => {
      let filename = '';
      let customImportModuleName = ''; // 自定义导入模块名称
      const projectFilename = p.match(/src\/views\/pages\/(.*)\/router\.js/);
      const importFilename = p.match(/\/[^\/]+\/router\.js$/);
      if (projectFilename) {
        filename = projectFilename[1];
      } else if (importFilename) {
        customImportModuleName = importFilename[0].match(/\/([^\/]+)\/router\.js$/);
        if (customImportModuleName) {
          filename = customImportModuleName[1];
          importModuleList.push(filename);
        }
      }
      const newpage = {};
      let pageLogin = `${pageTitle}-${getModuleName(importModuleList, filename)}`;
      if (`${filename}` == 'login') {
        pageLogin = `${pageTitle}`;
      }
      newpage[getModuleName(importModuleList, filename)] = {
        entry: importModuleList.includes(filename) ? `${commercialModule}/${filename}/${getLastValue(filename)}.js` : `${src}/views/pages/${filename}/${filename}.js`,
        template: `public/index.html`,
        filename: `${getModuleName(importModuleList, filename)}.html`,
        title: pageLogin, // 标题名称+参数
        chunks: [`chunk-vendors`, `chunk-common`, getModuleName(importModuleList, filename)]
      };
      Object.assign(pages, newpage);
    });
  } else {
    //eg:['process','dashboard']
    let list = typeof pageList == 'string' ? JSON.parse(pageList) : pageList;
    list.forEach(p => {
      const newpage = {};
      newpage[getModuleName(importModuleList, p)] = {
        entry: importModuleList.includes(p) ? `${commercialModule}/${p}/${getLastValue(p)}.js` : `${src}/views/pages/${p}/${p}.js`,
        template: `public/index.html`,
        filename: `${getModuleName(importModuleList, p)}.html`,
        title: `${pageTitle}-${getModuleName(importModuleList, p)}`, // 标题名称+参数
        chunks: [`chunk-vendors`, `chunk-common`, getModuleName(importModuleList, p)]
      };
      Object.assign(pages, newpage);
    });
  }
  return pages;
}
function getModuleName(importModuleList, moduleName) {
  // 自定义模块例如：neatlogic-web-codehub 拿到codehub模块名称
  return importModuleList.includes(moduleName) ? `${getLastValue(moduleName)}` : `${moduleName}`;
}
function getLastValue(moduleName) {
  const lastValue = moduleName.split('-');
  const moduleNames = lastValue.pop() || moduleName;
  return moduleNames;
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
    config.resolve.alias.set('commercial-module', resolve(commercialModule));
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
          Tenant: tenantName
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
