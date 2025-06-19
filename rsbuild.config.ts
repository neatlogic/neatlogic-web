import { rspack, defineConfig } from '@rsbuild/core';
import { pluginVue2 } from '@rsbuild/plugin-vue2';
import { pluginLess } from '@rsbuild/plugin-less';
let commercialModule = './src/commercial-module';
let communityModule = './src/community-module';
import path from 'path';
import glob from 'glob';
const { tenantName, urlPrefix } = require('./apiconfig.json');
const src = './src';
let pageTitle = 'neatlogic';
let login_Title = 'welcome';
let table_style = 'border';
let imgModule = './public/resource';
let copyPath = '';
let faviconPath = './public/resource/img/common/tsfavicon.png';

let importCustomConfig = glob.sync(`${communityModule}/**/customconfig.js`) || [];
importCustomConfig.forEach((filePath) => {
  if (filePath) {
    let {tableStyle, title, loginTitle, imgPath, publicPath, faviconIconPath} = require(filePath);
    copyPath = publicPath;
    if (loginTitle) {
      login_Title = String(loginTitle);
    }
    if (tableStyle) {
      table_style = String(tableStyle);
    }
    if (title) {
      pageTitle = String(title);
    }
    if (imgPath) {
      imgModule = imgPath;
    }
    if (faviconIconPath) {
      faviconPath = faviconIconPath; 
    }
  }
});

importCustomConfig = glob.sync(`${commercialModule}/**/customconfig.js`) || [];
importCustomConfig.forEach((filePath) => {
  if (filePath) {
    let {tableStyle, title, loginTitle, imgPath, publicPath, faviconIconPath} = require(filePath);
    copyPath = publicPath;
    if (loginTitle) {
      login_Title = String(loginTitle);
    }
    if (tableStyle) {
      table_style = String(tableStyle);
    }
    if (title) {
      pageTitle = String(title);
    }
    if (imgPath) {
      imgModule = imgPath;
    }
    if (faviconIconPath) {
      faviconPath = faviconIconPath; 
    }
  }
});
const resolve = dir => path.resolve(__dirname, dir);

function getModuleName(moduleName) {
  return moduleName ? moduleName.split('-').pop() : '';
}

function getAllModuleList(modulePathList = []) {
  return modulePathList.map(filePath => {
    const moduleName = filePath ? filePath.match(/\/([a-zA-Z0-9_-]+)\/router\.js$/)[1] : '';
    return getModuleName(moduleName);
  });
}

function getPages(pageList) {
  const pages = {};
  const pagePathList = glob.sync(src + '/views/pages/*/router.js');
  const importCommercialModulePathList = glob.sync(`${commercialModule}/**/router.js`) || [];
  const importCommunityModulePathList = glob.sync(`${communityModule}/**/router.js`) || [];
  const defaultModuleList = getAllModuleList(pagePathList);
  const commercialModuleList = [];
  const communityModuleList = [];

  importCommercialModulePathList.forEach(filePath => {
    const moduleName = filePath.match(/\/([a-zA-Z0-9_-]+)\/router\.js$/)[1];
    if (!defaultModuleList.includes(getModuleName(moduleName))) {
      pagePathList.push(filePath);
      commercialModuleList.push(getModuleName(moduleName));
    }
  });

  importCommunityModulePathList.forEach(filePath => {
    const moduleName = filePath.match(/\/([a-zA-Z0-9_-]+)\/router\.js$/)[1];
    if (!defaultModuleList.includes(getModuleName(moduleName))) {
      pagePathList.push(filePath);
      communityModuleList.push(getModuleName(moduleName));
    }
  });

  pagePathList.forEach(filePath => {
    const moduleName = filePath.match(/\/([a-zA-Z0-9_-]+)\/router\.js$/)[1];
    const filename = getModuleName(moduleName);
    const pageLogin = filename === 'login' ? pageTitle : `${pageTitle}-${filename}`;

    let entry = `${src}/views/pages/${filename}/${filename}.js`;
    if (communityModuleList.includes(filename)) {
      entry = `${communityModule}/${moduleName}/${filename}.js`;
    } else if (commercialModuleList.includes(filename)) {
      entry = `${commercialModule}/${moduleName}/${filename}.js`;
    } 
    pages[filename] = {
      entry,
      template: `public/index.html`,
      filename: `${filename}.html`,
      title: pageLogin,
      chunks: [`chunk-vendors`, `chunk-common`, filename]
    };
  });

  return pages;
}
const pages = getPages(process.env.VUE_APP_PAGE_LIST);
let tenantNames = process.env.NODE_ENV === 'development' ? tenantName : '';
const ent = Object.fromEntries(Object.keys(pages).map(key => [tenantNames + '/' + key, pages[key].entry]));
const copyRsPack = copyPath ? [
  {
    from: resolve(copyPath), // 需要复制的目录
    to: resolve('/dist/'), // 复制到目标目录
    force: true,
    filter: (resourcePath) => {
      // 只复制 .html 文件
      return resourcePath.endsWith('.html');
    },
    noErrorOnMissing: true // 当没有找到对应的文件或目录时，忽略错误
  },
  {
    from: resolve(copyPath),
    to: resolve('dist/resource/'),
    filter: (resourcePath) => {
      return !resourcePath.endsWith('.html');
    },
    force: true,
    noErrorOnMissing: true
  }
] : [];
const copyFavicon = faviconPath ? [
  {
    from: resolve(faviconPath),
    to: resolve('dist/resource/img/common/'),
    force: true,
    noErrorOnMissing: true // 忽略文件不存在的错误
  }
] : [];
export default defineConfig({
  plugins: [pluginVue2(), pluginLess({
    lessLoaderOptions: {
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
  })],
  html: {
    template: './public/rs-index.html',
    title: pageTitle,
    favicon: faviconPath
  },
  dev: {
    assetPrefix: '/'
  },
  tools: {
    rspack: {
      plugins: [
        new rspack.DefinePlugin({
          'GLOBAL_VERSION': "'3.0.0'",
          'GLOBAL_PAGELIST': "''",
          'GLOBAL_TABLESTRYLE': JSON.stringify(table_style),
          'GLOBAL_LOGINTITLE': JSON.stringify(login_Title)
        }),
        new rspack.CopyRspackPlugin({
          patterns: [...copyRsPack, ...copyFavicon]
        }) 
      ]
    }
  },
  source: {
    alias: {
      '@': resolve('./src'),
      'base-module': resolve('../neatlogic-web/src/resources'),
      '@img-module': resolve(imgModule),
      'assets': resolve('./src/resources/assets'),
      '@publics': resolve('./public/resource'),
      'components': resolve('./src/resources/components'),
      'pages': resolve('./src/views/pages'),
      'api': resolve('./src/resources/api'),
      'css-module': resolve('./src/resources/assets/css')
    },
    entry: ent
  },
  server: {
    proxy: {
      '/([^/]+)/anonymous/api/': {
        target: urlPrefix,
        changeOrigin: true,
        secure: false,
        pathRewrite: { '^/([^/]+)/anonymous/api/(.*)': '/neatlogic/anonymous/api/$2' }
      },
      '/([^/]+)/public/api/': {
        target: urlPrefix,
        changeOrigin: true,
        secure: false,
        pathRewrite: { '^/([^/]+)/public/api/(.*)': '/neatlogic/public/api/$2' },
        headers: { Tenant: tenantName }
      },
      [`/${tenantName}/api/`]: {
        target: urlPrefix,
        changeOrigin: true,
        secure: false,
        pathRewrite: { '^/([^/]+)/api/(.*)': '/neatlogic/api/$2' },
        headers: { Tenant: tenantName }
      },
      [`/${tenantName}/tenant/`]: {
        target: urlPrefix,
        changeOrigin: true,
        secure: false,
        pathRewrite: { [`/${tenantName}/tenant/check`]: '/neatlogic/tenant/check/' + tenantName },
        headers: { Tenant: tenantName, Env: 'uat' }
      },
      [`/${tenantName}/login/`]: {
        target: urlPrefix,
        changeOrigin: true,
        secure: false,
        pathRewrite: { [`/${tenantName}/login/check`]: '/neatlogic/login/check/' + tenantName },
        headers: { Tenant: tenantName, Env: 'uat' }
      }
    }
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-size'
    }
  },
  output: {
    distPath: {
      image: 'resource/images',
      svg: 'resource/images',
      font: 'resource/fonts',
      js: 'resource/js',
      wasm: 'resource/js',
      css: 'resource/css'
    }
  },
  resolve: {
    alias: {
      /**
       * 解决报错：You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.
       * vue/dist/vue.esm.js 表示完整版的vue文件，同时包含编辑器和运行时的版本
       * 
       * 解决错误的原理：通过设置这个别名，让项目从引入 Runtime-only 版本转变为引入包含编译器的 vue.esm.js 文件。
       *                 这样，当代码中使用 template 选项定义模板字符串时，在运行时 Vue 就可以使用其自带的编译器将模板字符串编译成渲染函数，从而避免了因缺少编译器而产生的错误
       *  */ 
      'vue$': 'vue/dist/vue.esm.js' // 将vue的模式改成运行时才编译，解决template动态编译模板的问题
    }
  }
});
