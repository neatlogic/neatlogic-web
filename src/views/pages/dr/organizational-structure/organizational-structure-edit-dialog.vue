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
    organizationalStructureName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      formValue: {
        name: this.organizationalStructureName
      },
      dialogSetting: {
        isShow: true,
        type: 'modal',
        title: this.id ? '编辑组织架构名称' : '添加组织架构名称'
      },
      formConfig: {
        name: {
          type: 'text',
          label: '名称',
          maxlength: 50,
          validateList: ['required']
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
    okDialog() {
      if (this.$refs.form && !this.$refs.form.valid()) {
        return false;
      }
      this.$api.dr.organizationalStructure.saveOrganizationalStructure({...this.formValue, organizationalStructureId: this.id}).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', true);
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
