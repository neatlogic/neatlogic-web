<template>
  <div v-if="setting.config" :style="getStyle">
    <!-- {{ currentValue }} ---  {{ value }} -->
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <div>
      <TsFormTree
        ref="select"
        v-model="currentValue"
        v-bind="getConfig"
        showPath
        :class="{treeCur:isReadonly}"
        :disabled="isReadonly || false"
        @on-change="updatethis"
      ></TsFormTree>
      
    </div>
    <div v-if="setting.config.desc" class="component-tips ts-info">
      {{ setting.config.desc }}
    </div>
  </div>
</template>
<script>
import viewmixin from '@/resources/components/FormMaker/formedit/view/viewmixin.js';
export default {
  name: 'FormtreeSelect',
  components: { TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve)
  },
  mixins: [viewmixin],
  props: {
    setting: Object,
    value: String,
    isReadonly: Boolean
  },
  data() {
    const _this = this;
    return {
      currentValue: this.value,
      validJson: ['required']
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    // this.getConfig();Z
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updatethis: function(val) {
      this.$emit('update', val);
    },
    updateValue: function(val) {
      this.currentValue = val;
    },
    getValue: function(val) {
      return this.currentValue;
    },
    validateValue: function() {
      let isVaild = true;
      if (this.setting.config.isRequired) {
        isVaild = this.$refs.select.valid();
      }
      return isVaild;
    }
  },
  filter: {},
  computed: {
    getStyle: function() {
      const resultJson = {};
      if (typeof this.setting.config.width == 'number') {
        resultJson.width = this.setting.config.width + 'px';
      } else if (typeof this.setting.config.width == 'string') {
        resultJson.width = this.setting.config.width;
      }
      return resultJson;
    },
    getConfig() {
      // console.log(this.setting.config, this.value, 'valuevaluevalue');
      let setting = this.setting.config;
      // setting.dataSource = 'knowledgeType';
      let config = {
        url: setting.url,
        desc: '',
        params: {isActive: 1},
        valueName: setting.valueName || 'uuid',
        textName: setting.textName || 'name',
        disabled: this.isReadonly || false,
        childrenKey: setting.childrenKey || 'children',
        validateList: [],
        placeholder: setting.placeholder,
        clearable: true,
        showPath: true,
        sperateText: '>'
      };
      return config;
    }
  },
  watch: {
    value: {
      handler: function(newValue, oldValue) {
        if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
          this.currentValue = newValue;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.component-tips {
  text-align: left;
  font-size: 90%;
  opacity: 0.6;
  display: block;
  word-break: break-all;
  display: block;
  &:before {
    margin-right: 3px;
  }
}
.treeCur{
  /deep/.select-top{
    cursor: not-allowed!important;
  }
}
</style>
