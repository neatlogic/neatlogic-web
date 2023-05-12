<template>
  <div>
    <TsFormItem
      :label="$t('term.autoexec.upstreamparameter')"
      labelPosition="left"
      :labelWidth="labelWidth"
    >
      
      <TsFormCascader
        v-model="currentValue"
        :dataList="getPrevList(prevStepList)"
        :format="format"
        :validateList="validateList"
        :disabled="!canEdit"
        transfer
        border="border"
      ></TsFormCascader>
    </TsFormItem>
  </div>
</template>
<script>
import addtargetmixin from './addtargetmixin.js';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormCascader: resolve => require(['@/resources/plugins/TsForm/TsFormCascader'], resolve)
  },
  mixins: [addtargetmixin],
  props: {
    labelWidth: {
      type: Number,
      default: 80
    },
    prevStepList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentValue: [],
      validateList: ['required']
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
    format(labels, selectedData) {
      let data = selectedData && selectedData.length > 1 ? selectedData[1] : false;
      let text = '';
      if (labels && labels.length > 0) {
        text = labels[labels.length - 1] + (data && data.operationDes ? '[' + data.operationDes + ']' : '');
      }
      return text;
    },
    valid() {
      if (!this.currentValue.length) {
        this.isValid = false;
      } else {
        this.isValid = true;
      }
      return this.isValid;
    },
    save() {
      return this.currentValue;
    },
    prevListConversion(arr) {
      let level1 = 'combopUuid';//获取一级属性名称: 阶段
      let level2 = 'operationUuid';//获取二级属性名称：工具
      let level3 = 'key';//获取三级属性名称：参数
      let list = Array.from(new Set(
        arr.map(item => {
          return {
            value: item['combopUuid'],
            label: item['combopName']
          };
        })));
      let subList = [];
      list.forEach(res => {
        arr.forEach(ele => {
          if (ele[level1] === res.value) {
            let nameArr = subList.map(item => item.value);
            if (nameArr.indexOf(res.value) !== -1) {
              let nameArr2 = subList[nameArr.indexOf(res.value)].children.map(item => item.value);
              if (nameArr2.indexOf(ele[level2]) !== -1) {
                if (!subList[nameArr.indexOf(res.value)].children[nameArr2.indexOf(ele[level2])].children.find(c => c.label == ele['name'])) {
                  subList[nameArr.indexOf(res.value)].children[nameArr2.indexOf(ele[level2])].children.push({
                    value: ele[level3],
                    label: ele['name']
                  });
                }
              } else {
                subList[nameArr.indexOf(res.value)].children.push({
                  value: ele[level2],
                  label: ele['operationName'] + (ele.operationLetter ? ('_' + ele.operationLetter) : '') + (ele.operationDes ? '[' + ele.operationDes + ']' : ''),
                  operationDes: ele.operationDes,
                  children: [{
                    value: ele[level3],
                    label: ele['name']
                  }]
                });
              }
            } else {
              subList.push({
                value: res.value,
                label: res.label,
                children: [{
                  value: ele[level2],
                  label: ele['operationName'] + (ele.operationLetter ? ('_' + ele.operationLetter) : '') + (ele.operationDes ? '[' + ele.operationDes + ']' : ''),
                  operationDes: ele.operationDes,
                  children: [{
                    value: ele[level3],
                    label: ele['name']
                  }]
                }]
              });
            }
          }
        });
      });
      return subList;
    }
  },
  filter: {},
  computed: {
    getPrevList() {
      return (prevStepList) => {
        if (prevStepList && prevStepList.length) {
          let li = [];
          li = prevStepList.filter(l => {
            return l.type == 'node';
          });
          if (li && li.length) {
            return this.prevListConversion(li);
          } else {
            return [];
          }
        } else {
          return [];
        }
      };
    }
  },
  watch: {
    defaultValue: {
      handler(val) {
        if (val && val.length) {
          this.currentValue = this.$utils.deepClone(val);
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
