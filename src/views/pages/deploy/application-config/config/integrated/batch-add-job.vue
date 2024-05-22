<template>
  <div>
    <TsForm
      ref="form"
      v-model="formValue"
      :item-list="formList"
    >
      <template v-slot:versionRule>
        <div class="bg-op radius-lg pt-nm pb-nm pr-nm">
          <TsForm
            ref="versionRuleForm"
            v-model="formValue.versionRule"
            :item-list="versionFormList"
          ></TsForm>
        </div>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    value: {
      type: Object,
      default: function() {
        return {};
      }
    },
    appSystemId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      formValue: {versionRule: {useCommitId: 0}},
      formList: [
        {
          name: 'jobName',
          type: 'text',
          label: this.$t('term.autoexec.jobname'),
          validateList: ['required', 'name-special'],
          maxlength: 64
        },
        {
          name: 'pipelineId',
          type: 'select',
          label: this.$t('term.deploy.superpipeline'),
          multiple: false,
          search: true,
          firstSelect: false,
          validateList: ['required'],
          dynamicUrl: '/api/rest/deploy/pipeline/search',
          params: {type: 'appsystem', appSystemId: this.appSystemId},
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name'
        },
        {
          name: 'versionRule',
          type: 'slot',
          label: this.$t('page.versions')
        }
      ],
      versionFormList: [
        {
          name: 'versionPrefix',
          type: 'text',
          label: this.$t('term.deploy.versionprefix'),
          maxlength: 64,
          desc: this.$t('term.deploy.versionprefixdesc')
        },
        {
          name: 'versionRegex',
          type: 'text',
          label: this.$t('term.deploy.interceptionrule'),
          validateList: ['required'],
          maxlength: 256,
          desc: this.$t('term.deploy.versionruledesc')
        },
        {
          name: 'useCommitId',
          type: 'select',
          label: this.$t('term.deploy.splicingcommitid'),
          validateList: ['required'],
          desc: this.$t('term.deploy.splicingcommitiddesc'),
          dataList: [
            {
              text: this.$t('term.deploy.unspliced'),
              value: 0
            },
            {
              text: this.$t('term.deploy.splicing'),
              value: 1
            }
          ]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.value && !this.$utils.isEmptyObj(this.value)) {
      this.setFormValue(this.value);
    }
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
    valid() {
      let isValid = true;
      let formList = ['form', 'versionRuleForm'];
      formList.forEach((item) => {
        if (!this.$refs[item].valid()) {
          isValid = false;
        }
      });
      return isValid;
    },
    getFormValue() {
      let formValue = this.$utils.deepClone(this.formValue);
      if (formValue && (formValue.jobName || formValue.pipelineId)) {
        formValue.config = {};
        formValue.config.jobName = formValue.jobName;
        formValue.config.pipelineId = formValue.pipelineId;
      }
      delete formValue.jobName;
      delete formValue.pipelineId;
      return formValue;
    },
    setFormValue(val) {
      let currentValue = this.$utils.deepClone(val) || {};
      let configValue = {};
      if (currentValue && currentValue.hasOwnProperty('config')) {
        configValue.jobName = currentValue.config.jobName;
        configValue.pipelineId = currentValue.config.pipelineId;
        delete currentValue.config;
        this.formValue = Object.assign({}, this.formValue, {...currentValue, ...configValue});
      }
      // 设置超级流水线，添加应用配置参数
      this.formList.forEach((item) => {
        if (item.name == 'pipelineId') {
          this.$set(item.params, 'appSystemId', this.appSystemId);
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    value: {
      handler(val) {
        this.setFormValue(val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
