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
        <Button @click="close()">取消</Button>
        <Button v-if="createMethod === 'pipeline'" type="primary" @click="save()">确定</Button>
        <Button v-if="createMethod === 'custom'" type="primary" @click="nextStep()">下一步</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    AddDeployJobForm: resolve => require(['../pipeline/add-deployjob-form.vue'], resolve)
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
        title: '添加批量作业'
      },
      formConfig: {
        createMethod: {
          type: 'radio',
          label: '创建方式',
          dataList: [
            { value: 'custom', text: '直接创建' },
            { value: 'pipeline', text: '超级流水线' }
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
          label: this.$t('term.deploy.jobname'),
          isHidden: false,
          validateList: ['required'],
          maxlength: 50
        },
        pipelineId: {
          type: 'select',
          label: '超级流水线',
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
