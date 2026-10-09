import ChannelBase from './channel-base.vue';
import ChannelEmail from './channel-email.vue';
import ChannelMessage from './channel-message.vue';
import ChannelWechat from './channel-wechat.vue';

const components = {
  EmailNotifyHandler: ChannelEmail,
  MessageNotifyHandler: ChannelMessage,
  WechatNotifyHandler: ChannelWechat
};

// 其他通知处理器也通过统一只读组件完整回显历史配置。
export function getChannelComponent(handler) {
  return components[handler] || ChannelBase;
}

export default components;
