<template>
  <div>
    <TsDialog
      v-bind="configDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Alert show-icon>
            {{ $t('term.deploy.overrelateobjectdescription') }}
          </Alert>
          <div class="common-auth">
            <div v-if="relateConfig && relateConfig?.typeList?.length > 0" class="wrapper">
              <span class="text check-all-text-pr mb-nm" :class="[ selectedAll ? 'ts-check-square-o':'ts-minus-square']" @click.stop="handleCheckedAll()">
                {{ selectedAll ? $t('page.unselectall') : $t('page.selectall') }}
              </span>
              <div v-for="(item, index) in relateConfig.typeList" :key="index" class="item mb-md">
                <div class="title text-grey">{{ item.text }}</div>
                <div class="radius-lg bg-op">
                  <div class="pl-nm pt-nm h2 flex-start" :class="secondSelectedAll(item) ? 'ts-check-square-o':'ts-minus-square'" @click.stop="handleSecondCheckedAll(item)">
                    <span class="text check-all-text-pr">
                      {{ secondSelectedAll(item) ? $t('page.unselectall') : $t('page.selectall') }}
                    </span>
                  </div>
                  <div class="item-cli pl-nm pr-nm">
                    <CheckboxGroup v-model="selectedConfig[item.value]">
                      <Checkbox 
                        v-for="(innerItem) in item.optionList"
                        :key="innerItem.value"
                        :label="innerItem.value"
                        style="width:20%"
                      >
                        <span class="check-all-text-pr">{{ innerItem.text }}</span>
                      </Checkbox>
                    </CheckboxGroup>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </TsDialog>
    <UploadDialog
      ref="uploadDialog"
      v-bind="uploadConfig"
      @on-success="uploadSuccess"
      @on-close="closeUploadDialog"
    ></UploadDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve)
  },
  props: {
    isShowCoverDialog: {
      // 是否显示覆盖弹窗
      type: Boolean,
      default: false
    },
    appSystemAbbrNameAndName: {
      type: String,
      default: ''
    },
    appSystemId: {
      type: Number
    }
  },
  data() {
    return {
      isEmit: false, // 二次弹窗，导入数据是不需要分发方法
      isRefreshTree: false, // 导入配置没有配置信息时，也需要刷新树
      defaultSelectedConfig: {}, // 默认选中的config
      selectedConfig: {},
      configDialog: {
        isShow: false,
        type: 'slider',
        width: 'large',
        title: this.$t('term.deploy.relateobjectcover'),
        okText: this.$t('page.import')
      },
      uploadConfig: {
        //上传图片配置
        actionUrl: BASEURLPREFIX + '/api/binary/deploy/app/pipeline/import', //导入地址
        formatList: ['pak'],
        multiple: false,
        showSuccessNotice: false,
        data: {
          appSystemId: this.appSystemId
        }
      },
      relateConfig: {},
      uploadSuccessFile: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.isRefreshTree = false;
    if (this.isShowCoverDialog) {
      this.$createDialog({
        title: this.$t('term.deploy.coverpipeline'),
        cancelText: this.$t('term.deploy.cancelimport'),
        okText: this.$t('page.cover'),
        content: `${this.appSystemAbbrNameAndName}${this.$t('term.deploy.overexistpipelineiscontinue')}`,
        'on-ok': (vnode) => {
          vnode.isShow = false;
          this.showDialog();
        },
        'on-close': () => {
          this.$emit('close');
        }
      });
      this.isEmit = false;
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleDefaultSelectedConfig() {
      // 处理选中默认值，为了后续用于对比高亮使用
      let relateConfig = this.$utils.deepClone(this.relateConfig);
      let defaultSelectedConfig = {};
      let selectedConfig = {};
      relateConfig?.typeList?.forEach((item) => {
        // 处理默认选中值
        defaultSelectedConfig[item.value] = [];
        selectedConfig[item.value] = [];
        if (!item.hasOwnProperty('checkedAll')) {
          item.checkedAll = false;
        }
        item.optionList?.forEach((optionItem) => {
          if (optionItem?.value) {
            defaultSelectedConfig[item.value].push(optionItem.value);
          }
          if (relateConfig.checkedAll || item.checkedAll || optionItem.checked) {
            selectedConfig[item.value].push(optionItem.value);
          }
        });
      });
      this.defaultSelectedConfig = defaultSelectedConfig;
      this.selectedConfig = selectedConfig;

      // 清空默认选中值
      this.relateConfig.checkedAll = false;
      this.relateConfig?.typeList?.forEach((item) => {
        item.checkedAll = false;
        item.optionList?.forEach((innerItem) => {
          if (innerItem) {
            innerItem.checked = false;
          }
        });
      });
    },
    showDialog() {
      // 提供给外部使用，用于打开上传文件的弹窗
      this.$refs.uploadDialog?.showDialog();
    },
    okDialog() {
      // 导入处理存储后端的值
      let relateConfig = this.$utils.deepClone(this.relateConfig);
      relateConfig.checkedAll = this.selectedAll;
      relateConfig.typeList.forEach((item) => {
        item?.optionList?.forEach((innerItem) => {
          innerItem.checked = this.selectedConfig[item.value]?.includes(innerItem.value);
        });
        item.checkedAll = item.optionList?.every((innerItem) => {
          return this.selectedConfig[item.value]?.includes(innerItem.value);
        });
      });
      const formData = new FormData();
      formData.append('appSystemId', this.appSystemId);
      formData.append('file', this.uploadSuccessFile.file);
      formData.append('userSelection', JSON.stringify(relateConfig));
      this.$api.deploy.apppipeline.coverPipeline(formData).then(res => {
        if (res.statusText == 'OK') {
          this.$Message.success(this.$t(this.$t('message.importsuccess')));
          this.configDialog.isShow = false;
          this.$emit('close', true);
        }
      });
    },
    closeDialog() {
      if (!this.isShowCoverDialog) {
        this.configDialog.isShow = false;
        this.selectedConfig = {};
        this.defaultSelectedConfig = {};
      }
      this.$emit('close');
    },
    closeUploadDialog() {
      if (!this.isEmit) {
        this.$emit('close', this.isRefreshTree); // 导入成功之后，不需要分发这个方法，隐藏整个组件
      }
    },
    uploadSuccess(data, file, fileList) {
      this.relateConfig = data.Return || {};
      this.uploadSuccessFile = file;
      if (!this.$utils.isEmpty(this.relateConfig)) {
        this.configDialog.isShow = true;
        this.isEmit = true;
        this.isRefreshTree = false;
        this.handleDefaultSelectedConfig();
      } else {
        this.isEmit = false;
        this.isRefreshTree = true;
      }
      this.isRefreshTree = true;
      this.$refs.uploadDialog?.hideDialog(); // 关闭弹窗
    },
    handleCheckedAll() {
      // 顶层选中
      this.relateConfig.typeList.forEach((item) => {
        if (item.value) {
          this.$set(this.selectedConfig, [item.value], []);
        }
        if (!this.relateConfig.checkedAll) {
          item.optionList.forEach((optionItem) => {
            if (optionItem?.value) {
              this.selectedConfig[item.value].push(optionItem.value);
            }
          });
        }
      });
      this.relateConfig.checkedAll = !this.relateConfig.checkedAll;
    },
    handleSecondCheckedAll(currentRow) {
      // 二级选中
      let checkedAll = !this.secondSelectedAll(currentRow);
      this.selectedConfig[currentRow.value] = [];
      if (checkedAll) {
        currentRow?.optionList?.forEach((item) => {
          if (item.value) {
            this.selectedConfig[currentRow.value].push(item.value);
          }
        });
      }
      this.relateConfig.checkedAll = checkedAll;
    }
  },
  filter: {},
  computed: {
    selectedAll() {
      // 顶层选中
      return this.$utils.isEmpty(this.selectedConfig) ? false : this.$utils.isSame(this.defaultSelectedConfig, this.selectedConfig);
    },
    secondSelectedAll() {
      // 二级选中
      return (currentRow) => {
        return this.$utils.isEmpty(this.selectedConfig) ? false : this.$utils.isSame(this.defaultSelectedConfig[currentRow.value], this.selectedConfig[currentRow.value]);
      };
    }
  },
  watch: {
    appSystemId: {
      handler() {
        this.uploadConfig.data.appSystemId = this.appSystemId;
        this.isEmit = false;
        this.isRefreshTree = false;
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.common-auth {
  .check-all-text-pr {
    display: inline-block;
    padding-left: 4px;
    cursor: pointer;
  }
  .wrapper {
    width: 100%;
    .item {
      .title {
        margin-bottom: 6px;
      }
      .item-cli {
        width: 100%;
        border: 1px solid transparent;
        label {
          margin-right: 50px;
          padding: 12px 0;
          display: inline-flex;
        }
      }
      .title-wrapper {
         overflow: hidden;
         border: 1px solid;
      }
      .not-allowed {
        cursor: not-allowed;
      }
    }
  }
  /deep/ .ivu-checkbox {
    line-height: revert;
  }
  /deep/ .ivu-checkbox-checked .ivu-checkbox-inner:after {
    top: -1px;
  }
}
</style>
