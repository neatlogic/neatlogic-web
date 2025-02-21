<template>
  <div v-if="errorList.length === 0">
    <TsCodemirror
      :value="actualValue"
      :isReadOnly="readonly"
      :disabled="disabled"
      :placeholder="config.placeholder"
      :readonlyTextIsHighlight="readonlyTextIsHighlight"
      :codeMode="codeMode"
      :validateList="validateList"
      @change="(val)=> {
        setValue(val);
      }"
    ></TsCodemirror>
  </div>
  <div v-else class="text-grey">
    <ul>
      <li v-for="(error, index) in errorList" :key="index">{{ error }}</li>
    </ul>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
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
    validConfig() {
      return this.validConfigForListItem();
    }
  },
  filter: {},
  computed: {
    actualValue() {
      if (this.value) {
        return this.value;
      } else {
        return '';
      }
    },
    errorList() {
      const errorList = [];
      this.validConfig().forEach(error => {
        if (!errorList.includes(error.error)) {
          errorList.push(error.error);
        }
      });
      return errorList;
    },
    codeMode() {
      let {codeMode = ''} = this.config || {};
      return codeMode;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
