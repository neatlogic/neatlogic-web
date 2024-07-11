/**
 * 组件管理器
 * 基于categoryList动态注册和获取组件
 * 注册方法：registerCategoryComponent(component)
 * 获取方法：getCategoryComponent() // Category来自categoryList，首字母大写
 */
class ComponentManager {
  static categoryList = ['timeLine', 'taskDetail', 'stepLog', 'flowNode', 'flowElement', 'flowNodeValid', 'flowLineValid', 'dispatcher', 'dispatcherValid', 'workCenterColumn', 'formDefine', 'formConfig', 'formComponent'];
  static categoryConfig = {};
  static generateMethods() {
    this.categoryList.forEach(category => {
      const methodName = `register${category.charAt(0).toUpperCase() + category.slice(1)}Component`;
      let getMethodName = `get${category.charAt(0).toUpperCase() + category.slice(1)}Component`;
      this[methodName] = component => {
        // 分类方法
        if (this.categoryConfig[category]) {
          // 如果分类已存在，则合并
          Object.assign(this.categoryConfig[category], component);
        } else {
          this.categoryConfig[category] = component;
        }
      };
      this[getMethodName] = () => {
        // 根据分类获取数据
        return this.categoryConfig[category] || {};
      };
    });
  }
}
ComponentManager.generateMethods();
export default ComponentManager;
