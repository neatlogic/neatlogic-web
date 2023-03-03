<template>
  <div>
    <TsFormItem label="风格" labelPosition="top">
      <TsFormRadio v-model="config.type" :dataList="typeList" :disabled="disabled"></TsFormRadio>
    </TsFormItem>
    <TsFormItem label="选项卡" labelPosition="top" required>
      <div class="radius-sm padding-md" :class="validClass('tabList')">
        <StaticDataEditor v-model="config.tabList" :disabled="disabled"></StaticDataEditor>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    StaticDataEditor: resolve => require(['./common/static-data-editor.vue'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      typeList: [
        { value: 'line', text: '横线' },
        { value: 'card', text: '卡片' }
      ]
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
