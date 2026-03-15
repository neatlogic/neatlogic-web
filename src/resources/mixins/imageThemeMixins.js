export default {
  methods: {
    /**
     * 获取模块背景样式
     * 根据模块ID和当前主题动态加载对应的背景图片
     * 
     * @param {string} moduleId - 模块标识符
     * @returns {Object} 包含backgroundImage属性的样式对象，如果图片加载失败则返回空对象
     * 
     * 逻辑说明：
     * 1. 首先尝试加载模块特定的背景图片（格式：模块ID-主题.png）
     * 2. 如果模块特定图片不存在，则回退到框架默认背景图片（格式：framework-主题.png）
     * 3. 如果所有图片都加载失败，返回空对象避免样式错误
     */
    getModuleBackgroundStyle(moduleId) {
      try {
        // 尝试加载模块特定的背景图片
        const imagePath = require(`@img-module/img/module/navigation/${moduleId}-${this.currentTheme}.png`);
        return {
          backgroundImage: `url('${imagePath}')`
        };
      } catch (error) {
        // 模块特定图片不存在，回退到框架默认背景图片
        try {
          const frameworkImagePath = require(`@img-module/img/module/navigation/framework-${this.currentTheme}.png`);
          return {
            backgroundImage: `url('${frameworkImagePath}')`
          };
        } catch (e) {
          // 所有图片加载失败，返回空对象
          return {};
        }
      }
    }
  },
  computed: {
    currentTheme() {
      // 检查$store.getters.themeType是否存在，不存在则默认使用default
      try {
        return this.$store.getters.themeType === 'dark' ? 'dark' : 'default';
      } catch (error) {
        return 'default';
      }
    }
  }
};
