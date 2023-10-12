<template>
  <div v-if="widget && widgetConfig[widget.name + 'Widget']">
    <component
      :is="widget.name + 'Widget'"
      :form="widget.form"
      :formData="widget.data"
      @data:update="updateData"
    ></component>
  </div>
  <div v-else>
    <TsForm
      v-model="data"
      labelPosition="top"
      :item-list="widget.form"
    ></TsForm>
  </div>
</template>
<script>
import * as components from '@/views/pages/diagram/graph/widget-config/components/index.js';

export default {
  name: '',
  components: {
    ...components,
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: { type: String },
    widget: { type: Object }
  },
  data() {
    return {
      data: {},
      widgetConfig: components
    };
  },
  beforeCreate() {},
  created() {
    this.data = this.$utils.deepClone(this.widget.data) || {};
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
  computed: {},
  watch: {
    data: {
      handler(val) {
        this.updateData(val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
