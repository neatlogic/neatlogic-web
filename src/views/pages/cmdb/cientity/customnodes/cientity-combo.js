import { BaseCombo, ExtensionCategory, register } from '@antv/g6';

class RectCombo extends BaseCombo {
  // 获取 keyShape 的样式，使用 rect
  getKeyStyle(attributes) {
    const style = super.getKeyStyle(attributes);
    const [width, height] = this.getKeySize(attributes);
    return {
      ...style,
      width,
      height,
      x: -width / 2,
      y: -height / 2,
      fill: '#ddd',
      fillOpacity: 0.2,
      //stroke: '#54BECC',
      lineWidth: 0
    };
  }

  // 绘制主图形为 rect
  drawKeyShape(attributes, container) {
    const shape = this.upsert('key', 'rect', this.getKeyStyle(attributes), container);
    return shape;
  }

  // 绘制收起/展开按钮
  drawCollapseButton(attributes, container) {
    const { collapsed } = attributes;
    const [width] = this.getKeySize(attributes);
    const btnR = 8;
    const x = width / 2 + btnR + 2;
    const hitArea = this.upsert('hit-area', 'circle', {
      cx: x,
      r: 8,
      //fill: '#fff',
      //stroke: '#54BECC',
      cursor: 'pointer'
    }, container);

    this.upsert('button-icon', 'text', {
      x: x,
      y: 0,
      text: '\ue953',
      fontFamily: 'tsfont', // 你的字体名
      fontSize: 16,
      fill: '#ccc',
      textAlign: 'center',
      textBaseline: 'middle',
      cursor: 'pointer'
    }, hitArea);
  }

  // 重写render方法，添加更多自定义图形
  render(attributes, container) {
    super.render(attributes, container);
    this.drawCollapseButton(attributes, container);
  }

  // 生命周期钩子：绑定点击事件
  onCreate() {
    this.shapeMap['hit-area'].addEventListener('click', () => {
      const { graph } = this.context;
      //const nodes = graph.getNodeData();
      //const childNodes = nodes.filter(node => node.combo && node.combo === this.id);
      const combo = graph.getNodeData(this.id);
      if (combo.data.onClick && typeof combo.data.onClick === 'function') {
        combo.data.onClick({combo: combo});
      }
    });
  }
}

register(ExtensionCategory.COMBO, 'cientity-combo', RectCombo);
