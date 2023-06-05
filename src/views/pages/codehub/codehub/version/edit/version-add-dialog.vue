<template>
  <TsDialog v-bind="dialogSetting" @on-close="close" @on-ok="saveEdit">
    <template v-slot>
      <div>
        <TsForm ref="editform" v-model="formData" :itemList="formConfig">
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
      textPrev: '',
      dialogSetting: {
        title: this.uuid ? this.$t('dialog.title.edittarget', {'target': this.$t('page.versions')}) : this.$t('page.newtarget', {'target': this.$t('page.versions')}),
        maskClose: false,
        isShow: true,
        height: '200px'
      },
      vaildConfig: ['required'],
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
            this.formData.versionTypeId = val;
            this.autofillName(val);
          }
        },
        {
          type: 'text',
          label: this.$t('term.framework.pkgversion'),
          name: 'name',
          prepend: '',
          validateList: ['required'],
          maxlength: 100
        }
      ],
      formData: {
        name: '',
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
        name: '',
        versionTypeId: this.versionData.versionTypeId || '',
        appModuleId: this.versionData.appModuleId
      });
      this.formConfig.forEach(form => {
        if (form.name == 'versionName') {
          this.$set(form, 'value', this.formData.name);
        }
        if (form.name == 'versionTypeId' && this.formData.versionTypeId) {
          this.$set(form, 'value', this.formData.versionTypeId);
          this.autofillName(this.formData.versionTypeId);
        }
        if (form.name == 'name') {
          this.$set(form, 'prepend', this.formData.versionPrefix);
          this.textPrev = this.formData.versionPrefix;
        }
      });
    },
    close() {
      this.$emit('close');
    },
    saveEdit() {
      if (this.$refs.editform.valid() && this.$refs.nameInput.valid()) {
        let param = {};
        Object.assign(param, {
          name: this.textPrev + this.formData.name,
          versionTypeId: this.formData.versionTypeId,
          versionStrategyId: this.formData.versionStrategyId,
          appStsyemId: this.formData.appStsyemId
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
    autofillName(versionTypeId) {
      Object.assign(this.formData, {
        name: ''
      });
      if (this.formData.appModuleId && this.formData.appModuleId && versionTypeId) {
        let param = {
          appModuleId: this.formData.appModuleId,
          versionStrategyId: this.formData.versionStrategyId,
          versionTypeId: versionTypeId
        };
        this.$api.codehub.version.autofillName(param).then(res => {
          if (res && res.Status == 'OK' && res.Return.version) {
            Object.assign(this.formData, {
              name: res.Return.version.replace(this.textPrev, '')
            });
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
