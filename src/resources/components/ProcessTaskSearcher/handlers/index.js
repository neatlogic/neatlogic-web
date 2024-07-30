//按类型区分的处理器，用于常规操作
export { default as userselectTypeHandler } from './userselect.vue';
export { default as selectTypeHandler } from './select.vue';
export { default as teamselectTypeHandler } from './teamselect.vue';
export { default as textareaTypeHandler } from './textarea.vue';
export { default as checkboxTypeHandler } from './checkbox.vue';
export { default as datetimeTypeHandler } from './datetime.vue';
export { default as radioTypeHandler } from './radio.vue';
export { default as timeTypeHandler } from './time.vue';
//按名字和模式区分的处理器，用于特殊操作，以下组件在值发生变化时需要有更复杂的联动
export { default as channel_simple_Handler } from './channelselect.vue';
export { default as stepuser_simple_Handler } from './stepuser.vue';
