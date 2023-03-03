<template>
  <div class="global-params-edit-box">
    <TsDialog
      :isShow="true"
      :okText="$t('button.save')"
      type="modal"
      @on-ok="save"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div v-if="id">{{ $t('page.edittarget', {target: $t('term.autoexec.globalparameter')}) }}</div>
        <div v-else>{{ $t('page.newtarget', {target: $t('term.autoexec.globalparameter')}) }}</div>
      </template>
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="formValue" :item-list="formConfig">
            <template slot="defaultValue">
              <Components
                :is="handlerType(formValue.type)"
                ref="components"
                v-model="formValue.defaultValue"
                :defaultValue="formValue.defaultValue"
                :config="getConfig(formValue)"
                :isRequired="true"
                :maxlength="formValue.type == 'textarea' ? 1024 : 500"
              ></Components>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import Components from './edit/index';
export default {
  name: 'GlobalParamsEdit', // 全局参数-编辑
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    ...Components
  },
  props: {
    id: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      typeList: [],
      formValue: {
        id: null,
        key: '',
        defaultValue: '',
        name: '',
        description: '',
        type: ''
      },
      formConfig: {
        id: {
          lable: '#',
          type: 'text',
          isHidden: true
        },
        key: {
          label: this.$t('term.autoexec.paramsname'),
          type: 'text',
          maxlength: 50,
          validateList: [
            'required',
            'key-special',
            { 
              name: 'searchUrl', 
              url: '/api/rest/autoexec/global/param/save', 
              key: 'name', 
              message: this.$t('message.content.targetisexists', {target: this.$t('term.autoexec.paramsname')}), 
              params: { id: '' } 
            }
          ]
        },
        name: {
          label: this.$t('term.autoexec.displayname'),
          type: 'text',
          maxlength: 50,
          validateList: ['required', 
            'name-special', 
            { 
              name: 'searchUrl', 
              url: '/api/rest/autoexec/global/param/save', 
              key: 'name', 
              message: this.$t('message.content.targetisexists', {target: this.$t('term.autoexec.displayname')}),
              params: { id: '' } 
            }
          ]
        },
        type: {
          label: this.$t('term.autoexec.valuetype'),
          type: 'select',
          defaultValueIsFirst: true,
          url: '/api/rest/universal/enum/get', // 枚举url地址
          params: { enumClass: 'neatlogic.framework.autoexec.constvalue.AutoexecGlobalParamType' }, // 参数，必须的
          validateList: ['required'],
          onChange: (componentType) => {
            this.formValue.defaultValue = '';
            this.formValue.type = componentType || this.formValue.type;
          }
        },
        defaultValue: {
          label: this.$t('term.autoexec.paramsvalue'),
          type: 'slot',
          validateList: ['required']
        },
        description: {
          label: this.$t('page.description'),
          type: 'textarea',
          maxlength: 500
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.handleValidSelfName(this.id);
      this.$api.autoexec.globalParams.getGlobalParamsDetail(this.id).then(res => {
        if (res.Status == 'OK') {
          Object.assign(this.formValue, res.Return);
        }
      });
    }
    this.getTypeList();
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
    save() {
      let componentsRefs = this.$refs.components;
      let itemRefs = componentsRefs ? (componentsRefs.$refs.item || componentsRefs.$refs.time) : '';
      if (!this.$refs.form.valid() || (itemRefs && !itemRefs.valid())) {
        return false;
      }
      this.$api.autoexec.globalParams.saveGlobalParams(this.formValue).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.savesuccess'));
          this.closeDialog(true);
        }
      });
    },
    handleValidSelfName(id = null) {
      // 编辑(参数名/显示名)时，名称改回自身，不需要校验
      for (let key in this.formConfig) {
        if (key == 'key' || key == 'name') {
          this.formConfig[key] &&
            this.formConfig[key].validateList.forEach(item => {
              if (item && item.hasOwnProperty('params')) {
                item.params.id = id || '';
              }
            });
        }
      }
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    getTypeList() {
      // 获取值类型下拉列表
      this.$api.autoexec.globalParams.getTypeList({ enumClass: 'neatlogic.framework.autoexec.constvalue.AutoexecGlobalParamType' }).then((res) => {
        if (res.Status == 'OK') {
          this.typeList = res.Return;
        }
      });
    },
    getConfig(data) {
      // 获取配置信息
      let config = {};
      let findConfig = this.typeList && this.typeList.find(item => item.value == data.type);
      if (findConfig) {
        config = findConfig.config;
      }
      return config;
    }
  },
  filter: {},
  computed: {
    handlerType() {
      return (defaultValue) => {
        let type = 'defaultInput';
        if (defaultValue) {
          type = defaultValue + 'Handler';
        }
        return type;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
