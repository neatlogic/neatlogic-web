import { store } from '@/views/pages/framework/theme/state.js';
import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
import logoConfig from '@/resources/import/logo-manager.js';
export default {
  computed: {
    getNavigationLogo() {
      //  用户上传的logo -> 前端定制包的logo -> 项目本地预设的logo
      let logoUrl = '';
      store.logo; //此句不能删，用于激活cache
      const uploadLogo = ThemeUtils.getValueByType('logo');
      const themeClass = localStorage.getItem('themeClass') || 'theme-default';
      const { logoWhiteIcon = '', logoDarkIcon = '' } = logoConfig || {};
      if (uploadLogo && typeof uploadLogo == 'number') { // 1. 用户上传的logo
        logoUrl = HOME + '/api/binary/image/download?id=' + uploadLogo;
      } else if (themeClass == 'theme-default') {
        logoUrl = logoWhiteIcon || require('@/resources/assets/images/logo_big_white.png');
      } else if (themeClass == 'theme-dark') {
        logoUrl = logoDarkIcon || require('@/resources/assets/images/logo_big_dark.png');
      }
      return logoUrl;
    }
  }
};
