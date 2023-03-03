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
        title: this.id ? '编辑类型' : '添加类型',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: [
        {
          type: 'text',
          name: 'id',
          label: '层级标识符',
          maxLength: 3,
          validateList: ['required', { name: 'regex', pattern: '^[a-zA-Z]+$', message: '只支持英文字母' }],
          onChange: (val) => {
            this.categoryData.levelCategory = val;
          }
        },
        {
          type: 'tree',
          name: 'parentId',
          label: '父类型',
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
          label: '名称',
          maxlength: 50,
          validateList: [{name: 'required', message: '请输入类型名称'}],
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
