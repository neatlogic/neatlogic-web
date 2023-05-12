<template>
  <Poptip
    v-model="isSettingVisible"
    width="250"
    popper-class="auditconfig-wap"
    style="text-align:left"
    :transfer="true"
  >
    <span class="tsfont-setting text-action">{{ buttonName }}</span>
    <div slot="title">{{ title }}</div>
    <div slot="content">
      <TimeSelect
        ref="timeSelect"
        v-model="auditConfig"
        clearable
        v-bind="timeSelectConfig"
      ></TimeSelect>
      <div class="mt-nm text-grey">{{ $t('message.autoexec.savedeadlinenolimit') }}</div>
      <div class="mt-nm text-right"><Button type="primary" size="small" @click="saveAuditConfig()">{{ $t('page.save') }}</Button></div>
    </div>
  </Poptip>
</template>
<script>
export default {
  name: '',
  components: {
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect'], resolve)
  },
  props: {
    auditName: {type: String},
    buttonName: {type: String, default() { return this.$t('page.setting'); }},
    title: {type: String, default() { return this.$t('dialog.title.logsavedeadline'); } }
  },
  data() {
    return {
      isSettingVisible: false,
      auditConfig: null,
      timeSelectConfig: {//时间选择器的数据
        border: 'border',
        placement: 'bottom-start',
        clearable: false,
        transfer: true,
        width: '100%',
        isMore: false,
        validateList: ['required'],
        type: 'datetimerange',
        format: 'yyyy-MM-dd HH:mm:ss'
      } 
    };
  },
  beforeCreate() {},
  created() { this.getAuditConfig(); },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getAuditConfig() {
      this.$api.framework.auditconfig.getAuditConfig(this.auditName.toUpperCase()).then(res => {
        if (res.Return) {
          this.auditConfig = res.Return.config;
        }
      });
    },
    saveAuditConfig() {
      this.$api.framework.auditconfig.saveApiConfig({name: this.auditName.toUpperCase(), config: this.auditConfig}).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
        }
      }).finally(() => {
        this.isSettingVisible = false;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
.auditconfig-wap {
  .ivu-poptip-title:after {
    left: 16px;
    right: 16px;
  }
}
</style>
