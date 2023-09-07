<template>
  <div class="editable radius-sm">
    <component
      :is="attrConfig.type + 'attr'"
      v-if="!attrConfig.isPrivate"
      ref="component"
      :readonly="readonly"
      :border="border"
      :valueList="valueList"
      :attrConfig="attrConfig"
      :mode="mode"
      :projectId="projectId"
      @setValue="setValue"
      @changeLabel="(text, selectedList) => $emit('changeLabel', text, selectedList)"
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
      :projectId="projectId"
      @setValue="setPrivateValue"
      @changeLabel="(text, selectedList) => $emit('changeLabel', text, selectedList)"
    ></component>
  </div>
</template>
<script>
import * as handlers from './index.js';
export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    projectId: { type: Number },
    readonly: { type: Boolean, default: false },
    border: { type: String, default: 'border' },
    mode: { type: String, default: 'input' },
    value: { type: [Array, String, Number] }, //直接从外部传值，一般用在属性默认值设置
    issueData: { type: Object }, //issue数据
    attrConfig: { type: Object } //属性设置
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
      if (this.value != null) {
        if (this.value instanceof Array) {
          this.valueList = this.value;
        } else {
          this.valueList = [this.value];
        }
      }
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
        if (!this.issueData.attrList) {
          this.$set(this.issueData, 'attrList', []);
        }
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
            this.issueData.attrList.push({ attrId: this.attrConfig.id, valueList: val });
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
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@bg-grey-hover) {
  .editable:hover {
    background: @bg-grey-hover;
  }
}
html {
  .theme(@default-op);
  &.theme-dark {
    .theme(@dark-op);
  }
}
</style>
