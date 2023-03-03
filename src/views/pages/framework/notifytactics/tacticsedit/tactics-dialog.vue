<template>
  <div>
    <TsDialog
      v-if="params.type === 'tacticsName'"
      title="重命名"
      :isShow="isShow"
      @on-ok="saveTacticsName"
      @on-close="close"
    >
      <Tsform ref="form" :itemList="formName"></Tsform>
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
          label: '名称',
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
          label: '对象',
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
      this.$api.framework.tactics.saveNotify(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success('重命名成功');
          this.$emit('update:isShow', false);
          this.$emit('updateTactics', data);
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
        }
      }
    }
  }
};
</script>
<style lang="less" scoped></style>
