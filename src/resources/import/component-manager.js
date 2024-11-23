/**
 * 组件管理器
 * 基于categoryList动态注册和获取组件
 * 注册方法：registerCategoryComponent(component)
 * 获取方法：getCategoryComponent() // Category来自categoryList，首字母大写
 *
 * 分类说明：
 * timeLine 时间线
 * taskDetail 工单详情
 * stepLog 步骤日志
 * flowNode 流程节点
 * flowElement 流程节点
 * flowNodeValid 流程节点校验
 * flowLineValid 流程线校验
 * dispatcher 分派器
 * dispatcherValid 分派器校验
 * workCenterColumn 工作中心列
 * formDefine 表单定义
 * formConfig 表单配置
 * formComponent 表单组件
 * deployAppConfigEnvTab 部署应用配置环境tab
 */
class ComponentManager {
  static categoryList = ['timeLine', 'taskDetail', 'stepLog', 'flowNode', 'flowElement', 'flowNodeValid', 'flowLineValid', 'dispatcher', 'dispatcherValid', 'workCenterColumn', 'formDefine', 'formConfig', 'formComponent', 'deployAppConfigEnvTab'];
  static categoryConfig = {};
  static generateMethods() {
    this.categoryList.forEach(category => {
      const methodName = `register${category.charAt(0).toUpperCase() + category.slice(1)}Component`;
      let getMethodName = `get${category.charAt(0).toUpperCase() + category.slice(1)}Component`;
      this[methodName] = component => {
        // 分类方法
        if (this.categoryConfig[category]) {
          // 如果分类已存在，则合并
          if (Array.isArray(component)) {
            this.categoryConfig[category].push(...component);
          } else {
            Object.assign(this.categoryConfig[category], component);
          }
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
