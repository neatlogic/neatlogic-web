<template>
  <div>
    <Tooltip 
      placement="top"
      :transfer="true"
      theme="light"
      max-width="300"
    >
      <span
        class="menu-button-box"
        :class="[icon, getActiveMenuClassName(command)]"
        @click="
          $emit('executeEditorCommand',
                {
                  commandName: command,
                  value: {
                    [capitalizeFirstWordKeepRest(command)]: menuState?.editorData?.isActive(command)
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
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/text-selected-menu/src/mixin.js';
export default {
  name: '',
  components: {},
  mixins: [mixin],
  props: {
    icon: {
      type: String,
      default: ''
    },
    tipContentList: {
      type: [],
      default: () => {
        return [];
      }
    },
    command: {
      type: String,
      default: ''
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
.menu-button-box {
  font-size: 18px;
}
</style>
