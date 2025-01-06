<template>
  <div>
    <TsFormItem :label="$t('page.displaytext')" labelPosition="top">
      <TsFormInput
        :value="config.content"
        type="textarea"
        :disabled="disabled"
        @on-blur="(value)=> {
          setConfig('content', value)
          if(value) {
            $emit('setValue', `${value}_${handleLabel(formItem.label)}`)
          } else {
            $emit('setValue', handleLabel(formItem.label))
          }
        }"
      ></TsFormInput>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  extends: base,
  props: {},
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
    handleLabel(label) {
      if (label && label.indexOf('_') > -1) {
        let arr = label.split('_');
        if (arr && arr.length > 2) {
          let finalLabel = arr.slice(-2).join('_');// 取最后两个元素
          return finalLabel;
        } else {
          return label;
        }
      }
      return label;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
