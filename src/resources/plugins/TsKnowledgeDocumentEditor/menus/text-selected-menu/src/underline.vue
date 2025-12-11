<template>
  <div>
    <Tooltip 
      placement="top"
      :transfer="true"
      theme="light"
      max-width="300"
    >
      <span
        class="tsfont-underline"
        style="font-size: 18px;"
        :class="getActiveMenuClassName(command)"
        @click="
          $emit('executeEditorCommand',
                {
                  commandName: command,
                  value: {}
                }
          )"
      ></span>
      <div slot="content">
        <div>
          <div>下划线 (ctrl + U)</div>
          <div>Markdown ~文本~ 空格</div>
        </div>
      </div>
    </Tooltip>
  </div>
</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/text-selected-menu/src/mixin.js';
export default {
  name: '',
  components: {},
  mixins: [mixin],
  props: {
    command: {
      type: String,
      default: 'underline'
    }
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
