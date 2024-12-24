import { rspack } from '@rsbuild/core';
import { defineConfig } from '@rsbuild/core';
import { pluginVue2 } from '@rsbuild/plugin-vue2';
let commercialModule = './src/commercial-module';
import path from 'path';
import glob from 'glob';
const { tenantName, urlPrefix } = require('./apiconfig.json');
const src = './src';
let pageTitle = 'neatlogic';
let login_Title = 'welcome';
let table_style = 'border';
let imgModule = './public/resource';
let importCustomConfig = glob.sync(`${commercialModule}/**/customconfig.js`) || [];
importCustomConfig.forEach((filePath) => {
  if (filePath) {
    let {tableStyle, title, loginTitle, home} = require(filePath);
    login_Title = String(loginTitle);
    table_style = String(tableStyle);
    pageTitle = String(title);
    imgModule = home;
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
  const importModulePathList = glob.sync(`${commercialModule}/**/router.js`) || [];
  const defaultModuleList = getAllModuleList(pagePathList);
  const commercialModuleList = [];

  importModulePathList.forEach(filePath => {
    const moduleName = filePath.match(/\/([a-zA-Z0-9_-]+)\/router\.js$/)[1];
    if (!defaultModuleList.includes(getModuleName(moduleName))) {
      pagePathList.push(filePath);
      commercialModuleList.push(getModuleName(moduleName));
    }
  });

  pagePathList.forEach(filePath => {
    const moduleName = filePath.match(/\/([a-zA-Z0-9_-]+)\/router\.js$/)[1];
    const filename = getModuleName(moduleName);
    const pageLogin = filename === 'login' ? pageTitle : `${pageTitle}-${filename}`;
    const entry = commercialModuleList.includes(filename)
      ? `${commercialModule}/${moduleName}/${filename}.js`
      : `${src}/views/pages/${filename}/${filename}.js`;

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

export default defineConfig({
  plugins: [pluginVue2()],
  html: {
    template: './public/rs-index.html',
    title: pageTitle
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
        })
      ]
    },
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
  }
});
