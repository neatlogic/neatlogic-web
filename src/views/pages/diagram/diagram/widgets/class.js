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
        fill: '#5f95ff',
        stroke: '#fff',
        strokeWidth: 0.5
      },
      'attrs-rect': {
        fill: '#eff4ff',
        stroke: '#fff',
        strokeWidth: 0.5
      },
      'methods-rect': {
        fill: '#eff4ff',
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
      } else {
        //this.render(data);
      }
      const name = data.name;
      const attributes = data.attributes;
      const methods = data.methods;
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
    }
  },
  data: {
    name: ['类名'],
    attributes: ['属性1', '属性2'],
    methods: ['方法1', '方法2'],
    test: 'a'
  },
  event: {
    'change:data': (cell, data) => {
      const name = data.name;
      const attributes = data.attributes;
      const methods = data.methods;
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
  setting: {

  },
  form: [
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
