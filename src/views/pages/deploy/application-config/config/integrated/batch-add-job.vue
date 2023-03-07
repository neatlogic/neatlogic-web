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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
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
          label: this.$t('term.deploy.jobname'),
          validateList: ['required', 'name-special'],
          maxlength: 64
        },
        {
          name: 'pipelineId',
          type: 'select',
          label: '超级流水线',
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
          label: '版本号'
        }
      ],
      versionFormList: [
        {
          name: 'versionPrefix',
          type: 'text',
          label: '版本前缀',
          maxlength: 64,
          desc: '指定要创建版本的前缀，可不填'
        },
        {
          name: 'versionRegex',
          type: 'text',
          label: '截取规则',
          validateList: ['required'],
          maxlength: 256,
          desc: '正则表达式，指定使用分支的哪个部分作为主版本，不给定或正则表达式匹配失败，则使用分支名。合法的正则表达式必须包含成对的"("、")"，示例：develop(\d+(\.\d+)*\.\d+)提取develop1.2.3分支中的1.2.3作为主版本号'
        },
        {
          name: 'useCommitId',
          type: 'select',
          label: '拼接commitID',
          validateList: ['required'],
          desc: '在版本号中拼接最近一次提交的 commit ID',
          dataList: [
            {
              text: '不拼接',
              value: 0
            },
            {
              text: '拼接',
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
