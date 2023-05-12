<template>
  <div>
    <UserSelect
      ref="item"
      :value="actualValue"
      :multiple="!!config.isMultiple"
      :groupList="config.groupList"
      :readonly="readonly"
      :disabled="disabled"
      border="border"
      :validateList="getValidateList()"
      transfer
      @on-change="changeValue"
    ></UserSelect>
  </div>
</template>
<script>
import viewmixin from './viewmixin.js';
export default {
  name: '',
  components: {
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve)
  },
  mixins: [viewmixin],
  props: {},
  data() {
    return {};
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
    getValidateList() {
      let validateList = this.config.validateList || [];
      if (typeof this.isRequired == 'boolean') {
        //当从别的判断带过来的关于这个组件是否必填的选项时，进行原来required的覆盖
        if (this.isRequired && validateList.indexOf('required') < 0) {
          validateList.push('required');
        } else if (!this.isRequired && validateList.indexOf('required') > -1) {
          validateList = validateList.filter(v => {
            return v != 'required';
          });
        }
      }
      return validateList;
    },
    changeValue(val) {
      let data = [];
      if (!this.config.isMultiple) {
        val && data.push(val);
      } else {
        val && (data = val);
      }
      this.updateval(data);
    }
  },
  filter: {},
  computed: {
    actualValue() {
      if (this.value) {
        if (!this.config.isMultiple && this.value instanceof Array && this.value.length > 0) {
          return this.value[0];
        } else {
          return this.value;
        }
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
