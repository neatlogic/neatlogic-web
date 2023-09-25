<template>
  <div v-if="widgetConfig[widget.name + 'Widget']">
    <component
      :is="widget.name + 'Widget'"
      :form="widget.form"
      :formData="widget.data"
      @data:update="updateData"
    ></component>
  </div>
</template>
<script>
import * as components from '@/views/pages/diagram/diagram/widget-config/components/index.js';

export default {
  name: '',
  components: {
    ...components
  },
  props: {
    id: {type: String},
    widget: {type: Object}
  },
  data() {
    return {
      widgetConfig: components
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updateData(val) {
      //必须重新复制数据，否则不能触发x6的change:data事件
      const data = val ? this.$utils.deepClone(val) : {};
      this.$emit('data:update', this.id, data);
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less"></style>
