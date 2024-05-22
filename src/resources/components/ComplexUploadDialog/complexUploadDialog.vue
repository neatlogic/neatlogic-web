<template>
  <div>
    <TsDialog
      v-bind="configDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <template v-if="!$utils.isEmpty(errorMessageList)">
          <Alert type="error" show-icon>
            {{ $t('message.importfailed') }}：
            <div slot="desc">
              <div v-for="(item, index) in errorMessageList" :key="index" class="mb-xs">
                {{ item }}
              </div>
            </div>
          </Alert>
        </template>
        <div v-else>
          <Alert show-icon>
            {{ $t('page.importoverdescrition') }}
          </Alert>
          <div class="common-auth">
            <div v-if="userSelectedData && userSelectedData?.typeList?.length > 0" class="wrapper">
              <span class="text check-all-text-pr mb-nm" :class="[ selectedAll ? 'tsfont-check-square-o':'tsfont-minus-square']" @click.stop="handleCheckedAll()">
                {{ selectedAll ? $t('page.unselectall') : $t('page.selectall') }}
              </span>
              <div v-for="(item, index) in userSelectedData.typeList" :key="index" class="item mb-md">
                <div class="title text-grey">{{ item.text }}</div>
                <div class="radius-lg bg-op">
                  <div class="pl-nm pt-nm h2 flex-start" :class="secondSelectedAll(item) ? 'tsfont-check-square-o':'tsfont-minus-square'" @click.stop="handleSecondCheckedAll(item)">
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
import axios from '@/resources/api/http';
export default {
  name: '',
  components: {
    UploadDialog: () => import('@/resources/components/UploadDialog/UploadDialog.vue')
  },
  props: {
    targetType: { // 上传类型
      type: String,
      default: ''
    },
    url: { // 上传地址
      type: String,
      default: ''
    },
    uploadParams: { // 上传参数
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      isEmit: false, // 二次弹窗，导入数据是不需要分发方法
      errorMessageList: [],
      defaultSelectedConfig: {}, // 默认选中的config
      selectedConfig: {},
      configDialog: {
        hasFooter: true,
        isShow: false,
        type: 'slider',
        width: 'large',
        title: this.$t('term.deploy.relateobjectcover'),
        okText: this.$t('page.import')
      },
      uploadConfig: {
        //上传图片配置
        actionUrl: BASEURLPREFIX + this.url, //导入地址
        formatList: ['pak'],
        multiple: false,
        showSuccessNotice: false,
        data: {
          targetType: this.targetType,
          ...this.uploadParams
        }
      },
      userSelectedData: {},
      uploadSuccessFile: {},
      userSelection: {},
      alreadyExistsConfig: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleDefaultSelectedConfig() {
      // 处理选中默认值，为了后续用于对比高亮使用
      let userSelectedData = this.$utils.deepClone(this.userSelectedData);
      let defaultSelectedConfig = {};
      let selectedConfig = {};
      userSelectedData?.typeList?.forEach((item) => {
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
          if (userSelectedData.checkedAll || item.checkedAll || optionItem.checked) {
            selectedConfig[item.value].push(optionItem.value);
          }
        });
      });
      this.defaultSelectedConfig = defaultSelectedConfig;
      this.selectedConfig = selectedConfig;

      // 清空默认选中值
      this.userSelectedData.checkedAll = false;
      this.userSelectedData?.typeList?.forEach((item) => {
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
      if (this.$utils.isEmpty(this.url)) {
        this.$Message.error(this.$t('page.uploadurlmustrequired'));
        return false;
      }
      let userSelectedData = this.$utils.deepClone(this.userSelectedData);
      if (!this.$utils.isEmpty(this.userSelection) && this.userSelection.checkedAll) {
        userSelectedData = this.userSelection;
      } else {
        userSelectedData.checkedAll = this.selectedAll;
        userSelectedData.typeList.forEach((item) => {
          item?.optionList?.forEach((innerItem) => {
            innerItem.checked = this.selectedConfig[item.value]?.includes(innerItem.value);
          });
          item.checkedAll = item.optionList?.every((innerItem) => {
            return this.selectedConfig[item.value]?.includes(innerItem.value);
          });
        });
      }
      const formData = new FormData();
      formData.append('targetType', this.targetType);
      formData.append('file', this.uploadSuccessFile.file);
      formData.append('userSelection', JSON.stringify(userSelectedData));
      axios.post(this.url, formData, {
        contentType: 'multipart/form-data'
      }).then(res => {
        if (res.Status == 'OK') {
          let {messageList = []} = res.Return || {};
          if (this.$utils.isEmpty(messageList)) {
            this.$Message.success(this.$t(this.$t('message.importsuccess')));
            this.configDialog.isShow = false;
            this.$emit('close', true);
          } else {
            this.errorMessageList = messageList;
            this.configDialog.hasFooter = false;
          }
        }
      });
    },
    closeDialog() {
      this.errorMessageList = [];
      this.configDialog.isShow = false;
      this.configDialog.hasFooter = true;
      this.$emit('close');
    },
    closeUploadDialog() {
      if (!this.isEmit) {
        this.$emit('close'); // 导入成功之后，不需要分发这个方法，隐藏整个组件
      }
    },
    uploadSuccess(data, file, fileList) {
      let dataInfo = data.Return || {};
      let {alreadyExists = {}, typeList = [], checkedAll = false} = data.Return || {};
      this.uploadSuccessFile = file;
      this.userSelectedData = {
        checkedAll,
        typeList
      };
      if (!this.$utils.isEmpty(alreadyExists) && alreadyExists.name) {
        this.alreadyExistsConfig = alreadyExists || {};
        this.userSelection = {
          typeList,
          checkedAll
        };
        this.openCreateDialog();
      } else {
        if (!this.$utils.isEmpty(this.userSelectedData) && !this.$utils.isEmpty(dataInfo)) {
          this.configDialog.isShow = true;
          this.isEmit = true;
          this.handleDefaultSelectedConfig();
        } else {
          this.isEmit = false;
          this.$Message.success(this.$t(this.$t('message.importsuccess')));
          this.$emit('close', true);
        }
      }
      this.$refs.uploadDialog?.hideDialog(); // 关闭弹窗
    },
    openCreateDialog() {
      if (!this.$utils.isEmpty(this.userSelection) && !this.$utils.isEmpty(this.alreadyExistsConfig) && this.alreadyExistsConfig.name) {
        this.$createDialog({
          title: this.$t('page.cover') + this.$t('page.tip'),
          cancelText: this.$t('term.deploy.cancelimport'),
          okText: this.$t('page.cover'),
          content: this.$t('page.existiscoverimport', {target: this.alreadyExistsConfig.name, type: this.alreadyExistsConfig.type}),
          'on-ok': (vnode) => {
            vnode.isShow = false;
            if (!this.$utils.isEmpty(this.alreadyExistsConfig) && this.userSelection.checkedAll) {
              this.okDialog();
            } else {
              this.configDialog.isShow = true;
              this.isEmit = true;
              this.handleDefaultSelectedConfig();
            }
          },
          'on-close': () => {
            this.$emit('close');
          }
        });
        this.isEmit = false;
      }
    },
    handleCheckedAll() {
      // 顶层选中
      this.userSelectedData.typeList.forEach((item) => {
        if (item.value) {
          this.$set(this.selectedConfig, [item.value], []);
        }
        if (!this.userSelectedData.checkedAll) {
          item.optionList.forEach((optionItem) => {
            if (optionItem?.value) {
              this.selectedConfig[item.value].push(optionItem.value);
            }
          });
        }
      });
      this.userSelectedData.checkedAll = !this.userSelectedData.checkedAll;
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
      this.userSelectedData.checkedAll = checkedAll;
    },
    arraysAreEqual(arr1, arr2) {
      // 判断两个数组是否相等
      const array1 = this.$utils.deepClone(arr1).sort();
      const array2 = this.$utils.deepClone(arr2).sort();
      if (array1.length !== array2.length) {
        return false;
      }

      for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
          return false;
        }
      }

      return true;
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
        return this.$utils.isEmpty(this.selectedConfig) ? false : this.arraysAreEqual(this.defaultSelectedConfig[currentRow.value], this.selectedConfig[currentRow.value]);
      };
    }
  },
  watch: {
    targetType: {
      handler() {
        this.uploadConfig.data.targetType = this.targetType;
        this.isEmit = false;
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
