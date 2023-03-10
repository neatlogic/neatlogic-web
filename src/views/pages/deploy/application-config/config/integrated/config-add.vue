<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage('', 'term.deploy.configurationlist') }}</span>
      </template>
      <template v-slot:topLeft>
        <span class="tsfont-question-s text-action" @click="openConfigAddHelpDialog">{{ $t('page.help') }}</span>
      </template>
      <template v-slot:topRight>
        <Button type="primary" @click="saveConfig">{{ $t('button.save') }}</Button>
      </template>
      <template v-slot:content>
        <ul>
          <li>
            <Divider orientation="start">{{ $t('page.basicinfo') }}</Divider>
            <TsForm
              ref="basicForm"
              v-model="formValue"
              :item-list="basicFormList"
            ></TsForm>
          </li>
          <li>
            <Divider orientation="start">{{ $t('page.module') }}</Divider>
            <TsForm
              ref="moduleForm"
              v-model="formValue"
              :item-list="moduleFormList"
            ></TsForm>
          </li>
          <li>
            <Divider orientation="start">{{ $t('term.deploy.warehouse') }}</Divider>
            <TsForm
              ref="storehouseForm"
              v-model="formValue"
              :item-list="storehouseFormList"
            ></TsForm>
          </li>
          <li>
            <Divider orientation="start">{{ $t('term.deploy.action') }}</Divider>
            <TsForm
              ref="actionForm"
              v-model="formValue"
              :item-list="actionFormList"
            >
              <template v-slot:triggerType>
                <div>
                  <PoptipSelect
                    ref="triggerType"
                    v-model="formValue.triggerType"
                    :list="triggerTypeList"
                    transfer
                    border="border"
                    :isRequired="true"
                    :clearable="false"
                    @change="changeTriggerType"
                  ></PoptipSelect>
                </div>
              </template>
            </TsForm>
          </li>
          <li v-if="!loadingShow" class="pt-nm">
            <BatchAddJob
              v-show="formValue.action == 'create_batch_job'"
              ref="batchAddJob"
              :appSystemId="appSystemId"
              :value="actionFormValue"
            ></BatchAddJob>
            <SingleAddJob
              v-show="formValue.action == 'create_job'"
              ref="singleAddJob"
              :appSystemId="appSystemId"
              :appModuleId="formValue.appModuleId"
              :value="actionFormValue"
            ></SingleAddJob>
          </li>
        </ul>
      </template>
    </TsContain>
    <ConfigAddHelpDialog v-if="isShowConfigAddHelpDialog" @close="closeConfigAddHelpDialog"></ConfigAddHelpDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    BatchAddJob: resolve => require(['./batch-add-job'], resolve), // ??????????????????
    SingleAddJob: resolve => require(['./single-add-job'], resolve), // ??????????????????
    PoptipSelect: resolve => require(['@/resources/components/PoptipSelect/PoptipSelect.vue'], resolve),
    ConfigAddHelpDialog: resolve => require(['./config-add-help-dialog'], resolve) // ??????
  },
  props: {},
  data() {
    return {
      isInit: true, // ????????????????????????????????????????????????
      loadingShow: false,
      isShowConfigAddHelpDialog: false,
      appSystemId: null,
      branchFilterSvnTooltip: this.$t('term.deploy.branchfiltersvntooltip1') + '\n' + this.$t('term.deploy.branchfiltersvntooltip2') + '\n' + this.$t('term.deploy.branchfiltersvntooltip3') + '\n' + this.$t('term.deploy.branchfiltersvntooltip4') + '\n' + this.$t('term.deploy.branchfiltersvntooltip5') + '\n' + this.$t('term.deploy.branchfiltersvntooltip6') + '\n' + this.$t('term.deploy.branchfiltersvntooltip7') + '\n' + this.$t('term.deploy.branchfiltersvntooltip8') + '\n' + this.$t('term.deploy.branchfiltersvntooltip9') + '\n' + this.$t('term.deploy.branchfiltersvntooltip10') + '\n' + this.$t('term.deploy.branchfiltersvntooltip11') + '\n',
      dataList: [],
      actionFormValue: {},
      initData: {}, // ????????????????????????????????????????????????
      formValue: {
        // ??????????????????????????????????????????????????????????????????
        id: null,
        name: '',
        isActive: 1,
        appModuleId: null,
        repoType: 'gitlab',
        repoServerAddress: '',
        repoName: '',
        branchFilter: '',
        event: 'post-receive',
        action: 'create_job',
        gitlabUsername: '',
        gitlabPassword: '',
        triggerType: null,
        triggerTime: null,
        delayTime: null
      },
      basicFormList: [ // ????????????
        {
          name: 'id',
          type: 'text',
          label: '#id',
          isHidden: true
        },
        {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: '/api/rest/deploy/ci/save',
              key: 'name',
              message: this.$t('form.validate.repeat', {target: this.$t('page.name')}),
              params: { id: '' }
            }],
          maxlength: 64
        },
        {
          name: 'isActive',
          type: 'switch',
          label: this.$t('page.enable'),
          falseValue: 0,
          trueValue: 1
        }
      ],
      moduleFormList: [ // ??????
        {
          name: 'appModuleId',
          type: 'select',
          label: this.$t('term.deploy.module'),
          validateList: ['required'],
          dynamicUrl: '/api/rest/deploy/app/config/module/list',
          params: {},
          firstSelect: false,
          textName: 'abbrName',
          valueName: 'id'
        }
      ],
      storehouseFormList: [ // ??????
        {
          name: 'repoType',
          type: 'select',
          label: this.$t('term.deploy.warehousetype'),
          validateList: ['required'],
          defaultValueIsFirst: true,
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.deploy.constvalue.DeployCiRepoType' },
          onChange: (repoType) => {
            this.$set(this.formValue, 'repoType', repoType);
            this.handleRepoType(repoType);
          }
        },
        {
          name: 'gitlabUsername',
          type: 'text',
          label: this.$t('page.username'),
          validateList: ['required'],
          maxlength: 64
        },
        {
          name: 'gitlabPassword',
          type: 'password',
          label: this.$t('page.password'),
          validateList: ['required'],
          maxlength: 64,
          showPassword: false,
          clearable: true
        },
        {
          name: 'repoServerAddress',
          type: 'text',
          label: this.$t('term.deploy.serviceaddress'),
          validateList: ['required', 'url'],
          maxlength: 256
        },
        {
          name: 'repoName',
          type: 'text',
          label: this.$t('term.deploy.warehousename'),
          validateList: ['required'],
          maxlength: 128
        },
        {
          name: 'branchFilter',
          type: 'text',
          label: this.$t('page.branch'),
          maxlength: 128
        },
        {
          name: 'event',
          type: 'select',
          label: this.$t('page.event'),
          validateList: ['required'],
          dataList: [],
          desc: this.$t('term.deploy.branchactiondesc')
        }
      ],
      actionFormList: [
        {
          name: 'action',
          type: 'select',
          label: this.$t('term.deploy.actiontype'),
          validateList: ['required'],
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.deploy.constvalue.DeployCiActionType' },
          desc: this.$t('term.deploy.actiontypedesc'),
          onChange: () => {
            this.actionFormValue = {};
          }
        }, {
          type: 'slot',
          name: 'triggerType',
          label: this.$t('term.autoexec.triggertype'),
          validateList: ['required']
        },
        {
          name: 'triggerTime',
          type: 'time',
          isHidden: true,
          label: this.$t('page.plantime'),
          validateList: ['required']
        },
        {
          name: 'delayTime',
          type: 'number',
          isHidden: true,
          label: this.$t('term.deploy.delaytime(s)'),
          validateList: ['required']
        }
      ],
      triggerTypeList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getTriggerTypeList();
  },
  beforeMount() {},
  async mounted() {
    await this.getEventList();
    let query = this.$route.query || {};
    if (query && !this.$utils.isEmptyObj(query)) {
      if (query.id) {
        // ????????????
        let id = parseInt(query.id);
        this.isInit = false;
        this.getConfigInfoById(id);
        this.basicFormList.forEach((item) => {
          // ???????????????????????????????????????
          if (item.name == 'name') {
            item.validateList.forEach((innerItem) => {
              if (innerItem && innerItem.hasOwnProperty('params')) {
                this.$set(innerItem.params, 'id', id);
              }
            });
          }
        });
      } else {
        // ????????????
        this.$nextTick(() => {
          this.isInit = true;
          this.initData = this.getConfigData();
        });
        this.handleRepoType(this.formValue.repoType);
      }
      this.appSystemId = query.appSystemId ? parseInt(query.appSystemId) : null;
      this.moduleFormList && this.moduleFormList.forEach((item) => {
        // ????????????????????????????????????
        if (item.name == 'appModuleId') {
          this.$set(item, 'params', {appSystemId: this.appSystemId, authorityActionList: ['view']});
        }
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    valid() {
      let formList = ['basicForm', 'moduleForm', 'storehouseForm', 'actionForm', 'triggerType'];
      if (this.formValue) {
        if (this.formValue.action == 'create_job') {
          formList.push('singleAddJob');
        } else if (this.formValue.action == 'create_batch_job') {
          formList.push('batchAddJob');
        }
      }
      let isValid = true;
      formList.forEach((item) => {
        if (!this.$refs[item].valid()) {
          isValid = false;
        }
      });
      return isValid;
    },
    getConfigData() {
      let params = {};
      let formValue = this.$utils.deepClone(this.formValue);
      params = {
        appSystemId: this.appSystemId,
        ...formValue
      };
      if (this.formValue.action == 'create_job') {
        Object.assign(params, this.$refs.singleAddJob ? this.$refs.singleAddJob.getFormValue() : {});
      } else if (this.formValue.action == 'create_batch_job') {
        Object.assign(params, this.$refs.batchAddJob ? this.$refs.batchAddJob.getFormValue() : {});
      }
      // if (this.isInit) {
      //   // ????????????????????????????????????????????????/???????????????????????????
      //   if (this.formValue.action == 'create_job') {
      //     this.$nextTick(() => {
      //       Object.assign(params, ((this.$refs.singleAddJob && this.$refs.singleAddJob.getFormValue()) || {}));
      //     });
      //   } else if (this.formValue.action == 'create_batch_job') {
      //     this.$nextTick(() => {
      //       Object.assign(params, this.$refs.batchAddJob ? this.$refs.batchAddJob.getFormValue() : {});
      //     });
      //   }
      // } else {
      //   if (this.formValue.action == 'create_job') {
      //     Object.assign(params, this.$refs.singleAddJob ? this.$refs.singleAddJob.getFormValue() : {});
      //   } else if (this.formValue.action == 'create_batch_job') {
      //     Object.assign(params, this.$refs.batchAddJob ? this.$refs.batchAddJob.getFormValue() : {});
      //   }
      // }
      if (formValue && formValue.gitlabUsername && formValue.gitlabPassword) {
        // ??????????????????
        if (params && params.hasOwnProperty('config')) {
          params['config'].gitlabUsername = formValue.gitlabUsername;
          params['config'].gitlabPassword = formValue.gitlabPassword;
        } else {
          params.config = {};
          params['config'].gitlabUsername = formValue.gitlabUsername;
          params['config'].gitlabPassword = formValue.gitlabPassword;
        }
      }
      let gitLabList = ['gitlabUsername', 'gitlabPassword']; // ??????????????????????????????
      for (let key in params) {
        if (gitLabList.includes(key)) {
          delete params[key];
        }
      }
      return params;
    },
    saveConfig() {
      if (!this.valid()) {
        return false;
      }
      this.$api.deploy.integrated.saveConfig(this.getConfigData()).then(res => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.savesuccess'));
          this.$back(); // ?????????????????????????????????
        }
      });
    },
    getConfigInfoById(id) {
      if (id) {
        this.loadingShow = true;
        let extraField = ['fcu', 'fcuVo', 'lcu', 'lcuVo', 'startPage', 'actionType']; // ??????????????????
        this.$api.deploy.integrated.getConfigInfoById({id}).then(res => {
          if (res && res.Status == 'OK') {
            let dataInfo = res.Return || {};
            for (let key in dataInfo) {
              if (this.formValue.hasOwnProperty(key)) {
                this.formValue[key] = dataInfo[key];
                if (key == 'repoType') {
                  // ??????????????????
                  this.handleRepoType(dataInfo[key], dataInfo);
                  this.formValue[key] = dataInfo[key];
                }
              } else if (!this.formValue.hasOwnProperty(key) && !extraField.includes(key)) {
                this.actionFormValue[key] = dataInfo[key];
              }
            }
            // ???????????????
            this.initData = {
              ...this.formValue,
              ...this.actionFormValue
            };
            this.isHiddenTriggerTime(this.formValue.triggerType);
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      }
    },
    handleRepoType(repoType, repoTypeConfig = '') {
      // ??????????????????????????????gitlab ????????????????????????????????????????????????
      if (repoType == 'gitlab') {
        this.storehouseFormList.forEach((item) => {
          if (item.name == 'gitlabUsername' || item.name == 'gitlabPassword') {
            // ??????????????? gitlab????????????????????????????????????????????????post-receive
            this.$set(item, 'isHidden', false);
          } else if (item.name == 'event') {
            this.$set(this.formValue, 'event', 'post-receive');
            this.$set(item, 'dataList', this.dataList.filter((item) => item.value == 'post-receive'));
          } else if (item.name == 'repoServerAddress') {
            this.$set(item, 'desc', this.$t('term.deploy.updatewarehousewillbedelete'));
          } else if (item.name == 'repoName') {
            // ????????????
            this.$set(item, 'placeholder', this.$t('term.deploy.reponamedesc'));
            this.$set(item, 'desc', this.$t('term.deploy.updatewarehousewillbedelete'));
          } else if (item.name == 'branchFilter') {
            // ??????
            this.$set(item, 'placeholder', this.$t('term.deploy.branchnamewildcardcharactersaresupported'));
            this.$set(item, 'desc', this.$t('term.deploy.branchtriggerintegrationdesc'));
          }
        });
        if (repoTypeConfig && repoTypeConfig.hasOwnProperty('config')) {
          this.$set(this.formValue, 'gitlabUsername', repoTypeConfig['config']['gitlabUsername'] || '');
          this.$set(this.formValue, 'gitlabPassword', repoTypeConfig['config']['gitlabPassword'] || '');
        }
      } else if (repoType == 'svn') {
        this.storehouseFormList.forEach((item) => {
          if (item.name == 'gitlabUsername' || item.name == 'gitlabPassword') {
            // ??????????????? svn????????????????????????????????????????????????post-commit
            this.$set(item, 'isHidden', true);
          } else if (item.name == 'event') {
            this.$set(this.formValue, 'event', 'post-commit');
            this.$set(item, 'dataList', this.dataList.filter((item) => item.value == 'post-commit'));
          } else if (item.name == 'repoName') {
            // ????????????
            this.$set(item, 'placeholder', this.$t('term.deploy.addressexample'));
            this.$set(item, 'desc', this.$t('term.deploy.warehousecompletepath'));
          } else if (item.name == 'branchFilter') {
            // ??????
            this.$set(item, 'placeholder', this.$t('term.deploy.branchexample'));
            this.$set(item, 'desc', this.$t('term.deploy.branchchangedesc'));
            this.$set(item, 'tooltip', this.branchFilterSvnTooltip);
          }
        });
        let gitLabList = ['gitlabUsername', 'gitlabPassword'];
        for (let key in this.formValue) { // ????????????????????????????????????????????????
          if (gitLabList.includes(key)) {
            delete this.formValue[key];
          }
        }
      } else {
        this.$set(this.formValue, 'event', '');
        this.storehouseFormList.forEach((item) => {
          if (item.name == 'event') {
            this.$set(item, 'dataList', this.dataList);
          }
        });
      }
    },
    async getEventList() {
      // ??????????????????
      let data = {
        enumClass: 'neatlogic.framework.deploy.constvalue.DeployCiRepoEvent'
      };
      await this.$api.common.getSelectLit(data).then((res) => {
        if (res.Status == 'OK') {
          this.dataList = res.Return || [];
          this.storehouseFormList.forEach((item) => {
            if (item.name == 'event') {
              this.$set(item, 'dataList', this.dataList);
            }
          });
        }
      });
    },
    changeTriggerType(triggerType) {
      this.$set(this.formValue, 'triggerType', triggerType);
      this.isHiddenTriggerTime(triggerType);
    },
    getTriggerTypeList() {
      let data = {
        enumClass: 'neatlogic.framework.deploy.constvalue.DeployCiTriggerType'
      };
      this.$api.common.getSelectLit(data).then(res => {
        if (res.Status == 'OK') {
          this.$set(this, 'triggerTypeList', res.Return);
        }
      });
    },
    isHiddenTriggerTime(triggerType) {
      if (triggerType != 'delay') {
        // ??????????????????????????????????????????????????????
        this.actionFormList && this.actionFormList.forEach((item) => {
          if (item.name == 'delayTime') {
            this.$set(item, 'isHidden', true);
            if (this.formValue && this.formValue.hasOwnProperty('delayTime')) {
              delete this.formValue.delayTime;
            }
          }
        });
      } else {
        this.actionFormList && this.actionFormList.forEach((item) => {
          if (item.name == 'delayTime') {
            this.$set(item, 'isHidden', false);
          }
        });
      }
      if (triggerType == 'instant' || triggerType == 'delay') {
        // ?????????????????????????????????????????????????????????
        this.actionFormList && this.actionFormList.forEach((item) => {
          if (item.name == 'triggerTime') {
            this.$set(item, 'isHidden', true);
            if (this.formValue && this.formValue.hasOwnProperty('triggerTime')) {
              delete this.formValue.triggerTime;
            }
          }
        });
      } else {
        this.actionFormList && this.actionFormList.forEach((item) => {
          if (item.name == 'triggerTime') {
            this.$set(item, 'isHidden', false);
          }
        });
      }
    },
    openConfigAddHelpDialog() {
      this.isShowConfigAddHelpDialog = true;
    },
    closeConfigAddHelpDialog() {
      this.isShowConfigAddHelpDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
  // beforeRouteLeave(to, from, next, url) {
  //   this.isInit = false;
  //   let changeData = this.getConfigData();
  //   if (changeData) {
  //     if (this.$utils.isSame(this.initData, changeData)) {
  //       url ? this.$utils.gotoHref(url) : next(true);
  //     } else {
  //       this.$utils.jumpDialog.call(
  //         this,
  //         {
  //           save: {
  //             fn: async() => {
  //               return await this.saveConfig();
  //             }
  //           }
  //         },
  //         to,
  //         from,
  //         next,
  //         url
  //       );
  //     }
  //   } else {
  //     next(true);
  //   }
  // }
};
</script>
<style lang="less">
</style>
