import Block from './Block.vue';

export default {
  name: 'block',
  type: 'Architecture',
  label: '方块',
  icon: 'tsfont-component',
  isVue: true, //需要声明是vue组件
  config: {
    shape: 'block',
    component: Block
  },
  data: {
    name: '名称',
    bgColor: null,
    borderColor: null,
    borderStyle: 'none',
    disableDrag: false,
    borderWidth: 1,
    radius: 0
  },
  prop: {
    width: 150,
    height: 40
  },
  event: {},
  setting: { resizable: true },
  form: [
    {
      name: 'name',
      label: '名称',
      type: 'text'
    },
    {
      name: 'borderStyle',
      label: '边框风格',
      type: 'radio',
      dataList: [
        { value: 'none', text: '无边框' },
        { value: 'solid', text: '实线' },
        { value: 'double', text: '双线' },
        { value: 'dotted', text: '点线' },
        { value: 'dashed', text: '虚线' }
      ]
    },
    {
      name: 'borderWidth',
      label: '边框宽度',
      type: 'slot'
    },
    {
      name: 'borderColor',
      label: '边框颜色',
      type: 'slot'
    },
    {
      name: 'bgColor',
      label: '背景颜色',
      type: 'slot'
    },
    {
      name: 'radius',
      label: '圆角',
      type: 'slot'
    },
    {
      name: 'disableDrag',
      label: '禁止拖动',
      type: 'switch'
    }
  ]
};
