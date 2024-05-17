
<template>
  <div class="script-detail">
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsContain
      v-if="!isLoading && scriptConfig"
      :rightWidth="204"
      :clearStyle="true"
      border="border"
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <template v-if="!isEdit">
          <VersionStatus
            :id="scriptId"
            :versionVo="scriptConfig.versionVo"
            :currentVersion="currentVersionVo"
            @updateVersion="updateVersion"
          ></VersionStatus>
        </template>
        <div v-else>
          <TsFormInput
            ref="formNameInput"
            v-model="title"
            :placeholder="$t('term.autoexec.pleaseinputversionname')"
            maxlength="50"
            size="large"
            isEmptyBg
            :validateList="nameValidateList"
          />
        </div>
      </template>
      <template v-slot:topRight>
        <template v-if="!isEdit">
          <div v-if="versionOperateList && versionOperateList.length" class="div-btn-contain action-group text-right no-line">
            <span
              v-for="operate in versionOperateList"
              :key="operate.value"
              class="action-item btn-icon"
              :class="getIcon(operate.value, operate)"
              :title="operate.disabledReason"
              @click.stop="doAction(operate.value, operate)"
            >{{ operate.text }}</span>
          </div>
        </template>
        <template v-else>
          <div v-if="editBtnList && editBtnList.length" class="div-btn-contain action-group text-right no-line">
            <span
              v-for="operate in editBtnList"
              :key="operate.value"
              class="action-item btn-icon"
              :class="getIcon(operate.value, operate)"
              :title="operate.disabledReason"
              @click.stop="doAction(operate.value, operate)"
            >{{ operate.text }}</span>
          </div>
        </template>
      </template>
      <template v-slot:content>
        <div class="version-box">
          <VersionDetail
            ref="versionDetail"
            :config="scriptConfig"
            :type="versionType"
          ></VersionDetail>
        </div>
      </template>
      <template v-slot:right>
        <BasicDetail 
          :config="scriptConfig" 
          @updetaScriptName="updetaScriptName" 
          @updateIsLib="updateIsLib"
        >
        </BasicDetail>
      </template>
    </TsContain>
    <!-- 提交审核 -->
    <ReviewDialog
      :id="scriptId"
      :isShow.sync="isReviewShow"
      :versionId="versionId"
      :type="userType"
      @updateData="updateData"
    ></ReviewDialog>
    <!-- 对比 -->
    <VersionCompare
      v-if="versionVo && isCompareShow"
      :id="scriptId"
      :isShow.sync="isCompareShow"
      :sourceVersionId="versionId"
    ></VersionCompare>
    <!--校验 -->
    <VersionValid v-model="validVisible" :validList="validList" @on-click="selectValidItem"></VersionValid>
    <!-- 数据保存提示 -->
    <DataDialog
      :isShow.sync="isTipShow"
      :type="typeDialog"
      :tipText="tipText"
      :versionId="versionId"
      @saveData="saveUpdate"
    ></DataDialog>
    <TsDialog
      :title="$t('page.save') + $t('page.versions')"
      type="modal"
      :isShow.sync="isShowVersionDialog"
      :okText="$t('page.save')"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="versionForm"
            v-model="versionFormData"
            :item-list="formConfig"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: 'ScriptDetail',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    VersionDetail: resolve => require(['./scriptDetail/edit/version-detail'], resolve),
    BasicDetail: resolve => require(['./scriptDetail/edit/basic-detail'], resolve),
    VersionStatus: resolve => require(['./scriptDetail/common/version-status.vue'], resolve),
    ReviewDialog: resolve => require(['./scriptDetail/edit/review-dialog.vue'], resolve),
    VersionCompare: resolve => require(['./scriptDetail/edit/version-compare'], resolve),
    VersionValid: resolve => require(['./scriptDetail/common/version-valid'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve),
    DataDialog: resolve => require(['./scriptDetail/common/data-dialog.vue'], resolve)
  },
  filters: {},
  mixins: [download],
  props: {},
  data() {
    return {
      isShowVersionDialog: false,
      versionFormData: {
        version: ''
      },
      currentBtnConfig: {}, // 选中当前按钮的对象
      fromPath: '',
      isLoading: true,
      scriptId: null,
      scriptConfig: null, //脚本的数据
      name: '', //工具库名称
      versionId: null,
      versionVo: null, //当前版本数据
      versionOperateList: [], //版本的操作按钮
      actionIcons: {
        generateToCombop: 'tsfont-tool',
        copy: 'tsfont-copy',
        export: 'tsfont-export',
        delete: 'tsfont-trash-o',
        compare: 'tsfont-compare',
        submit: 'tsfont-check-o',
        save: 'tsfont-save',
        validate: 'tsfont-check',
        test: 'tsfont-test',
        pass: 'tsfont-check-o',
        reject: 'tsfont-close-o',
        edit: 'tsfont-edit',
        cancel: 'tsfont-close-o',
        switchversion: 'tsfont-arrow-right'
      },
      versionType: 'passed',
      currentVersionVo: {}, //当前激活版本
      versionStatus: 'passed',
      title: '', //版本标题
      userType: 'submit', //审核人权限
      isReviewShow: false,
      isCompareShow: false,
      validVisible: false, //校验列表是否显示
      validList: [{ text: '', type: '', config: {} }], //校验产生的数据列表
      isEdit: false,
      editBtnList: [
        {
          disabled: 0,
          text: this.$t('page.compare'),
          value: 'compare'
        },
        {
          disabled: 0,
          text: this.$t('page.validate'),
          value: 'validate'
        },
        {
          disabled: 0,
          text: this.$t('page.test'),
          value: 'test'
        },
        {
          disabled: 0,
          text: this.$t('page.cancel'),
          value: 'cancel'
        },
        {
          disabled: 0,
          text: this.$t('page.savedraft'),
          value: 'save'
        },
        {
          disabled: 0,
          text: this.$t('page.submitaudit'),
          value: 'submit'
        }
      ],
      nameValidateList: ['required', 'name-special'],
      initData: null, //初始数据，用于对比
      isTipShow: false,
      typeDialog: 'delete',
      tipText: null,
      formConfig: {
        version: {
          type: 'text',
          label: this.$t('term.framework.pkgversion'),
          maxlength: 50,
          validateList: ['required']
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    const { scriptId = '', versionId = '', status = '' } = this.$route.query || {};
    if (status) {
      this.versionStatus = status;
    }
    if (scriptId) {
      this.scriptId = parseInt(scriptId);
      this.getDetail(this.scriptId);
    }
    if (versionId) {
      this.versionId = versionId;
      this.getDetail(parseInt(this.versionId), 'versionId');
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async okDialog() {
      if (!this.$refs.versionForm.valid()) {
        return false;
      }
      this.isShowVersionDialog = false;
      if (this.typeDialog == 'save') {
        this.handleSave(this.currentBtnConfig);
      } else if (this.typeDialog == 'submit') {
        this.submitData(this.currentBtnConfig);
      } else {
        await this.saveUpdate(this.typeDialog);
      }
    },
    closeDialog() {
      this.isShowVersionDialog = false;
    },
    getDetail(id, type) {
      //根据id获取详情
      this.isLoading = true;
      this.scriptConfig = null;
      let param = type && type === 'versionId' ? { versionId: id } : { id: id, status: this.versionStatus };
      this.$api.autoexec.script
        .getScriptDetail(param)
        .then(res => {
          if (res.Status == 'OK' && res.Return) {
            this.scriptConfig = res.Return.script;
            const { id = '', versionVo = {}, name = '', currentVersionVo = {}, isLib = ''} = this.scriptConfig || {};
            const { title = '', status, id: versionId, operateList = null } = versionVo || {};
            this.scriptId = id;
            this.versionVo = versionVo;
            this.title = title;
            this.name = name;
            this.currentVersionVo = currentVersionVo;
            this.versionId = versionId;
            this.versionOperateList = operateList;
            this.versionType = status;

            //isLib（是否库文件）标识为1时，标识该脚本是库文件，不支持使用测试功能，需要隐藏测试按钮
            this.updateIsLib(isLib);
            this.getDefaultConfig();
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    doAction(methods, item) {
      this.currentBtnConfig = item || {};
      this[methods](item);
    },
    edit(item) {
      if (item && item.disabled) {
        return;
      }
      this.typeDialog = '';
      this.versionType = 'edit';
      this.$set(this.versionVo, 'status', 'draft');
      this.versionId = null;
      this.isEdit = true;
      if (this.isEdit) {
        this.$set(this.initData, 'id', this.scriptId);
      } else {
        this.$set(this.initData, 'versionId', this.versionId);
      }
    },
    cancel() {
      this.isEdit = false;
      this.versionType = 'passed';
      this.getDetail(this.scriptId);
    },
    test(item) {
      if (item && item.disabled) {
        return;
      }
      this.typeDialog = 'test';
      if (this.isEdit) {
        this.isShowVersionDialog = true;
        this.$set(this.versionFormData, 'version', this.name + '_' + this.$utils.getCurrenttime('MMdd'));
        return false;
      }
      let data = this.saveData();
      if (this.$utils.isSame(this.initData, data)) {
        this.$router.push({
          path: '/test-detail',
          query: {
            id: this.versionId,
            type: 'script',
            execMode: this.scriptConfig.execMode
          }
        });
      } else {
        this.tipText = this.$t('term.autoexec.nosavetip');
        this.isTipShow = true;
      }
    },
    async validate() {
      let valid = true;
      let validList = await this.$refs.versionDetail.valid();
      if (validList.length > 0) {
        valid = false;
        this.validList = validList;
      } else {
        this.validList = [];
        this.validList.push({ text: this.$t('term.autoexec.scriptvalidsuccess'), type: 'success' });
      }
      this.validVisible = true;
      return valid;
    },
    saveData() {
      if (this.scriptConfig) {
        let data = {
          name: this.scriptConfig.name,
          typeId: this.scriptConfig.typeId,
          isLib: this.scriptConfig.isLib,
          catalogId: this.scriptConfig.catalogId, // 工具目录
          title: this.versionFormData.version || this.title,
          ...this.$refs.versionDetail.save()
        };
        //isLib（是否库文件）标识为1时，标识该脚本是库文件，保存时不需要执行方式、风险等级、自定义模板
        if (this.scriptConfig.isLib == 0) {
          this.$set(data, 'execMode', this.scriptConfig.execMode);
          this.$set(data, 'riskId', this.scriptConfig.riskId);
        }
        if (this.isEdit) {
          this.$set(data, 'id', this.scriptId);
        } else {
          this.$set(data, 'versionId', this.versionId);
        }
        return data;
      }
    },
    save() {
      //编辑保存
      this.typeDialog = 'save';
      this.$set(this.versionFormData, 'version', this.name + '_' + this.$utils.getCurrenttime('MMdd'));
      this.isShowVersionDialog = true;
    },
    async handleSave(item, isLeave) {
      if (item && item.disabled) {
        return;
      }
      let isValid = await this.validate();
      if (!isValid) {
        return false;
      }
      this.validVisible = false;
      let data = this.saveData();
      this.initData = this.$utils.deepClone(data);
      return this.$api.autoexec.script.saveScript(data).then(res => {
        if (res.Status == 'OK') {
          this.versionId = res.Return.versionId;
          this.$Message.success(this.$t('message.savesuccess')); //保存成功
          if (!isLeave) {
            this.$route.meta.isSkip = true;
            this.$router.push({
              path: '/script-detail',
              query: {
                versionId: this.versionId
              }
            });
          }
        }
      });
    },
    submit() {
      this.typeDialog = 'submit';
      this.$set(this.versionFormData, 'version', this.name + '_' + this.$utils.getCurrenttime('MMdd'));
      this.isShowVersionDialog = true;
    },
    async submitData(item) {
      if (item.disabled) {
        return;
      }
      let isValid = await this.validate();
      if (!isValid) {
        return;
      }
      this.validVisible = false;
      let data = this.saveData();
      let res = await this.$api.autoexec.script.saveScript(data);
      let config = res.Return;
      this.versionId = config.versionId;
      let isReviewable = config.isReviewable;
      if (isReviewable == 1) {
        this.userType = 'review';
      } else {
        this.userType = 'submit';
      }
      await this.$api.autoexec.script.submitScript({ versionId: this.versionId });
      this.isReviewShow = true;
    },
    validDelete() {
      return this.$api.autoexec.script
        .validDelete({ id: this.scriptId })
        .then(res => {
          if (res.Status == 'OK') {
            this.tipText = null;
          }
        })
        .catch(() => {
          this.tipText = this.$t('term.autoexec.deletelastversiontip');
        });
    },
    async delete(item) {
      if (item.disabled) {
        return;
      }
      this.typeDialog = 'delete';
      await this.validDelete();
      this.isTipShow = true;
    },
    copy() {},
    updateVersion(type, id) {
      this.versionType = type;
      if (type == 'submitted') {
        this.$router.push({
          path: '/review-detail',
          query: {
            versionId: id
          }
        });
      } else {
        this.$route.meta.isSkip = true;
        this.$router.push({
          path: '/script-detail',
          query: {
            versionId: id,
            status: type
          }
        });
      }
    },
    updetaScriptName(name) {
      this.name = name;
    },
    updateIsLib(isLib) {
      if (this.editBtnList.length > 0) {
        let testIndex = this.editBtnList.findIndex(item => item.value == 'test');
        if (isLib == 1 && testIndex >= 0) {
          this.editBtnList.splice(testIndex, 1);
        } else if (isLib == 0 && testIndex == -1) {
          let validateIndex = this.editBtnList.findIndex(item => item.value == 'validate');
          if (validateIndex >= 0) {
            this.editBtnList.splice(validateIndex + 1, 0, {disabled: 0, text: this.$t('page.test'), value: 'test'});
          }
        }
      }

      if (this.versionOperateList.length > 0) {
        let testIndex = this.versionOperateList.findIndex(item => item.value == 'test');
        if (isLib == 1 && testIndex >= 0) {
          if (testIndex >= 0) {
            this.versionOperateList.splice(testIndex, 1);
          } else if (isLib == 0 && testIndex == -1) {
            let validateIndex = this.versionOperateList.findIndex(item => item.value == 'validate');
            if (validateIndex >= 0) {
              this.versionOperateList.splice(validateIndex + 1, 0, {disabled: 0, text: this.$t('page.test'), value: 'test'});
            }
          }
        }
      }
    },
    export() {
      let param = {
        url: 'api/binary/autoexec/script/export',
        params: {
          idList: [this.scriptId]
        }
      };
      this.download(param);
    },
    async saveUpdate(type) {
      await this.handleSave(null, true);
      if (type == 'compare') {
        let isValid = await this.validate();
        if (!isValid) {
          return;
        }
        this.isCompareShow = true;
      } else if (type == 'test') {
        let isValid = await this.validate();
        if (!isValid) {
          return;
        }
        this.$router.push({
          path: '/test-detail',
          query: {
            id: this.versionId,
            execMode: this.scriptConfig.execMode,
            type: 'script'
          }
        });
      }
    },
    compare(item) {
      //对比
      if (item && item.disabled) {
        return;
      }
      if (this.isEdit) {
        this.typeDialog = 'compare';
        this.isShowVersionDialog = true;
        this.$set(this.versionFormData, 'version', this.name + '_' + this.$utils.getCurrenttime('MMdd'));
        return false;
      }
      this.typeDialog = 'compare';
      let saveData = this.saveData();
      let initData = this.$utils.deepClone(this.initData);
      // 兼容老数据，默认的话，会加一个 \n 所以在比较的时候，要把这个去掉,不然只要一对比就会数据不一样
      initData.lineList.forEach(v => {
        if (v.content) {
          let jsonContent = JSON.stringify(v.content);
          if (jsonContent.substring(jsonContent.length, jsonContent.length - 3).indexOf('\n') !== -1) {
            v.content = v.content.substring(0, v.content.lastIndexOf('\n'));
          }
        }
      });
      if (!this.isEdit || this.$utils.isSame(initData, saveData)) {
        this.isCompareShow = true;
      } else {
        this.tipText = this.$t('term.autoexec.nosavetip');
        this.isTipShow = true;
      }
    },
    switchversion(item) {
      //回退
      if (item.disabled) {
        return;
      }
      this.$api.autoexec.script.switchVersion({ versionId: this.versionId }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess')); //保存成功
          this.$route.meta.isSkip = true;
          this.$router.push({
            path: '/script-detail',
            query: {
              versionId: this.versionId,
              key: Date.now()
            }
          });
        }
      });
    },
    selectValidItem(selector) {
      let height = this.$refs.versionDetail.$el.clientHeight;
      if (selector && this.$el.querySelector(selector)) {
        let scroll = this.$el.querySelector('#versionDetail');
        if (scroll && scroll.scrollHeight > height) {
          this.$el.querySelector(selector).scrollIntoView();
        }
      }
    },
    updateData(status) {
      //提交审核刷新页面
      this.initData = this.saveData();
      let param = {
        scriptId: this.scriptId,
        versionId: this.versionId
      };
      if (status && status == 'submitted') {
        this.$router.push({
          path: '/review-detail',
          query: param
        });
      } else {
        this.$route.meta.isSkip = true;
        this.$router.push({
          path: '/script-detail',
          query: param
        });
      }
    },
    getDefaultConfig() {
      //初始数据，用于离开页面是对比
      let paramList = [];
      let inputParamList = this.versionVo.inputParamList || [];
      let outputParamList = this.versionVo.outputParamList || [];
      paramList.push(...inputParamList, ...outputParamList);
      let lineList = [];
      if (this.versionVo.lineList && this.versionVo.lineList.length > 0) {
        lineList = this.versionVo.lineList.map(i => {
          return { content: i.content };
        });
      }
      if (inputParamList.length > 0) {
        inputParamList.forEach(i => {
          if (i.type == 'select' || i.type == 'multiselect' || i.type == 'radio' || i.type == 'checkbox') {
            let config = {
              defaultValue: i.defaultValue || i.config.defaultValue,
              dataSource: i.config.dataSource,
              type: i.type
            };
            if (i.config.dataSource == 'matrix') {
              this.$set(config, 'matrixUuid', i.config.matrixUuid);
              this.$set(config, 'mapping', i.config.mapping);
            } else if (i.config.dataSource == 'static') {
              this.$set(config, 'dataList', i.config.dataList);
            }
            this.$set(i, 'config', config);
            this.$set(i, 'defaultValue', config.defaultValue);
          }
        });
      }
      let initData = {
        name: this.scriptConfig.name,
        execMode: this.scriptConfig.execMode,
        typeId: this.scriptConfig.typeId,
        riskId: this.scriptConfig.riskId,
        title: this.title,
        paramList: paramList,
        // encoding: this.versionVo.encoding,
        parser: this.versionVo.parser,
        lineList: lineList,
        catalogId: this.scriptConfig.catalogId, // 工具目录Id
        isLib: this.scriptConfig.isLib,
        useLib: this.scriptConfig.useLib
       
      };
      //自由参数
      if (this.versionVo.argument && !this.$utils.isEmpty(this.versionVo.argument)) {
        this.$set(initData, 'argument', {
          name: this.versionVo.argument.name,
          defaultValue: this.versionVo.argument.defaultValue,
          argumentCount: this.versionVo.argument.argumentCount,
          description: this.versionVo.argument.description,
          isRequired: this.versionVo.argument.isRequired
        });
      }
      this.initData = initData;
    }
  },
  computed: {
    getIcon() {
      return function(type, item) {
        let className = this.actionIcons[type] || 'tsfont-tool';
        if (item.disabled) {
          className += ' disable';
        }
        return className;
      };
    }
  },
  watch: {},
  beforeRouteLeave(to, from, next, url) {
    let saveData = this.saveData();
    if (saveData) {
      if (!this.isEdit || this.$utils.isSame(this.initData, saveData) || this.typeDialog == 'delete') {
        url ? this.$utils.gotoHref(url) : next(true);
      } else {
        this.$utils.jumpDialog.call(
          this,
          {
            save: {
              fn: async vnode => {
                return await this.handleSave(null, true);
              }
            }
          },
          to,
          from,
          next,
          url
        );
      }
    } else {
      next(true);
    }
  }
};
</script>
<style lang="less" scoped>
.script-detail {
  position: relative;
  /deep/ .goprev-right {
    padding-left: 0;
  }
  .action-title {
    width: 220px;
    display: inline-flex;
    flex-direction: column;
  }
}
.version-box {
  height: 100%;
  padding-right: 10px;
}
</style>
