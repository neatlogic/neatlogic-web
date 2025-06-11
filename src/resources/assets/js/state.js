import Vue from 'vue';
class State {
  constructor(module) {
    this.store = Vue.observable({
      /**
       * Vue.observable 只有在对象初始化时定义的属性，才会被 Vue 2 的响应式系统处理。
       * 勿删data，主要目的就是让state.data是响应式，computed才可以监听其值的变化。
       */
      data: {}
    });
    this.module = module;
  }
  /**
   * 使用方法：
   * computed: {
   *    getState() {
   *      return this.$state.get(key); // key为set时的key值
   *   }
   * },
   * watch: {
   *   getState(val) {
   *      // 处理逻辑
   *   }
   * }
   */
  get(key, type) {
    if (key) {
      let finalKey = '';
      if (type) {
        finalKey = `${this.module}_${type}_${key}`;
      } else {
        finalKey = `${this.module}_${key}`;
      }
      return this.store.data[finalKey];
    }
  }

  /**
   * 使用方法：
   * this.$state.set(key, value);
   */
  set(key, value, type) {
    if (key && value != null && typeof value != 'undefined') {
      let valueKey = '';
      if (type) {
        valueKey = `${this.module}_${type}_${key}`;
      } else {
        valueKey = `${this.module}_${key}`;
      }
      Vue.set(this.store.data, valueKey, value);
    }
  }
}

export default State;
