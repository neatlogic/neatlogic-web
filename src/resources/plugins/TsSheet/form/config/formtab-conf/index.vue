<template>
  <div>
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
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TabListSetting: resolve => require(['./tab-list-setting.vue'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
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
