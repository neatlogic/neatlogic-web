<template>
  <div>
    <TsFormItem :label="$t('term.cmdb.topicci')" labelPosition="top">
      <TsFormSelect
        :value="configLocal.ciIdList || []"
        :dataList="ciList"
        transfer
        :multiple="true"
        border="border"
        @on-change="
          val => {
            $set(configLocal, 'ciIdList', val);
          }
        "
      ></TsFormSelect>
    </TsFormItem>
  </div>
</template>
<script>
import { ConfigBase } from '@/views/pages/framework/mq/config/config.base.js';

export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  extends: ConfigBase,
  props: {},
  data() {
    return {
      ciList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getCiList();
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
    getCiList() {
      this.$api.cmdb.ci.getCiList({ isVirtual: 0, isAbstract: 0 }).then(res => {
        this.ciList = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
