<template>
  <div>
    <TsDialog
      v-if="showTemplate == 'overview'"
      :title="$t('page.templatelist')"
      width="large"
      height="400px"
      className="setting-dialog"
      :isShow="isShow"
      :hasFooter="false"
      @on-close="close"
    >
      <TsRow>
        <Col span="16">
        </Col>
        <Col span="8">
          <InputSearcher
            v-model="keyword"
            @change="() => getTemplateList(1)"
          ></InputSearcher>
        </Col>
      </TsRow>
      <div>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div class="card-box">
          <TsCard
            v-bind="cardData"
            :firstBtn="true"
            :padding="true"
            :sm="12"
            :lg="8"
            :xl="8"
            :xxl="8"
            @updatePage="getTemplateList"
          >
            <template slot="firstBtn">
              <div class="add text-action" @click.stop="addSetting">
                <i class="ts-plus">{{ $t('page.template') }}</i>
              </div>
            </template>
            <template slot-scope="{ row }">
              <div class="template-item">
                <div :class="row.isDel?'text-mask':''">
                  <i class="icon-block" :class="setClass(row)"></i>
                  <div class="title">
                    <div class="overflow">
                      <span class="text-title">{{ row.name }}</span>
                    </div>
                  </div>
                  <div class="text-title overflow">{{ row.actionUser }}于{{ row.actionTime | formatDate }}{{ row.actionName }}</div>
                  <div class="operation text-tip" :class="row.isDel?'block':''">
                    <i class="ts-intersect" :title="$t('page.copy')" @click="editSetting(row, true)"></i>
                    <i class="tsfont-edit" :title="$t('page.edit')" @click="editSetting(row, false)"></i>
                    <i class="tsfont-trash-s" :title="$t('page.delete')" @click="delSetting(row)"></i>
                  </div>
                </div>
                <DelItme
                  v-if="row.isDel"
                  :delName="$t('dialog.content.deleteconfirm', {target: row.name})"
                  buttonSize="small"
                  @on-del="delTemplate(row)"
                  @on-close="closeTemplate(row)"
                ></DelItme>
              </div>
            </template>
          </TsCard>
        </div>
      </div>
    </TsDialog>
    <TsDialog
      v-if="templateDialog"
      :isShow.sync="templateDialog"
      :title="dialogTitle"
      width="large"
      height="634px"
      @on-ok="saveTemplate"
      @on-close="cancelDialog"
    >
      <template>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div class="template-content">
          <TsRow>
            <Col span="16" class="form-item">
              <div>
                <Alert>
                  <div>
                    {{ $t('term.framework.freemarkerhelp') }}
                    <Poptip
                      trigger="hover"
                      placement="right"
                      width="650"
                      :transfer="true"
                    >
                      <i class="tsfont-info-o cursor-pointer text-href"></i>
                      <div slot="content">
                        <freemarkerHelp></freemarkerHelp>
                      </div>
                    </Poptip>
                  </div>
                </Alert>
                <div class="form-box">
                  <TsForm ref="templateFormConfig" :itemList="templateFormConfig">
                    <template slot="title">
                      <div class="title-code">
                        <TsCodemirror
                          ref="title"
                          v-model="templateFormConfig[2].value"
                          :code="code"
                          :blurText="blurText"
                          @onBlur="onBlur"
                          @onFocus="onFocus('title')"
                          @repeatClick="repeatClick"
                        ></TsCodemirror>
                      </div>
                    </template>
                    <template slot="content">
                      <div class="content-code">
                        <TsCodemirror
                          ref="content"
                          v-model="templateFormConfig[3].value"
                          :code="code"
                          :blurText="blurText"
                          @onBlur="onBlur"
                          @onFocus="onFocus('content')"
                          @repeatClick="repeatClick"
                        ></TsCodemirror>
                      </div>
                    </template>
                  </TsForm>
                </div>
              </div>
            </Col>
            <Col span="8">
              <div class="right border-color">
                <div class="text-title" style="width:280px;">
                  <Alert>
                    <div>
                      {{ $t('message.framework.templateparamstip') }} 
                    </div>
                  </Alert>
                </div>
                <div class="param-search">
                  <InputSearcher
                    v-model="paramkeyword"
                    @change="() => getParamList(1)"
                  ></InputSearcher>
                </div>
                <div class="add-box">
                  <div class="add text-action border-color" @click="addParam">
                    <i class="ts-plus"></i>
                  </div>
                  <div v-if="isAddParam" class="param-edit">
                    <EditParam
                      :id="id"
                      :paramTypeList="paramTypeList"
                      @close="closeParam"
                      @updateParam="addParamData"
                    ></EditParam>
                  </div>
                </div>
                <div class="param-card">
                  <TsCard
                    v-bind="paramData"
                    pageType="scroll"
                    :padding="true"
                    :height="490"
                    :sm="24"
                    :lg="24"
                    :xl="24"
                    :xxl="24"
                    @reach-bottom="getParamList"
                  >
                    <template slot-scope="{ row }">
                      <div @click="changeText(row)">
                        <div class="parma-item" :title="row.isEditable ? '' : $t('term.framework.sysparamsnotedit')">
                          <div :class="row.isDel?'text-mask':''">
                            <div class="title">
                              <div class="type-block text-tip bg-grey">{{ row.paramTypeName }}</div>
                              <div class="text-title overflow">{{ row.name }}</div>
                            </div>
                            <div class="content text-title overflow">
                              {{ row.label }}
                            </div>
                            <div v-if="row.isEditable" class="operation text-tip bg-block" :class="row.isDel?'block':''">
                              <i class="tsfont-edit" :title="$t('page.edit')" @click.stop="editParam(row)"></i>
                              <i class="tsfont-trash-s" :title="$t('page.delete')" @click.stop="delParamSetting(row)"></i>
                            </div>
                          </div>
                          <DelItme
                            v-if="row.isDel"
                            :delName="$t('dialog.content.deleteconfirm', {target: row.name})"
                            buttonSize="small"
                            @on-del="delParam(row)"
                            @on-close="closeDelParam(row)"
                          ></DelItme>
                        </div>
                        <div v-if="row.isAddParam" class="param-edit">
                          <EditParam
                            :id="id"
                            :config="row"
                            :paramTypeList="paramTypeList"
                            :isEdit="true"
                            @close="closeParam"
                            @updateParam="saveParam(arguments,row)"
                          ></EditParam>
                        </div>
                      </div>
                    </template>
                  </TsCard>
                </div>
              </div>
            </Col>
          </TsRow>
        </div>
      </template>
    </TsDialog>
    <TemplateHelp
      v-if="helpDialog"
      :isDialog.sync="helpDialog"
      :policyId="id"
      @add="editSetting"
    ></TemplateHelp>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    freemarkerHelp: resolve => require(['./freemarker-help.vue'], resolve),
    EditParam: resolve => require(['./edit-param.vue'], resolve),
    DelItme: resolve => require(['./del-item.vue'], resolve),
    TemplateHelp: resolve => require(['./template-help.vue'], resolve)
  },
  filters: {},
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    id: {
      //策略id
      type: Number,
      default: null
    },
    handler: {
      type: String,
      default: null
    },
    isEditDialog: {
      type: Boolean,
      default: false
    },
    defaultTemplateId: {
      type: [String, Number],
      default: null
    },
    showTemplate: {
      type: String,
      default: 'overview'
    }
  },
  data() {
    return {
      loadingShow: true,
      keyword: '',
      paramkeyword: '',
      paramData: {
        classname: 'card-item',
        pageSize: 10,
        currentPage: 1,
        pageCount: 1,
        rowNum: 1,
        cardList: []
      },
      templateList: [],
      cardData: {
        classname: 'card-item',
        pageSize: 8,
        currentPage: 1,
        pageCount: 1,
        rowNum: 1,
        cardList: []
      },
      paramList: [],
      templateDialog: false,
      dialogTitle: this.$t('dialog.title.addtarget', {'target': this.$t('page.template')}),
      templateFormConfig: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required'],
          width: '100%'
        },
        {
          type: 'select',
          name: 'notifyHandler',
          label: this.$t('page.type'),
          validateList: ['required'],
          transfer: true,
          width: '100%'
        },
        {
          type: 'slot',
          name: 'title',
          label: this.$t('page.title'),
          validateList: ['required']
        },
        {
          type: 'slot',
          name: 'content',
          label: this.$t('page.content'),
          validateList: ['required']
        }
      ],
      selectHandlerList: [],
      templateId: null, //模板id
      isEdit: false,
      notifyHandler: '', //类型
      blurText: '', //失焦对象
      code: '',
      isAddParam: false,
      helpDialog: false
    };
  },
  beforeCreate() {},
  created() {
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
    initData() {
      this.gethandlerList();
      this.getTemplateList();
      this.getParamtypeList();
      this.getParamList();
    },
    close() {
      this.$emit('update:isShow', false);
    },
    getTemplateList(currentPage) {
      let data = {
        keyword: this.keyword,
        policyId: this.id,
        notifyHandler: this.notifyHandler || '',
        currentPage: 1
      };
      if (currentPage) {
        this.$set(data, 'currentPage', currentPage);
      }
      data.pageSize = this.cardData.pageSize;
      this.$api.codehub.tactics.getTemplateList(data).then(res => {
        if (res.Status == 'OK') {
          this.loadingShow = false;
          let config = res.Return;
          this.templateList = config.templateList;
          this.cardData.cardList = config.templateList;
          this.cardData.pageCount = config.pageCount;
          this.cardData.pageSize = config.pageSize;
          this.cardData.rowNum = config.rowNum;
          this.cardData.currentPage = config.currentPage;
        }
      });
    },
    gethandlerList() {
      this.$api.codehub.tactics.handlerList().then(res => {
        if (res.Status == 'OK') {
          this.selectHandlerList = JSON.parse(JSON.stringify(res.Return));
          this.selectHandlerList.unshift({
            value: 'all',
            text: this.$t('page.allofthem')
          });
          this.templateFormConfig[1].dataList = res.Return;
        }
      });
    },
    //获取参数列表
    getParamList(currentPage) {
      if (currentPage && this.paramData.pageCount > 0 && currentPage > this.paramData.pageCount) {
        return false;
      }
      let data = {
        keyword: this.paramkeyword,
        policyId: this.id,
        currentPage: currentPage || 1,
        pageSize: this.paramData.pageSize
      };
      if (data.currentPage == 1) {
        this.paramData.cardList = [];
      }
      this.$api.codehub.tactics.notifyParamList(data).then(res => {
        if (res.Status == 'OK') {
          this.loadingShow = false;
          let config = res.Return;
          this.paramList = config.paramList;
          this.paramData.cardList.push(...config.paramList);
          this.paramData.pageCount = config.pageCount;
          this.paramData.rowNum = config.rowNum;
          this.paramData.currentPage = config.currentPage;
        }
      });
    },
    getParamtypeList() {
      let data = {
        handler: this.handler
      };
      this.$api.codehub.tactics.getParamtypeList(data).then(res => {
        if (res.Status == 'OK') {
          const paramTypeList = res.Return;
          this.paramTypeList = paramTypeList;
        }
      });
    },
    addSetting() {
      this.templateDialog = true;
    },
    saveTemplate() {
      if (this.$refs.templateFormConfig.valid()) {
        const formData = this.$refs.templateFormConfig.getFormValue();
        formData.title = this.$refs.title.saveData();
        formData.content = this.$refs.content.saveData();
        if (formData.title === '' || formData.content === '') {
          this.$Notice.info({
            title: this.$t('form.validate.completetheform'),
            duration: 1.5
          });
          return;
        }
        if (this.templateList.find(d => d.name == formData.name) && !this.isEdit) {
          this.$Notice.info({
            title: this.$t('form.validate.repeat', {target: this.$t('page.templatename')}),
            duration: 1.5
          });
          return;
        }
        const data = Object.assign({ config: this.config, policyId: this.id, id: this.templateId }, formData);
        this.$api.codehub.tactics.templateSave(data).then(res => {
          if (res.Status == 'OK') {
            this.$Notice.success({
              title: this.$t('message.savesuccess'),
              duration: 1.5
            });
            this.getTemplateList();
            this.templateDialog = false;
          }
        });
      }
    },
    cancelDialog() {
      this.templateFormConfig.forEach(item => {
        item.value = null;
      });
      this.templateId = null;
      this.isEdit = false;
      this.blurText = '';
      this.$emit('closeEdit');
    },
    onBlur() {
      setTimeout(() => {
        this.blurText = '';
      }, 200);
    },
    onFocus(val) {
      setTimeout(() => {
        this.blurText = val;
      }, 250);
    },
    //重复点击
    repeatClick(val) {
      setTimeout(() => {
        this.blurText = val;
      }, 300);
    },
    changeText(item) {
      if (this.blurText) {
        this.code = item.freemarkerTemplate;
        this.$refs[this.blurText].changeCode();
      }
    },
    //编辑、复制
    editSetting(val, isCopy) {
      this.templateDialog = true;
      this.isEdit = true;
      this.templateId = val.id;
      this.templateFormConfig.forEach(item => {
        item.value = val[item.name];
      });
      if (isCopy) {
        this.dialogTitle = this.$t('term.report.copytemplate');
        this.templateFormConfig[0].value = val.name + '_copy';
        this.isEdit = false;
        this.templateId = null;
      } else if (!val.name) {
        this.templateFormConfig[0].value = val.trigger;
      }
    },
    //删除
    delSetting(item) {
      this.$set(item, 'isDel', true);
    },
    delTemplate(item) {
      let data = {
        policyId: this.id,
        id: item.id
      };
      this.$api.codehub.tactics.templateDelete(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          this.getTemplateList();
        }
      });
    },
    closeTemplate(item) {
      this.$set(item, 'isDel', false);
    },
    editTemplate() {
      //编辑模板信息
      let data = {
        policyId: this.id,
        id: this.templateId
      };
      this.$api.codehub.tactics.getTemplateData(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return;
          this.templateDialog = true;
          this.isEdit = true;
          this.templateId = obj.id;
          this.templateFormConfig.forEach(item => {
            item.value = obj[item.name];
          });
        }
      });
    },
    addParam() {
      this.isAddParam = true;
      this.paramData.cardList.forEach(e => {
        this.$set(e, 'isAddParam', false);
      });
    },
    closeParam(config) {
      if (config) {
        this.paramData.cardList.forEach(e => {
          if (e.name == config.name) {
            this.$set(e, 'isAddParam', false);
          }
        });
      } else {
        this.isAddParam = false;
      }
    },
    saveParam(arr, item) {
      this.$set(item, 'isAddParam', false);
      this.$set(item, 'paramTypeName', arr[0].paramTypeName);
      this.$set(item, 'label', arr[0].label);
    },
    addParamData() {
      this.paramData.cardList = [];
      this.getParamList(1);
    },
    editParam(item) {
      //编辑参数
      this.isAddParam = false;
      this.$set(item, 'isAddParam', true);
    },
    delParamSetting(item) {
      this.$set(item, 'isDel', true);
    },
    delParam(item) {
      let data = {
        policyId: this.id,
        name: item.name
      };
      this.$api.codehub.tactics.paramDelete(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          const list = this.paramData.cardList.filter(p => p.name != item.name);
          this.paramData.cardList = list;
        }
      });
    },
    closeDelParam(item) {
      this.$set(item, 'isDel', false);
    },
    lookHelp() {
      this.helpDialog = true;
    }
  },
  computed: {
    setClass() {
      return function(item) {
        let icon_class = '';
        switch (item.notifyHandler) {
          case 'com.techsure.module.codehub.notify.EmailNotifyHandler':
            icon_class = 'text-primary tsfont-mail-s';
            break;
          case 'com.techsure.module.codehub.notify.WeChatGroupNotifyHandler':
            icon_class = 'text-warning tsfont-team-s';
            break;
          case 'com.techsure.module.codehub.notify.WeChatNotifyHandler':
            icon_class = 'text-success ts-chat';
            break;
        }
        return icon_class;
      };
    }
  },
  watch: {
    isEditDialog: {
      handler(val) {
        if (val) {
          if (this.defaultTemplateId) {
            this.templateId = this.defaultTemplateId;
            this.editTemplate();
          }
          this.templateDialog = true;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.setting-dialog {
  .add {
    width: 100%;
    height: 70px;
    line-height: 70px;
    text-align: center;
    cursor: pointer;
  }
  .card-box {
    padding-top: 16px;
    /deep/ .tscard-body {
      padding: 0 !important;
    }
  }
  .template-item {
    width: 100%;
    padding: 14px 16px 14px 34px;
    position: relative;
    height: 72px;
    .title {
      margin-bottom: 4px;
    }
    .icon-block {
      position: absolute;
      left: 12px;
      top: 16px;
    }
    .operation {
      display: none;
      position: absolute;
      right: 10px;
      top: 10px;
      font-size: 14px;
      > i {
        cursor: pointer;
        padding-left: 10px;
      }
    }
    &:hover {
      .operation {
        display: block;
      }
    }
  }
}

.template-content {
  height: 100%;
  .form-item {
    height: 610px;
    overflow: auto;
  }
  .right {
    width: 310px;
    height: 610px;
    overflow: hidden;
    border-left: 1px solid;
    padding-left: 24px;
    /deep/ .ivu-alert {
      padding: 8px;
    }
    .param-search {
      padding-bottom: 10px;
      width: 280px;
    }
    .add-box {
      position: relative;
      padding-bottom: 2px;
    }
    .add {
      width: 280px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      border: 1px dashed;
    }
    .param-edit {
      position: absolute;
      top: 0;
      z-index: 2;
    }
    .param-card {
      /deep/ .tscard-body {
        padding: 0 !important;
        position: relative;
        overflow: initial;
      }
    }
    .parma-item {
      width: 100%;
      height: 72px;
      padding: 6px 12px;
      position: relative;
      .title {
        .type-block {
          position: absolute;
          right: 12px;
          height: 18px;
          line-height: 16px;
          padding: 0 @space-xs;
          margin-right: -12px;
          width: fit-content;
          width: -webkit-fit-content;
          width: -moz-fit-content;
        }
      }
      .content {
        margin-top: 4px;
        width: 100%;
      }
      .operation {
        display: none;
        position: absolute;
        top: 6px;
        right: 0;
        padding-right: 12px;
        font-size: 14px;
        > i {
          cursor: pointer;
          padding-left: 10px;
        }
      }
      &:hover {
        .operation {
          display: block;
        }
      }
    }
  }
  .form-box {
    .title-code {
      /deep/ .CodeMirror-lines {
        min-height: 150px !important;
      }
    }
    .content-code {
      /deep/ .CodeMirror-lines {
        min-height: 250px !important;
      }
    }
  }
}
.block {
  display: block !important;
}
</style>
