import {default as equal} from './equal.js';
import {default as notequal} from './notequal.js';
import {default as isnull} from './isnull.js';
import {default as isnotnull} from './isnotnull.js';
import {default as change} from './change.js';
import { default as include } from './include.js';
import { default as exclude } from './exclude.js';

export const EXPRESSIONS = {
  equal: equal,
  notequal: notequal,
  isnull: isnull,
  isnotnull: isnotnull,
  change: change,
  include: include,
  exclude: exclude
};
