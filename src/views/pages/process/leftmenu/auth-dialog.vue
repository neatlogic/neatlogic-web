<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="save()"
      @on-close="close()"
    >
      <template v-slot>
        <div>
          <TsForm ref="nameForm" :itemList="formConfig"></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    uuid: {type: String}
  },
  data() {
    const _this = this;
    return {
      dialogConfig: {
        title: '编辑授权',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      }, 
      workcenterData: {},
      formConfig: {
        type: {
          type: 'radio',
          label: '类型',
          value: 'custom',
          isHidden: true,
          dataList: [
            {
              text: '自定义分类', // 个人分类
              value: 'custom'
            },
            {
              text: '系统分类',
              value: 'system'
            }
          ],
          onChange(val) {
            _this.addFormConfig(val);
          }
        },
        authList: {
          type: 'userselect',
          value: _this.defaultAuthList,
          label: '授权',
          isHidden: true,
          transfer: true,
          groupList: ['role', 'user', 'common'],
          validateList: ['required']
        }, 
        support: {
          type: 'select',
          label: '使用范围',
          transfer: true,
          isHidden: true,
          value: _this.defaultSupport,
          defaultValueIsFirst: !_this.defaultSupport,
          url: '/api/rest/universal/enum/get',
          params: {enumClass: 'neatlogic.framework.common.constvalue.DeviceType'}
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getWorkcenterByUuid();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    addFormConfig(workcenterType) {
      if (workcenterType === 'factory') {
        this.formConfig['type'].isHidden = true;
        if (this.$AuthUtils.hasRole('WORKCENTER_MODIFY')) {
          this.formConfig['authList'].isHidden = false;
          this.formConfig['support'].isHidden = false;
        } else {
          this.formConfig['authList'].isHidden = true;
          this.formConfig['support'].isHidden = true;
        }
      } else if (workcenterType === 'custom') {
        if (this.$AuthUtils.hasRole('WORKCENTER_MODIFY')) {
          this.formConfig['type'].isHidden = false;
        } else {
          this.formConfig['type'].isHidden = true;
        }
        this.formConfig['authList'].isHidden = true;
        this.formConfig['support'].isHidden = true;
      } else if (workcenterType === 'system') {
        this.formConfig['type'].isHidden = false;
        if (this.$AuthUtils.hasRole('WORKCENTER_MODIFY')) {
          this.formConfig['authList'].isHidden = false;
          this.formConfig['support'].isHidden = false;
        } else {
          this.formConfig['authList'].isHidden = true;
          this.formConfig['support'].isHidden = true;
        }
      }
    },
    getWorkcenterByUuid() {
      if (this.uuid) {
        this.$api.process.processtask.getWorkcenterByUuid(this.uuid).then(res => {
          this.workcenterData = res.Return;
          this.addFormConfig(this.workcenterData.type);
          for (let key in this.formConfig) {
            this.$set(this.formConfig[key], 'value', this.workcenterData[this.formConfig[key].name]);
          }
        });
      }
    },
    save() {
      if (this.$refs['nameForm'].valid()) {
        const data = this.$refs['nameForm'].getFormValue();
        data.uuid = this.uuid;
        this.$api.process.processtask.saveWorkcenterAuth(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.close(true);
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
