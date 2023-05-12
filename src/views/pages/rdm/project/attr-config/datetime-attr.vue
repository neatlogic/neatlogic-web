<template>
  <div>
    <TsForm :item-list="formConfig">
      <template v-slot:format>
        <TsFormSelect
          :dataList="formatList"
          :value="myConfig && myConfig.format"
          :transfer="true"
          :clearable="false"
          :validateList="['required']"
          @change="
            val => {
              $set(myConfig, 'format', val);
            }
          "
        ></TsFormSelect>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    config: { type: Object }
  },
  data() {
    const _this = this;
    return {
      myConfig: {},
      formatList: [
        { value: 'yyyy-MM-dd HH:mm:ss', text: 'yyyy-MM-dd HH:mm:ss' },
        { value: 'yyyy-MM-dd HH:mm', text: 'yyyy-MM-dd HH:mm' },
        { value: 'yyyy-MM-dd HH', text: 'yyyy-MM-dd HH' }
      ],
      formConfig: {
        format: {
          type: 'slot',
          label: this.$t('page.format')
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
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
    myConfig: {
      handler: function(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    },
    config: {
      handler: function(val) {
        this.myConfig = val || {format: 'yyyy-MM-dd HH:mm:ss'};
        if (this.myConfig) {
          for (const k in this.myConfig) {
            this.formConfig[k].value = this.myConfig[k];
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
