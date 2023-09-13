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
    parentId: {
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
        id: this.id,
        parentId: this.id || this.parentId,
        name: this.organizationalStructureName
      },
      dialogSetting: {
        isShow: true,
        type: 'modal',
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('page.name')}) : this.$t('dialog.title.addtarget', {'target': this.$t('page.name')})
      },
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required', { 
            name: 'searchUrl',
            url: '/api/rest/dr/organization/save',
            key: 'name',
            params: {parentId: this.id || this.parentId}
          }]
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
      this.$api.dr.organizationalStructure.saveOrganizationalStructure(this.formValue).then(res => {
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
