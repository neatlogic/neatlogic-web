<template>
  <div>
    <TsDialog
      title="title"
      type="modal"
      :isShow="true"
      :ok-text="$t('page.save')"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div v-if="params && params.name">{{ $t('page.rename') }}</div>
        <div v-else>{{ $t('page.build') }}</div>
      </template>
      <template v-slot>
        <div>
          <TsForm
            ref="form"
            v-model="formValue"
            :item-list="formItemList"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 版本制品
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      formValue: {},
      directoryList: [],
      formItemList: [
        {
          name: 'name',
          type: 'text',
          maxlength: 50,
          label: this.$t('page.name'),
          errorMessage: '',
          onChange: (val) => {
            this.$nextTick(() => {
              this.validUniqueName(val);
            });
          },
          validateList: ['required', {
            name: 'custom', trigger: 'change', validator: (rule, value) => { 
              return this.validUniqueName(value);
            }}]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    let {name} = this.params;
    if (name) {
      this.$set(this.formValue, 'name', name);
    }
    this.getDirectoryList();
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
      if (form && !form.valid()) {
        return false;
      }
      const {name, path} = this.$utils.deepClone(this.params);
      if (name) {
        // 重命名
        let params = {
          ...this.params,
          name: this.formValue.name,
          src: path == '/' ? `/${name}` : path + `/${name}`,
          operation: 'rename'
        };
        this.$api.deploy.version.moveOrRenameFile(params).then((res) => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
            this.closeDialog(true);
          }
        });
      } else {
        let {path} = this.$utils.deepClone(this.params);
        let params = {
          ...this.params,
          path: path == '/' ? `/${this.formValue.name}` : `${path}/${this.formValue.name}`

        };
        if (params) {
          delete params.name;
        }
        this.$api.deploy.version.saveDirectory(params).then((res) => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.closeDialog(true);
          }
        });
      }
    },
    closeDialog(needRefersh = false) {
      this.formValue = {};
      this.$emit('close', needRefersh);
    },
    validUniqueName(name) {
      let nameList = [];
      let isValid = true;
      if (!this.$utils.isEmpty(this.directoryList)) {
        nameList = this.directoryList.filter((item) => {
          return item.name == name;
        });
        if (nameList && nameList.length > 0) {
          const errorMessage = nameList[0].type == 'd' ? this.$t('term.deploy.foldernamerepeat') : this.$t('term.deploy.filenamerepeat');
          this.formItemList.forEach((item) => {
            if (item.name == 'name') {
              this.$set(item, 'errorMessage', errorMessage);
            }
          });
          isValid = false;
        } else {
          this.formItemList.forEach((item) => {
            if (item.name == 'name') {
              this.$set(item, 'errorMessage', '');
            }
          });
          isValid = true;
        }
      }
      return isValid;
    },
    getDirectoryList() {
      let params = {
        ...this.params
      };
      this.$api.deploy.version.getDirectoryList(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.directoryList = [];
          res.Return && res.Return.forEach((item) => {
            if (item && item.name) {
              this.directoryList.push({
                name: item.name,
                type: item.type
              });
            }
          });
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
