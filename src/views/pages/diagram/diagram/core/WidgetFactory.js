import $utils from '@/resources/assets/js/util.js';

export const WIDGET_TYPES = [{ name: 'UML', label: 'UML' }];
import * as widgets from '@/views/pages/diagram/diagram/widgets';
const widgetList = Object.values(widgets);

function WIDGETS() {
  return $utils.deepClone(widgetList);
}

const WidgetFactory = {
  getWidget: widgetName => {
    const widget = widgetList.find(widget => widget.name.toLowerCase() === widgetName.toLowerCase()) || null;
    if (widget) {
      return $utils.deepClone(widget);
    }
  }
};

export { WIDGETS, WidgetFactory };
