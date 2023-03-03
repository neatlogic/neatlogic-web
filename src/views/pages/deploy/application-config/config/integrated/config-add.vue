<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage('', '配置列表') }}</span>
      </template>
      <template v-slot:topLeft>
        <span class="tsfont-question-s text-action" @click="openConfigAddHelpDialog">帮助</span>
      </template>
      <template v-slot:topRight>
        <Button type="primary" @click="saveConfig">保存</Button>
      </template>
      <template v-slot:content>
        <ul>
          <li>
            <Divider orientation="start">基本信息</Divider>
            <TsForm
              ref="basicForm"
              v-model="formValue"
              :item-list="basicFormList"
            ></TsForm>
          </li>
          <li>
            <Divider orientation="start">模块</Divider>
            <TsForm
              ref="moduleForm"
              v-model="formValue"
              :item-list="moduleFormList"
            ></TsForm>
          </li>
          <li>
            <Divider orientation="start">仓库</Divider>
            <TsForm
              ref="storehouseForm"
              v-model="formValue"
              :item-list="storehouseFormList"
            ></TsForm>
          </li>
          <li>
            <Divider orientation="start">动作</Divider>
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
      branchFilterSvnTooltip: '1、*：匹配单层目录内任意数量的字符。\n如 /Projects/Branches/* 匹配 /Projects/Branches/v1.2.3/，但不匹配 /Projects/Branches/v1.2.3/Java/\n2、**：匹配任意数量的字符。\n如 /Projects/Branches/** 匹配 /Projects/Branches/v1.2.3/、/Projects/Branches/v1.2.3/Java/ 和 /Projects/Branches/v1.2.3/Java/Spring/\n3、?：匹配单个字符。\n如 /Projects/Branches/v?.?.? 匹配 /Projects/Branches/v1.2.3/，但不匹配 /Projects/Branches/v1.2.3.4/\n4、{pattern1, pattern2,...patternN}：只匹配给定的模式。\n如 /Projects/Branches/{v1.2.3, v1.2.4, v1.2.5} 只匹配 /Projects/Branches/ 下的 v1.2.3, v1.2.4, v1.2.5\n5、方括号模式指定单个匹配的字符集。\n如 [0-9] 匹配单个数字，[a-z, A-Z] 匹配任意一个字母，/Projects/Branches/v[0-9.]* 匹配 /Projects/Branches/v1.2.3/、/Projects/Branches/v1.2.3.4/\n6、要匹配特殊字符需用 “\” 转义，如 /Projects/Branches/v\[ 匹配 /Projects/Branches/v[/',
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
          label: '名称',
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: '/api/rest/deploy/ci/save',
              key: 'name',
              message: '名称已存在',
              params: { id: '' }
            }],
          maxlength: 64
        },
        {
          name: 'isActive',
          type: 'switch',
          label: '激活',
          falseValue: 0,
          trueValue: 1
        }
      ],
      moduleFormList: [ // 模块
        {
          name: 'appModuleId',
          type: 'select',
          label: '模块',
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
          label: '仓库类型',
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
          label: '用户名',
          validateList: ['required'],
          maxlength: 64
        },
        {
          name: 'gitlabPassword',
          type: 'password',
          label: '密码',
          validateList: ['required'],
          maxlength: 64,
          showPassword: false,
          clearable: true
        },
        {
          name: 'repoServerAddress',
          type: 'text',
          label: '服务地址',
          validateList: ['required', 'url'],
          maxlength: 256
        },
        {
          name: 'repoName',
          type: 'text',
          label: '仓库名',
          validateList: ['required'],
          maxlength: 128
        },
        {
          name: 'branchFilter',
          type: 'text',
          label: '分支',
          maxlength: 128
        },
        {
          name: 'event',
          type: 'select',
          label: '事件',
          validateList: ['required'],
          dataList: [],
          desc: '分支上发生此事件时触发集成动作'
        }
      ],
      actionFormList: [
        {
          name: 'action',
          type: 'select',
          label: '动作类型',
          validateList: ['required'],
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.deploy.constvalue.DeployCiActionType' },
          desc: '动作修改之后，动作对应的配置信息将会清空',
          onChange: () => {
            this.actionFormValue = {};
          }
        }, {
          type: 'slot',
          name: 'triggerType',
          label: '触发方式',
          validateList: ['required']
        },
        {
          name: 'triggerTime',
          type: 'time',
          isHidden: true,
          label: '计划时间',
          validateList: ['required']
        },
        {
          name: 'delayTime',
          type: 'number',
          isHidden: true,
          label: '延迟时间(s)',
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
          this.$Message.success(this.$t('message.content.savesuccess'));
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
      // 处理仓库类型，如果是gitlab 显示帐号和密码输入框，否则不显示
      if (repoType == 'gitlab') {
        this.storehouseFormList.forEach((item) => {
          if (item.name == 'gitlabUsername' || item.name == 'gitlabPassword') {
            // 仓库类型为 gitlab时，用户名和密码显示，事件默认为post-receive
            this.$set(item, 'isHidden', false);
          } else if (item.name == 'event') {
            this.$set(this.formValue, 'event', 'post-receive');
            this.$set(item, 'dataList', this.dataList.filter((item) => item.value == 'post-receive'));
          } else if (item.name == 'repoServerAddress') {
            this.$set(item, 'desc', '如果修改了仓库服务器地址或仓库名称，原有仓库的gitlab webhook将被删除');
          } else if (item.name == 'repoName') {
            // 仓库名称
            this.$set(item, 'placeholder', '示例：projects/moduleName');
            this.$set(item, 'desc', '如果修改了仓库服务器地址或仓库名称，原有仓库的gitlab webhook将被删除');
          } else if (item.name == 'branchFilter') {
            // 分支
            this.$set(item, 'placeholder', '分支名称，支持通配符');
            this.$set(item, 'desc', '此分支上的事件会触发集成，如果不填所有分支都会触发');
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
            this.$set(item, 'placeholder', '示例：/www/svn/demo_repo');
            this.$set(item, 'desc', '仓库名称的完整路径名称，示例：/home/app/svn/repoName');
          } else if (item.name == 'branchFilter') {
            // 分支
            this.$set(item, 'placeholder', '示例：branches/v1.0.0');
            this.$set(item, 'desc', '仓库下的分支名称，此分支内容的变化将会触发持续集成。如果填“/”，则repo的任何分支变更都会触发持续集成.支持使用通配符');
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
