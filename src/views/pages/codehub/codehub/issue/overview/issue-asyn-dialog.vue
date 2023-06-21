<template>
  <TsDialog v-bind="asynTsDialog" @on-close="close" @on-ok="submitEdit">
    <template v-slot>
      <div>
        <TsForm ref="editform" :itemList="formConfig">
        </TsForm>
        <TsForm ref="sourceform" :itemList="sourceConfig||[]">
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  props: {
    sourceList: {
      type: Array
    }
  },
  data() {
    return {
      asynTsDialog: {
        title: this.$t('term.codehub.syncissues'),
        maskClose: false,
        isShow: true,
        height: '200px'
      },
      editData: {
        systemUuid: '',
        subsystemUuid: ''
      },
      formConfig: [  
        {
          type: 'select',
          label: this.$t('term.codehub.issuessource'),
          name: 'sourceUuid',
          transfer: true,
          clear: false,
          dataList: this.sourceList,
          rootName: 'syncSourceList',
          textName: 'source',
          valueName: 'uuid',
          validateList: ['required'],
          onChange: (val) => {
            this.editData.sourceUuid = val;
            this.getsourceconfig(val);
          }
        },    
        {
          type: 'select',
          label: this.$t('page.system'),
          name: 'systemUuid',
          transfer: true,
          dynamicUrl: '/api/rest/codehub/appsystem/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          validateList: ['required'],
          onChange: (val) => {
            this.editData.systemUuid = val;
            this.getsubsysconfig(val);
          }
        }
      ],
      subsysConfig: {
        type: 'select',
        label: this.$t('page.subsystem'),
        name: 'subsystemUuid',
        transfer: true,
        dynamicUrl: '/api/rest/codehub/appmodule/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        params: {},
        validateList: ['required'],
        onChange: (val) => {
          this.editData.subsystemUuid = val;
        }
      },
      sourceConfig: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    getsourceconfig(uuid) {
      if (uuid) {
        this.$api.codehub.issue.getSourceconfig({sourceUuid: uuid}).then(res => {
          if (res && res.Status == 'OK') {
            let list = res.Return.queryParameterList || [];
            list.forEach(que => {
              if (que.type == 'input') {
                this.$set(que, 'type', 'text');
              }
              this.$set(que, 'transfer', true);
              this.$set(que, 'value', que.value ? que.value : (que.isMultiple ? [] : ''));
              this.$set(que, 'validateList', []);
              if (que.isRequired) {
                que.validateList.push('required');
              }
              if (que.isMultiple) {
                this.$set(que, 'multiple', true);
              }
              if (que.type == 'number') {
                que.validateList.push('integer_p');
              }
            });
            this.asynTsDialog.height = ((list.length + (this.formConfig.length - 2)) * 32 + 300) + 'px';
            this.sourceConfig = list;
          } else {
            this.sourceConfig = [];
          }
        });  
      }
    },
    getsubsysconfig(val) {
      if (val) {
        this.formConfig.forEach((form, findex) => {
          if (form.name == 'subsystemUuid') {
            this.formConfig.splice(findex, 1);
          }
        });
        let sysitem = {
          type: 'select',
          label: this.$t('page.subsystem'),
          name: 'subsystemUuid',
          transfer: true,
          dynamicUrl: '/api/rest/codehub/appmodule/search',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          params: {appSystemId: val},
          validateList: ['required'],
          onChange: (val) => {
            this.editData.subsystemUuid = val;
          }
        };
        this.formConfig.push(sysitem);
      } else {
        this.formConfig.forEach((form, findex) => {
          if (form.name == 'subsystemUuid') {
            this.formConfig.splice(findex, 1);
          }
        });       
      }
    },
    submitEdit() {
      if (this.$refs.editform.valid() && (this.sourceConfig.length > 0 && this.$refs.sourceform.valid())) {
        let param = {};
        Object.assign(param, this.editData, this.$refs.sourceform.getFormValue());
        if (param.startTime > param.endTime) {
          this.$Message.error(this.$t('term.framework.startlargethanend'));
        } else {
          this.$api.codehub.issue.aysn(param).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.syncsuccess'));
              this.$emit('close', true);
            }
          }); 
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang='less'>
</style>
