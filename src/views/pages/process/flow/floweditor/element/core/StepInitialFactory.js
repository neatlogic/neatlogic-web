import elements from '@/views/pages/process/flow/floweditor/element/validators/index.js';

const ValidFactory = {
  getValidator: ({ handler, type }) => {
    let element;
    if (handler) {
      const element = elements.find(d => d.handler && d.handler === handler);
      if (element) {
        return element;
      }
    }
    if (type) {
      const element = elements.find(d => d.type && d.type === type);
      if (element) {
        return element;
      }
    }
    return null;
  }
};

export { ValidFactory };
