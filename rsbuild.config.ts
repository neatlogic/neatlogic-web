import { rspack } from '@rsbuild/core';
import { defineConfig } from '@rsbuild/core';
import { pluginVue2 } from '@rsbuild/plugin-vue2';
let commercialModule = './src/commercial-module';
import path from 'path';
import glob from 'glob';
const { tenantName, urlPrefix } = require('./apiconfig.json');

const src = './src';
const pageTitle = 'neatlogic';

const resolve = dir => path.resolve(__dirname, dir);

function getModuleName(moduleName) {
  return moduleName ? moduleName.split('-').pop() : '';
}

function getAllModuleList(modulePathList = []) {
  return modulePathList.map(filePath => {
    const moduleName = filePath.match(/\/([a-zA-Z0-9_-]+)\/router\.js$/)[1];
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
const ent = Object.fromEntries(Object.keys(pages).map(key => [tenantName + '/' + key, pages[key].entry]));

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
          'process.env.VERSION': "'3.0.0'",
          'process.env.VUE_APP_PAGE_LIST': "''",
          'process.env.VUE_APP_TABLESTRYLE': '"border"',
          'process.env.VUE_APP_TENANT': tenantName,
          'process.env.VUE_APP_LOGINTITLE': '"welcome"'
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
      '@img-module': resolve('./public/resource'),
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
  }
});
