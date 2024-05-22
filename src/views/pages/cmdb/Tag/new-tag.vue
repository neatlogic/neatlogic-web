<template>
  <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
    <template v-slot:header>
      <div v-if="id">{{ $t('dialog.title.edittarget', {target: $t('page.tag')}) }}</div>
      <div v-if="!id">{{ $t('dialog.title.addtarget', {target: $t('page.tag')}) }}</div>
    </template>
    <template v-slot>
      <TsForm ref="form" :item-list="formConfig"></TsForm>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  filters: {},
  props: {
    id: { type: Number },
    data: Object
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true
      },
      tableData: {},
      formConfig: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        name: {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          width: '100%',
          validateList: [{ name: 'required', message: this.$t('form.validate.inputtagname'), url: 'api/rest/resourcecenter/tag/save', key: 'name' }, 'name-special']
        },
        description: {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.description'),
          width: '100%',
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.validate.inputtagdescription') }]
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getTagType();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    save() {
      const form = this.$refs['form'];
      let data = this.$refs.form.getFormValue();
      if (!form.valid()) {
        return;
      }
      this.$api.cmdb.tagManage
        .saveTag(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        })
        .catch(error => {
          if (error.data.Message) {
            this.$Message.error(error.data.Message);
          } else {
            this.$Message.error(this.$t('message.savefailed'));
          }
        });
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    },
    getTagType() {
      if (this.id) {
        for (let key in this.formConfig) {
          this.$set(this.formConfig[key], 'value', this.data[key]);
        }
      }

      // this.formConfig.password.showPassword = false;
    }
  },
  computed: {},
  watch: {}
};
</script>
