<script>
import ContentHandler from './content-handler.vue';

export default {
  name: 'ReplyOpinionHandler',
  // 回复意见已在完成操作时保存，继承原内容组件的净化、图片查看和长内容折叠。
  extends: ContentHandler
};
</script>
