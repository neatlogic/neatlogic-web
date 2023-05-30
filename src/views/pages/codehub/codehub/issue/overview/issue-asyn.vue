<template>
  <TsDialog v-bind="asynTsDialog" :isShow="isShow" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="editform" :itemList="formConfig">
        </TsForm>
        <TsForm ref="sourceform" :itemList="sourceConfig||[]">
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">取消</Button>
        <Button type="primary" :disabled="saving" @click="submitEdit">确定</Button>
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
    isShow: {
      type: Boolean,
      default: false
    },
    sourceList: {
      type: Array
    }
  },
  data() {
    let _this = this;
    return {
      asynTsDialog: {
        title: '同步需求',
        maskClose: false,
        height: '200px'
      },
      editData: {
        systemUuid: '',
        subsystemUuid: ''
      },
      formConfig: [  
        {
          type: 'select',
          label: '需求来源',
          name: 'sourceUuid',
          transfer: true,
          clear: false,
          dataList: _this.sourceList,
          rootName: 'syncSourceList',
          textName: 'source',
          valueName: 'uuid',
          validateList: ['required'],
          onChange: function(val) {
            _this.editData.sourceUuid = val;
            _this.getsourceconfig(val);
          }
        },    
        {
          type: 'select',
          label: '系统',
          name: 'systemUuid',
          transfer: true,
          dynamicUrl: '/module/codehub/api/rest/system/search',
          rootName: 'list',
          textName: 'name',
          valueName: 'uuid',
          validateList: ['required'],
          onChange: function(val) {
            _this.editData.systemUuid = val;
            _this.getsubsysconfig(val);
          }
        }
      ],
      subsysConfig: {
        type: 'select',
        label: '子系统',
        name: 'subsystemUuid',
        transfer: true,
        dynamicUrl: '/module/codehub/api/rest/subsystem/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        params: {},
        validateList: ['required'],
        onChange: function(val) {
          _this.editData.subsystemUuid = val;
        }
      },
      sourceConfig: [],
      saving: false
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    //this.getConfig();
  },

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
    getConfig() {
      // this.$api.codehub.issue.aysn().then(res => {
      //   if (res && res.Status == 'OK') {
      //     console.log(res);
      //   }
      // });      
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
        let _this = this;
        this.formConfig.forEach((form, findex) => {
          if (form.name == 'subsystemUuid') {
            this.formConfig.splice(findex, 1);
          }
        });
        let sysitem = {
          type: 'select',
          label: '子系统',
          name: 'subsystemUuid',
          transfer: true,
          dynamicUrl: '/module/codehub/api/rest/subsystem/search',
          rootName: 'list',
          textName: 'name',
          valueName: 'id',
          params: {systemId: val},
          validateList: ['required'],
          onChange: function(val) {
            _this.editData.subsystemUuid = val;
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
          this.$Message.error('开始时间不能大于结束时间！');
        } else {
          this.saving = true;
          this.$api.codehub.issue.aysn(param).then(res => {
            this.saving = false;
            if (res && res.Status == 'OK') {
              this.$Message.success('同步成功');
              this.$emit('close');
            }
          }).catch(e => {
            this.saving = false;
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
