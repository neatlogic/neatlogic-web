<template>
  <div>
    <TsSheet
      ref="subSheet"
      v-model="subFormData.formConfig"
      @selectCell="selectCell"
      @removeComponent="removeComponent"
    ></TsSheet>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsSheet: resolve => require(['./TsSheet.vue'], resolve)
  },
  props: {
    formData: {
      type: Object,
      default: () => {}
    },
    mode: {
      type: String, //edit编辑模式|read使用模式
      default: 'edit',
      validator(value) {
        return ['edit', 'read'].includes(value);
      }
    }
  },
  data() {
    return {
      subFormData: { formConfig: {} }
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
    selectCell(cell, component) {
      console.log(component, cell, 'oooo');
      this.$emit('selectCell', cell, component);
    },
    removeComponent(uuid) {
      this.$emit('removeComponent', uuid);
    },
    getFormConfig() {
      return this.$refs.subSheet.getFormConfig();
    },
    validConfig() {
      return this.$refs.subSheet.validConfig();
    }
  },
  filter: {},
  computed: {},
  watch: {
    formData: {
      handler(val) {
        if (val) {
          this.subFormData = val;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
