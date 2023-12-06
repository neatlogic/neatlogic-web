<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template v-slot:navigation>
        <span
          v-if="$hasBack()"
          class="tsfont-left text-action"
          @click="$back()"
        >{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span class="tsfont-question-s text-action" @click="openConfigAddHelpDialog">{{ $t('page.help') }}</span>
      </template>
      <template v-slot:topRight>
        <Button type="primary" @click="saveConfig">{{ $t('page.save') }}</Button>
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
            <Divider orientation="start">{{ $t('page.actions') }}</Divider>
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
    BatchAddJob: resolve => require(['./batch-add-job'], resolve), // 批量作业作业
    SingleAddJob: resolve => require(['./single-add-job'], resolve), // 单个创建作业
    PoptipSelect: resolve => require(['@/resources/components/PoptipSelect/PoptipSelect.vue'], resolve),
    ConfigAddHelpDialog: resolve => require(['./config-add-help-dialog'], resolve) // 帮助
  },
  props: {},
  data() {
    return {
      isInit: true, // 用于获取初始化数据，获取对比数据
      loadingShow: false,
      isShowConfigAddHelpDialog: false,
      appSystemId: null,
      branchFilterSvnTooltip: this.$t('term.deploy.branchfiltersvntooltip1') + '\n' + this.$t('term.deploy.branchfiltersvntooltip2') + '\n' + this.$t('term.deploy.branchfiltersvntooltip3') + '\n' + this.$t('term.deploy.branchfiltersvntooltip4') + '\n' + this.$t('term.deploy.branchfiltersvntooltip5') + '\n' + this.$t('term.deploy.branchfiltersvntooltip6') + '\n' + this.$t('term.deploy.branchfiltersvntooltip7') + '\n' + this.$t('term.deploy.branchfiltersvntooltip8') + '\n' + this.$t('term.deploy.branchfiltersvntooltip9') + '\n' + this.$t('term.deploy.branchfiltersvntooltip10') + '\n' + this.$t('term.deploy.branchfiltersvntooltip11') + '\n',
      dataList: [],
      actionFormValue: {},
      initData: {}, // 初始值，用于离开页面的时候，对比
      formValue: {
        // 基本信息，模块，仓库双向绑定值，用户回显使用
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
      basicFormList: [ // 基本信息
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
      moduleFormList: [ // 模块
        {
          name: 'appModuleId',
          type: 'select',
          label: this.$t('page.module'),
          validateList: ['required'],
          dynamicUrl: '/api/rest/deploy/app/config/module/list',
          params: {},
          firstSelect: false,
          textName: 'abbrName',
          valueName: 'id'
        }
      ],
      storehouseFormList: [ // 仓库
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
        // 编辑配置
        let id = parseInt(query.id);
        this.isInit = false;
        this.getConfigInfoById(id);
        this.basicFormList.forEach((item) => {
          // 处理编辑时，名称不验证自身
          if (item.name == 'name') {
            item.validateList.forEach((innerItem) => {
              if (innerItem && innerItem.hasOwnProperty('params')) {
                this.$set(innerItem.params, 'id', id);
              }
            });
          }
        });
      } else {
        // 添加配置
        this.$nextTick(() => {
          this.isInit = true;
          this.initData = this.getConfigData();
        });
        this.handleRepoType(this.formValue.repoType);
      }
      this.appSystemId = query.appSystemId ? parseInt(query.appSystemId) : null;
      this.moduleFormList && this.moduleFormList.forEach((item) => {
        // 查询当前应用下的所有模块
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
      //   // 用于初始化时，解决获取不到【单个/批量】作业数据问题
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
        // 处理后端入参
        if (params && params.hasOwnProperty('config')) {
          params['config'].gitlabUsername = formValue.gitlabUsername;
          params['config'].gitlabPassword = formValue.gitlabPassword;
        } else {
          params.config = {};
          params['config'].gitlabUsername = formValue.gitlabUsername;
          params['config'].gitlabPassword = formValue.gitlabPassword;
        }
      }
      let gitLabList = ['gitlabUsername', 'gitlabPassword']; // 删除后端不需要的数据
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
          this.$Message.success(this.$t('message.savesuccess'));
          this.$back(); // 保存成功，返回列表页面
        }
      });
    },
    getConfigInfoById(id) {
      if (id) {
        this.loadingShow = true;
        let extraField = ['fcu', 'fcuVo', 'lcu', 'lcuVo', 'startPage', 'actionType']; // 额外多余字段
        this.$api.deploy.integrated.getConfigInfoById({id}).then(res => {
          if (res && res.Status == 'OK') {
            let dataInfo = res.Return || {};
            for (let key in dataInfo) {
              if (this.formValue.hasOwnProperty(key)) {
                this.formValue[key] = dataInfo[key];
                if (key == 'repoType') {
                  // 处理仓库类型
                  this.handleRepoType(dataInfo[key], dataInfo);
                  this.formValue[key] = dataInfo[key];
                }
              } else if (!this.formValue.hasOwnProperty(key) && !extraField.includes(key)) {
                this.actionFormValue[key] = dataInfo[key];
              }
            }
            // 设置初始值
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
      // 处理仓库类型，如果是gitlab 显示账号和密码输入框，否则不显示
      if (repoType == 'gitlab') {
        this.storehouseFormList.forEach((item) => {
          if (item.name == 'gitlabUsername' || item.name == 'gitlabPassword') {
            // 仓库类型为 gitlab时，用户名和密码显示，事件默认为post-receive
            this.$set(item, 'isHidden', false);
          } else if (item.name == 'event') {
            this.$set(this.formValue, 'event', 'post-receive');
            this.$set(item, 'dataList', this.dataList.filter((item) => item.value == 'post-receive'));
          } else if (item.name == 'repoServerAddress') {
            this.$set(item, 'desc', this.$t('term.deploy.updatewarehousewillbedelete'));
          } else if (item.name == 'repoName') {
            // 仓库名称
            this.$set(item, 'placeholder', this.$t('term.deploy.reponamedesc'));
            this.$set(item, 'desc', this.$t('term.deploy.updatewarehousewillbedelete'));
          } else if (item.name == 'branchFilter') {
            // 分支
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
            // 仓库类型为 svn时，用户名和密码隐藏，事件默认为post-commit
            this.$set(item, 'isHidden', true);
          } else if (item.name == 'event') {
            this.$set(this.formValue, 'event', 'post-commit');
            this.$set(item, 'dataList', this.dataList.filter((item) => item.value == 'post-commit'));
          } else if (item.name == 'repoName') {
            // 仓库名称
            this.$set(item, 'placeholder', this.$t('term.deploy.addressexample'));
            this.$set(item, 'desc', this.$t('term.deploy.warehousecompletepath'));
          } else if (item.name == 'branchFilter') {
            // 分支
            this.$set(item, 'placeholder', this.$t('term.deploy.branchexample'));
            this.$set(item, 'desc', this.$t('term.deploy.branchchangedesc'));
            this.$set(item, 'tooltip', this.branchFilterSvnTooltip);
          }
        });
        let gitLabList = ['gitlabUsername', 'gitlabPassword'];
        for (let key in this.formValue) { // 删除多余字段，否则数据对比有问题
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
      // 获取事件列表
      let data = {
        enumClass: 'neatlogic.framework.deploy.constvalue.DeployCiRepoEvent'
      };
      await this.$api.common.getSelectList(data).then((res) => {
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
      this.$api.common.getSelectList(data).then(res => {
        if (res.Status == 'OK') {
          this.$set(this, 'triggerTypeList', res.Return);
        }
      });
    },
    isHiddenTriggerTime(triggerType) {
      if (triggerType != 'delay') {
        // 触发方式为延迟执行，显示延迟时间组件
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
        // 触发方式为立即执行，不显示计划时间组件
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
