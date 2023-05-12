import { mutations } from './state.js';
import themeConfig from './components/theme-config.js';
import themeApi from '@/resources/api/framework/theme/theme.js';

export default {
  resetTheme() {
    // 清空主题缓存
    localStorage.themeJson = '';
  },
  async init() {
    this.activeTheme();
    const res = await themeApi.getTheme();
    if (res && res.themeConfig && Object.values(res.themeConfig).length > 0) {
      let json = {
        light: res.themeConfig.light,
        dark: res.themeConfig.dark
      };
      this.configTheme(json);
      this.activeTheme();
    } else {
      this.resetTheme();
    }
  },
  getValueListByType(type) {
    // 获取类型的值
    let themes = localStorage.themeJson;
    let temList = [];
    if (themes) {
      temList = this._list(themes);
    } else {
      let themesDefaul = JSON.stringify(themeConfig);
      temList = this._list(themesDefaul);
    }

    let valueList = [];
    temList.forEach(v => {
      if (v.type === type && v.value) {
        valueList.push(v);
      }
    });
    return valueList;
  },
  getValueByType(param) {
    // 获取类型的值
    let themes = localStorage.themeJson;
    let temList = [];
    if (themes) {
      temList = this._list(themes);
    } else {
      let themesDefaul = JSON.stringify(themeConfig);
      temList = this._list(themesDefaul);
    }

    let value = '';
    temList && temList instanceof Array && temList.forEach(v => {
      if (v.param === param && v.value) {
        value = v.value;
      }
    });
    return value;
  },
  activeTheme() {
    // 渲染主题
    let themes = localStorage.themeJson;
    if (themes) {
      let temList = this._list(themes);
      temList && temList instanceof Array && temList.forEach(v => {
        if (v.type === 'common' && v.value) {
          document.body.style.setProperty(v.param, v.value); // 将变量存储到浏览器的方法里
        }

        if (v.param === 'logo') {
          if (v.value) {
            this.updateThemeValue(mutations, 'setLogo', 'logo'); // 主要是更新状态管理器, setlogo 为参数
          } else {
            mutations.setLogo('');
          }
        }
      });
    }
  },
  configTheme(json) {
    localStorage.themeJson = JSON.stringify(json);
  },
  updateThemeValue(mutations, updataValue, type) {
    // 更新状态管理器
    let value = this.getValueByType(type);
    if (value) {
      mutations[updataValue](value);
    }
  },
  _list(themes) {
    // 获取当前主题的缓存列表数据
    let newList = JSON.parse(themes);
    let temList = newList.light;
    if (localStorage.themeClass === 'theme-dark') {
      // 默认主题模式
      temList = newList.dark;
    }
    return temList;
  }
};
