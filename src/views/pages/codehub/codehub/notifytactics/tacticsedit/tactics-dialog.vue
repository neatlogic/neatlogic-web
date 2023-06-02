<template>
  <div>
    <TsDialog
      v-if="params.type === 'tacticsName'"
      :title="$t('page.rename')"
      :isShow="isShow"
      @on-ok="saveTacticsName"
      @on-close="close"
    >
      <Tsform ref="form" :itemList="formName"></Tsform>
    </TsDialog>
    <TsDialog
      v-if="params.type === 'tacticsUser'"
      :title="$t('term.codehub.exceptionnotification')"
      :isShow="isShow"
      @on-ok="saveTacticsUser"
      @on-close="close"
    >
      <Tsform ref="form" :itemList="formUser"></Tsform>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    Tsform: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  filters: {},
  props: {
    isShow: { type: Boolean, default: false },
    params: Object
  },
  data() {
    return {
      formName: [
        {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          value: null,
          readonly: false,
          className: 'name-input',
          maxlength: 50,
          validateList: ['required', 'name-special']
        }
      ],
      formUser: [
        {
          name: 'userList',
          type: 'userselect',
          label: this.$t('page.object'),
          transfer: true,
          multiple: true,
          value: null,
          groupList: ['user']
        }
      ]
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
    close() {
      this.$emit('update:isShow', false);
    },
    saveTacticsName() {
      if (!this.$refs.form.valid()) {
        return;
      }
      let data = {
        id: this.params.id,
        name: this.formName[0].value,
        handler: this.params.handler
      };
      this.$api.codehub.tactics.saveNotify(data).then(res => {
        if (res.Status == 'OK') {
          this.$Notice.success({
            title: this.$t('message.executesuccess'),
            duration: 1.5
          });
          this.$emit('update:isShow', false);
          this.$emit('updateTactics', data);
        }
      });
    },
    saveTacticsUser() {
      const data = {
        policyId: this.params.id,
        userIdList: this.formUser[0].value
      };
      this.$api.codehub.tactics.addAdminUser(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('update:isShow', false);
          this.$emit('updateTactics', { userList: this.formUser[0].value });
        }
      });
    }
  },
  computed: {},
  watch: {
    isShow(val) {
      if (val) {
        if (this.params.type == 'tacticsName') {
          this.formName[0].value = this.params.name;
        } else if (this.params.type == 'tacticsUser' && this.params.config) {
          this.formUser[0].value = this.params.config.userList;
        }
      }
    }
  }
};
</script>
<style lang="less" scoped></style>
