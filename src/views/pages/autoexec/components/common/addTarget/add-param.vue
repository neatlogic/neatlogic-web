<template>
  <div class="param-main">
    <div class="content" :class="!isValid?'border-error':''">
      <TsForm
        ref="paramList"
        v-model="executeConfig"
        :item-list="formConfig"
        :labelWidth="labelWidth"
        labelPosition="left"
      ></TsForm>
    </div>
  </div>
</template>
<script>
import addtargetmixin from './addtargetmixin.js';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {},
  mixins: [addtargetmixin],
  props: {
    id: {type: [String, Number], default: null},
    runtimeParamList: {
      type: Array,
      default: () => []
    },
    labelWidth: {
      type: Number,
      default: 80
    }
  },
  data() {
    let _this = this;
    return {
      formConfig: {
        paramList: {
          type: 'checkbox',
          label: this.$t('term.autoexec.jobparam'),
          value: [],
          dataList: [],
          multiple: true,
          disabled: !_this.canEdit
        }
      },
      executeConfig: {
        paramList: []
      },
      paramList: []
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
      if (!this.executeConfig.paramList.length) {
        this.isValid = false;
      } else {
        this.isValid = true;
      }
      return this.isValid;
    },
    save() {
      return this.executeConfig;
    },
    getDataList(list) {
      if (list && list.length > 0) {
        let paramList = list;
        let dataList = [];
        paramList.forEach(item => {
          if (item.type == 'node') { //节点类型才可以作为作业参数选项
            let obj = {
              text: item.name,
              value: item.key
            };
            dataList.push(obj);
          }
        });
        this.paramList = dataList;
        this.formConfig.paramList.dataList = dataList;
      } else {
        this.paramList = [];
        this.formConfig.paramList.dataList = [];
      }
    }
  },
  computed: {},
  watch: {
    defaultValue: {
      handler(val) {
        if (val && val.length > 0) {
          this.executeConfig.paramList = this.$utils.deepClone(val);
        }
      },
      deep: true,
      immediate: true
    },
    runtimeParamList: {
      handler(val) {
        this.getDataList(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.param-main{
  margin-bottom: 16px;
  .content{
    /deep/ .ivu-checkbox-wrapper{
      margin-right: 32px;
      .ivu-checkbox {
        margin-right: 4px;
      }
    }
  }
}
.type-name{
  min-width: 70px;
}
</style>
