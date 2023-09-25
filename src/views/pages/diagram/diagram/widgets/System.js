import { ObjectExt } from '@antv/x6';

export default {
  name: 'system',
  type: 'GLOBAL',
  label: '系统',
  config: {
    inherit: 'rect',
    markup: [
      {
        tagName: 'rect',
        selector: 'body'
      },
      {
        tagName: 'text',
        selector: 'name-text'
      }
    ],
    attrs: {
      body: {
        stroke: 'none'
      },
      'name-text': {
        ref: 'body',
        refY: 0.5,
        refX: 0.5,
        textAnchor: 'middle',
        fontWeight: 'bold',
        fontSize: 12
      }
    },
    propHooks(meta) {
      const { data, ...others } = meta;
      if (!data) {
        return meta;
      }
      const name = data.name;
      const bgColor = data.bgColor;
      if (bgColor) {
        ObjectExt.setByPath(others, `attrs/body/fill`, bgColor);
      }
      ObjectExt.setByPath(others, `attrs/name-text/text`, name);
      return others;
    }
  },
  data: {
    bgColor: '#eff4ff',
    name: '系统群',
    parent: ['systemGroup']
  },
  prop: {
    width: 100,
    height: 80
  },
  event: {
    'change:data': (cell, data, defaultData) => {
      const name = data.name;
      const bgColor = data.bgColor;
      if (bgColor) {
        cell.setAttrByPath(`body/fill`, bgColor);
      } else {
        cell.setAttrByPath(`body/fill`, defaultData.bgColor);
      }
      cell.setAttrByPath(`name-text/text`, name);
    }
  },
  setting: {},
  form: [
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
    }
  ]
};
