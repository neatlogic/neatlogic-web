export const TEXT_COLOR_LIST = [
  {
    color: '#000',
    text: '黑色'
  },
  {
    color: '#bbbfc4',
    text: '灰色'
  },
  {
    color: '#f76964',
    text: '红色'
  },
  {
    color: '#ffa53d',
    text: '橙色'
  },
  {
    color: '#ffe928',
    text: '黄色'
  },
  {
    color: '#62d256',
    text: '绿色'
  },
  {
    color: '#9ebbfe',
    text: '蓝色'
  },
  {
    color: '#c4a4fa',
    text: '紫色'
  }
];

export const BACKGROUND_COLOR_LIST = [
  {
    color: '#dee0e3cc',
    text: '浅灰色'
  },
  ...TEXT_COLOR_LIST.slice(1)
];

export const LIGHT_BACKGROUND_COLOR_LIST = [
  {
    color: '#fff',
    text: '无颜色',
    hasAfter: true
  },
  {
    color: '#bbbfc4',
    text: '浅灰色'
  },
  {
    color: '#fbbfbc',
    text: '浅红色'
  },
  {
    color: '#feddb6',
    text: '浅橙色'
  },
  {
    color: '#fff895',
    text: '浅黄色'
  },
  {
    color: '#c5f1c1',
    text: '浅绿色'
  },
  {
    color: '#cfddfe',
    text: '浅蓝色'
  },
  {
    color: '#dcc9fb',
    text: '浅紫色'
  }
];

export const BLOCK_LIGHT_BACKGROUND_COLOR_LIST = [
  {
    ...LIGHT_BACKGROUND_COLOR_LIST[0],
    text: '透明'
  },
  ...LIGHT_BACKGROUND_COLOR_LIST.slice(1)
];

export const BORDER_COLOR_LIST = [
  {
    color: '#fff',
    text: '透明',
    hasAfter: true
  },
  ...TEXT_COLOR_LIST.slice(1)
];
