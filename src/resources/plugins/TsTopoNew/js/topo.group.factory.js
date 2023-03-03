/** 创建实例的策略工厂，用于根据type创建合适的对象**/
(function(global, GroupFactory) {
  GroupFactory((global.GroupFactory = global.GroupFactory || {}), global);
})(window, function(exports, global) {
  class GroupFactory {
    constructor() {
      if (!GroupFactory.instance) {
        //支持的类列表
        this.classList = {};
        //单例模式，无论new多少次都只会返回一个factory实例
        GroupFactory.instance = this;
      }
      return GroupFactory.instance;
    }
    addClass(ObjectClass, name) {
      //注册支持的类
      name = name || ObjectClass.name;
      this.classList[name.toLowerCase()] = function(...arg) {
        return new ObjectClass(...arg);
      };
    }
    create(className, ...arg) {
      if (this.classList[className.toLowerCase()]) {
        return this.classList[className.toLowerCase()].call(null, ...arg);
      } else {
        console.warn(className + '不存在，请先加载');
        return null;
      }
    }
  }
  global.GroupFactory = GroupFactory;
});
