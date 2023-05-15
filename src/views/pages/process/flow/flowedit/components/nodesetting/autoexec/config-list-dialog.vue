<template>
  <div>
    <TsDialog
      :title="$t('term.inspect.jobdetail')"
      :isShow="true"
      type="slider"
      width="medium"
      className="autoexec-dialog"
      @on-ok="ok()"
      @on-close="close()"
    >
      <div v-if="configList.length > 0">
        <div v-for="(item, index) in configList" :key="index" class="autoexec-list bg-op radius-sm mb-sm">
          <div class="autoexec-title">
            <div>#{{ index+1 }}</div>
            <div class="action-btn">
              <span class="tsfont-close pr-sm text-tip-active" @click="delItem(index)"></span>
              <span class="text-tip-active" :class="item.isShow ? 'tsfont-down' : 'tsfont-up'" @click="item.isShow=!item.isShow"></span>
            </div>
          </div>
          <div v-show="item.isShow" class="autoexec-content border-color padding">
            <AutoexecConfig ref="autoexecConfig" :config="item" @update="(config)=>{setConfig(config,index)}"></AutoexecConfig>
          </div>
        </div>
      </div>
      <span class="tsfont-plus text-href" @click="addAutoexecList">{{ $t('term.autoexec.addjob') }}</span>
      <div v-if="!isValid && $utils.isEmpty(configList)" class="form-error-tip pl-nm">
        {{ $t('form.validate.leastonetarget', {'target': $t('term.autoexec.job')}) }}
      </div>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AutoexecConfig: resolve => require(['./autoexec-config.vue'], resolve)
  },
  props: {
    list: Array
  },
  data() {
    return {
      configList: [],
      isValid: true
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.list) {
        this.configList = this.$utils.deepClone(this.list);
      }
    },
    addAutoexecList() {
      let config = {
        autoexecCombopId: null,
        jobName: '',
        createJobPolicy: 'single',
        runtimeParamList: [], //作业参数列表
        executeParamList: [], //执行参数列表:执行目标、连接协议、执行用户、分批数量
        formAttributeList: [],
        isShow: true
      };
      this.configList.push(config);
    },
    delItem(index) {
      this.configList.splice(index, 1);
    },
    ok() {
      this.isValid = true;
      if (!this.configList.length) {
        this.isValid = false;
      }
      let autoexecConfigValidList = this.$refs.autoexecConfig;
      if (autoexecConfigValidList && autoexecConfigValidList.length > 0) {
        autoexecConfigValidList.forEach(v => {
          if (!v.valid()) {
            this.isValid = false;
          }
        });
      }
      if (!this.isValid) {
        return;
      }
      this.$emit('close', this.configList);
    },
    close() {
      this.$emit('close');
    },
    setConfig(config, index) {
      this.$set(this.configList, index, config);
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.autoexec-dialog {
  .autoexec-list {
    &:hover {
      .action-btn {
        display: block;
      }
    }
    .action-btn {
      display: none;
    }
    .autoexec-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
    }
    .autoexec-content {
      border-top: 1px solid;
    }
  }
}
</style>
