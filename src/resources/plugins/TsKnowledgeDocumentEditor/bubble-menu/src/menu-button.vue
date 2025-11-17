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
        :class="[icon, menuState?.editorData?.isActive(command) ? 'text-href' : '']"
        @click="
          $emit('execCommand',
                {command: command,
                 value: {
                   [`is${command}`]: menuState?.editorData?.isActive(command)
                 }
                }
          )"
      ></span>
      <div slot="content">
        {{ title }}
      </div>
    </Tooltip>

  </div>

</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/bubble-menu/src/mixin.js';
export default {
  name: '',
  components: {},
  mixins: [mixin],
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.menu-button-box {
  font-size: 16px;
}
</style>
