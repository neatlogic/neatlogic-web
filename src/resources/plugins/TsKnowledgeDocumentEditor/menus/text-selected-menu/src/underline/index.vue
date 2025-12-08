<template>
  <div>
    <Tooltip 
      placement="top"
      :transfer="true"
      theme="light"
      max-width="300"
    >
      <IconSvg
        :activeClassName="menuState?.editorData?.isActive(command) ? `active` : ''"
        @click="
          $emit('executeEditorCommand',
                {
                  commandName: command,
                  value: {}
                }
          )"
      ></IconSvg>
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
  components: {
    IconSvg: () => import('./icon/index.vue')
  },
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
