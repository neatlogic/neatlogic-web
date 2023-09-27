import { ObjectExt } from '@antv/x6';
export default {
  name: 'system',
  type: 'GLOBAL',
  label: '系统',
  config: {
    inherit: 'rect',
    /*tools: [
      {
        name: 'button-remove',
        args: {
          x: '100%',
          y: 0,
          offset: { x: 10, y: -10 }
        }
      }
    ],*/
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
        className: 'bg-grey'
      },
      {
        tagName: 'text',
        selector: 'name-text'
      }
    ],
    attrs: {
      body: {
        stroke: 'none',
        rx: 5,
        ry: 5
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
      ObjectExt.setByPath(others, `attrs/name-text/text`, name);
      return others;
    }
  },
  data: {
    bgColor: null,
    name: '系统',
    parent: ['systemGroup']
  },
  prop: {
    width: 100,
    height: 30
  },
  event: {
    'change:data': ({ cell, current: data }, widget) => {
      const name = data.name;
      const bgColor = data.bgColor;
      const markup = cell.markup;
      const markup_body = markup.find(d => d.selector === 'body');
      if (bgColor) {
        markup_body.style = { fill: bgColor };
      } else {
        markup_body.style = {};
      }
      cell.markup = markup;
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
