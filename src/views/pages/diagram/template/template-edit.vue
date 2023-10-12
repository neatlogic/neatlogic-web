<template>
  <TsContain>
    <template v-slot:navigation><span>导航</span></template>
    <template v-slot:content>
      <div>
        <TemplateEditCore :templateQueue="templateQueue"></TemplateEditCore>
      </div>
    </template>
  </TsContain>
</template>
<script>
export default {
  name: '',
  components: {
    TemplateEditCore: resolve => require(['./template-edit-core.vue'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      templateQueue: []
    };
  },
  beforeCreate() {},
  created() {
    this.getTemplateById();
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
    getTemplateById() {
      if (this.id) {
        this.$api.diagram.template.getTemplateById(this.id).then(res => {
          this.templateQueue.push(res.Return);
        });
      } else {
        this.templateQueue.push({
          uuid: this.$utils.setUuid(),
          name: '新的模板',
          widgetTypeList: []
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
