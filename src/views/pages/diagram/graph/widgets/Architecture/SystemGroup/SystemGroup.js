import { ObjectExt } from '@antv/x6';

export default {
  name: 'systemGroup',
  type: 'GLOBAL',
  label: '系统群',
  config: {
    inherit: 'rect',
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
        className: 'bg'
      },
      {
        tagName: 'rect',
        selector: 'name-rect',
        className: 'title-bg'
      },
      {
        tagName: 'text',
        selector: 'name-text'
      }
    ],
    attrs: {
      rect: {
        width: 160
      },
      body: {
        stroke: 'none',
        rx: 4,
        ry: 4,
        fill: null
      },
      'name-rect': {
        stroke: 'none',
        height: 30,
        y: 0,
        x: 0,
        rx: 4,
        ry: 4
      },
      'name-text': {
        ref: 'name-rect',
        refY: 0.5,
        refX: 10,
        xAlign: 'left',
        textAnchor: 'start',
        fontWeight: 'bold',
        fill: '#fff',
        fontSize: 12
      }
    },
    propHooks(meta) {
      const { data, ...others } = meta;
      if (!data) {
        return meta;
      }
      const name = data.name;
      const width = data.width;
      const height = data.height;
      ObjectExt.setByPath(others, `attrs/name-text/text`, name);
      ObjectExt.setByPath(others, `attrs/name-rect/width`, width);
      others.size = { width: width, height: height };
      return others;
    }
  },
  data: {
    titleBgColor: null,
    bgColor: null,
    name: '系统群',
    children: ['system']
  },
  prop: {
    width: 200,
    height: 200
  },
  setting: {
    resizable: true
  },
  event: {
    'change:data': ({ cell, current: data }, widget) => {
      const name = data.name;
      const titleBgColor = data.titleBgColor;
      const bgColor = data.bgColor;
      const width = data.width || widget.data.width;
      const height = data.height || widget.data.height;
      const markup = cell.markup;
      const markup_body = markup.find(d => d.selector === 'body');
      const markup_rectname = markup.find(d => d.selector === 'name-rect');
      if (titleBgColor) {
        markup_rectname.style = { fill: titleBgColor };
      } else {
        markup_rectname.style = {};
      }
      if (bgColor) {
        markup_body.style = { fill: bgColor };
      } else {
        markup_body.style = {};
      }
      cell.markup = markup;
      cell.setAttrByPath(`name-text/text`, name);
      cell.setAttrByPath(`name-rect/width`, width);
      cell.resize(width, height);
    }
  },
  restrict(node) {
    //返回子节点可移动空间
    const data = node.getData();
    const width = data['width'];
    const height = data['height'];
    return node.getBBox().moveAndExpand({
      x: 0,
      y: 30,
      width: 0,
      height: -30
    });
  },

  form: [
    {
      name: 'titleBgColor',
      label: '标题背景颜色',
      type: 'slot'
    },
    {
      name: 'bgColor',
      label: '背景颜色',
      type: 'slot'
    },
    {
      name: 'name',
      label: '名称',
      maxlength: 20,
      type: 'text'
    },
    {
      name: 'width',
      label: '宽度',
      type: 'slot'
    },
    {
      name: 'height',
      label: '高度',
      type: 'slot'
    }
  ]
};
