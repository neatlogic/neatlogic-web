const path = require('path');
const glob = require('glob');
let custommodule_home;
let src = './src';
let baseImg = './public/resource';
let importModuleUrl = process.env.VUE_APP_IMPORT_MODULE_URL || './src/dummy-module';
let baseConfiglUrl = './src/dummy-module'; // 如果不引用的话，就引用本地的空文件夹
let localUrl = '../neatlogic-web/src/resources';
let pageTitle = 'neatlogic'; //页面标题名称
let currentModuleName = '';
let projectName = ''; //引入项目配置信息
const { tenantName, urlPrefix } = require('./apiconfig.json');
process.env.VUE_APP_TENANT = tenantName; // 租户名称
process.env.VUE_APP_LOGINTITLE = 'welcome';
try {
  custommodule_home = require('../neatlogic-web-config/config.json'); //查找是否有配置信息
  currentModuleName = custommodule_home.currentModuleName; //项目信息
  projectName = custommodule_home[currentModuleName];
  if (projectName) {
    if (projectName.baseConfiglUrl) {
      baseConfiglUrl = projectName.baseConfiglUrl; //自定义页面引入路径
    }
    if (projectName.baseImg) {
      baseImg = projectName.baseImg; //图片引入路径
    }
    if (projectName.loginTitle) {
      process.env.VUE_APP_LOGINTITLE = projectName.loginTitle; // 登陆页标题
    }
    if (projectName.tableStyle) {
      process.env.VUE_APP_TABLESTRYLE = projectName.tableStyle; //table显示的间隔是边框，之所以在这里定义table的显示样式，因为模块需要所有的table都是颜色间隔显示，然而产品的显示样式为边框间隔
    }
    process.env.VUE_APP_CUSTOMPAGES = projectName.home; //自定义项目文件夹名称
    process.env.VUE_APP_CUSTOMMODULE = true;
    pageTitle = projectName.title;
  }
} catch (e) {
  console.log('neatlogic-web-config', e);
}
function getPages(pageList) {
  const pages = {};
  if (!pageList) {
    const pagePath = glob.sync(src + '/views/pages/*/router.js');
    let pagePathList = [...pagePath];
    let importModuleList = [];
    let customPagePath = [];
    let importModulePathList;
    importModulePathList = glob.sync(`${importModuleUrl}/**/router.js`);
    if (importModulePathList && importModulePathList.length > 0) {
      customPagePath.push(...importModulePathList);
    }
    pagePathList.push(...customPagePath);
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
      let pageLogin = `${pageTitle}-${filename}`;
      if (`${filename}` == 'login') {
        pageLogin = `${pageTitle}`;
      }
      newpage[filename] = {
        entry: importModuleList.includes(filename) ? `${importModuleUrl}/${filename}/${filename}.js` : `${src}/views/pages/${filename}/${filename}.js`,
        template: `public/index.html`,
        filename: `${filename}.html`,
        title: pageLogin, // 标题名称+参数
        chunks: [`chunk-vendors`, `chunk-common`, `${filename}`]
      };
      Object.assign(pages, newpage);
    });
  } else {
    //eg:['process','dashboard']
    let list = typeof pageList == 'string' ? JSON.parse(pageList) : pageList;
    list.forEach(p => {
      const newpage = {};
      newpage[p] = {
        entry: importModuleList.includes(p) ? `${importModuleUrl}/${p}/${p}.js` : `${src}/views/pages/${p}/${p}.js`,
        template: `public/index.html`,
        filename: `${p}.html`,
        title: `${pageTitle}-${p}`, // 标题名称+参数
        chunks: [`chunk-vendors`, `chunk-common`, `${p}`]
      };
      Object.assign(pages, newpage);
    });
  }
  return pages;
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
    config.resolve.alias.set('dummy-module', resolve(baseConfiglUrl));
    config.resolve.alias.set('base-module', resolve(localUrl));
    config.resolve.alias.set('img-module', resolve(baseImg));
    config.resolve.alias.set('import-module-url', path.resolve(__dirname, importModuleUrl)); // path.resolve 解析相对路径为绝对路径，解决require.context 获取router.js/config.js 文件，路径找不到问题
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
