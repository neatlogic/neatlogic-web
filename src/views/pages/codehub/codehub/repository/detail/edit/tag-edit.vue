<template>
  <TsDialog v-bind="setting" :isShow="isShow" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="editform" :itemList="formConfig">
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :disabled="canSubmit" @click="saveEdit">{{ $t('page.confirm') }}</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: 'BranchEdit',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    uuid: {type: [String, Boolean]},
    repositoryId: {type: Number}
  },
  data() {
    return {
      vaild: ['required'],
      canSubmit: false,
      setting: {
        title: this.uuid ? this.$t('term.codehub.edittag') : this.$t('term.codehub.addtag'),
        maskClose: false
      },
      formConfig: [
        {
          type: 'text',
          label: this.$t('term.codehub.tagname'),
          name: 'tagName',
          value: '',
          validateList: ['required']
        }, {
          type: 'select',
          label: this.$t('page.branch'),
          transfer: true,
          value: '',
          name: 'branchName',
          validateList: ['required'],
          clearable: false,
          multiple: false,
          textName: 'name',
          valueName: 'name',
          rootName: 'list',
          url: '/api/rest/codehub/repository/branch/search',
          params: {
            repositoryId: this.repositoryId,
            hasCommit: 1
          }
        
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    saveEdit() {
      if (this.$refs.editform.valid()) {
        let param = Object.assign(this.$refs.editform.getFormValue(), {
          repositoryId: this.repositoryId
        });
        this.uuid && this.$set(param, 'uuid', this.uuid);
        if (!param.description) {
          this.$delete(param, 'description');
        }
        this.canSubmit = true;
        this.$api.codehub.repositorydetail.saveTag(param).then(res => {
          this.canSubmit = false;
          if (res && res.Status == 'OK') {
            this.$emit('close', true);
          }
        }).catch(error => {
          this.canSubmit = false;
        });
      }
    },
    getDetail(uuid) {
      this.$api.codehub.service.getDetail({uuid: uuid}).then(res => {
        if (res && res.Status == 'OK') {
          this.updataVal(res.Return);
        }
      });      
    },
    updataVal(data) {
      this.formConfig.forEach(form => {
        if (form.name && data[form.name]) {
          this.$set(form, 'value', data[form.name]);
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
