const GRID_COLUMN_COUNT = 12; // 网格列数
const GRID_ROW_HEIGHT = 30; // 网格行高
const GRID_MARGIN_X = 10; // 网格水平间距
const GRID_MARGIN_Y = 10; // 网格垂直间距
const GRID_REFERENCE_WIDTH = 1200; // 网格参考宽度
const PREVIEW_VIEWPORT_ROWS = 14; // 预览视口行数
const PREVIEW_VIEWPORT_HEIGHT = PREVIEW_VIEWPORT_ROWS * (GRID_ROW_HEIGHT + GRID_MARGIN_Y); // 预览视口高度
const PREVIEW_PADDING_MIN = 6; // 预览最小内边距
const PREVIEW_PADDING_MAX = 10; // 预览最大内边距
const PREVIEW_PANEL_RADIUS = 2; // 预览面板圆角
const PREVIEW_TYPE_ALIASES = { // 预览类型别名
  tablechart: 'table',
  tablewidget: 'table'
};

function toPositiveNumber(value, fallback) { // 转换为正数
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function toNumber(value, fallback = 0) { // 转换为数字
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getWidgetPreviewType(widget) { // 获取组件预览类型
  const type = String(widget?.type || '').toLowerCase();
  const normalizedType = PREVIEW_TYPE_ALIASES[type] || type;
  const chartType = String(widget?.chartType || '').toLowerCase();
  const normalizedChartType = PREVIEW_TYPE_ALIASES[chartType] || chartType;
  if (normalizedChartType === 'table') {
    return normalizedChartType;
  }
  if (normalizedType && normalizedType !== 'basic' && normalizedType !== 'chart') {
    return normalizedType;
  }
  return normalizedChartType || normalizedType;
}

function hashString(value) {
  let hash = 2166136261;
  const text = String(value || 'dashboard-preview');
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seedValue) {
  // 同一组件始终生成相同的模拟数据，避免列表滚动或重新挂载后图形跳变。
  let seed = hashString(seedValue) || 1;
  return () => {
    seed += 0x6d2b79f5;
    let result = seed;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function getColumnWidth() {
  return (GRID_REFERENCE_WIDTH - GRID_MARGIN_X * (GRID_COLUMN_COUNT + 1)) / GRID_COLUMN_COUNT;
}

function getWidgetGridRect(widget) {
  const columnWidth = getColumnWidth();
  const x = Math.max(toNumber(widget?.x), 0);
  const y = Math.max(toNumber(widget?.y), 0);
  const width = toPositiveNumber(widget?.w, 1);
  const height = toPositiveNumber(widget?.h, 1);
  return {
    x: GRID_MARGIN_X + x * (columnWidth + GRID_MARGIN_X),
    y: GRID_MARGIN_Y + y * (GRID_ROW_HEIGHT + GRID_MARGIN_Y),
    width: width * columnWidth + Math.max(width - 1, 0) * GRID_MARGIN_X,
    height: height * GRID_ROW_HEIGHT + Math.max(height - 1, 0) * GRID_MARGIN_Y
  };
}

export function getDashboardMixLayout(widgetList = []) {
  // 先裁掉仪表板外围空白，再保留组件之间由真实网格产生的相对间距。
  const widgetRects = widgetList.map(widget => ({
    widget,
    rect: getWidgetGridRect(widget)
  }));
  const minLeft = widgetRects.reduce((min, item) => Math.min(min, item.rect.x), Number.POSITIVE_INFINITY);
  const minTop = widgetRects.reduce((min, item) => Math.min(min, item.rect.y), Number.POSITIVE_INFINITY);
  const maxRight = widgetRects.reduce((max, item) => Math.max(max, item.rect.x + item.rect.width), Number.NEGATIVE_INFINITY);
  const maxBottom = widgetRects.reduce((max, item) => Math.max(max, item.rect.y + item.rect.height), Number.NEGATIVE_INFINITY);
  const bounds = widgetRects.length
    ? {
      x: minLeft,
      y: minTop,
      width: Math.max(maxRight - minLeft, 1),
      height: Math.max(maxBottom - minTop, 1)
    }
    : {
      x: 0,
      y: 0,
      width: GRID_REFERENCE_WIDTH,
      height: GRID_ROW_HEIGHT
    };
  // 复杂仪表板只渲染顶部一屏，避免所有纵向内容被压缩到固定高度的列表卡片中。
  const previewHeight = Math.min(bounds.height, PREVIEW_VIEWPORT_HEIGHT);
  const previewBounds = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: Math.max(previewHeight, 1)
  };
  const previewBottom = previewBounds.y + previewBounds.height;
  const visibleWidgetRects = widgetRects.filter(({ rect }) => (
    rect.y < previewBottom && rect.y + rect.height > previewBounds.y
  ));
  return {
    width: bounds.width,
    height: bounds.height,
    bounds,
    widgetRects,
    previewBounds,
    visibleWidgetRects,
    hasOverflow: bounds.height > previewBounds.height
  };
}

function getPreviewPadding(stageSize) {
  const minSize = Math.min(toPositiveNumber(stageSize?.width, 1), toPositiveNumber(stageSize?.height, 1));
  return Math.max(Math.min(minSize * 0.04, PREVIEW_PADDING_MAX), PREVIEW_PADDING_MIN);
}

function getRegion(rect, layout, stageSize) {
  const bounds = layout.previewBounds || layout.bounds || { x: 0, y: 0, width: layout.width, height: layout.height };
  const stageWidth = toPositiveNumber(stageSize?.width, 1);
  const stageHeight = toPositiveNumber(stageSize?.height, 1);
  const padding = getPreviewPadding(stageSize);
  const contentWidth = Math.max(stageWidth - padding * 2, 1);
  const contentHeight = Math.max(stageHeight - padding * 2, 1);
  const layoutWidth = Math.max(bounds.width, 1);
  const layoutHeight = Math.max(bounds.height, 1);
  // 列表缩略图优先保证画面饱满和组件可辨识，因此在两个方向分别映射完整布局。
  const scaleX = contentWidth / layoutWidth;
  const scaleY = contentHeight / layoutHeight;
  const originX = padding;
  const originY = padding;
  const startX = originX + (rect.x - bounds.x) * scaleX;
  const startY = originY + (rect.y - bounds.y) * scaleY;
  const endX = originX + (rect.x + rect.width - bounds.x) * scaleX;
  const endY = originY + (rect.y + rect.height - bounds.y) * scaleY;
  return {
    start: {
      x: Math.max(Math.min(startX / stageWidth, 1), 0),
      y: Math.max(Math.min(startY / stageHeight, 1), 0)
    },
    end: {
      x: Math.max(Math.min(endX / stageWidth, 1), 0),
      y: Math.max(Math.min(endY / stageHeight, 1), 0)
    }
  };
}

function flattenColors(value, result = []) {
  if (typeof value === 'string' && value.trim()) {
    result.push(value);
  } else if (Array.isArray(value)) {
    value.forEach(item => flattenColors(item, result));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(item => flattenColors(item, result));
  }
  return result;
}

function getWidgetPalette(widget, theme) {
  const configured = flattenColors(widget?.config?.color);
  const rangeColors = flattenColors(widget?.config?.range?.color);
  const colors = [...configured, ...rangeColors].filter((color, index, list) => list.indexOf(color) === index);
  return colors.length ? colors : theme.palette;
}

function getWidgetBackground(widget, theme) {
  return widget?.config?.backgroundColor || widget?.config?.background?.color?.value || theme.panelColor;
}

function getFieldValues(widget) {
  return (widget?.fields || []).reduce((result, field) => {
    if (field?.name) {
      result[field.name] = field.value;
    }
    return result;
  }, {});
}

function getDetailLevel(region, stageSize) {
  // 图形过小时只减少标签、数据点和装饰，不隐藏任何组件。
  const width = Math.abs(region.end.x - region.start.x) * stageSize.width;
  const height = Math.abs(region.end.y - region.start.y) * stageSize.height;
  const minSize = Math.min(width, height);
  if (minSize < 28) {
    return 0;
  }
  if (minSize < 64) {
    return 1;
  }
  return 2;
}

function getDataCount(detailLevel) {
  return detailLevel === 0 ? 3 : detailLevel === 1 ? 5 : 8;
}

function createCategoryData(widget, count, multiple = false) {
  const random = createRandom(`${widget?.uuid || widget?.i || widget?.name}-${widget?.type}`);
  const result = [];
  const seriesList = multiple ? ['A', 'B'] : ['A'];
  for (let index = 0; index < count; index += 1) {
    seriesList.forEach((series, seriesIndex) => {
      result.push({
        xField: `${index + 1}`,
        yField: Math.round(20 + random() * 70 + seriesIndex * 4),
        seriesField: series,
        colorField: series,
        sizeField: Math.round(3 + random() * 8)
      });
    });
  }
  return result;
}

function createPieData(widget, count) {
  const random = createRandom(`${widget?.uuid || widget?.i || widget?.name}-pie`);
  return Array.from({ length: count }, (item, index) => ({
    colorField: `${index + 1}`,
    angleField: Math.round(15 + random() * 70)
  }));
}

function createScatterData(widget, count) {
  const random = createRandom(`${widget?.uuid || widget?.i || widget?.name}-scatter`);
  return Array.from({ length: count }, (item, index) => ({
    xField: Math.round(random() * 100),
    yField: Math.round(random() * 100),
    colorField: index % 2 ? 'B' : 'A',
    sizeField: Math.round(3 + random() * 8)
  }));
}

function createFunnelData(widget, count) {
  const random = createRandom(`${widget?.uuid || widget?.i || widget?.name}-funnel`);
  let value = 100;
  return Array.from({ length: count }, (item, index) => {
    value -= Math.round(7 + random() * 11);
    return { xField: `${index + 1}`, yField: Math.max(value, 12) };
  });
}

function getCoordinateBox(view) {
  const coordinate = view.getCoordinate();
  const left = Math.min(coordinate.start.x, coordinate.end.x);
  const top = Math.min(coordinate.start.y, coordinate.end.y);
  return {
    x: left,
    y: top,
    width: Math.abs(coordinate.end.x - coordinate.start.x),
    height: Math.abs(coordinate.end.y - coordinate.start.y)
  };
}

function addText(container, text, x, y, style = {}) {
  container.addShape('text', {
    attrs: {
      x,
      y,
      text: String(text ?? ''),
      fill: style.fill,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      textAlign: style.textAlign || 'center',
      textBaseline: style.textBaseline || 'middle'
    }
  });
}

function getTextAlignment(widget, box) {
  const align = widget?.config?.align;
  if (align === 'left') {
    return { x: box.x + Math.max(box.width * 0.08, 3), textAlign: 'left' };
  }
  if (align === 'right') {
    return { x: box.x + box.width - Math.max(box.width * 0.08, 3), textAlign: 'right' };
  }
  return { x: box.x + box.width / 2, textAlign: 'center' };
}

function createPanelAnnotation(widget, theme) {
  return {
    type: 'shape',
    top: false,
    render(container, view) {
      const box = getCoordinateBox(view);
      // Shape annotation 必须返回 Group；直接添加多个图元会只保留最后一个。
      const group = container.addGroup();
      group.addShape('rect', {
        attrs: {
          x: box.x + 0.5,
          y: box.y + 0.5,
          width: Math.max(box.width - 1, 0),
          height: Math.max(box.height - 1, 0),
          radius: PREVIEW_PANEL_RADIUS,
          fill: getWidgetBackground(widget, theme),
          stroke: theme.borderColor,
          lineWidth: 1
        }
      });
      return group;
    }
  };
}

function createContentAnnotation(draw) {
  return {
    type: 'shape',
    top: true,
    render(container, view) {
      // 每个非标准组件独占一个 Group，保证面板背景不会覆盖内部图元。
      const group = container.addGroup();
      draw(group, getCoordinateBox(view));
      return group;
    }
  };
}

function createBaseView(widget, region, theme, labels, detailLevel, contentAnnotation) {
  const tableViewConfig = getWidgetPreviewType(widget) === 'table'
    ? createTableViewConfig(widget, theme, labels, detailLevel)
    : null;
  const annotations = [createPanelAnnotation(widget, theme)];
  if (contentAnnotation) {
    annotations.push(contentAnnotation);
  }
  return {
    region,
    data: tableViewConfig ? tableViewConfig.data : [{ x: 0, y: 0 }],
    meta: tableViewConfig?.meta,
    axes: false,
    geometries: tableViewConfig ? tableViewConfig.geometries : [],
    tooltip: false,
    animation: false,
    interactions: [],
    annotations
  };
}

function createCommonPlotOptions(widget, theme, data, detailLevel) {
  return {
    data,
    padding: detailLevel === 0 ? [2, 2, 2, 2] : detailLevel === 1 ? [4, 4, 4, 4] : [5, 6, 5, 6],
    appendPadding: 0,
    animation: false,
    interactions: [],
    tooltip: false,
    legend: false,
    label: false,
    xAxis: false,
    yAxis: false,
    color: getWidgetPalette(widget, theme)
  };
}

function createStandardPlots(widget, region, detailLevel, theme) {
  // G2Plot 原生支持的类型通过 Mix plot adaptor 绘制，其余类型使用静态图元。
  const type = getWidgetPreviewType(widget);
  const count = getDataCount(detailLevel);
  const multiple = ['mline', 'marea', 'groupedcolumn', 'stackedcolumn', 'stackedbar'].includes(type);
  const data = createCategoryData(widget, count, multiple);
  const common = createCommonPlotOptions(widget, theme, data, detailLevel);

  if (type === 'line' || type === 'mline') {
    return [{
      type: 'line',
      region,
      options: {
        ...common,
        xField: 'xField',
        yField: 'yField',
        seriesField: type === 'mline' ? 'seriesField' : undefined,
        smooth: !!widget?.config?.smooth,
        lineStyle: { lineWidth: detailLevel === 0 ? 1 : 2 },
        point: detailLevel > 0 ? { size: 2 } : false
      }
    }];
  }
  if (type === 'area' || type === 'marea') {
    return [{
      type: 'area',
      region,
      options: {
        ...common,
        xField: 'xField',
        yField: 'yField',
        seriesField: type === 'marea' ? 'seriesField' : undefined,
        isStack: type === 'marea',
        smooth: !!widget?.config?.smooth,
        areaStyle: { fillOpacity: 0.45 }
      }
    }];
  }
  if (['column', 'groupedcolumn', 'stackedcolumn'].includes(type)) {
    return [{
      type: 'column',
      region,
      options: {
        ...common,
        xField: 'xField',
        yField: 'yField',
        seriesField: type === 'column' ? undefined : 'seriesField',
        isGroup: type === 'groupedcolumn',
        isStack: type === 'stackedcolumn',
        columnWidthRatio: Math.min(toPositiveNumber(widget?.config?.columnWidthRatio, 0.55), 0.8)
      }
    }];
  }
  if (type === 'bar' || type === 'stackedbar') {
    return [{
      type: 'bar',
      region,
      options: {
        ...common,
        xField: 'yField',
        yField: 'xField',
        seriesField: type === 'stackedbar' ? 'seriesField' : undefined,
        isStack: type === 'stackedbar',
        barWidthRatio: Math.min(toPositiveNumber(widget?.config?.barWidthRatio, 0.55), 0.8)
      }
    }];
  }
  if (type === 'pie') {
    return [{
      type: 'pie',
      region,
      options: {
        ...common,
        data: createPieData(widget, Math.max(3, Math.min(count, 6))),
        angleField: 'angleField',
        colorField: 'colorField',
        radius: 0.78,
        innerRadius: toNumber(widget?.config?.innerRadius, 0.45),
        statistic: false
      }
    }];
  }
  if (type === 'scatter' || type === 'pscatter') {
    return [{
      type: 'scatter',
      region,
      options: {
        ...common,
        data: createScatterData(widget, count + 2),
        xField: 'xField',
        yField: 'yField',
        colorField: 'colorField',
        sizeField: type === 'scatter' ? 'sizeField' : undefined,
        size: type === 'scatter' ? [2, detailLevel === 0 ? 3 : 6] : detailLevel === 0 ? 2 : 4,
        shape: 'circle'
      }
    }];
  }
  if (type === 'funnel') {
    return [{
      type: 'funnel',
      region,
      options: {
        ...common,
        data: createFunnelData(widget, Math.max(3, Math.min(count, 6))),
        xField: 'xField',
        yField: 'yField',
        dynamicHeight: true,
        conversionTag: false
      }
    }];
  }
  if (type === 'gauge') {
    const random = createRandom(`${widget?.uuid || widget?.i || widget?.name}-gauge`);
    return [{
      type: 'gauge',
      region,
      options: {
        ...common,
        percent: 0.42 + random() * 0.4,
        range: {
          color: getWidgetPalette(widget, theme),
          width: 8
        },
        statistic: false
      }
    }];
  }
  if (type === 'columnline') {
    const columnPlot = {
      type: 'column',
      region,
      options: {
        ...common,
        xField: 'xField',
        yField: 'yField',
        columnWidthRatio: 0.45,
        color: getWidgetPalette(widget, theme)[0]
      }
    };
    const linePlot = {
      type: 'line',
      region,
      options: {
        ...common,
        data: data.map(item => ({ ...item, yField: Math.max(item.yField - 12, 4) })),
        xField: 'xField',
        yField: 'yField',
        color: getWidgetPalette(widget, theme)[1] || theme.accentColor,
        lineStyle: { lineWidth: 2 },
        point: false
      }
    };
    return [columnPlot, linePlot];
  }
  return [];
}

function drawNumber(container, box, widget, theme, labels, detailLevel) {
  const values = getFieldValues(widget);
  const number = values.number ?? 42;
  const title = values.text || widget?.name || labels.data;
  const color = widget?.config?.numberFontColor || getWidgetPalette(widget, theme)[0];
  const alignment = getTextAlignment(widget, box);
  if (detailLevel > 0) {
    addText(container, title, alignment.x, box.y + box.height * 0.38, {
      fill: widget?.config?.textFontColor || theme.mutedTextColor,
      fontSize: Math.max(Math.min(box.height * 0.13, 12), 7),
      textAlign: alignment.textAlign
    });
  }
  addText(container, number, alignment.x, box.y + box.height * (detailLevel > 0 ? 0.62 : 0.5), {
    fill: color,
    fontSize: Math.max(Math.min(box.height * 0.28, box.width * 0.2, 24), 8),
    fontWeight: 500,
    textAlign: alignment.textAlign
  });
}

function drawText(container, box, widget, theme, labels, detailLevel) {
  const values = getFieldValues(widget);
  const content = values.text || widget?.name || labels.data;
  const alignment = getTextAlignment(widget, box);
  addText(container, content, alignment.x, box.y + box.height / 2, {
    fill: widget?.config?.color || theme.textColor,
    fontSize: Math.max(Math.min(toPositiveNumber(widget?.config?.fontsize, 12), box.height * 0.3, 16), detailLevel === 0 ? 6 : 8),
    textAlign: alignment.textAlign
  });
}

function createTableViewConfig(widget, theme, labels, detailLevel) {
  const columnCount = 3;
  const bodyRowCount = detailLevel === 2 ? 2 : 1;
  const fieldList = Array.isArray(widget?.fields) ? widget.fields : [];
  const data = [];
  for (let row = 0; row <= bodyRowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      data.push({
        column: `${column + 1}`,
        row: row === 0 ? 'header' : `body${row}`,
        tone: row === 0 ? 'header' : 'body',
        text: row === 0
          ? fieldList[column]?.label || fieldList[column]?.name || `${labels.column}${column + 1}`
          : '—'
      });
    }
  }
  return {
    data,
    meta: {
      column: { type: 'cat' },
      row: {
        type: 'cat',
        values: Array.from({ length: bodyRowCount }, (item, index) => `body${bodyRowCount - index}`).concat('header')
      }
    },
    geometries: [{
      type: 'polygon',
      xField: 'column',
      yField: 'row',
      colorField: 'tone',
      customMappingField: 'tone',
      mapping: {
        color: ({ tone }) => tone === 'header' ? theme.tableHeaderColor : theme.panelColor,
        style: {
          stroke: theme.gridColor || theme.borderColor,
          lineWidth: 1
        }
      },
      tooltipFields: false,
      label: detailLevel > 0
        ? {
          fields: ['text'],
          callback: text => ({ content: String(text).slice(0, 10) }),
          style: { fill: theme.mutedTextColor, fontSize: detailLevel === 2 ? 9 : 7 },
          offset: 0
        }
        : false
    }]
  };
}

function drawRadar(container, box, widget, theme, detailLevel) {
  const random = createRandom(`${widget?.uuid || widget?.i || widget?.name}-radar`);
  const count = detailLevel === 0 ? 4 : 6;
  const radius = Math.max(Math.min(box.width, box.height) * 0.36, 3);
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const outer = [];
  const values = [];
  for (let index = 0; index < count; index += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
    outer.push([center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius]);
    const valueRadius = radius * (0.45 + random() * 0.45);
    values.push([center.x + Math.cos(angle) * valueRadius, center.y + Math.sin(angle) * valueRadius]);
  }
  outer.forEach(point => container.addShape('line', { attrs: { x1: center.x, y1: center.y, x2: point[0], y2: point[1], stroke: theme.gridColor || theme.borderColor, lineWidth: 1 } }));
  [0.45, 0.72, 1].forEach(scale => {
    const ring = outer.map(point => [center.x + (point[0] - center.x) * scale, center.y + (point[1] - center.y) * scale]);
    container.addShape('path', { attrs: { path: getClosedPath(ring), stroke: theme.gridColor || theme.borderColor, fill: null, lineWidth: 1 } });
  });
  const color = getWidgetPalette(widget, theme)[0];
  container.addShape('path', { attrs: { path: getClosedPath(values), stroke: color, fill: color, fillOpacity: 0.3, lineWidth: detailLevel === 0 ? 1 : 2 } });
  if (detailLevel > 0) {
    values.forEach(point => container.addShape('circle', { attrs: { x: point[0], y: point[1], r: 1.5, fill: color } }));
  }
}

function getClosedPath(points) {
  if (!points.length) {
    return [];
  }
  return [
    ['M', points[0][0], points[0][1]],
    ...points.slice(1).map(point => ['L', point[0], point[1]]),
    ['Z']
  ];
}

function getSectorPath(cx, cy, radius, startAngle, endAngle) {
  // 使用折线近似圆弧，规避 Mix annotation 中 SVG Arc 路径兼容不一致的问题。
  const segmentCount = 8;
  const points = [[cx, cy]];
  for (let index = 0; index <= segmentCount; index += 1) {
    const angle = startAngle + ((endAngle - startAngle) * index) / segmentCount;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return getClosedPath(points);
}

function drawRose(container, box, widget, theme, detailLevel) {
  const count = detailLevel === 0 ? 4 : 6;
  const random = createRandom(`${widget?.uuid || widget?.i || widget?.name}-rose`);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const maxRadius = Math.max(Math.min(box.width, box.height) * 0.38, 3);
  const palette = getWidgetPalette(widget, theme);
  for (let index = 0; index < count; index += 1) {
    const start = -Math.PI / 2 + (Math.PI * 2 * index) / count + 0.03;
    const end = -Math.PI / 2 + (Math.PI * 2 * (index + 1)) / count - 0.03;
    const radius = maxRadius * (0.45 + random() * 0.55);
    container.addShape('path', {
      attrs: {
        path: getSectorPath(cx, cy, radius, start, end),
        fill: palette[index % palette.length],
        fillOpacity: 0.78 + (index % 3) * 0.1,
        stroke: theme.panelColor,
        lineWidth: detailLevel === 0 ? 0.5 : 1
      }
    });
  }
}

function drawLiquid(container, box, widget, theme) {
  const color = getWidgetPalette(widget, theme)[0];
  const radius = Math.max(Math.min(box.width, box.height) * 0.34, 3);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  container.addShape('circle', { attrs: { x: cx, y: cy, r: radius, stroke: color, lineWidth: 2, fill: theme.panelColor } });
  container.addShape('path', {
    attrs: {
      path: [
        ['M', cx - radius * 0.82, cy + radius * 0.1],
        ['C', cx - radius * 0.35, cy - radius * 0.15, cx + radius * 0.25, cy + radius * 0.3, cx + radius * 0.82, cy],
        ['L', cx + radius * 0.72, cy + radius * 0.55],
        ['C', cx + radius * 0.2, cy + radius * 0.82, cx - radius * 0.25, cy + radius * 0.82, cx - radius * 0.72, cy + radius * 0.55],
        ['Z']
      ],
      fill: color,
      fillOpacity: 0.7
    }
  });
}

function drawHeatmap(container, box, widget, theme, detailLevel) {
  const random = createRandom(`${widget?.uuid || widget?.i || widget?.name}-heatmap`);
  const columns = detailLevel === 0 ? 3 : 5;
  const rows = detailLevel === 2 ? 4 : 3;
  const padding = Math.max(Math.min(box.width, box.height) * 0.1, 2);
  const cellWidth = (box.width - padding * 2) / columns;
  const cellHeight = (box.height - padding * 2) / rows;
  const color = getWidgetPalette(widget, theme)[0];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      container.addShape('rect', {
        attrs: {
          x: box.x + padding + column * cellWidth + 1,
          y: box.y + padding + row * cellHeight + 1,
          width: Math.max(cellWidth - 2, 1),
          height: Math.max(cellHeight - 2, 1),
          fill: color,
          fillOpacity: 0.18 + random() * 0.75
        }
      });
    }
  }
}

function drawBullet(container, box, widget, theme) {
  const palette = getWidgetPalette(widget, theme);
  const left = box.x + box.width * 0.1;
  const width = box.width * 0.8;
  const height = Math.max(box.height * 0.24, 3);
  const top = box.y + (box.height - height) / 2;
  container.addShape('rect', { attrs: { x: left, y: top, width, height, fill: palette[0], fillOpacity: 0.18 } });
  container.addShape('rect', { attrs: { x: left, y: top + height * 0.22, width: width * 0.68, height: height * 0.56, fill: palette[1] || palette[0] } });
  const targetX = left + width * 0.82;
  container.addShape('line', { attrs: { x1: targetX, y1: top - 2, x2: targetX, y2: top + height + 2, stroke: theme.textColor, lineWidth: 2 } });
}

function drawWordcloud(container, box, widget, theme, detailLevel, labels) {
  const words = [widget?.name, labels.data, 'AntV', 'Dashboard', 'Chart', 'View'].filter(Boolean);
  const positions = [[0.5, 0.48], [0.25, 0.3], [0.72, 0.28], [0.28, 0.7], [0.68, 0.7], [0.5, 0.82]];
  const palette = getWidgetPalette(widget, theme);
  words.slice(0, detailLevel === 0 ? 2 : detailLevel === 1 ? 4 : 6).forEach((word, index) => {
    addText(container, word, box.x + box.width * positions[index][0], box.y + box.height * positions[index][1], {
      fill: palette[index % palette.length],
      fontSize: Math.max(Math.min(box.height * (index === 0 ? 0.18 : 0.1), index === 0 ? 20 : 12), 6),
      fontWeight: index === 0 ? 500 : 400
    });
  });
}

function drawPoints(container, box, widget, theme, detailLevel) {
  const random = createRandom(`${widget?.uuid || widget?.i || widget?.name}-points`);
  const palette = getWidgetPalette(widget, theme);
  const count = detailLevel === 0 ? 4 : detailLevel === 1 ? 9 : 16;
  for (let index = 0; index < count; index += 1) {
    container.addShape('circle', {
      attrs: {
        x: box.x + box.width * (0.08 + random() * 0.84),
        y: box.y + box.height * (0.1 + random() * 0.8),
        r: Math.max(Math.min(box.width, box.height) * (0.025 + random() * 0.025), 1.5),
        fill: palette[index % palette.length],
        fillOpacity: 0.45 + random() * 0.5
      }
    });
  }
}

function drawMap(container, box, widget, theme) {
  const color = getWidgetPalette(widget, theme)[0];
  const points = [
    [0.15, 0.38], [0.28, 0.18], [0.47, 0.24], [0.58, 0.14], [0.82, 0.3],
    [0.75, 0.52], [0.86, 0.68], [0.63, 0.82], [0.44, 0.7], [0.25, 0.8], [0.12, 0.6]
  ].map(point => [box.x + box.width * point[0], box.y + box.height * point[1]]);
  container.addShape('polygon', { attrs: { points, fill: color, fillOpacity: 0.25, stroke: color, lineWidth: 1.5 } });
  [[0.35, 0.42], [0.58, 0.42], [0.68, 0.63]].forEach(point => {
    container.addShape('circle', { attrs: { x: box.x + box.width * point[0], y: box.y + box.height * point[1], r: 2.5, fill: color } });
  });
}

function drawCustom(container, box, widget, theme, labels, detailLevel) {
  const palette = getWidgetPalette(widget, theme);
  const padding = Math.max(Math.min(box.width, box.height) * 0.1, 2);
  const blockHeight = Math.max((box.height - padding * 3) * 0.32, 2);
  container.addShape('rect', { attrs: { x: box.x + padding, y: box.y + padding, width: box.width - padding * 2, height: blockHeight, radius: 2, fill: palette[0], fillOpacity: 0.2 } });
  container.addShape('rect', { attrs: { x: box.x + padding, y: box.y + padding * 2 + blockHeight, width: (box.width - padding * 3) * 0.55, height: Math.max(box.height - padding * 3 - blockHeight, 2), radius: 2, fill: palette[0], fillOpacity: 0.55 } });
  container.addShape('rect', { attrs: { x: box.x + padding * 2 + (box.width - padding * 3) * 0.55, y: box.y + padding * 2 + blockHeight, width: (box.width - padding * 3) * 0.45, height: Math.max(box.height - padding * 3 - blockHeight, 2), radius: 2, fill: palette[1] || palette[0], fillOpacity: 0.35 } });
  if (detailLevel === 2) {
    addText(container, widget?.name || labels.custom, box.x + box.width / 2, box.y + padding + blockHeight / 2, { fill: theme.textColor, fontSize: Math.max(Math.min(blockHeight * 0.35, 10), 6) });
  }
}

function drawUnsupported(container, box, widget, theme, labels, detailLevel) {
  if (detailLevel === 0) {
    container.addShape('line', { attrs: { x1: box.x + box.width * 0.25, y1: box.y + box.height * 0.5, x2: box.x + box.width * 0.75, y2: box.y + box.height * 0.5, stroke: theme.mutedTextColor, lineWidth: 1 } });
    return;
  }
  addText(container, widget?.name || labels.unsupported, box.x + box.width / 2, box.y + box.height / 2, {
    fill: theme.mutedTextColor,
    fontSize: Math.max(Math.min(box.height * 0.16, 11), 7)
  });
}

function createNonStandardAnnotation(widget, theme, labels, detailLevel) {
  // 非标准组件只表达结构和类型，不执行真实模板、地图、粒子或时间运行逻辑。
  return createContentAnnotation((container, box) => {
    switch (getWidgetPreviewType(widget)) {
      case 'number':
        drawNumber(container, box, widget, theme, labels, detailLevel);
        break;
      case 'text':
        drawText(container, box, widget, theme, labels, detailLevel);
        break;
      case 'table':
        drawTable(container, box, widget, theme, labels, detailLevel);
        break;
      case 'time':
        drawText(container, box, { ...widget, fields: [{ name: 'text', value: labels.currentTime }] }, theme, labels, detailLevel);
        break;
      case 'radar':
        drawRadar(container, box, widget, theme, detailLevel);
        break;
      case 'rose':
        drawRose(container, box, widget, theme, detailLevel);
        break;
      case 'liquid':
        drawLiquid(container, box, widget, theme);
        break;
      case 'heatmap':
        drawHeatmap(container, box, widget, theme, detailLevel);
        break;
      case 'bullet':
        drawBullet(container, box, widget, theme);
        break;
      case 'wordcloud':
        drawWordcloud(container, box, widget, theme, detailLevel, labels);
        break;
      case 'point':
        drawPoints(container, box, widget, theme, detailLevel);
        break;
      case 'maparea':
      case 'district':
        drawMap(container, box, widget, theme);
        break;
      case 'custom':
        drawCustom(container, box, widget, theme, labels, detailLevel);
        break;
      default:
        drawUnsupported(container, box, widget, theme, labels, detailLevel);
    }
  });
}

const STANDARD_PLOT_TYPES = new Set([
  'line', 'mline', 'area', 'marea', 'column', 'groupedcolumn', 'stackedcolumn',
  'bar', 'stackedbar', 'pie', 'scatter', 'pscatter', 'funnel', 'gauge', 'columnline'
]);

export function buildDashboardMixOptions(layout, stageSize, theme, labels) {
  const views = [];
  const plots = [];
  const visibleWidgetRects = layout.visibleWidgetRects || layout.widgetRects;
  visibleWidgetRects.forEach(({ widget, rect }) => {
    const region = getRegion(rect, layout, stageSize);
    const detailLevel = getDetailLevel(region, stageSize);
    const previewType = getWidgetPreviewType(widget);
    const isStandardPlot = STANDARD_PLOT_TYPES.has(previewType);
    const contentAnnotation = isStandardPlot || previewType === 'table' ? null : createNonStandardAnnotation(widget, theme, labels, detailLevel);
    views.push(createBaseView(widget, region, theme, labels, detailLevel, contentAnnotation));
    if (isStandardPlot) {
      plots.push(...createStandardPlots(widget, region, detailLevel, theme));
    }
  });
  return {
    renderer: 'canvas',
    width: stageSize.width,
    height: stageSize.height,
    autoFit: false,
    pixelRatio: Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, 2),
    padding: 0,
    appendPadding: 0,
    syncViewPadding: false,
    animation: false,
    defaultInteractions: [],
    interactions: [],
    tooltip: false,
    legend: false,
    useDeferredLabel: false,
    data: [],
    views,
    plots
  };
}
