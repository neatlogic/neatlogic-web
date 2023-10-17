<template>
  <div>
    <div class="control-box">
      <div class="control-setting">
        <span class="label">
          <span>回退重新同步</span>
          <Tooltip
            max-width="300"
            content="流程回退后，再次流转至当前步骤时，重新同步"
            theme="light"
            placement="bottom"
            :transfer="true"
          >
            <span class="text-href tsfont-info-o"></span>
          </Tooltip>
        </span>
        <span class="control-btn">
          <TsFormSwitch v-model="autoexecConfig.rerunStepToCreateNewJob"></TsFormSwitch>
        </span>
      </div>
    </div>
    <div id="failPolicy" class="permission-list">
      <div class="list">
        <div class="second-title text-grey require-label">{{ $t('page.failurestrategy') }}</div>
        <div class="input-border">
          <TsFormSelect
            ref="failPolicy"
            v-model="failPolicy"
            :dataList="failPolicyList"
            :validateList="validateList"
            border="border"
          > </TsFormSelect>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
 
  },
  props: {},
  data() {
    return {
      failPolicyList: [], //失败策略
      failPolicy: '',
      validateList: ['required']
    };
  },
  beforeCreate() {},
  created() {
    this.getFailPolicyList();
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
    getFailPolicyList() {
      let data = {
        enumClass: 'FailPolicy'
      };
      this.$api.common.getSelectList(data).then((res) => {
        if (res.Status == 'OK') {
          let failPolicyList = res.Return || [];
          let newfailPolicyList = [];
          let isBack = false;
          if (this.nodeAllLinksList && this.nodeAllLinksList.length > 0) {
            this.nodeAllLinksList.forEach(item => {
              if (item.config.type == 'backward') {
                isBack = true;
              }
            });
          }
          if (!isBack) {
            newfailPolicyList = failPolicyList.filter(f => f.value != 'back');
          } else {
            newfailPolicyList = failPolicyList;
          }
          this.failPolicyList = newfailPolicyList;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
