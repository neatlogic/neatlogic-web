<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="validatorData.id">{{ $t('dialog.title.edittarget',{'target':$t('page.rule')}) }}</div>
        <div v-if="!validatorData.id">{{ $t('dialog.title.addtarget',{'target':$t('page.rule')}) }}</div>
      </template>
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
        </TsForm>
        <Divider v-if="configFormConfig && configFormConfig.length > 0" plain style="font-size:12px">{{ $t('page.componentconfig') }}</Divider>
        <TsForm v-if="configFormConfig && configFormConfig.length > 0" ref="configForm" :item-list="configFormConfig"></TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
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
          label: this.$t('term.report.isactive'),
          dataList: [{value: 1, text: this.$t('page.yes')}, {value: 0, text: this.$t('page.no')}],
          validateList: ['required'],
          onChange: (isActive) => {
            this.validatorData.isActive = isActive;
          }
        },
        {
          type: 'select',
          name: 'handler',
          label: this.$t('page.component'),
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
          label: this.$t('term.cmdb.exceptiontemplate'),
          width: '100%',
          desc: this.$t('message.cmdb.exceptiontemplate'),
          onChange: (value) => {
            this.$set(this.validatorData, 'errorTemplate', value);
          }
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.description'),
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
            this.$Message.success(this.$t('message.savesuccess'));
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
