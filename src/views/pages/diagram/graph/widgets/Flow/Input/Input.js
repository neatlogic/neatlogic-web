import InputVue from './Input.vue';

export default {
  name: 'input',
  type: 'GLOBAL',
  label: '输入数据',
  isVue: true, //需要声明是vue组件
  config: {
    shape: 'input',
    component: InputVue,
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
    name: '名称',
    bgColor: null
  },
  prop: {
    width: 150,
    height: 40
  },
  event: {
  },
  setting: {},
  form: [
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
