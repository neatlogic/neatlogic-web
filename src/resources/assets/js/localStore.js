class LocalStore {
  constructor(module, router) {
    this.module = module;
    this.router = router;
  }

  set(key, value, type) {
    if (key && value != null && typeof value != 'undefined') {
      let valueKey = '';
      if (type) {
        valueKey = `${this.module}_${type}_${key}`;
      }else {
        valueKey = `${this.module}_${this.router.currentRoute.name}_${key}`;
      }
      const data = {};
      data.v = value;
      localStorage.setItem(valueKey, JSON.stringify(data));
    }
  }

  get(key, type) {
    if (key) {
      let finalKey = '';
      if (type) {
        finalKey = `${this.module}_${type}_${key}`;
      } else {
        finalKey = `${this.module}_${this.router.currentRoute.name}_${key}`;
      }
      const data = localStorage.getItem(finalKey);
      if (data) {
        return JSON.parse(data).v;
      }
      return null;
    }
  }

  remove(key, type) {
    if (key) {
      let finalKey = '';
      if (type) {
        finalKey = `${this.module}_${type}_${key}`;
      } else {
        finalKey = `${this.module}_${this.router.currentRoute.name}_${key}`;
      }
      localStorage.removeItem(finalKey);
    }
  }
}
export default LocalStore;
