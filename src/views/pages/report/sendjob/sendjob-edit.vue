<template>
  <div class="sendjob-edit">
    <TsContain border="border">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/sendjob-manage')">{{ $t('page.back') }}</span>
      </template>
      <template v-slot:topLeft>
        <TsFormInput v-model="jobConfig.name" :maxlength="50" :validateList="nameValidateList" />
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <TsFormSwitch v-model="jobConfig.isActive" :showStatus="true" />
          </div>
          <div class="action-item  text-action tsfont-eye" @click="previewJob">{{ $t('page.preview') }}</div>
          <div class="action-item  text-action tsfont-save" :class="{ 'text-disabled': isSaving }" @click="saveJob">{{ $t('page.save') }}</div>
          <div class="action-item  text-action tsfont-trash-s" :class="{ 'text-grey text-disabled': operation === 'add' }" @click="deleteJob">{{ $t('page.delete') }}</div>
        </div>
      </template>
      <div slot="content" class="sendjob-edit-content">
        <section class="form-section basic-info">
          <Divider orientation="left">{{ $t('page.basicinfo') }}</Divider>
          <TsForm ref="basicInfoForm" :itemList="basicInfoFormConfig">
            <template v-slot:toList>
              <TsFormSelect v-model="basicInfoFormConfig.toList.value" v-bind="formSelectConfig" :dealDataByUrl="dealDataByUrl">
                <template v-slot:option="{ item }">
                  <Tooltip
                    transfer
                    theme="light"
                    placement="left-end"
                    :disabled="$utils.isEmpty(item.teamNameList)"
                  >
                    <div>{{ item.userNameAndUserId }}</div>
                    <div slot="content">
                      <p>{{ getTeamNameList(item.teamNameList) }}</p>
                    </div>
                  </Tooltip>
                </template>
              </TsFormSelect>
            </template>
            <template v-slot:ccList>
              <TsFormSelect
                v-model="basicInfoFormConfig.ccList.value"
                v-bind="formSelectConfig"
                :validateList="[]"
                :dealDataByUrl="ccListDealDataByUrl"
              >
                <template v-slot:option="{ item }">
                  <Tooltip
                    transfer
                    theme="light"
                    placement="left-end"
                    :disabled="$utils.isEmpty(item.teamNameList)"
                  >
                    <div>{{ item.userNameAndUserId }}</div>
                    <div slot="content">
                      <p>{{ getTeamNameList(item.teamNameList) }}</p>
                    </div>
                  </Tooltip>
                </template>
              </TsFormSelect>
            </template>
          </TsForm>
        </section>
        <section class="form-section report-detail">
          <div>
            <Divider orientation="left">{{ $t('term.report.reportdetail') }}</Divider>
          </div>
          <div style="display:grid;grid-template-columns:120px auto;width:100%">
            <div></div>
            <div>
              <div class="mb-nm tsfont-plus text-href" @click="showAddDialog">{{ $t('term.report.addreport') }}</div>
              <Draggable
                v-model="jobConfig.reportList"
                tag="ol"
                :scroll="true"
                :animation="150"
                handle=".handle"
                class="report-list"
              >
                <li v-for="(report, index) in jobConfig.reportList" :key="report.id" class="report-item">
                  <div class="flex-between">
                    <div class="flex-start">
                      <i class="tsfont-bar handle"></i>
                      <h3 class="report-name">{{ report.name }}</h3>
                    </div>
                    <ul class="action-group">
                      <li class="action-item last text-action tsfont-eye" @click="previewReport(report)">{{ $t('page.preview') }}</li>
                      <li class="action-item last text-action tsfont-trash-s" @click="removeReport(index)">{{ $t('page.delete') }}</li>
                    </ul>
                  </div>
                  <div v-if="report.paramList && report.paramList.length > 0" style="margin-top:20px">
                    <TsRow>
                      <Col v-for="widget in report.paramList" :key="widget.id" :span="widget.width">
                        <div class="form-block">
                          <div class="block-left">{{ widget.label }}</div>
                          <div class="block-right">
                            <Component :is="widget.type" :config="widget.config" @setParam="widget.value = $event" />
                          </div>
                        </div>
                      </Col>
                    </TsRow>
                  </div>
                </li>
              </Draggable>
            </div>
          </div>
        </section>
        <section class="form-section cron">
          <Divider orientation="left">{{ $t('term.report.scheduledsending') }}</Divider>
          <TsForm ref="cronForm" :itemList="getForm('cron')" />
        </section>
      </div>
    </TsContain>

    <!-- 添加对话框 -->
    <TsDialog :isShow.sync="isAddDialogShow" :title="$t('term.report.addreport')" @on-ok="addReport">
      <TsForm ref="dialogForm" :itemList="getForm('reportIdList')" />
    </TsDialog>

    <!-- 预览对话框 -->
    <TsDialog
      :isShow.sync="isPreviewDialogShow"
      :hasFooter="false"
      width="large"
      fullscreen
      :title="previewType === 'sendjob' ? $t('term.report.sendplan') : $t('term.report.previewreport')"
      @on-close="setBasicFormReadonly(false)"
    >
      <div v-if="previewType === 'report'" :style="{ overflow: 'auto' }">
        <h3 :style="{ padding: '0 0 10px 80px' }">{{ previewContent.name }}</h3>
        <div v-html="previewContent.content"></div>
      </div>
      <div v-else-if="previewType === 'sendjob'">
        <TsForm v-if="!isLoading" :itemList="basicInfoFormConfig">
          <template v-slot:toList>
            <TsFormSelect
              v-model="basicInfoFormConfig.toList.value"
              v-bind="formSelectConfig"
              :readonly="true"
              :dealDataByUrl="dealDataByUrl"
            >
              <template v-slot:option="{ item }">
                <Tooltip
                  transfer
                  theme="light"
                  placement="left-end"
                  :disabled="$utils.isEmpty(item.teamNameList)"
                >
                  <div>{{ item.userNameAndUserId }}</div>
                  <div slot="content">
                    <p>{{ getTeamNameList(item.teamNameList) }}</p>
                  </div>
                </Tooltip>
              </template>
            </TsFormSelect>
          </template>
          <template v-slot:ccList>
            <TsFormSelect
              v-model="basicInfoFormConfig.ccList.value"
              v-bind="formSelectConfig"
              :readonly="true"
              :dealDataByUrl="ccListDealDataByUrl"
            >
              <template v-slot:option="{ item }">
                <Tooltip
                  transfer
                  theme="light"
                  placement="left-end"
                  :disabled="$utils.isEmpty(item.teamNameList)"
                >
                  <div>{{ item.userNameAndUserId }}</div>
                  <div slot="content">
                    <p>{{ getTeamNameList(item.teamNameList) }}</p>
                  </div>
                </Tooltip>
              </template>
            </TsFormSelect>
          </template>
        </TsForm>
        <div v-for="(report, index) in previewContent" :key="index" style="overflow: auto">
          <h3 style="padding: 20px 0 10px 80px">{{ report.name }}</h3>
          <ReportMain :content="report.content || ''"></ReportMain>
        </div>
      </div>
      <Loading :loadingShow="isLoading" type="fix" />
    </TsDialog>
  </div>
</template>

<script>
import * as widgets from '@/views/pages/report/report/paramhandler';
export default {
  name: 'SendjobEdit',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    Draggable: () => import('vuedraggable'),
    ReportMain: () => import('../component/report-main.vue'),
    ...widgets
  },
  data() {
    return {
      fromPath: '',
      operation: this.$route.query.operation,
      isLoading: false,
      isSaving: false,
      isAddDialogShow: false,
      isPreviewDialogShow: false,
      previewType: 'report',
      cache: new Map(),
      previewContent: {},
      formSelectConfig: {
        valueName: 'uuid',
        textName: 'userNameAndUserId',
        filterName: ['userId', 'uuid', 'userName'],
        allowCreate: true,
        multiple: true,
        search: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/user/search/forselect',
        params: {
          needTeam: true
        },
        rootName: 'tbodyList'
      },
      jobConfig: {
        id: null,
        name: this.$route.query.name,
        isActive: 1,
        reportList: []
      },
      nameValidateList: [
        'required',
        'name-special',
        {
          name: 'searchUrl',
          url: 'api/rest/report/sendjob/save',
          key: 'name',
          params: () => ({ id: this.jobConfig.id })
        }
      ],
      basicInfoFormConfig: {
        emailTitle: {
          type: 'text',
          readonly: false,
          label: this.$t('page.title'),
          validateList: ['required']
        },
        emailContent: {
          type: 'textarea',
          label: this.$t('page.textmainbody'),
          readonly: false,
          autosize: { minRows: 2 }
        },
        toList: {
          type: 'slot',
          label: this.$t('page.recipient'),
          readonly: false,
          value: []
        },
        ccList: {
          type: 'slot',
          label: this.$t('page.cc'),
          readonly: false,
          value: []
        }
      },
      formConfig: {
        reportIdList: {
          type: 'select',
          label: this.$t('term.report.report'),
          require: ['required'],
          multiple: true,
          value: [],
          search: true,
          dynamicUrl: '/api/rest/report/search',
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          transfer: true
        },
        cron: {
          type: 'quartz',
          defaultValue: '',
          label: this.$t('page.executeplan'),
          showType: 'edit',
          validateList: ['required']
        }
      }
    };
  },
  created() {
    this.init(this.operation);
  },
  methods: {
    getTeamNameList(list) {
      let teamNameList = '';
      if (list && !this.$utils.isEmpty(list)) {
        teamNameList = list.join(',');
      }
      return teamNameList;
    },
    dealDataByUrl(nodeList) {
      return this.handleDealDataByUrl(nodeList, 'toList');
    },
    handleDealDataByUrl(nodeList, type) {
      let dropDownList = [];
      let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      let obj = {
        toList: this.basicInfoFormConfig.toList.value,
        ccList: this.basicInfoFormConfig.ccList.value
      };
      let dataList = obj[type] || [];
      if (nodeList && nodeList.length) {
        dropDownList = nodeList;
        if (this.operation != 'add') {
          dataList &&
            dataList.forEach(item => {
              if (item && reg.test(item)) {
                dropDownList.unshift({
                  uuid: item,
                  userName: item,
                  userId: item
                });
              }
            });
        }
        dropDownList &&
          dropDownList.forEach(item => {
            item['userNameAndUserId'] = `${item.userName}(${item.userId})`;
          });
      }
      return dropDownList;
    },
    ccListDealDataByUrl(nodeList) {
      return this.handleDealDataByUrl(nodeList, 'ccList');
    },
    async init(operation) {
      this.initialJob = this.$utils.deepClone(this.jobConfig);
      if (operation === 'add') {
        document.title = this.$t('term.report.newsendplan');
        return;
      }
      const params = { id: this.$route.query.id };
      const res = await this.$api.report.sendjob.get(params);
      this.jobConfig = res.Return.job;
      if (operation === 'edit') {
        document.title = this.$t('term.report.editsendplan');
      } else if (operation === 'copy') {
        document.title = this.$t('term.report.copysendplan');
        this.jobConfig.name = this.jobConfig.name + '_copy';
        this.jobConfig.id = null;
      }
      this.formConfig.reportIdList.value = this.jobConfig.reportList.map(report => report.id);
      for (let i in this.formConfig) {
        this.$set(this.formConfig[i], 'value', this.jobConfig[i]);
        this.$set(this.formConfig[i], 'onChange', value => {
          this.$set(this.jobConfig, i, value);
        });
      }
      for (let i in this.basicInfoFormConfig) {
        this.$set(this.basicInfoFormConfig[i], 'value', this.jobConfig[i]);
      }
      setTimeout(() => {
        this.initialJob = this.$utils.deepClone(this.jobConfig);
      });
    },
    async previewJob() {
      this.previewType = 'sendjob';
      this.isLoading = true;
      this.setBasicFormReadonly(true);
      this.isPreviewDialogShow = true;
      const promiseList = this.jobConfig.reportList.map(report => {
        return this.getReportContent(report);
      });
      const reportContentList = await Promise.all(promiseList);
      this.previewContent = reportContentList;
      this.isLoading = false;
    },
    async previewReport(report) {
      this.previewType = 'report';
      this.previewContent = '';
      this.isLoading = true;
      this.isPreviewDialogShow = true;
      this.previewContent = await this.getReportContent(report);
      this.isLoading = false;
    },
    async getReportContent(report) {
      const reportParams = report.paramList.reduce(
        (result, { name, value }) => {
          if (![undefined, null, ''].includes(value)) {
            result[name] = value;
          }
          return result;
        },
        { id: report.id }
      );
      let key = Array.from(this.cache.keys()).find(k => {
        let isSame = this.$utils.isSame(k, reportParams);
        return isSame;
      });
      if (key) return this.cache.get(key);
      const content = await this.$api.report.sendjob.getReportContent(reportParams);
      const result = {
        content,
        name: report.name
      };
      this.cache.set(reportParams, result);
      return result;
    },
    async deleteJob() {
      if (this.operation === 'add') return;
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.jobConfig.name}),
        btnType: 'error',
        'on-ok': async vnode => {
          const params = { id: this.jobConfig.id };
          const res = await this.$api.report.sendjob.delete(params);
          this.initialJob = this.$utils.deepClone(this.jobConfig);
          this.$Message.success(this.$t('message.deletesuccess'));
          vnode.isShow = false;
          this.$router.push({ name: 'sendjob-manage' });
        }
      });
    },
    removeReport(index) {
      this.jobConfig.reportList.splice(index, 1);
    },
    async saveJob() {
      if (!this.$refs.basicInfoForm.valid()) return false;
      if (!this.$refs.cronForm.valid()) return false;
      if (this.jobConfig.reportList.length === 0) {
        this.$Notice.warning({ title: this.$t('page.error'), desc: this.$t('term.report.describe.reportisempty') });
        return false;
      }
      const reportList = this.jobConfig.reportList.map(report => {
        const { id, paramList } = report;
        let formValue = {};
        let condition = {};
        paramList &&
          paramList.forEach(({ name, value }) => {
            formValue[name] = value;
            condition[name] = value;
          });
        return { id, formValue, condition };
      });
      const params = { ...this.jobConfig, ...this.$refs.basicInfoForm.getFormValue(), ...this.$refs.cronForm.getFormValue(), reportList };
      this.isSaving = true;
      await this.$api.report.sendjob
        .save(params)
        .then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.operation = 'edit';
            this.jobConfig.id = res.Return.id;
            this.initialJob = this.$utils.deepClone(this.jobConfig);
          }
        })
        .finally(() => {
          this.isSaving = false;
        });
    },
    async addReport() {
      if (!this.$refs.dialogForm.valid()) return;
      const reportIdList = this.$refs.dialogForm.getFormValue().reportIdList;
      const newReportIdList = reportIdList.filter(id => {
        if (this.jobConfig.reportList.some(report => report.id === id)) return false;
        return true;
      });
      const promiseList = newReportIdList.map(id => {
        return this.$api.report.report.getReportById(id);
      });
      const resList = await Promise.all(promiseList);
      resList.forEach(res => {
        this.jobConfig.reportList.push(res.Return);
      });
      this.isAddDialogShow = false;
    },
    showAddDialog() {
      this.isAddDialogShow = true;
      this.formConfig.reportIdList.value = this.jobConfig.reportList.map(report => report.id);
    },
    getForm(...list) {
      return list.reduce((formItemList, itemName) => {
        formItemList[itemName] = this.formConfig[itemName];
        return formItemList;
      }, {});
    },
    setBasicFormReadonly(isReadonly) {
      const basicForm = this.basicInfoFormConfig;
      for (let key in basicForm) {
        basicForm[key].readonly = isReadonly;
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 通过 `vm` 访问组件实例,将值传入fromPath
      vm.fromPath = from.path; //获取上层路由地址
    });
  },
  beforeRouteLeave(from, to, next, url) {
    let isSame = this.$utils.isSame(this.jobConfig, this.initialJob);
    if (isSame) {
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(
        this,
        {
          save: {
            fn: async vnode => {
              _this.initialJob = _this.$utils.deepClone(_this.jobConfig);
              return await _this.saveJob();
            }
          }
        },
        to,
        from,
        next,
        url
      );
    }
  }
};
</script>

<style lang="less" scoped>
.sendjob-edit {
  .input-wrapper {
    display: inline-block;
  }
  &-content {
    margin: 12px;
    .form-section {
      margin: 20px 10px;
      .form-caption {
        margin: 10px;
        font-size: 16px;
      }
    }
    .report-detail {
      .report-list {
        .report-item {
          .handle {
            cursor: move;
            padding: 4px;
            margin-right: 10px;
          }
          .report-name {
            font-size: 13px;
            font-weight: normal;
          }
        }
      }
    }
  }
}
</style>
