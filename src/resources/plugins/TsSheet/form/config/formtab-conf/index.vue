<template>
  <div>
    <TsFormItem
      :label="$t('term.framework.showcomponentnamesintab')"
      labelWidth="200px"
      labelPosition="left"
      contentAlign="right"
    >
      <TsFormSwitch
        v-model="config.isShowComponentNameInTab"
        :falseValue="false"
        :trueValue="true"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('page.style')" labelPosition="top">
      <TsFormRadio v-model="config.type" :dataList="typeList" :disabled="disabled"></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('page.tab')" labelPosition="top" required>
      <div class="radius-sm padding-md" :class="validClass('tabList')">
        <TabListSetting v-model="config.tabList" :formItemList="formItemList" :disabled="disabled"></TabListSetting>
      </div>
    </TsFormItem>
  
  </div>
</template>
<script>
import base from '../base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TabListSetting: () => import('./tab-list-setting.vue'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  extends: base,
  props: {},
  data() {
    return {
      typeList: [
        { value: 'line', text: this.$t('page.line') },
        { value: 'card', text: this.$t('page.card') }
      ]
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
