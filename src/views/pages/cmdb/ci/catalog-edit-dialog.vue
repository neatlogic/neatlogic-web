<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="form"
            v-model="formValue"
            :item-list="formConfig"
          ></TsForm>
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
    catalogData: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      formValue: {
        id: this.catalogData.id,
        parentId: this.catalogData.parentId,
        name: ''
      },
      dialogSetting: {
        isShow: true,
        title: this.catalogData?.id ? this.$t('dialog.title.edittarget', {'target': this.$t('term.cmdb.directoryname')}) : this.$t('dialog.title.addtarget', {'target': this.$t('term.cmdb.directoryname')})
      },
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required', {name: 'searchUrl', url: '/api/rest/cmdb/cicatalog/save', key: 'name', params: {id: this.catalogData.id, parentId: this.catalogData.parentId}}]
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getCicatalog();
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
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      this.$api.cmdb.cicatalog.saveCiCatalog(this.formValue).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', res.Return);
        }
      });
    },
    getCicatalog() {
      if (this.$utils.isEmpty(this.catalogData) || (!this.$utils.isEmpty(this.catalogData) && this.$utils.isEmpty(this.catalogData.id))) {
        return false;
      }
      let params = {
        id: this.catalogData.id
      };
      this.$api.cmdb.cicatalog.getCiCatalog(params).then(res => {
        if (res.Status == 'OK') {
          let {name = '', id = null, parentId = null} = res.Return || {};
          this.formValue = {
            id: id,
            name: name,
            parentId: parentId
          };
        }
      });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
