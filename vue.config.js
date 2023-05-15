/* eslint-disable */
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
let custommodule_home;
let baseConfiglUrl = '';
let baseImg = '';
let src = './src';
let rootSrc = './src';
let cssCkeditor = '';  //主要是用来工单处理-回复-编辑器的段落样式,为了改颜色才加的这个js
let pageTitle = '';   //页面标题名称
let currentModuleName = '';
let projectName = '';
try {
  custommodule_home = require('../neatlogic-web-config/config.json');  //查找是否有配置信息
  currentModuleName = custommodule_home.currentModuleName;  //项目信息
  projectName = custommodule_home[currentModuleName]
  if (projectName.hasUrl) {
    baseConfiglUrl = projectName.baseConfiglUrl;
    baseImg = projectName.baseImg;
    cssCkeditor = projectName.cssCkeditor;
  } else {
    baseImg = './public/resource';
    baseConfiglUrl = src + '/dummy_custom_module';// 如果不引用的话，就引用本地的空文件夹
    cssCkeditor = src + '/resources/plugins/TsCkeditor/js';
  }
  process.env.VUE_APP_CUSTOMMODULE = true;
  process.env.VUE_APP_CUSTOMPAGES = projectName.home;  //当前模块是否是银行的
  pageTitle = projectName.title;
  process.env.VUE_APP_LOGINTITLE = projectName.loginTitle; // 登陆页标题
  process.env.VUE_APP_TABLESTRYLE = projectName.tableStyle; //table显示的间隔是边框，之所以在这里定义table的显示样式，因为模块需要所有的table都是颜色间隔显示，然而产品的显示样式为边框间隔
} catch (e) {
  baseImg = './public/resource';
  process.env.VUE_APP_CUSTOMPAGES = 'neatlogic';
  process.env.VUE_APP_CUSTOMMODULE = false
  baseConfiglUrl = src + '/dummy_custom_module';// 如果不引用的话，就引用本地的空文件夹
  cssCkeditor = src + '/resources/plugins/TsCkeditor/js';
  pageTitle = 'neatlogic';
  // localStorage.titleLogin = 'neatlogic';
  // window.localStorage.setItem('titleLogin', 'neatlogic');
  process.env.VUE_APP_LOGINTITLE = 'neatlogic'
}
//注意：urlPrefix需为包含端口号的完整的访问路径，比如：http://192.168.0.25:8282

// console.log('--------------------全局变量----------',)

let localUrl = '../neatlogic-web/src/resources';
// let configUrl = '../neatlogic-web-config';

const { tenantName, urlPrefix } = require('./apiconfig.json');
function getPages(pageList) {
  const pages = {};
  if (!pageList) {
    const pagePath = glob.sync(rootSrc + '/views/pages/*/router.js');
    pagePath.forEach(p => {
      const filename = p.match(/src\/views\/pages\/(.*)\/router\.js/);
      const newpage = {};
      let pageLogin = `${pageTitle}-${filename[1]}`;
      if (`${filename[1]}` == 'login') {
        pageLogin = `${pageTitle}`
      }
      newpage[filename[1]] = {
        entry: `${src}/views/pages/${filename[1]}/${filename[1]}.js`,
        template: `public/index.html`,
        filename: `${filename[1]}.html`,
        title: pageLogin,  // 标题名称+参数
        chunks: [`chunk-vendors`, `chunk-common`, `${filename[1]}`]
      };

      Object.assign(pages, newpage);
    });
  } else {
    //eg:['process','dashboard']
    let list = typeof pageList == 'string' ? JSON.parse(pageList) : pageList;
    list.forEach(p => {
      const newpage = {};
      newpage[p] = {
        entry: `${src}/views/pages/${p}/${p}.js`,
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
  publicPath: '/' + tenantName + '/',
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
    config.module
      .rule('vue')
      .use('vue-path-injector')
      .loader(require.resolve('./vue-path-injector.js'))
      .after('vue-loader')
      .end();
    config.resolve.alias.set('@', resolve(src));
    config.resolve.alias.set('custom-module', resolve(baseConfiglUrl));
    config.resolve.alias.set('base-module', resolve(localUrl));
    config.resolve.alias.set('img-module', resolve(baseImg));
    config.resolve.alias.set('cssCkeditor-module', resolve(cssCkeditor));

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
      '/([^/]+)/([^\/]+)/check': {
        target: urlPrefix,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/([^/]+)/([^\/]+)/check$': '/neatlogic/$2/check/$1'
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
