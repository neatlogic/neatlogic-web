
<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="formValue" :itemList="formSetting"></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'ToolCatalogEditDialog', // 目录工具(添加-编辑)
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  filters: {},
  props: {
    nodeData: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      formValue: {},
      dialogSetting: {
        type: 'modal',
        title: this.$t('dialog.title.addtarget', {target: this.$t('term.autoexec.directorytool')}),
        isShow: true
      },
      formSetting: {
        id: {
          type: 'text',
          isHidden: true,
          label: '#id'
        },
        parentId: {
          type: 'text',
          isHidden: true,
          label: this.$t('term.autoexec.parentnodeid')
        },
        name: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [
            'required', 
            'name-special',
            { 
              name: 'searchUrl', // 字段必须，不能更改
              url: '/api/rest/autoexec/catalog/save',
              key: 'name', // key值
              params: {}
            }]
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    if (!this.$utils.isEmpty(this.nodeData)) {
      this.formValue = this.nodeData.value;
      if (this.nodeData.value.id) {
        // 重命名
        this.dialogSetting.title = this.$t('dialog.title.edittarget', {target: this.$t('term.autoexec.directorytool')});
      }
      for (let key in this.formSetting) {
        if (key == 'name') {
          this.formSetting[key].validateList.forEach((item) => {
            if (item && item.name) {
              item.params = {id: this.nodeData.value.id, parentId: this.nodeData.value.parentId}; // 验证名称是否重复
            }
          });
        }
      }
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
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    okDialog() {
      let form = this.$refs.form;
      if (!form.valid()) {
        return false;
      }
      let params = form.getFormValue();
      this.$api.autoexec.catalog.saveCatalog(params).then((res) => {
        if (res.Status == 'OK') {
          if (!this.$utils.isEmpty(this.nodeData) && !this.$utils.isEmpty(this.nodeData.value) && !this.$utils.isEmpty(this.nodeData.value.id)) {
            // 重命名
            this.nodeData.node.name = params.name; 
          } else if (!this.$utils.isEmpty(this.nodeData) && !this.$utils.isEmpty(this.nodeData.value) && this.$utils.isEmpty(this.nodeData.value.id)) {
            // 添加下级目录
            const newNode = {
              ...params,
              id: res.Return,
              childCount: 0,
              children: [],
              expand: false
            };
            this.nodeData.node.expand = true;
            this.nodeData.node.children.push(newNode);
            if (this.nodeData.node.childCount != undefined) {
              this.nodeData.node.childCount++;
            }
          }
          this.$Message.success(this.$t('message.executesuccess'));
          this.closeDialog(!!this.$utils.isEmpty(this.nodeData));
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
