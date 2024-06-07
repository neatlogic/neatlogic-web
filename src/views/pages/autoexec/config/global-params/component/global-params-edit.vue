<template>
  <div class="global-params-edit-box">
    <TsDialog
      :isShow="true"
      :okText="$t('page.save')"
      type="modal"
      @on-ok="save"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div v-if="id">{{ $t('dialog.title.edittarget', {target: $t('term.autoexec.globalparameter')}) }}</div>
        <div v-else>{{ $t('page.newtarget', {target: $t('term.autoexec.globalparameter')}) }}</div>
      </template>
      <template v-slot>
        <div>
          <Loading
            :loadingShow="loadingShow"
            type="fix"
          ></Loading>
          <TsForm ref="form" v-model="formValue" :item-list="formConfig">
            <template slot="defaultValue">
              <Components
                :is="componentType(formValue.type)"
                v-model="formValue.defaultValue"
                v-bind="getConfig(formValue)"
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
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
      loadingShow: true,
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
          lable: '#id',
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
              message: this.$t('message.targetisexists', {target: this.$t('term.autoexec.paramsname')}),
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
              message: this.$t('message.targetisexists', {target: this.$t('term.autoexec.displayname')}),
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
          transfer: true,
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
  async created() {
    await this.getTypeList();
    if (this.id) {
      this.loadingShow = true;
      this.handleValidSelfName(this.id);
      this.$api.autoexec.globalParams.getGlobalParamsDetail(this.id).then(res => {
        if (res.Status == 'OK') {
          Object.assign(this.formValue, res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    } else {
      this.loadingShow = false;
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
    save() {
      if (!this.$refs.form.valid()) {
        return false;
      }
      this.$api.autoexec.globalParams.saveGlobalParams(this.formValue).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
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
    async getTypeList() {
      // 获取值类型下拉列表
      await this.$api.autoexec.globalParams.getTypeList({ enumClass: 'neatlogic.framework.autoexec.constvalue.AutoexecGlobalParamType' }).then((res) => {
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
      if (data.type == 'textarea') {
        config.maxlength = 1024;
      }
      if (data.type == 'text') {
        config.maxlength = 500;
      }
      if (data.type == 'datetime') { // 日期时间，返回值类型需要转成字符串
        config.valueType = 'format';
      }
      config.validateList = ['required'];
      config.transfer = true;
      return config;
    }
  },
  filter: {},
  computed: {
    componentType() {
      return (defaultValue) => {
        let type = 'textComponent';
        if (defaultValue) {
          type = defaultValue + 'Component';
        }
        return type;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
