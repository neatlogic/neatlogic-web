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
          <TsFormSwitch v-model="ciEntityConfig.rerunStepToSync"></TsFormSwitch>
        </span>
      </div>
    </div>
    <div id="failPolicy" class="permission-list">
      <div class="list">
        <div class="second-title text-grey require-label">{{ $t('page.failurestrategy') }}</div>
        <div class="input-border">
          <TsFormSelect
            ref="failPolicy"
            v-model="ciEntityConfig.failPolicy"
            :dataList="failPolicyList"
            :validateList="validateList"
            border="border"
          > </TsFormSelect>
        </div>
      </div>
    </div>
    <div class="mode-mapping">
      <div class="top">
        <div class="second-title text-grey require-label">{{ $t('term.cmdb.modemapping') }}</div>
        <div class="text-href" @click="edit()">
          {{ $t('page.edit') }}
        </div>
      </div>
      <div v-if="ciEntityConfig.configList.length" class="pt-sm overflow">{{ ciEntityConfig.configList[0].ciLabel }}
        <span v-if="ciEntityConfig.configList[0].ciName" class="text-tip">({{ ciEntityConfig.configList[0].ciName }})</span>
      </div>
      <div v-if="!isValid && $utils.isEmpty(ciEntityConfig.configList)" class="form-error-tip pl-nm">
        {{ $t('form.validate.required', { target: $t('term.cmdb.modemapping') }) }}
      </div>
    </div>
    <CmdbsyncDialog v-if="isShowDialog" :configList="ciEntityConfig.configList" @close="close"></CmdbsyncDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    CmdbsyncDialog: resolve => require(['./cmdbsync-dialog.vue'], resolve)
  },
  props: {
    defaultCiEntityConfig: Object
  },
  data() {
    return {
      failPolicyList: [], //失败策略
      validateList: ['required'],
      isShowDialog: false,
      ciEntityConfig: {
        failPolicy: '',
        rerunStepToSync: 0,
        configList: []
      },
      isValid: true //校验
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
    initData() {
      let config = this.$utils.deepClone(this.defaultCiEntityConfig);
      if (!this.$utils.isEmpty(config)) {
        Object.keys(config).forEach(key => {
          this.ciEntityConfig[key] = config[key];
        });
      }
    },
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
    },
    edit() {
      this.isShowDialog = true;
    },
    close(data) {
      if (data) {
        Object.keys(data).forEach(key => {
          this.$set(this.ciEntityConfig, key, data[key]);
        });
      }
      this.isShowDialog = false;
    },
    valid() {
      this.isValid = true;
      if (!this.$refs.failPolicy.valid()) {
        this.isValid = false;
      }
      if (this.$utils.isEmpty(this.ciEntityConfig.configList)) {
        this.isValid = false;
      }
      return this.isValid;
    },
    save() {
      return this.ciEntityConfig;
    }
  },
  filter: {},
  computed: {},
  watch: {
    defaultCiEntityConfig: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.initData();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scpoed>
.mode-mapping {
  padding: 10px 16px;
  .top {
    display: flex;
    justify-content: space-between;
  }
}
</style>
