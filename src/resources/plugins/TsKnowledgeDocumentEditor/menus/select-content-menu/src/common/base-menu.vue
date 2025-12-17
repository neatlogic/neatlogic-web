<template>
  <div>
    <Tooltip 
      placement="top"
      :transfer="true"
      theme="light"
      max-width="300"
    >
      <span
        :style="iconStyle"
        :class="[icon, getActiveMenuClassName(command)]"
        @click.stop="
          $emit('executeEditorCommand',
                {
                  commandName: command,
                  value: {
                    [capitalizeFirstWordKeepRest(command)]: menuState?.editorData?.isActive(command),
                    ...(nodeConfig || {}),
                   ...(params || {})
                  }
                }
          )"
      ></span>
      <div slot="content">
        <div v-for="(item, index) in tipContentList" :key="index">{{ item }}</div>
      </div>
    </Tooltip>
  </div>
</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/mixin.js';
export default {
  name: '',
  components: {},
  mixins: [mixin],
  props: {
    params: {
      type: Object,
      default: () => {
        return {};
      }
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
  methods: {
    capitalizeFirstWordKeepRest(str) {
      if (!str || typeof str !== 'string') return '';
      const trimmed = str.trim();
      // 首字符大写 + 剩余字符原样拼接
      return `is${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
