export const WIDGET_TYPES = [
  { name: 'basic', label: '基础组件' },
  //{ name: 'geography', label: '地理组件' },
  { name: 'other', label: '其他组件' }
];
import { default as text } from './define/text.json';
import { default as image } from './define/image.json';

//import { default as table } from './define/table.json';
import { default as pie } from './define/pie.json';
import { default as radar } from './define/radar.json';
import { default as rose } from './define/rose.json';
import { default as funnel } from './define/funnel.json';
import { default as column } from './define/column.json';
import { default as bar } from './define/bar.json';
import { default as stackedbar } from './define/stackedbar.json';
import { default as line } from './define/line.json';
import { default as mline } from './define/mline.json';
import { default as area } from './define/area.json';
import { default as marea } from './define/marea.json';
import { default as stackedcolumn } from './define/stackedcolumn.json';
import { default as groupedcolumn } from './define/groupedcolumn.json';
import { default as gauge } from './define/gauge.json';
//import { default as maparea } from './define/maparea.json';
//import { default as district } from './define/district.json';
//import { default as firework } from './define/firework.json';
//import { default as spark } from './define/spark.json';
import { default as custom } from './define/custom.json';
import { default as point } from './define/point.json';
import { default as liquid } from './define/liquid.json';
import { default as pscatter } from './define/p-scatter.json';
import { default as scatter } from './define/scatter.json';
import { default as heatmap } from './define/heatmap.json';
import { default as wordcloud } from './define/wordcloud.json';
export const WIDGETS = [
  text,
  image,
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
  custom,
  //maparea,
  //district,
  //firework,
  //spark,
  funnel,
  point,
  gauge,
  liquid,
  scatter,
  pscatter,
  heatmap,
  wordcloud
];
