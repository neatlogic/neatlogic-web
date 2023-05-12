<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve =>
      require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: {type: Number}
  },
  data() {
    return {
      categoryData: {},
      dialogConfig: { 
        title: this.id ? this.$t('term.pbc.edittype') : this.$t('term.pbc.addtype'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: [
        {
          type: 'text',
          name: 'id',
          label: this.$t('term.pbc.levelidentifier'),
          maxLength: 3,
          validateList: ['required', { name: 'regex', pattern: '^[a-zA-Z]+$', message: this.$t('page.englishonly') }],
          onChange: (val) => {
            this.categoryData.levelCategory = val;
          }
        },
        {
          type: 'tree',
          name: 'parentId',
          label: this.$t('term.pbc.parenttype'),
          valueName: 'id',
          transfer: true,
          textName: 'name',
          url: '/api/rest/pbc/category/tree',
          onChange: (val) => {
            this.categoryData.parentId = val;
          }
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [{name: 'required', message: this.$t('page.inputtypename')}],
          onChange: (val) => {
            this.categoryData.name = val;
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCategoryById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getCategoryById() {
      if (this.id) {
        this.$api.pbc.category.getCategoryById(this.id).then(res => {
          this.categoryData = res.Return;
          this.formConfig.forEach(element => {
            element.value = this.categoryData[element.name];
          });
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.dialogConfig.loading = true;
        this.$api.pbc.category.saveCategory(this.categoryData).then(res => {
          this.dialogConfig.loading = false;
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
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
