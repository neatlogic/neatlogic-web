
<template>
  <TsDialog
    v-if="isShow"
    v-bind="setting"
    :isShow="isShow"
    @on-close="close()"
    @on-cancel="close()"
    @on-ok="confirmEdit()"
  >
    <template v-slot:header>
      <div>{{ $t('term.autoexec.publishcombinetool') }}</div>
    </template>
    <template v-slot>
      <div>
        <TsForm ref="settingForm" v-model="settingConfig" :itemList="settingForm"></TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: 'ScriptEdit',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  filters: {
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
      bgOp: true
    },
    id: {
      type: [String, Number]
    },
    operationType: {
      type: String,
      default: 'script'
    }
  },
  data() {
    return {
      setting: {
        maskClose: false
      },
      settingConfig: {
        name: '',
        typeId: '',
        description: ''
      },
      settingForm: [
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          validateList: [
            'required',
            'name-special',
            { name: 'searchUrl',
              url: '/api/rest/autoexec/combop/basic/info/save',
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('page.name')})
            }
          ]
        },
        {
          type: 'select',
          name: 'typeId',
          value: '',
          dataList: [],
          label: this.$t('page.type'),
          multiple: false,
          placeholder: this.$t('term.autoexec.pleaseselectcategory'),
          validateList: ['required'],
          search: true,
          dynamicUrl: '/api/rest/autoexec/type/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getToolClassificationList,
          transfer: true
        },
        {
          type: 'textarea',
          name: 'description',
          value: '',
          label: this.$t('page.description'),
          transfer: true,
          maxlength: 500
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.id) {
      this.getConfig();
    }
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
    confirmEdit() {
      if (!this.$refs.settingForm.valid()) {
        return;
      }
      let data = {
        operationId: this.id,
        operationType: this.operationType,
        ...this.settingConfig
      };
      this.$api.autoexec.script.generateAction(data).then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.$router.push({
            path: '/action-detail',
            query: {
              id: res.Return,
              versionStatus: 'passed'

            }
          });
        }
      });
    },
    getConfig() {
      let param = {
        id: this.id,
        status: 'passed'
      };
      this.$api.autoexec.script.getScriptDetail(param).then(res => {
        if (res.Status == 'OK' && res.Return) {
          let scriptConfig = res.Return.script || null;
          scriptConfig && Object.keys(this.settingConfig).forEach(key => {
            let i = scriptConfig[key];
            this.settingConfig[key] = i;
          });
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
