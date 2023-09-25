import { ObjectExt } from '@antv/x6';

export default {
  name: 'class',
  type: 'UML',
  label: '类',
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
        tagName: 'rect',
        selector: 'attrs-rect'
      },
      {
        tagName: 'rect',
        selector: 'methods-rect'
      },
      {
        tagName: 'text',
        selector: 'name-text'
      },
      {
        tagName: 'text',
        selector: 'attrs-text'
      },
      {
        tagName: 'text',
        selector: 'methods-text'
      }
    ],
    attrs: {
      rect: {
        width: 160
      },
      body: {
        stroke: '#fff'
      },
      'name-rect': {
        stroke: '#fff',
        strokeWidth: 0.5
      },
      'attrs-rect': {
        stroke: '#fff',
        strokeWidth: 0.5
      },
      'methods-rect': {
        stroke: '#fff',
        strokeWidth: 0.5
      },
      'name-text': {
        ref: 'name-rect',
        refY: 0.5,
        refX: 0.5,
        textAnchor: 'middle',
        fontWeight: 'bold',
        fill: '#fff',
        fontSize: 12
      },
      'attrs-text': {
        ref: 'attrs-rect',
        refY: 0.5,
        refX: 5,
        textAnchor: 'left',
        fill: 'black',
        fontSize: 10
      },
      'methods-text': {
        ref: 'methods-rect',
        refY: 0.5,
        refX: 5,
        textAnchor: 'left',
        fill: 'black',
        fontSize: 10
      }
    },
    propHooks(meta) {
      const { data, ...others } = meta;
      if (!data) {
        return meta;
      }
      const name = data.name;
      const attributes = data.attributes;
      const methods = data.methods;
      const titleBgColor = data.titleBgColor;
      const bgColor = data.bgColor;
      if (titleBgColor) {
        ObjectExt.setByPath(others, `attrs/name-rect/fill`, titleBgColor);
      }
      if (bgColor) {
        ObjectExt.setByPath(others, `attrs/attrs-rect/fill`, bgColor);
        ObjectExt.setByPath(others, `attrs/methods-rect/fill`, bgColor);
      }
      const rects = [
        { type: 'name', text: name },
        { type: 'attrs', text: attributes },
        { type: 'methods', text: methods }
      ];

      let offsetY = 0;
      rects.forEach(rect => {
        const height = rect.text.length * 12 + 16;
        ObjectExt.setByPath(others, `attrs/${rect.type}-text/text`, rect.text.join('\n'));
        ObjectExt.setByPath(others, `attrs/${rect.type}-rect/height`, height);
        ObjectExt.setByPath(others, `attrs/${rect.type}-rect/transform`, 'translate(0,' + offsetY + ')');
        offsetY += height;
      });

      others.size = { width: 160, height: offsetY };
      return others;
    },
    ports: {
      groups: {
        top: {
          markup: {
            tagName: 'circle'
          },
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#31d0c6',
              strokeWidth: 2,
              fill: '#fff'
            }
          },
          zIndex: 99,
          position: 'top'
        },
        right: {
          markup: {
            tagName: 'circle'
          },
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#31d0c6',
              strokeWidth: 2,
              fill: '#fff'
            }
          },
          zIndex: 99,
          position: 'right'
        },
        bottom: {
          markup: {
            tagName: 'circle'
          },
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#31d0c6',
              strokeWidth: 2,
              fill: '#fff'
            }
          },
          zIndex: 99,
          position: 'bottom'
        },
        left: {
          markup: {
            tagName: 'circle'
          },
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#31d0c6',
              strokeWidth: 2,
              fill: '#fff'
            }
          },
          zIndex: 99,
          position: 'left'
        }
      },
      items: [
        { id: 'top', group: 'top' },
        { id: 'right', group: 'right' },
        { id: 'bottom', group: 'bottom' },
        { id: 'left', group: 'left' }
      ]
    }
  },
  data: {
    titleBgColor: '#5f95ff',
    bgColor: '#eff4ff',
    name: ['类名'],
    attributes: ['属性1', '属性2'],
    methods: ['方法1', '方法2'],
    test: 'a'
  },
  event: {
    'change:data': (cell, data, defaultData) => {
      const name = data.name;
      const attributes = data.attributes;
      const methods = data.methods;
      const titleBgColor = data.titleBgColor;
      const bgColor = data.bgColor;
      if (titleBgColor) {
        cell.setAttrByPath(`name-rect/fill`, titleBgColor);
      } else {
        cell.setAttrByPath(`name-rect/fill`, defaultData.titleBgColor);
      }
      if (bgColor) {
        cell.setAttrByPath(`attrs-rect/fill`, bgColor);
        cell.setAttrByPath(`methods-rect/fill`, bgColor);
      } else {
        cell.setAttrByPath(`attrs-rect/fill`, defaultData.bgColor);
        cell.setAttrByPath(`methods-rect/fill`, defaultData.bgColor);
      }
      const rects = [
        { type: 'name', text: name },
        { type: 'attrs', text: attributes },
        { type: 'methods', text: methods }
      ];

      let offsetY = 0;
      rects.forEach(rect => {
        const height = rect.text.length * 12 + 16;
        cell.setAttrByPath(`${rect.type}-text/text`, rect.text.join('\n'));
        cell.setAttrByPath(`${rect.type}-rect/height`, height);
        cell.setAttrByPath(`${rect.type}-rect/transform`, 'translate(0,' + offsetY + ')');
        offsetY += height;
      });
      cell.resize(160, offsetY);
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
      type: 'slot'
    },
    {
      name: 'attributes',
      label: '属性',
      type: 'slot'
    },
    {
      name: 'methods',
      label: '方法',
      type: 'slot'
    }
  ]
};
