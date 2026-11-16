// 嵌入式配置表单只渲染主体插槽，页面导航和正式保存按钮由宿主接管。
export default {
  functional: true,
  render: (h, ctx) => h('div', ctx.scopedSlots.content())
};
