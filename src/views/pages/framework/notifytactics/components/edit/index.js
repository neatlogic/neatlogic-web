import ChannelBase from './channel-base.vue';
import ChannelEmail from './channel-email.vue';
import ChannelMessage from './channel-message.vue';
import ChannelWechat from './channel-wechat.vue';

const components = {
  EmailNotifyHandler: ChannelEmail,
  MessageNotifyHandler: ChannelMessage,
  WechatNotifyHandler: ChannelWechat
};

// 未单独实现的通知处理器仍使用通用模板和接收人配置。
export function getChannelComponent(handler) {
  return components[handler] || ChannelBase;
}

export default components;
