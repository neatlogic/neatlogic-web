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
  <div>
    <TsContain border="border">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back()"></span>
      </template>
      <template v-slot:topLeft>
        <span class="action-title-name h4">{{ oldId ? $t('page.copyscript'):$t('page.addscript') }}</span>
      </template>
      <template v-slot:topRight>
        <div v-if="!oldId" class="div-btn-contain action-group text-right no-line">
          <span v-show="current==0" class="action-item tsfont-arrow-right btn-icon" @click="nextStep()">{{ $t('page.thenextstep') }}</span>
          <span v-show="current==1" class="action-item tsfont-arrow-left btn-icon" @click="current=0">{{ $t('page.previousstep') }}</span>
          <span v-show="current==1" class="action-item tsfont-save btn-icon" @click="save">{{ $t('page.save') }}</span>
          <span v-show="current==1" class="action-item tsfont-send btn-icon" @click="submit">{{ $t('page.submitaudit') }}</span>
        </div>
        <div v-else class="div-btn-contain action-group text-right">
          <span class="action-item tsfont-save btn-icon" @click="save">{{ $t('page.save') }}</span>
        </div>
      </template>
      <template v-slot:content>
        <div class="step-main">
          <div v-if="!oldId" class="step">
            <Steps :current="current">
              <Step
                v-for="(litem, lindex) in stepList"
                :key="lindex"
                :title="litem"
              ></Step>
            </Steps>
          </div>
          <div v-show="current == 0" class="form">
            <TsForm ref="settingForm" v-model="settingConfig" :itemList="settingForm"></TsForm>
          </div>
          <div v-show="current == 1" class="auth btn">
            <div class="item-list">
              <div class="title require-label">{{ $t('term.autoexec.draftname') }}</div>
              <TsFormInput
                ref="versionForm"
                v-model="versionConfig.title"
                v-bind="versionForm"
              ></TsFormInput>
            </div>
            <VersionEdit ref="versionEdit" :typeList="paramsTypeList" :outputParamTypeList="outputParamTypeList"></VersionEdit>
          </div>
        </div>
      </template>
    </TsContain>
    <!-- 提交审核 -->
    <ReviewDialog
      :id="id"
      :isShow.sync="isReviewShow"
      :versionId="versionId"
      :type="userType"
      @updateData="updateData"
    ></ReviewDialog>
  </div>
</template>
<script>
import VersionEdit from './scriptDetail/common/version-edit.vue';
export default {
  name: 'ScriptDetail',
  components: {
    VersionEdit,
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    ReviewDialog: resolve => require(['./scriptDetail/edit/review-dialog.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  filters: {
  },
  props: {
  },
  data() {
    return {
      settingForm: [],
      oldId: null,
      scriptConfig: null, //脚本的数据
      current: 0,
      stepList: [this.$t('page.basicinfo'), this.$t('term.autoexec.createversion')],
      settingConfig: {
        name: '',
        typeId: '',
        catalogId: null,
        isLib: 0,
        execMode: null,
        riskId: null,
        customTemplateId: null,
        description: ''
      },
      formList: [
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          width: '100%',
          validateList: [
            'required', 
            'name-special',
            { name: 'searchUrl',
              url: '/api/rest/autoexec/script/save', 
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('page.name')})
            }
          ]
         
        },
        {
          type: 'select',
          name: 'typeId',
          value: '',
          dataList: [],
          label: this.$t('term.autoexec.toolclassification'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          validateList: ['required'],
          search: true,
          dynamicUrl: '/api/rest/autoexec/type/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getToolClassificationList,
          transfer: true,
          width: '100%'
         
        },
        {
          type: 'tree',
          name: 'catalogId',
          value: '',
          dataList: [],
          label: this.$t('term.autoexec.directorytool'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          validateList: ['required'],
          search: false,
          textName: 'name',
          valueName: 'id',
          transfer: true,
          width: '100%'
         
        },
        {
          name: 'isLib',
          type: 'radio',
          label: this.$t('term.autoexec.islibraryfile'),
          dataList: [
            {
              text: this.$t('page.yes'),
              value: 1
            },
            {
              text: this.$t('page.no'),
              value: 0
            }
          ],
          validateList: ['required'],
          transfer: true,
          onChange: (val) => {
            if (val && val == 1) {
              this.settingForm = this.formList.concat(this.isLibSettingForm);
              this.settingConfig.isLib = 1;
            } else {
              this.settingForm = this.formList.concat(this.isNotLibSettingForm);
              this.settingConfig.isLib = 0;
            }
            this.$refs.versionEdit.changeIsLib(val);
          }
        }
      ],
      isNotLibSettingForm: [
        {
          type: 'select',
          name: 'execMode',
          value: '',
          label: this.$t('page.executionmode'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          width: '100%',
          dynamicUrl: '/api/rest/universal/enum/get',
          params: {enumClass: 'ScriptExecMode'},
          dealDataByUrl: this.dealExecModeList,
          validateList: ['required']
        },
        {
          type: 'select',
          name: 'riskId',
          value: '',
          label: this.$t('term.autoexec.risklevel'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          width: '100%',
          dynamicUrl: '/api/rest/autoexec/risk/list',
          validateList: ['required']
        },
        {
          type: 'select',
          name: 'customTemplateId',
          label: this.$t('page.customtemplate'),
          value: '',
          dynamicUrl: '/api/rest/autoexec/customtemplate/search',
          params: {isActive: 1},
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          tooltip: this.$t('term.autoexec.jobdetailspecialinfo'),
          with: '100%',
          transfer: true
        },
        {
          type: 'textarea',
          name: 'description',
          value: '',
          maxlength: 500,
          label: this.$t('page.description'),
          width: '100%'
        }
      ],
      isLibSettingForm: [
        {
          type: 'textarea',
          name: 'description',
          value: '',
          maxlength: 500,
          label: this.$t('page.description'),
          width: '100%'
        }
      ],
      paramsTypeList: [],
      userType: 'submit', //审核人权限
      isReviewShow: false,
      versionId: null,
      id: null, //新建id
      versionForm: { 
        value: '',
        width: '50%',
        maxlength: 50,
        border: 'border',
        validateList: ['required', 'name-special']
      },      
      versionConfig: {
        title: ''
      },
      outputParamTypeList: [] //输出参数类型
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.oldId) {
      this.oldId = parseInt(this.$route.query.oldId);
    }
    this.getTreeListSync();
    if (this.$route.query.isLib && this.$route.query.isLib == 1) {
      this.settingForm = this.formList.concat(this.isLibSettingForm);
    } else {
      this.settingForm = this.formList.concat(this.isNotLibSettingForm);
    }
  },
  beforeMount() {},
  mounted() {
    this.getParamsTypeLit();
    if (this.oldId) {
      this.getDetail(this.oldId);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getTreeListSync() {
      for (let i = 0; i < this.formList.length; i++) {
        if (this.formList[i].name == 'catalogId') {
          this.formList[i].dataList = await this.$toolCatalogUtils.getTreeList();
        }
      }
    },
    getDetail(id) {
      //根据id获取详情
      let param = {
        id: id
      };
      this.$api.autoexec.script.getScriptBaseinfo(param).then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.scriptConfig = res.Return || null;
          Object.keys(this.settingConfig).forEach(key => {
            let i = this.scriptConfig[key];
            if (key == 'name') {
              this.settingConfig[key] = i + '_copy';
            } else {
              this.settingConfig[key] = i;
            }
          });
        }
      });
    },
    getParamsTypeLit() { //选择组件类型
      let data = {
        enumClassList: ['neatlogic.framework.autoexec.constvalue.ParamType', 'neatlogic.framework.autoexec.constvalue.OutputParamType']
      };
      return this.$api.common.getBatchSelectLit(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return || {};
          this.paramsTypeList = obj['neatlogic.framework.autoexec.constvalue.ParamType'] || [];
          this.outputParamTypeList = obj['neatlogic.framework.autoexec.constvalue.OutputParamType'] || [];
        }
      });
    },
    nextStep() {
      if (!this.$refs.settingForm.valid()) {
        return;
      }
      this.versionConfig.title = this.settingConfig.name + '_' + this.$utils.getCurrenttime('MMdd');
      this.current = 1;
    },
    async validate() {
      let valid = true;
      let validList = await this.$refs.versionEdit.valid();
      if (validList.length > 0) {
        valid = false;
      }
      if (!this.$refs.versionForm.valid()) {
        valid = false;
      }
      return valid;
    },
    async save() {
      let data = {};
      if (!this.oldId) {
        let isValid = await this.validate();
        if (!isValid) {
          return;
        }
        
        this.$nextTick(() => {
          data = Object.assign(data, this.settingConfig, this.versionConfig, this.$refs.versionEdit.save());
          if (this.versionId) {
            Object.assign(data, {versionId: this.versionId});
          }
          if (data && data.hasOwnProperty('catalogId')) {
            data.catalogId = this.$toolCatalogUtils.handleCatalogIdAlltoZero(data);
          }
          this.$api.autoexec.script.saveScript(data).then(res => {
            if (res.Status == 'OK') {
              let config = res.Return;
              this.id = config.id;
              this.versionId = config.versionId;
              this.$Message.success(this.$t('message.savesuccess'));
              this.$router.push({
                path: '/script-detail',
                query: {
                  versionId: this.versionId
                }
              });
            }
          });
        });
      } else {
        if (!this.$refs.settingForm.valid()) {
          return;
        }
        data = Object.assign(data, this.settingConfig, {id: this.oldId});
        if (data && data.hasOwnProperty('catalogId')) {
          data.catalogId = this.$toolCatalogUtils.handleCatalogIdAlltoZero(data);
        }
        this.$api.autoexec.script.copyScript(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.copysuccess'));
            this.$router.push({
              path: '/script-detail',
              query: {
                scriptId: res.Return
              }
            });
          }
        });
      }
    },
    async submit() {
      let isValid = await this.validate();
      if (!isValid) {
        return;
      }
      let data = Object.assign({}, this.settingConfig, this.versionConfig, this.$refs.versionEdit.save());
      if (data && data.hasOwnProperty('catalogId')) {
        data.catalogId = this.$toolCatalogUtils.handleCatalogIdAlltoZero(data);
      }
      let res = await this.$api.autoexec.script.saveScript(data);
      this.$Message.success(this.$t('message.commitsuccess'));
      let config = res.Return;
      this.id = config.id;
      this.versionId = config.versionId;
      let isReviewable = config.isReviewable;
      if (isReviewable == 1) {
        this.userType = 'review';
      } else {
        this.userType = 'submit';
      }
      await this.$api.autoexec.script.submitScript({ versionId: this.versionId}); 
      this.isReviewShow = true;
    },
    updateData(status) {
      let param = {
        scriptId: this.id,
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
    dealExecModeList(nodeList) {
      let columlist = [];
      if (nodeList && nodeList.length > 0) {
        columlist = nodeList.filter(item => {
          return item.value != 'native';
        });
      }
      return columlist;
    }
  },
  computed: {},
  watch: {},
  beforeRouteEnter(to, from, next) {
    //获取前一个路由信息，用来返回
    from.path != '/' && sessionStorage.setItem(to.path, JSON.stringify({ router: from.path, name: from.meta.title }));
    next(true);
  }
};
</script>
<style lang="less" scoped>
.step-main{
  padding-top: 20px;
  .step{ 
    width: 60%;
    margin: 0 auto;
    padding: 40px 0;
  }
  .form{
    width: 60%;
    margin: 0 auto;
  }
  .auth{
    width: 60%;
    margin: 0 auto;
  }
  .item-list{
    padding-bottom: 16px;
    .title{
      padding-bottom: 16px;
      font-size: 14px;
    }
  }
}
</style>
