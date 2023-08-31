export default {
  bind(el, binding) {
    el.querySelectorAll('*').forEach((element) => {
      // 移除所有事件属性
      Array.from(element.attributes).forEach(item => {
        if (typeof item.name === 'string') {
          if (item.name.startsWith('on')) {
            element.removeAttribute(item.name);
          }
        }
      });
    });
  },
  update(el, binding) {
    el.querySelectorAll('*').forEach((element) => {
      // 移除所有事件属性
      Array.from(element.attributes).forEach(item => {
        if (typeof item.name === 'string') {
          if (item.name.startsWith('on')) {
            element.removeAttribute(item.name);
          }
        }
      });
    });
  }
};

