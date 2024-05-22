<template>
  <div>
    <TsForm :item-list="formConfig">
      <template v-slot:isMultiple>
        <i-switch v-model="myConfig.isMultiple" :true-value="1" :false-value="0"></i-switch>
        <!--<span v-html="myConfig.isMultiple == 1 ? '是' : '否'"></span>-->
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    config: {type: Object},
    attrData: {type: Object}
  },
  data() {
    return {
      dataList: [],
      myConfig: {},
      formConfig: {
        mode: {
          type: 'radio',
          label: '关联方式',
          value: 'r',
          dataList: [
            {
              value: 'r',
              text: '选择'
            },
            {
              value: 'rw',
              text: '选择或新增'
            }
          ],
          onChange: val => {
            this.$set(this.myConfig, 'mode', val);
          }
        },
        isMultiple: {
          type: 'slot',
          label: '多选'
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
    adjustFormConfig: function(val) {
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
    'attrData.targetCiId': {
      handler: function(val) {
        if (val) {
          this.$api.cmdb.ci.getCiById(val).then(res => {
            if (res.Return.isVirtual) {
              //虚拟模型只能读
              this.$set(this.formConfig.mode, 'disabled', true);
              this.$set(this.formConfig.mode, 'value', 'r');
              this.$set(this.formConfig.mode, 'desc', '虚拟模型不支持新增');
              this.$set(this.myConfig, 'mode', 'r');
            } else {
              this.$set(this.formConfig.mode, 'disabled', false);
              this.$set(this.formConfig.mode, 'desc', '');
            }
          });
        }
      },
      deep: true,
      immediate: true
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
<style lang="less">
</style>
