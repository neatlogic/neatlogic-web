/**
 * 组件管理器
 * // 老写法：
 * 基于categoryList动态注册和获取组件
 * Category来自categoryList，首字母大写
 * 注册方法：registerCategoryComponent(component)
 * 获取方法：getCategoryComponent()
 * // 新写法：
 * 如果是用新写法，获取老写法的组件，category就是categoryList中的分类名称
 * registerComponent(category, component)
 * getComponent(category, moduleName) // moduleName为模块名称，category为分类名称, category 为router时，才需要传入moduleName(需要获取指定模块的路由列表)，其他情况不需要传入moduleName
 *
 * 分类说明：
 * timeLine 时间线
 * taskDetail 工单详情
 * stepLog 步骤日志
 * flowNode 流程节点
 * flowElement 流程元素
 * dispatcher 分派器
 * dispatcherValid 分派器校验
 * workCenterColumn 工作中心列
 * formDefine 表单定义
 * formConfig 表单配置
 * formComponent 表单组件
 * formVersionList 表单版本列表（用户自定义组件，新加配置，存量数据不会跟着改变的问题）
 * deployAppConfigEnvTab 部署应用配置环境tab
 * mqTopicConfig 消息主题配置组件
 * mqSubscribeConfig 消息订阅配置组件
 * loginPage 登录页
 * diagramWidget 架构图图元组件
 * diagramWidgetConfig 架构图图元编辑组件
 * diagramWidgetCustomConfig 结构图图元自定义编辑组件
 * alertEventHandlerEdit 告警中心事件处理配置
 * alertEventHandlerView 告警中心事件处理查看
 * alertEventHandlerConfig 告警中心事件处理配置（配置组件）
 * alChatView AI聊天工具结果查看
 * router 跨模块路由
 *   使用方法：getRouterComponent(moduleName)，moduleName为模块名称
 *   注册方法：registerRouterComponent({
 *     moduleName: routerList // moduleName为模块名称，routerList为路由列表
 *   })
 */
class ComponentManager {
  static categoryList = ['timeLine', 'taskDetail', 'stepLog', 'flowNode', 'flowElement', 'dispatcher', 'dispatcherValid', 'workCenterColumn', 'formDefine', 'formConfig', 'formComponent', 'deployAppConfigEnvTab', 'mqTopicConfig', 'mqSubscribeConfig', 'loginPage', 'formVersionList', 'router', 'deployAppConfigModule', 'diagramWidget', 'diagramWidgetConfig', 'diagramWidgetCustomConfig', 'alertEventHandlerEdit', 'alertEventHandlerView', 'alertEventHandlerConfig', 'aiChatView'];
  static categoryConfig = {_template: {}};
  static generateMethods() {
    this.categoryList.forEach(category => {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      const methodName = `register${categoryName}Component`;
      let getMethodName = `get${categoryName}Component`;
      this[methodName] = component => {
        // 分类方法
        if (this.categoryConfig[category]) {
          // 如果分类已存在，则合并
          if (Array.isArray(component)) {
            this.categoryConfig[category].push(...component);
          } else {
            for (let key in component) {
              if (this.categoryConfig[category].hasOwnProperty(key) && Array.isArray(component[key]) && component[key].length > 0) {
                this.categoryConfig[category][key].push(...component[key]);
              } else {
                this.categoryConfig[category][key] = component[key];
              }
            }
          }
        } else {
          this.categoryConfig[category] = component;
        }
      };
      this[getMethodName] = moduleName => {
        // 根据分类获取数据
        if (moduleName) {
          return this.categoryConfig[category] ? this.categoryConfig[category][moduleName] : '';
        } else {
          return this.categoryConfig[category];
        }
      };
    });
    //用于注册vue模板
    this['registerVueTemplate'] = (name, template) => {
      this.categoryConfig['_template'][name] = template;
    };
    this['getVueTemplate'] = (name, template) => {
      return this.categoryConfig['_template'][name];
    };
  }
  /**
   * 新注册组件方法
   * @param {string} name 分类名称，如：timeLine、taskDetail、stepLog等
   * @param {object/array}  component 组件，如：{timeLine: {component: component}}
   */
  static registerComponent(name, component) {
    const existing = this.categoryConfig[name];
    if (!existing) {
      this.categoryConfig[name] = component;
      return;
    }
    if (Array.isArray(component)) {
      this.categoryConfig[name].push(...component);
    } else {
      for (let key in component) {
        if (this.categoryConfig[name].hasOwnProperty(key) && Array.isArray(component[key]) && component[key].length > 0) {
          this.categoryConfig[name][key].push(...component[key]);
        } else {
          this.categoryConfig[name][key] = component[key];
        }
      }
    }
  }
  /**
   * 新获取组件方法
   * @param {string} name 分类名称，如：timeLine、taskDetail、stepLog等
   * @param {string} moduleName 模块名称，如：process、cmdb等。模块名称是路由(router)时必填，其他时候可以不传。
   *
   */
  static getComponent(name, moduleName) {
    if (name && moduleName) {
      return this.categoryConfig[name] ? this.categoryConfig[name][moduleName] : '';
    } else {
      return this.categoryConfig[name];
    }
  }
}
ComponentManager.generateMethods();
export default ComponentManager;
