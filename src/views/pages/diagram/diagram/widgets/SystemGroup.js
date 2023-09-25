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
        selector: 'body'
      },
      {
        tagName: 'rect',
        selector: 'name-rect'
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
        stroke: 'none'
      },
      'name-rect': {
        stroke: 'none',
        height: 30,
        y: -30
      },
      'name-text': {
        ref: 'name-rect',
        refY: 0.5,
        refX: 0.5,
        textAnchor: 'middle',
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
      const titleBgColor = data.titleBgColor;
      const bgColor = data.bgColor;
      const width = data.width;
      const height = data.height;
      if (titleBgColor) {
        ObjectExt.setByPath(others, `attrs/name-rect/fill`, titleBgColor);
      }
      if (bgColor) {
        ObjectExt.setByPath(others, `attrs/body/fill`, bgColor);
      }
      ObjectExt.setByPath(others, `attrs/name-text/text`, name);
      others.size = { width: width, height: height };
      return others;
    }
  },
  data: {
    titleBgColor: '#5f95ff',
    bgColor: '#fff',
    name: '系统群',
    children: ['system'],
    width: 200,
    height: 200
  },
  prop: {
    
  },
  event: {
    'change:data': (cell, data, defaultData) => {
      const name = data.name;
      const titleBgColor = data.titleBgColor;
      const bgColor = data.bgColor;
      const width = data.width || defaultData.width;
      const height = data.height || defaultData.height;
      if (titleBgColor) {
        cell.setAttrByPath(`name-rect/fill`, titleBgColor);
      } else {
        cell.setAttrByPath(`name-rect/fill`, defaultData.titleBgColor);
      }
      if (bgColor) {
        cell.setAttrByPath(`body/fill`, bgColor);
      } else {
        cell.setAttrByPath(`body/fill`, defaultData.bgColor);
      }
      cell.setAttrByPath(`name-text/text`, name);
      cell.resize(width, height);
    }
  },
  setting: {},
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
      type: 'number',
      min: 30
    },
    {
      name: 'height',
      label: '高度',
      type: 'number',
      min: 30
    }
  ]
};
