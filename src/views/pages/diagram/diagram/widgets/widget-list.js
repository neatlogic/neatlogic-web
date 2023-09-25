import $utils from '@/resources/assets/js/util.js';

export const WIDGET_TYPES = [{ name: 'UML', label: 'UML' }];
import { default as Class } from './Class.js';
import { default as SystemGroup } from './SystemGroup.js';
import { default as System } from './System.js';

function WIDGETS() {
  return $utils.deepClone([Class, SystemGroup, System]);
}

export { WIDGETS };
