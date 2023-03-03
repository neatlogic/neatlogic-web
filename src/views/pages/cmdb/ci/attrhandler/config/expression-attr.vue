<template>
  <div>
    <TsForm :item-list="formConfig">
      <template v-slot:expression>
        <TsFormSelect
          v-model="myConfig.expression"
          :dataList="dataList"
          width="75%"
          :multiple="true"
          :allowCreate="true"
          :search="true"
          :validateList="['required']"
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
    ciId: {type: Number},
    config: { type: Object }
  },
  data() {
    return {
      myConfig: {},
      dynamicFormatList: [],
      dataList: [],
      formConfig: {
        expression: {
          type: 'slot',
          label: '表达式'
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getExpressionList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getExpressionList() {
      this.$api.cmdb.ci.getExpressionAttrRelByCiId(this.ciId).then(res => {
        this.dataList = res.Return;
        if (this.myConfig.expression && this.myConfig.expression.length > 0) {
          this.myConfig.expression.forEach(element => {
            if (element.indexOf('{') == -1 && element.indexOf('}') == -1) {
              this.dataList.push({value: element, text: element});
            }
          });
        }
      });
    }
  },
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
        this.myConfig = val || {};
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
