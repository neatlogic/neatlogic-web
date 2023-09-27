import $utils from '@/resources/assets/js/util.js';

export const WIDGET_TYPES = [{ name: 'UML', label: 'UML' }];
import { default as Class } from '@/views/pages/diagram/diagram/widgets/Class.js';
import { default as SystemGroup } from '@/views/pages/diagram/diagram/widgets/SystemGroup.js';
import { default as System } from '@/views/pages/diagram/diagram/widgets/System.js';
const widgetList = [Class, SystemGroup, System];

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
