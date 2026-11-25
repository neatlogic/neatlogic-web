<script>
import titleHandler from './title-handler.vue';

export default {
  // 按钮名称按纯文本展示，复用现有文字明细的模板和布局，避免名称被解析为 HTML。
  extends: titleHandler
};
</script>
