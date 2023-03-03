<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="validatorData.id">编辑校验规则</div>
        <div v-if="!validatorData.id">添加校验规则</div>
      </template>
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
        </TsForm>
        <Divider v-if="configFormConfig && configFormConfig.length > 0" plain style="font-size:12px">组件配置</Divider>
        <TsForm v-if="configFormConfig && configFormConfig.length > 0" ref="configForm" :item-list="configFormConfig"></TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve =>
      require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: {type: Number}
  },
  data() {
    return {
      configFormConfig: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      validatorData: {},
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: '名称',
          width: '100%',
          maxlength: 30,
          validateList: ['required'],
          onChange: (name) => {
            this.validatorData.name = name;
          }
        },
        {
          type: 'radio',
          name: 'isActive',
          label: '是否激活',
          dataList: [{value: 1, text: '是'}, {value: 0, text: '否'}],
          validateList: ['required'],
          onChange: (isActive) => {
            this.validatorData.isActive = isActive;
          }
        },
        {
          type: 'select',
          name: 'handler',
          label: '组件',
          width: '100%',
          url: '/api/rest/cmdb/validator/handler/list',
          validateList: ['required'],
          onChange: (handler) => {
            this.$set(this.validatorData, 'handler', handler);
          }
        },
        {
          type: 'textarea',
          name: 'errorTemplate',
          label: '异常模板',
          width: '100%',
          desc: '自定义异常信息，范例：属性“{label}”的值“{value}”需要符合IP格式',
          onChange: (value) => {
            this.$set(this.validatorData, 'errorTemplate', value);
          }
        },
        {
          type: 'textarea',
          name: 'description',
          label: '描述',
          width: '100%',
          maxlength: 500,
          onChange: (description) => {
            this.validatorData.description = description;
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getValidatorById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getValidatorById() {
      if (this.id) {
        this.$api.cmdb.validator.getValidatorById(this.id).then(res => {
          this.validatorData = res.Return;
          this.formConfig.forEach(element => {
            element.value = this.validatorData[element.name];
          });
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      const configForm = this.$refs['configForm'];
      if (form.valid() && (!configForm || configForm.valid())) {
        if (configForm) {
          this.validatorData.config = configForm.getFormValue();
        }
        this.$api.cmdb.validator.saveValidator(this.validatorData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {
    'validatorData.handler': {
      handler: function(val) {
        this.configFormConfig = [];
        if (val) {
          this.$api.cmdb.validator.getFormByValidatorHandler(val).then(res => {
            this.configFormConfig = res.Return;
            if (this.validatorData && this.validatorData.config && this.configFormConfig && this.configFormConfig.length > 0) {
              this.configFormConfig.forEach(element => {
                element.value = this.validatorData.config[element.name]; 
                element.width = '100%';
              });
            } else {
              this.configFormConfig.map(v => {
                v.width = '100%';
              });
            }
          });
        }
      }
    }
  }
};
</script>
<style lang="less">
</style>
