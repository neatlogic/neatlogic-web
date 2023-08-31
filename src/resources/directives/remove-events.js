export default {
  bind(el, binding) {
    el.querySelectorAll('*').forEach((element) => {
      // 移除所有事件属性
      for (const attrIndex in element.attributes) {
        let attrName = element.attributes[attrIndex].name;
        if (typeof attrName === 'string') {
          if (attrName.startsWith('on')) {
            element.removeAttribute(attrName);
          }
        }
      }
    });
  },
  update(el, binding) {
    el.querySelectorAll('*').forEach((element) => {
      // 移除所有事件属性
      for (const attrIndex in element.attributes) {
        let attrName = element.attributes[attrIndex].name;
        if (typeof attrName === 'string') {
          if (attrName.startsWith('on')) {
            element.removeAttribute(attrName);
          }
        }
      }
    });
  }
};

