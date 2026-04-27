<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <TsForm
            ref="dialogForm"
            :item-list="formConfig"
            :labelWidth="90"
          >
            <template v-slot:pipelineId>
              <TsForm
                ref="pipelineFormConfig"
                :itemList="pipelineFormConfig"
                :labelWidth="90"
              ></TsForm>
            </template>
          </TsForm>
          <AddDeployJobForm
            v-if="createMethod === 'pipeline'"
            :id="pipelineId"
            ref="pipelineForm"
            class="mt-nm"
          >
          </AddDeployJobForm>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button
          v-if="createMethod === 'pipeline'"
          type="primary"
          :loading="saveLoading"
          @click="save()"
        >{{ $t('page.confirm') }}</Button>
        <Button v-if="createMethod === 'custom'" type="primary" @click="nextStep()">{{ $t('page.thenextstep') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    AddDeployJobForm: () => import('../pipeline/add-deployjob-form.vue')
  },
  data() {
    return {
      createMethod: 'custom', // 批量作业创建方式
      pipelineId: null,
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium',
        title: this.$t('term.deploy.addbatchjob')
      },
      formConfig: {
        createMethod: {
          type: 'radio',
          label: this.$t('page.creationmethod'),
          dataList: [
            { value: 'custom', text: this.$t('term.deploy.directcreation') },
            { value: 'pipeline', text: this.$t('term.deploy.superpipeline') }
          ],
          value: 'pipeline',
          validateList: ['required'],
          onChange: val => {
            this.changeCreateMethod(val);
          }
        },
        name: {
          type: 'text',
          label: this.$t('term.autoexec.jobname'),
          isHidden: false,
          validateList: ['required'],
          maxlength: 50
        },
        pipelineId: {
          type: 'slot',
          isHidden: true,
          labelWidth: 1
        }
      },
      saveLoading: false,
      pipelineFormConfig: {
        pipelineType: {
          type: 'radio',
          label: this.$t('term.deploy.pipelinetype'),
          value: 'appsystem', //global(全局)，appsystem（应用）
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'PipelineType' },
          validateList: ['required'],
          onChange: (val) => {
            this.handlePipelineId(val);
          }
        },
        appSystemId: {
          type: 'select',
          label: this.$t('page.apply'),
          value: null,
          dynamicUrl: '/api/rest/deploy/app/config/appsystem/search',
          dealDataByUrl: (nodeList) => { return this.dealDataByUrl(nodeList, 'appsystem'); },
          params: {authorityActionList: ['view']},
          rootName: 'tbodyList',
          border: 'border',
          transfer: true,
          validateList: ['required'],
          onChange: (val) => {
            this.changeAppSystemId(val);
          }
        },
        pipelineId: {
          type: 'select',
          label: this.$t('term.autoexec.pipeline'),
          value: null,
          dynamicUrl: '/api/rest/deploy/pipeline/search',
          params: {type: 'appsystem', needVerifyAuth: 1},
          rootName: 'tbodyList',
          dealDataByUrl: this.dealPipelineData,
          validateList: ['required'],
          transfer: true,
          onChange: val => {
            this.pipelineId = val;
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      this.formConfig.createMethod.dataList.forEach(item => {
        if (item.value === 'custom') {
          if (this.$AuthUtils.hasRole('BATCHDEPLOY_MODIFY')) {
            this.$set(item, 'disabled', false);  
            this.$set(item, 'description', '');
          } else {
            this.$set(item, 'disabled', true);
            this.$set(item, 'description', this.$t('term.deploy.batchdeployauthtip'));
          }
        }
      });
      this.changeCreateMethod('pipeline');
    },
    changeCreateMethod(val) {
      this.createMethod = val;
      this.$set(this.formConfig.name, 'isHidden', !(val === 'custom'));
      this.$set(this.formConfig.pipelineId, 'isHidden', val === 'custom');
      this.handlePipelineId('appsystem');
    },
    nextStep() {
      const dialogForm = this.$refs['dialogForm'];
      if ((dialogForm && !dialogForm.valid())) {
        return false;
      }
      this.$router.push({
        path: '/batch-job-edit',
        query: {
          name: this.formConfig.name.value
        }
      });
    },
    save() {
      const dialogForm = this.$refs['dialogForm'];
      const pipelineForm = this.$refs['pipelineForm'];
      const pipelineFormConfig = this.$refs['pipelineFormConfig'];
      let isValidate = true;
      if (dialogForm) {
        isValidate = isValidate && dialogForm.valid();
      }
      if (pipelineForm) {
        isValidate = isValidate && pipelineForm.validateForm();
      }
      if (pipelineFormConfig) {
        isValidate = isValidate && pipelineFormConfig.valid();
      }
      if (!isValidate) {
        return false;
      }
      
      let data = {
        ...pipelineForm.save()
      };
      if (this.$refs.pipelineFormConfig) {
        Object.assign(data, this.$refs.pipelineFormConfig.getFormValue());
      }
      this.saveLoading = true;

      this.$api.deploy.pipeline.addBatchJob(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      }).finally(() => {
        this.saveLoading = false;
      });
    },
    close(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    dealDataByUrl(nodeList, type) {
      let dataList = [];
      if (nodeList) {
        nodeList.forEach(item => {
          dataList.push({
            value: item.id,
            text: item.abbrName + (item.name ? '(' + item.name + ')' : ''),
            _disabled: this.getDisabledText(item, type),
            tooltip: this.getDisabledText(item, type) || null
          });
        });
      }
      return dataList;
    },
    getDisabledText(item, type) {
      let text = false;
      if (!item.isHasAllAuthority && type == 'appsystem') {
        if (item.isHasAuthPipeline) {
          return text;
        }
        if (this.$utils.isEmpty(item.authActionSet) || (!item.authActionSet.includes('operation#pipeline') && !item.authActionSet.includes('operation#all'))) {
          text = this.$t('term.deploy.notapplyallexecuteauth');
        }
      } else if (!item.isConfig) {
        text = this.$t('term.deploy.applynotconfigpipeline');
      } else if (type == 'app' && !item.isHasModule) {
        text = this.$t('term.deploy.applynotconfigmodule');
      } else if (!item.isHasEnv) {
        type == 'app' && (text = this.$t('term.deploy.applynotconfigenv'));
        type == 'module' && (text = this.$t('term.deploy.modulenotconfigenv'));
      }
      return text;
    },
    dealPipelineData(nodeList) {
      let dataList = [];
      if (nodeList) {
        nodeList.forEach(item => {
          dataList.push({
            value: item.id,
            text: item.name + (item.appSystemAbbrName ? '/' + item.appSystemAbbrName : '')
          });
        });
      }
      return dataList;
    },
    changeAppSystemId(val) { //应用流水线切换
      this.$set(this.pipelineFormConfig.pipelineId, 'value', null);
      this.$set(this.pipelineFormConfig.pipelineId.params, 'appSystemId', val);
      if (val) {
        this.$set(this.pipelineFormConfig.pipelineId, 'disabled', false);
      } else {
        this.$set(this.pipelineFormConfig.pipelineId, 'disabled', true);
      }
    },
    handlePipelineId(val) {
      this.$set(this.pipelineFormConfig.pipelineId, 'value', null);
      this.$set(this.pipelineFormConfig.pipelineId.params, 'type', val);
      this.$set(this.pipelineFormConfig.pipelineId.params, 'appSystemId', null);
      if (val == 'appsystem') {
        this.$set(this.pipelineFormConfig.pipelineId, 'disabled', true);
      } else if (val == 'global') {
        this.$set(this.pipelineFormConfig.pipelineId, 'disabled', false);
      }
      this.$set(this.pipelineFormConfig.appSystemId, 'value', null);
      this.$set(this.pipelineFormConfig.appSystemId, 'isHidden', val !== 'appsystem');
    }
  },
  filter: {},
  computed: {

  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 10px;
}
</style>
