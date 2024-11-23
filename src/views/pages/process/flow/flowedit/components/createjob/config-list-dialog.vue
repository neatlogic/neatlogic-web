<template>
  <div>
    <TsDialog
      :title="$t('term.inspect.jobdetail')"
      :isShow="true"
      type="slider"
      width="large"
      className="main-dialog"
      @on-ok="ok()"
      @on-close="close()"
    >
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <div v-if="!loadingShow && configList.length > 0">
        <div v-for="(item, index) in configList" :key="index" class="main-list bg-op radius-sm mb-sm">
          <div class="main-title">
            <div>#{{ index+1 }}</div>
            <div class="action-btn">
              <span class="tsfont-close pr-sm text-tip-active" @click="delItem(index)"></span>
              <span class="text-tip-active" :class="item.isShow ? 'tsfont-down' : 'tsfont-up'" @click="item.isShow=!item.isShow"></span>
            </div>
          </div>
          <div v-show="item.isShow" class="main-content border-color padding">
            <TsFormItem
              label="作业类型"
              labelPosition="left"
              required
            >
              <TsFormRadio
                v-model="item.type"
                :dataList="typeDataList"
                @change="()=>{
                  item.jobName = '';
                  item.formAttributeUuid = ''
                }"
              ></TsFormRadio>
            </TsFormItem>
       
            <CreatejobConfig
              v-if="item.type == 'combop'"
              ref="itemConfig"
              :formUuid="formUuid"
              :defaultAllFormitemList="allFormitemList"
              :config="item"
              @update="(config)=>{setConfig(item, config,index)}"
            ></CreatejobConfig>
            <AutoexecserviceCreatejobConfig
              v-else-if="item.type == 'service'"
              :formUuid="formUuid"
              :defaultAllFormitemList="allFormitemList"
              :configList="configList"
              :config="item"
              @update="(config)=>{setConfig(item, config,index)}"
            ></AutoexecserviceCreatejobConfig>
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
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    CreatejobConfig: () => import('./createjob-config.vue'),
    AutoexecserviceCreatejobConfig: () => import('./autoexecservice-createjob-config.vue')
  },
  props: {
    formUuid: String,
    list: Array
  },
  data() {
    return {
      loadingShow: true,
      configList: [],
      isValid: true,
      allFormitemList: [],
      typeDataList: [
        {
          text: this.$t('term.autoexec.combinationtool'),
          value: 'combop'
        },
        {
          text: this.$t('term.process.catalog'),
          value: 'service'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getFormItemList();
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
    getFormItemList() {
      if (!this.formUuid) {
        this.allFormitemList = [];
        return;
      }
      let data = {
        formUuid: this.formUuid,
        tag: 'common'
      };
      return this.$api.framework.form.getFormItemList(data).then(res => {
        if (res.Status == 'OK') {
          this.allFormitemList = res.Return || [];
        }
      });
    },
    addAutoexecList() {
      let config = {
        combopId: null,
        jobName: '',
        jobNamePrefixMappingValue: '',
        createPolicy: 'single',
        formTag: '',
        batchDataSourceMapping: {}, //批量
        jobParamMappingGroupList: [], //作业参数列表
        executeParamMappingGroupList: [], //执行参数列表:执行目标、连接协议、执行用户、分批数量
        scenarioParamMappingGroupList: [], // 场景参数列表
        formAttributeMappingList: [],
        isShow: true,
        type: '', // 组合工具、服务
        formAttributeUuid: '' // 表单属性，自动化服务的uuid
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
      let itemConfigValidList = this.$refs.itemConfig;
      if (itemConfigValidList && itemConfigValidList.length > 0) {
        itemConfigValidList.forEach((v, index) => {
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
        if (!this.$utils.isEmpty(c.executeParamMappingGroupList)) {
          c.executeParamMappingGroupList = c.executeParamMappingGroupList.filter(f => {
            return f.mappingMode != 'constant' && f.mappingMode != 'runtimeparam';
          });
        }
        this.$delete(c, 'isShow');
      });
      this.$emit('close', this.configList);
    },
    close() {
      this.$emit('close');
    },
    setConfig(currentItem, config = {}, index) {
      this.$set(this.configList, index, Object.assign(currentItem, config)); // 采用浅拷贝，解决config缺少isShow字段，导致选中组合工具后，组合工具被隐藏的问题
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.main-dialog {
  .main-list {
    &:hover {
      .action-btn {
        opacity: 1;
      }
    }
    .action-btn {
      opacity: 0;
    }
    .main-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
    }
    .main-content {
      border-top: 1px solid;
    }
  }
}
</style>
