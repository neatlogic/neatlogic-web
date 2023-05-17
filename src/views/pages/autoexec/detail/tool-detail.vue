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
  <div class="tool-detail">
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsContain
      v-if="toolConfig"
      siderPosition="right"
      :siderWidth="204"
      :clearStyle="true"
      border="border"
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ toolConfig.name }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group no-line" style="text-align: right;">
          <span v-if="!downloadLoading" v-download="exportWord" class="tsfont-export action-item">{{ $t('term.autoexec.libraryusageinstructions') }}</span>
          <span v-if="downloadLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
            <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
            {{ $t('term.autoexec.libraryusageinstructions') }}
          </span>
          <template v-for="(operate, index) in toolConfig.operateList">
            <span
              v-if="operate.value != 'active'"
              :key="index"
              :class="getIcon(operate.value, operate)"
              :title="operate.disabledReason"
              class="action-item"
              @click="doAction(operate.value, operate)"
            >{{ operate.text }}</span>
            <span
              v-else
              :key="operate.value"
              class="action-item test"
              style="flex: 1;"
              :class="{ disable: operate.disabled }"
              :title="operate.disabledReason"
              @click.stop
            >
              <TsFormSwitch
                v-model="toolConfig.isActive"
                :true-value="1"
                :false-value="0"
                :disabled="operate.disabled ? true : false"
                showStatus
                @on-change="toggleAction()"
              ></TsFormSwitch>
            </span>
          </template>
        </div>
      </template>
      <template v-slot:sider>
        <BasicDetail :config="toolConfig" operationType="tool"></BasicDetail>
      </template>
      <template v-slot:content>
        <div class="main pr-md">
          <div class="detail-content">
            <div v-if="toolConfig.description" class="bg-op padding mb-md radius-lg">{{ toolConfig.description }}</div>
            <div class="params-detail">
              <div class="item-list">
                <div class="h4 pb-md">{{ $t('page.inputparam') }}</div>
                <div v-if="!toolConfig.inputParamList || toolConfig.inputParamList.length == 0" class="text-tip">{{ $t('page.notarget', {target: $t('page.inputparam')}) }}</div>
                <template v-else>
                  <ParamsReadonly
                    v-for="(iParam,iindex) in toolConfig.inputParamList"
                    :key="iindex"
                    :typeList="paramsTypeList"
                    :config="iParam"
                  ></ParamsReadonly>
                </template>
              </div>
              <div v-if="toolConfig.argument" class="item-list free-params-box">
                <div class="h4 pb-md">{{ $t('term.autoexec.freeparameter') }}</div>
                <ParamsReadonly :typeList="paramsTypeList" :config="toolConfig.argument"></ParamsReadonly>
              </div>
              <div class="item-list">
                <div class="h4 pb-md">{{ $t('page.outputparam') }}</div>
                <div v-if="!toolConfig.outputParamList || toolConfig.outputParamList.length == 0" class="text-tip">{{ $t('page.notarget', {target: $t('page.outputparam')}) }}</div>
                <template v-else>
                  <ParamsReadonly
                    v-for="(oParam,oindex) in toolConfig.outputParamList"
                    :key="oindex"
                    :typeList="outputParamTypeList"
                    :config="oParam"
                  ></ParamsReadonly>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </TsContain>
    <TsDialog
      v-if="isShow"
      :isShow.sync="isShow"
      @on-close="close()"
      @on-ok="saveAction()"
    >
      <template v-slot:header>
        <div>{{ $t('term.autoexec.publishcombinetool') }}</div>
      </template>
      <template v-slot>
        <div>
          <TsForm ref="settingForm" v-model="settingConfig" :itemList="settingForm"></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import ParamsReadonly from '@/views/pages/autoexec/components/param/params-readonly.vue';
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    ParamsReadonly,
    BasicDetail: resolve => require(['./scriptDetail/edit/basic-detail'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  filters: {},
  directives: { download },
  props: {},
  data() {
    return {
      id: null,
      fromPath: '',
      isLoading: true,
      toolConfig: null,
      downloadLoading: false,
      paramMode: {
        input: {
          mode: 'input'
        },
        output: {
          mode: 'output'
        }
      },
      actionIcons: {
        generateToCombop: 'tsfont-tool',
        copy: 'tsfont-copy',
        export: 'tsfont-export',
        delete: 'tsfont-trash-o',
        test: 'tsfont-test'
      },
      isShow: false,
      settingConfig: {
        name: '',
        typeId: '',
        description: ''
      },
      settingForm: [
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          validateList: ['required', 'name-special', { name: 'searchUrl', url: '/api/rest/autoexec/combop/save', key: 'name', message: this.$t('message.targetisexists', {target: this.$t('page.name')}) }]
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
          transfer: true
        },
        {
          type: 'textarea',
          name: 'description',
          value: '',
          label: this.$t('page.description'),
          transfer: true,
          maxlength: 500
        }
      ],
      outputParamTypeList: [] //输出参数类型
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.id) {
      this.id = parseInt(this.$route.query.id);
    }
    this.initData();
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
    async initData() {
      await this.getParamsTypeLit();
      await this.getDetail();
    },
    getDetail() {
      //根据id获取详情
      let param = { id: this.id };
      this.$api.autoexec.tool
        .getToolDetail(param)
        .then(res => {
          if (res.Status == 'OK') {
            this.toolConfig = res.Return;
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    doAction(methods, item) {
      this[methods](item);
    },
    generateToCombop(item) {
      if (item.disabled) {
        return;
      }
      Object.keys(this.settingConfig).forEach(key => {
        let i = this.toolConfig[key];
        this.settingConfig[key] = i;
      });
      this.isShow = true;
    },
    close() {
      this.isShow = false;
    },
    saveAction() {
      if (!this.$refs.settingForm.valid()) {
        return;
      }
      let data = {
        operationId: this.id,
        operationType: 'tool',
        ...this.settingConfig
      };
      this.$api.autoexec.script
        .generateAction(data)
        .then(res => {
          if (res.Status == 'OK' && res.Return) {
            this.$router.push({ 
              path: '/action-detail',
              query: { 
                id: res.Return,
                versionStatus: 'passed'
 
              }
            });
          }
        })
        .finally(() => {
          this.isShow = false;
        });
    },
    test() {
      this.$router.push({
        path: '/test-detail',
        query: {
          id: this.id,
          type: 'tool',
          execMode: this.toolConfig.execMode
        }
      });
    },
    toggleAction() {
      let param = {
        id: this.toolConfig.id,
        isActive: this.toolConfig.isActive
      };
      this.$api.autoexec.tool.updateToolStatus(param).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess')); //保存成功
          this.getDetail();
        }
      });
    },
    getParamsTypeLit() { //选择组件类型
      let data = {
        enumClassList: ['neatlogic.framework.autoexec.constvalue.ParamType', 'neatlogic.framework.autoexec.constvalue.OutputParamType']
      };
      return this.$api.common.getBatchSelectList(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return || {};
          this.paramsTypeList = obj['neatlogic.framework.autoexec.constvalue.ParamType'] || [];
          this.outputParamTypeList = obj['neatlogic.framework.autoexec.constvalue.OutputParamType'] || [];
        }
      });
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
    },
    exportWord() {
      // 导出参数说明
      return {
        url: '/api/binary/autoexec/tool/param/export',
        method: 'post',
        params: {toolId: this.id, isAll: 0},
        changeStatus: status => {
          if (status == 'start') {
            this.downloadLoading = true;
          } else if (status == 'success' || status == 'error') {
            this.downloadLoading = false;
          }
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.main {
  height: 100%;
  .detail-content {
    height: 100%;
    overflow-y: auto;
  }
  .item-list {
    padding-bottom: 16px;
  }
}
.free-params-box{
  .param-header{
    padding-bottom: @space-sm;
  }
  .param-list{
    position: relative;
    padding-right: 60px;
    padding-bottom: 16px;
    &:last-child{
      padding-bottom: 10px;
    }
    .btn-item{
      width: 50px;
      position: absolute;
      right: 0;
      top: 0;
      display: flex;
      justify-content: space-between;
      height: 32px;
      line-height: 32px;
    }
  }
  .item-col{
    display: flex;
    justify-content: space-between;
    height: 32px;
    line-height: 32px;
  }
}
</style>
