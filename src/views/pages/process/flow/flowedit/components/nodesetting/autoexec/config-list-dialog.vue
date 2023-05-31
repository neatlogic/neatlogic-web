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
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <div v-if="!loadingShow && configList.length > 0">
        <div v-for="(item, index) in configList" :key="index" class="autoexec-list bg-op radius-sm mb-sm">
          <div class="autoexec-title">
            <div>#{{ index+1 }}</div>
            <div class="action-btn">
              <!-- <span class="tsfont-close pr-sm text-tip-active" @click="delItem(index)"></span> -->
              <span class="text-tip-active" :class="item.isShow ? 'tsfont-down' : 'tsfont-up'" @click="item.isShow=!item.isShow"></span>
            </div>
          </div>
          <div v-show="item.isShow" class="autoexec-content border-color padding">
            <AutoexecConfig ref="autoexecConfig" :config="item" @update="(config)=>{setConfig(config,index)}"></AutoexecConfig>
          </div>
        </div>
      </div>
      <!-- <span class="tsfont-plus text-href" @click="addAutoexecList">{{ $t('term.autoexec.addjob') }}</span> -->
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
      loadingShow: true,
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
      if (this.list && this.list.length > 0) {
        this.configList = this.$utils.deepClone(this.list);
        this.configList.forEach(item => {
          this.$set(item, 'isShow', true);
        });
      } else {
        this.addAutoexecList();
      }
      this.loadingShow = false;
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
      this.loadingShow = true;
      this.$nextTick(() => {
        this.configList.splice(index, 1);
        this.loadingShow = false;
      });
    },
    ok() {
      this.isValid = true;
      if (!this.configList.length) {
        this.isValid = false;
      }
      let autoexecConfigValidList = this.$refs.autoexecConfig;
      if (autoexecConfigValidList && autoexecConfigValidList.length > 0) {
        autoexecConfigValidList.forEach((v, index) => {
          if (!v.valid()) {
            this.$set(this.configList[index], 'isShow', true);
            this.isValid = false;
          }
        });
      }
      if (!this.isValid) {
        return;
      }
      this.configList.forEach(c => {
        this.$delete(c, 'isShow');
      });
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
        opacity: 1;
      }
    }
    .action-btn {
      opacity: 0;
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
