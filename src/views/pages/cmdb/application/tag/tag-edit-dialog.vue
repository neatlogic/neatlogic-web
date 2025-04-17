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
            v-model="formData"
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    type: {
      type: String
    },
    systemIdList: {
      type: Array,
      default: () => {
        return []; 
      }
    }
  },
  data() {
    return {
      dialogSetting: {
        title: this.type ? (this.type == 'batchAddTag' ? '批量添加标签' : (this.type == 'batchdelTag' ? '批量删除标签' : '')) : '编辑标签',
        width: 'small',
        type: 'modal',
        isShow: true
      },
      formData: {},
      formConfig: {
        tag: {
          type: 'select',
          label: '标签',
          transfer: true,
          validateList: ['required'],
          dynamicUrl: '/api/rest/resourcecenter/tag/search',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id'
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    closeDialog() {
      this.$emit('close');
    },
    okDialog() {
      let formRef = this.$refs.form;
      if (formRef && !formRef.valid()) {
        return false;
      }
      this.$api.cmdb.applicationManage.saveTag({}).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', true);
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
