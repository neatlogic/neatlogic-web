<template>
  <div>
    <div
      class="container overflow cursor radius-sm shadow"
      :class="status"
    >
      <span v-if="status !=='bg-primary' && icon" :class="icon"></span>
      <span v-else-if="status === 'bg-primary'">
        <LoadingIcon></LoadingIcon>
      </span>
    </div>
    <div v-if="data.name" style="text-align: center" class="text-grey">{{ data.name }}</div>
  </div>
</template>
<script>
import base from '@/views/pages/process/flow/floweditor/element/components/base.vue';
export default {
  name: 'VueRect',
  components: {
   
  },
  extends: base,
  props: {},
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
  computed: {
    width() {
      return this.node.size().width + 'px';
    },
    height() {
      return this.node.size().height + 'px';
    },
    icon() {
      return this.node.getProp('icon') && this.node.getProp('icon').replace('#', '');
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 40px;
}
</style>
