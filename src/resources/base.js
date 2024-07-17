// 全局通用类的引入，包括：全局样式、全局组件等
import Vue from 'vue';
import 'neatlogic-ui/iview/styles/index.less';
import ViewUI from 'neatlogic-ui/iview/index.js';
import utils from '@/resources/assets/js/util.js';
import NoData from '@/resources/components/nodata/NoData.js';
import Loading from '@/resources/components/loading/Loading.js';
import TsContain from '@/resources/components/TsContain/TsContain.js';
import TsRow from '@/resources/components/TsRow/TsRow';
import TsDialog from '@/resources/plugins/TsDialog/TsDialog.js';
import * as filters from '@/resources/filters/index'; //时间过滤器
import HistoryUtil from '@/resources/assets/js/historyUtil.js';

import auth from '@/resources/directives/auth.js'; // 权限指令
import Particles from 'particles.vue'; //粒子效果
import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
import AuthUtils from '@/resources/assets/js/authUtil.js'; //权限判断
import VueDomPurifyHtml from 'vue-dompurify-html'; //防止xss攻击
import './assets/index.js';
import 'regenerator-runtime/runtime'; // 处理regeneratorRuntime is not defined问题
import 'element-ui/lib/theme-chalk/index.css';
// common.checkTenant().then(res => {
//   if (res) {
//     if (res.Status != 'OK') {
//       window.location.href = '/404.html';
//     } else {
//       if (!res.license || !res.license.isValid) {
//         window.location.href = HOME + '/license.html';
//       }
//     }
//   }
// }).catch(() => {
//   window.location.href = '/404.html';
// });

// eslint-disable-next-line space-before-function-paren
(async function () {
  await ThemeUtils.init();
})();

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});
Vue.use(ViewUI);

//全局通用的提示高度和持续时间

Vue.use(NoData);
Vue.use(TsContain);
Vue.use(TsRow);
Vue.use(Loading);
Vue.use(TsDialog);
Vue.use(HistoryUtil);
Vue.use(Particles);
Vue.use(VueDomPurifyHtml, {
  //防止xss攻击，用法v-dompurify-html替代v-html
  hooks: {
    afterSanitizeAttributes: currentNode => {
      if ('target' in currentNode) {
        currentNode.setAttribute('target', '_blank');
      }
    }
  }
});
Vue.prototype.$utils = utils;
Vue.prototype.$AuthUtils = AuthUtils;

import 'assets/index.js';
import '@/resources/import/index'; // 加载所有模块的import.js文件

Vue.directive('auth', auth);
