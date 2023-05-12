import {$t} from '@/resources/init.js';

export const WIDGET_TYPES = [
  { name: 'basic', label: $t('term.report.basicwidget') },
  //{ name: 'geography', label: '地理组件' },
  { name: 'other', label: $t('term.report.otherwidget') }
];
import { default as text } from './define/text.js';
import { default as number } from './define/number.js';
//import { default as table } from './define/table.js';
import { default as pie } from './define/pie.js';
import { default as radar } from './define/radar.js';
import { default as rose } from './define/rose.js';
import { default as funnel } from './define/funnel.js';
import { default as column } from './define/column.js';
import { default as bar } from './define/bar.js';
import { default as stackedbar } from './define/stackedbar.js';
import { default as line } from './define/line.js';
import { default as mline } from './define/mline.js';
import { default as area } from './define/area.js';
import { default as marea } from './define/marea.js';
import { default as stackedcolumn } from './define/stackedcolumn.js';
import { default as groupedcolumn } from './define/groupedcolumn.js';
import { default as gauge } from './define/gauge.js';
//import { default as maparea } from './define/maparea.js';
//import { default as district } from './define/district.js';
//import { default as firework } from './define/firework.js';
//import { default as spark } from './define/spark.js';
import { default as point } from './define/point.js';
import { default as liquid } from './define/liquid.js';
import { default as pscatter } from './define/p-scatter.js';
import { default as scatter } from './define/scatter.js';
import { default as heatmap } from './define/heatmap.js';
import { default as wordcloud } from './define/wordcloud.js';
import { default as custom } from './define/custom.js';

export const WIDGETS = [
  text,
  number,
  //table,
  pie,
  radar,
  rose,
  column,
  bar,
  stackedbar,
  line,
  mline,
  area,
  marea,
  stackedcolumn,
  groupedcolumn,
  //maparea,
  //district,
  //firework,
  //spark,
  custom,
  funnel,
  point,
  gauge,
  liquid,
  scatter,
  pscatter,
  heatmap,
  wordcloud
];
