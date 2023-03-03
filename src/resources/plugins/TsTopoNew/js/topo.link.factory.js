/** 创建实例的策略工厂，用于根据type创建合适的对象**/
(function(global, LinkFactory) {
  LinkFactory((global.LinkFactory = global.LinkFactory || {}), global);
}(window, function(exports, global) {
  class LinkFactory {
    constructor() {
      if (!LinkFactory.instance) {
        //支持的类列表
        this.classList = {};
        //单例模式，无论new多少次都只会返回一个factory实例
        LinkFactory.instance = this;
      }
      return LinkFactory.instance;
    }
    addClass(ObjectClass,name) {
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
  global.LinkFactory = LinkFactory;
}));
