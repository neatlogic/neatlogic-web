class LocalStore {
  constructor(module, router) {
    this.module = module;
    this.router = router;
  }

  set(key, value) {
    if (key && value != null && typeof value != 'undefined') {
      const valueKey = `${this.module}_${this.router.currentRoute.name}_${key}`;
      const data = {};
      data.v = value;
      localStorage.setItem(valueKey, JSON.stringify(data));
    }
  }

  get(key) {
    if (key) {
      const finalKey = `${this.module}_${this.router.currentRoute.name}_${key}`;
      const data = localStorage.getItem(finalKey);
      if (data) {
        return JSON.parse(data).v;
      }
      return null;
    }
  }

  remove(key) {
    if (key) {
      const finalKey = `${this.module}_${this.router.currentRoute.name}_${key}`;
      localStorage.removeItem(finalKey);
    }
  }
}
export default LocalStore;
