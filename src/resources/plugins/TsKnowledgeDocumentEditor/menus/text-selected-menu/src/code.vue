<template>
  <div>
    <Tooltip 
      placement="top"
      :transfer="true"
      theme="light"
      max-width="300"
    >
      <span
        class="tsfont-code"
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
          <div>下划线 (ctrl + shift + c)</div>
          <div>Markdown ~代码~</div>
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
      default: 'code'
    }
  },
  data() {
    return {
      
    };
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
