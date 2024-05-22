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
        <Button v-if="createMethod === 'pipeline'" type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
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
          label: this.$t('term.deploy.creationmode'),
          dataList: [
            { value: 'custom', text: this.$t('term.deploy.directcreation') },
            { value: 'pipeline', text: this.$t('term.deploy.superpipeline') }
          ],
          value: 'custom',
          validateList: ['required'],
          onChange: val => {
            this.createMethod = val;
            this.$set(this.formConfig.name, 'isHidden', !(val === 'custom'));
            this.$set(this.formConfig.pipelineId, 'isHidden', val === 'custom');
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
          type: 'select',
          label: this.$t('term.deploy.superpipeline'),
          value: null,
          transfer: true,
          isHidden: true,
          dynamicUrl: '/api/rest/deploy/pipeline/search',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          multiple: false,
          validateList: [
            'required'
          ],
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
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
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
      if ((dialogForm && !dialogForm.valid()) || (pipelineForm && !pipelineForm.validateForm())) {
        return false;
      }
      pipelineForm.submitForm().then(() => {
        this.close(true);
      });
    },
    close(needRefresh = false) {
      this.$emit('close', needRefresh);
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
