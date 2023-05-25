<template>
  <div>
    <TsForm :item-list="formConfig">
      <template v-slot:isMultiple>
        <i-switch v-model="myConfig.isMultiple" :true-value="1" :false-value="0"></i-switch>
        <span v-html="myConfig.isMultiple == 1 ? $t('page.yes') : $t('page.no')"></span>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve =>
      require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    config: {type: Object}
  },
  data() {
    return {
      error: null,
      dataList: [],
      myConfig: {},
      formConfig: {
        isMultiple: {
          type: 'slot',
          label: this.$t('page.multipleselection')
        }
      }
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
    valid() {
      return true;
    }
  },
  filter: {},
  computed: {},
  watch: {
    myConfig: {
      handler: function(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    },
    config: {
      handler: function(val) {
        this.myConfig = val || {};
        if (this.myConfig) {
          for (const k in this.myConfig) {
            if (this.formConfig[k]) {
              this.formConfig[k].value = this.myConfig[k];
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
