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
    id: {
      type: Number,
      default: null
    },
    conditionConfig: {
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
        title: this.id ? '编辑分类' : '新建分类',
        type: 'modal',
        isShow: true
      },
      formConfig: {
        name: {
          type: 'text',
          name: 'name',
          label: '名称',
          validateList: ['required', {
            name: 'searchUrl',
            url: '/api/rest/inspect/new/problem/customview/save',
            key: 'name', // 验证的key值
            message: '名称已存在', // 错误提示信息
            params: { id: this.id }
          }],
          maxlength: 50
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getNameById();
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
      if (!form.valid()) {
        return false;
      }
      if (this.id) {
        // 编辑
        this.$api.inspect.assetsInspect.renameProblemClassification({id: this.id, ...this.formValue}).then((res) => {
          if (res && res.Status == 'OK') {
            this.$Message.success('编辑成功');
            this.closeDialog(true);
          }
        });
      } else {
        this.$emit('save', this.formValue);
      }
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    getNameById() {
      if (this.id) {
        this.$api.inspect.assetsInspect.getProblemClassificationById({id: this.id}).then(res => {
          if (res.Status == 'OK') {
            let dataInfo = res.Return;
            if (dataInfo && dataInfo.hasOwnProperty('name')) {
              this.$set(this.formValue, 'name', dataInfo.name);
            }
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
