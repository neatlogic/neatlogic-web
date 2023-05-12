<template>
  <div>
    <TsFormItem :label="$t('page.style')" labelPosition="top">
      <TsFormRadio v-model="config.type" :dataList="typeList" :disabled="disabled"></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('page.tab')" labelPosition="top" required>
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
