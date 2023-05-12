<template>
  <div>
    <CustomTemplateViewer
      v-if="isReady"
      :fileList="widget.config.fileList"
      :template="widget.config.template"
      :config="widget.config.config"
      :data="{ dataList: data }"
    ></CustomTemplateViewer>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
export default {
  name: '',
  components: {
    CustomTemplateViewer: resolve => require(['@/resources/components/customtemplate/customtemplate-viewer.vue'], resolve)
  },
  extends: WidgetBase,
  props: {},
  data() {
    return {
      isReady: false
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
  computed: {
  },
  watch: {
    'widget.config': {
      handler: function() {
        this.isReady = false;
        this.$nextTick(() => {
          this.isReady = true;
        });
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped></style>
