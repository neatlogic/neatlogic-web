import Step from './Step.vue';

export default {
  name: 'step',
  type: 'GLOBAL',
  label: '步骤',
  isVue: true, //需要声明是vue组件
  config: {
    shape: 'step',
    component: Step,
    ports: {
      groups: {
        right: {
          markup: {
            tagName: 'circle'
          },
          attrs: {
            circle: {
              r: 4,
              class: 'port hidden',
              magnet: true,
              strokeWidth: 2
            }
          },
          zIndex: 99,
          position: 'right'
        },
        left: {
          markup: {
            tagName: 'circle'
          },
          attrs: {
            circle: {
              r: 4,
              class: 'port hidden',
              magnet: true,
              strokeWidth: 2
            }
          },
          zIndex: 99,
          position: 'left'
        }
      },
      items: [
        { id: 'right', group: 'right' },
        { id: 'left', group: 'left' }
      ]
    }
  },
  data: {
    num: 1,
    name: '名称',
    bgColor: null
  },
  prop: {
    width: 200,
    height: 40
  },
  event: {},
  setting: {},
  form: [
    {
      name: 'num',
      label: '序号',
      type: 'number'
    },
    {
      name: 'name',
      label: '名称',
      type: 'text'
    },
    {
      name: 'bgColor',
      label: '背景颜色',
      type: 'slot'
    }
  ]
};
