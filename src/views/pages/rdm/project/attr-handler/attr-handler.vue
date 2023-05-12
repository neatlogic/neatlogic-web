<template>
  <component
    :is="attrConfig.type + 'attr'"
    v-if="!attrConfig.isPrivate"
    ref="component"
    :readonly="readonly"
    :border="border"
    :valueList="valueList"
    :attrConfig="attrConfig"
    :mode="mode"
    @setValue="setValue"
  ></component>
  <component
    :is="attrConfig.type + 'attr'"
    v-else
    ref="component"
    :readonly="readonly"
    :border="border"
    :issueData="issueData"
    :valueList="valueList"
    :attrConfig="attrConfig"
    :mode="mode"
    @setValue="setPrivateValue"
  ></component>
</template>
<script>
import * as handlers from './index.js';
export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    readonly: {type: Boolean, default: false},
    border: {type: String, default: 'border'},
    mode: {type: String, default: 'input'},
    value: {type: Array}, //直接从外部传值，一般用在属性默认值设置
    issueData: {type: Object}, //issue数据
    attrConfig: {type: Object} //属性设置
  },
  data() {
    return {
      valueList: null
    };
  },
  beforeCreate() {},
  created() {
    if (this.issueData && this.issueData.attrList) {
      const attrData = this.issueData.attrList.find(d => d.attrId === this.attrConfig.id);
      if (attrData) {
        this.valueList = attrData.valueList;
      }
    } else {
      this.valueList = this.value;
    }
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
    valid() {
      return this.$refs['component'].valid && this.$refs['component'].valid();
    },
    setPrivateValue(attr, value, text) {
      if (this.issueData) {
        this.$set(this.issueData, attr, value);
      } else {
        if (value != null && typeof value != 'undefined' && value != '') {
          if (!(value instanceof Array)) {
            if (this.mode === 'input') {
              this.$emit('setValue', [value], [text]);
            } else {
              //搜索模式下，不需要把值统一转换成数组，返回值是什么类型就是什么类型
              this.$emit('setValue', value, text);
            }
          } else {
            if (value.length > 0) {
              this.$emit('setValue', value, text);
            } else {
              this.$emit('setValue', null, null);
            }
          }
        } else {
          this.$emit('setValue', null, null);
        }
      }
    },
    setValue(val, text) {
      if (this.issueData) {
        const index = this.issueData.attrList.findIndex(d => d.attrId === this.attrConfig.id);
        if (index > -1) {
          const attrData = this.issueData.attrList[index];
          if (val && val.length > 0) {
            this.$set(attrData, 'valueList', val);
          } else {
            this.$delete(this.issueData.attrList, index);
          }
        } else {
          if (val && val.length > 0) {
            this.issueData.attrList.push({attrId: this.attrConfig.id, valueList: val});
          }
        }
      } else {
        if (val && val.length > 0) {
          this.$emit('setValue', val, text);
        } else {
          this.$emit('setValue', null, text);
        }
      }
    }
  },
  filter: {},
  computed: {
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
