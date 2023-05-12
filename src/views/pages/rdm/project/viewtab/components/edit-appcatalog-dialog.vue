<template>
  <TsDialog v-bind="dialogConfig" @on-ok="okDialog" @on-close="closeDialog">
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="catalogData" :item-list="formConfig"></TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: { type: Number },
    appId: {type: Number},
    parentId: {type: Number},
    parentName: {type: String}
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('page.catalogue') }) : this.$t('dialog.title.addtarget', { target: this.$t('page.catalogue') }),
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      catalogData: {
        id: this.id,
        appId: this.appId,
        parentId: this.parentId,
        parentName: this.parentName
      },
      formConfig: [
        {
          type: 'text',
          label: this.$t('term.rdm.parentnode'),
          name: 'parentName',
          readonly: true,
          isHidden: !this.parentName
        },
        {
          type: 'text',
          label: this.$t('page.name'),
          name: 'name',
          validateList: ['required']
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getAppCatalogById();
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
    getAppCatalogById() {
      if (this.id) {
        this.$api.rdm.catalog.getCatalogById(this.id).then(res => {
          this.catalogData = res.Return;
        });
      }
    },
    okDialog() {
      if (this.$refs['form'].valid()) {
        this.$api.rdm.catalog.saveCatalog(this.catalogData).then(res => {
          this.closeDialog(true);
        });
      }
    },
    closeDialog(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
