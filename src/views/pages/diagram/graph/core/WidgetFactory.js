import $utils from '@/resources/assets/js/util.js';

//export const WIDGET_TYPES = [{ name: 'UML', label: 'UML' }];
import widgetTypes from '@/views/pages/diagram/graph/widgets';

/*function WIDGETS() {
  return $utils.deepClone([]);
}*/

function WIDGET_TYPES() {
  return $utils.deepClone(widgetTypes);
}

const WidgetFactory = {
  getWidget: (widgetName) => {
    for (let i = 0; i < widgetTypes.length; i++) {
      const widget = widgetTypes[i].widgets.find(d => d.name === widgetName);
      if (widget) {
        return $utils.deepClone(widget);
      }
    }
    return null;
  }
};

export { WIDGET_TYPES, WidgetFactory };
