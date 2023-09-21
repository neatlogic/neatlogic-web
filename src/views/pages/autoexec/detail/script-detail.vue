/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="script-detail">
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsContain
      v-if="!isLoading && scriptConfig"
      siderPosition="right"
      :siderWidth="204"
      :clearStyle="true"
      border="border"
    >
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/script-manage')">{{ $getFromPage('term.autoexec.customtoollibrary') }}</span>
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
      <template v-slot:sider>
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
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: 'ScriptDetail',
  components: {
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
      tipText: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$route.query.scriptId && (this.scriptId = parseInt(this.$route.query.scriptId));
    this.$route.query.versionId && (this.versionId = this.$route.query.versionId);
    this.$route.query.status && (this.versionStatus = this.$route.query.status);
    if (this.versionId) {
      this.getDetail(parseInt(this.versionId), 'versionId');
    } else if (this.scriptId) {
      this.getDetail(this.scriptId);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getDetail(id, type) {
      //根据id获取详情
      this.isLoading = true;
      this.scriptConfig = null;
      let param = {};
      if (type && type == 'versionId') {
        param = {
          versionId: id
        };
      } else {
        param = {
          id: id,
          status: this.versionStatus
        };
      }
      this.$api.autoexec.script
        .getScriptDetail(param)
        .then(res => {
          if (res.Status == 'OK' && res.Return) {
            this.scriptConfig = res.Return.script;
            this.scriptId = this.scriptConfig.id;
            this.versionVo = this.scriptConfig.versionVo;
            this.title = this.versionVo.title || '';
            this.name = this.scriptConfig.name;
            this.currentVersionVo = this.scriptConfig.currentVersionVo;
            this.versionId = this.scriptConfig.versionVo.id;
            this.versionOperateList = this.scriptConfig.versionVo.operateList || null;
            this.versionType = this.versionVo.status;

            //isLib（是否库文件）标识为1时，标识该脚本是库文件，不支持使用测试功能，需要隐藏测试按钮
            this.updateIsLib(res.Return.script.isLib);
            this.getDefaultConfig();
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    doAction(methods, item) {
      this[methods](item);
    },
    edit(item) {
      if (item && item.disabled) {
        return;
      }
      this.typeDialog = '';
      this.title = this.name + '_' + this.$utils.getCurrenttime('MMdd');
      this.versionType = 'edit';
      this.$set(this.versionVo, 'status', 'draft');
      this.versionId = null;
      this.isEdit = true;
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
          title: this.title,
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
    async save(item, isLeave) {
      //编辑保存
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
    async submit(item) {
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
      let _this = this;
      return new Promise((resolve, reject) => {
        _this.$api.autoexec.script
          .validDelete({ id: this.scriptId })
          .then(res => {
            if (res.Status == 'OK') {
              _this.tipText = null;
            }
            resolve();
          })
          .catch(error => {
            _this.tipText = this.$t('term.autoexec.deletelastversiontip');
            resolve();
          });
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
      await this.save(null, true);
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
      this.typeDialog = 'compare';
      let data = this.saveData();
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
      if (!this.isEdit || this.$utils.isSame(initData, data)) {
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
        catalogId: this.scriptConfig.catalogId // 工具目录Id
       
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
      if (this.isEdit) {
        this.$set(initData, 'id', this.scriptId);
      } else {
        this.$set(initData, 'versionId', this.versionId);
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
    let data = this.saveData();
    if (data) {
      if (!this.isEdit || this.$utils.isSame(this.initData, data) || this.typeDialog == 'delete') {
        url ? this.$utils.gotoHref(url) : next(true);
      } else {
        let _this = this;
        this.$utils.jumpDialog.call(
          this,
          {
            save: {
              fn: async vnode => {
                return await _this.save(null, true);
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
