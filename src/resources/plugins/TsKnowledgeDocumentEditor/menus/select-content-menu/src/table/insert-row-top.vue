<template>
  <div>
    <Tooltip 
      placement="top"
      :transfer="true"
      theme="light"
      max-width="300"
    >
      <img
        style="width:16px;height: 16px;"
        src="@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/table/svg/insert-row-above.svg"
        alt=""
        @click="handleClick"
      />
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
  components: {
  },
  mixins: [mixin],
  props: {},
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
  methods: {
    handleClick() {
      this.$emit('emitMenuValue', {
        commandName: this.command,
        value: {
          direction: 'top',
          ...(this.nodeConfig || {})
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
