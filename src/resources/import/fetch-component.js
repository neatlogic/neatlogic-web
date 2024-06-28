class FetchComponent {
  static categoryList = ['timeLine', 'taskDetail', 'stepLog', 'flowNode', 'flowNodeValid', 'flowLineValid', 'dispatcher', 'dispatcherValid'];
  static categoryConfig = {};
  static generateMethods() {
    this.categoryList.forEach(category => {
      const methodName = `fetch${category.charAt(0).toUpperCase() + category.slice(1)}Component`;
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
FetchComponent.generateMethods();
export default FetchComponent;
