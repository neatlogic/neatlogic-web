<script>
import ChannelBase from './channel-base.vue';

// 邮件渠道沿用模板和接收人契约，保留独立入口供渠道能力扩展。
export default {
  name: 'NotifyChannelEmailEdit',
  extends: ChannelBase
};
</script>
