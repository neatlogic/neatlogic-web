<template>
  <div>
    <TsForm
      ref="formConfig"
      :item-list="formConfig"
    >
      <template v-slot:file>
        <div v-for="(item,index) in configFilePathList" :key="index" class="file pb-sm">
          <TsFormInput v-model="item.filePath"></TsFormInput>
          <span class="tsfont-trash-s del-icon text-tip-active" @click="delFilepath(index)"></span>
        </div>
        <Button type="primary" ghost @click="addFile()">
          <span class="tsfont-plus">{{ $t('page.path') }}</span>
        </Button>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    type: {
      type: String,
      default: 'add'
    },
    config: {
      type: Object,
      default: () => {}
    },
    dataCenterList: Array
  },
  data() {
    return {
      formConfig: {
        name: {
          type: 'text',
          maxlength: 50,
          label: '服务名称', // 名称
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: '/api/rest/dr/service/save',
              key: 'name'
            }
          ]
        },
        applicationType: {
          type: 'select',
          label: '应用类型',
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'DrAppType' },
          validateList: ['required'],
          isHidden: this.type === 'edit',
          onChange: (val) => {
            this.changeApplicationType(val);
          }
        },
        orgId: {
          type: 'tree',
          label: '恢复机构',
          url: '/api/rest/dr/organization/tree',
          textName: 'name',
          valueName: 'id',
          search: true,
          transfer: true,
          validateList: ['required']
        },
        recoveryTimeObjective: {
          type: 'number',
          label: 'RTO（' + this.$t('page.minute') + '）'
        },
        recoveryPointObjective: {
          type: 'number',
          label: 'RPO（' + this.$t('page.minute') + '）'
        },
        file: {
          type: 'slot',
          label: '配置文件路径'
        },
        dataCenter: {
          type: 'checkbox',
          label: '关联数据中心',
          url: '/api/rest/dr/datacenter/list',
          valueName: 'id',
          textName: 'name',
          multiple: true,
          validateList: ['required', {
            name: 'custom',
            trigger: 'change',
            message: '至少选择两个',
            validator: (rule, val, el) => {
              return this.validDatacenter(el);
            }
          }],
          onChange: this.changeDataCenter,
          isHidden: this.type === 'edit'
        }
      },
      configFilePathList: []
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      if (!this.$utils.isEmpty(this.config)) {
        Object.keys(this.config).forEach(key => {
          if (this.formConfig[key]) {
            this.formConfig[key].value = this.config[key] || null;
          }
        });
        if (this.config.configFilePathList) {
          this.config.configFilePathList.forEach(item => {
            this.configFilePathList.push({
              filePath: item
            });
          });
        }
      }
      if (!this.$utils.isEmpty(this.dataCenterList)) {
        this.formConfig['dataCenter'].value = this.$utils.mapArray(this.dataCenterList, 'datacenterId');
      }
    },
    changeApplicationType(val) {
      this.$emit('updateApplicationType', val);
    },
    addFile() {
      this.configFilePathList.push({
        filePath: ''
      });
    },
    delFilepath(index) {
      this.configFilePathList.splice(index, 1);
    },
    validDatacenter(el) {
      //关联数据中心校验：至少选择两项
      let isValid = true;
      if (el && el.currentValue.length < 2) {
        isValid = false;
      }
      return isValid;
    },
    changeDataCenter(value, selectedItem) {
      this.$emit('updateDataCenter', selectedItem);
    },
    valid() {
      return this.$refs.formConfig.valid();
    },
    getData() {
      this.baseSettings = this.$refs.formConfig.getFormValue() || {};
      let data = {
        name: this.baseSettings.name || '',
        applicationType: this.baseSettings.applicationType || '',
        orgId: this.baseSettings.orgId || '',
        recoveryTimeObjective: this.baseSettings.recoveryTimeObjective || null,
        recoveryPointObjective: this.baseSettings.recoveryPointObjective || null,
        configFilePathList: this.$utils.mapArray(this.configFilePathList, 'filePath')
        
      };
      return data;
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
.file {
  position: relative;
  .del-icon {
    position: absolute;
    right: -20px;
    top: 0;
  }
}
</style>
