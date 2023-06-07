<template>
  <TsDialog v-bind="dialogSetting" @on-close="close" @on-ok="saveVersion">
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="formData" :itemList="formConfig">
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
    versionData: { type: Object }
  },
  data() {
    return {
      versionPrefix: '',
      dialogSetting: {
        title: this.$t('page.newtarget', {'target': this.$t('page.versions')}),
        maskClose: false,
        isShow: true,
        height: '200px'
      },
      formConfig: [
        {
          type: 'text',
          label: this.$t('term.codehub.versionstrategy'),
          name: 'versionName',
          disabled: true
        },
        {
          type: 'select',
          label: this.$t('page.versiontype'),
          name: 'versionTypeId',
          transfer: true,
          dynamicUrl: '/api/rest/codehub/versiontype/search?isActive=1',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          onChange: (val) => {
            this.getAutoCreateVersionName(val);
          }
        },
        {
          type: 'text',
          label: this.$t('term.framework.pkgversion'),
          name: 'version',
          prepend: '',
          validateList: ['required'],
          maxlength: 100
        }
      ],
      formData: {
        versionName: '',
        version: '',
        versionTypeId: '',
        versionStrategyId: '',
        appStsyemId: ''
      }
    };
  },
  beforeCreate() {},
  created() {
    this.initData();
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
    initData() {
      Object.assign(this.formData, {
        versionStrategyId: this.versionData.id,
        versionName: this.versionData.name,
        version: '',
        versionTypeId: this.versionData.versionTypeId || '',
        appModuleId: this.versionData.appModuleId,
        versionPrefix: this.versionData.versionPrefix
      });
      if (this.formData.versionTypeId) {
        this.getAutoCreateVersionName(this.formData.versionTypeId);
      }
      this.formConfig.forEach(form => {
        if (form.name == 'version') {
          this.$set(form, 'prepend', this.formData.versionPrefix);
          this.versionPrefix = this.formData.versionPrefix;
        }
      });
    },
    close() {
      this.$emit('close');
    },
    saveVersion() {
      if (this.$refs.form.valid()) {
        let param = {};
        Object.assign(param, {
          version: this.versionPrefix + this.formData.version,
          versionTypeId: this.formData.versionTypeId,
          versionStrategyId: this.formData.versionStrategyId,
          appModuleId: this.formData.appModuleId
        });
        this.$api.codehub.version.save(param).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.addsuccess'));
            this.$emit('close', true);
            this.$router.push({ path: 'merge-create', query: {versionid: res.Return} });
          }
        });
      }
    },
    getAutoCreateVersionName(versionTypeId) {
      // 获取根据规则来生成的版本号
      this.formData.version = '';
      if (this.formData.appModuleId && versionTypeId) {
        let param = {
          appModuleId: this.formData.appModuleId,
          versionStrategyId: this.formData.versionStrategyId,
          versionTypeId: versionTypeId
        };
        this.$api.codehub.version.autofillName(param).then(res => {
          if (res && res.Status == 'OK' && res.Return.version) {
            this.formData.version = res.Return.version.replace(this.versionPrefix, '');
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
<style lang="less" scoped></style>
