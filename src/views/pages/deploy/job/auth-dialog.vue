<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot>
      <TsForm
        :item-list="formConfig"
      ></TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="save()">确定</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    authList: {type: Array, default: () => { return []; }}
  },
  data() {
    return {
      dialogConfig: {
        title: '作业授权',
        width: 'small',
        isShow: true,
        maskClose: false
      },
      formConfig: {
        authList: { 
          type: 'userselect',
          isMultiple: true,
          label: '授权用户', 
          transfer: true,
          desc: '被授权的用户可执行当前批量作业',
          groupList: ['user'],
          onChange: val => {
            this.localAuthList = val;
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.localAuthList = [];
    this.authList.forEach(auth => {
      this.localAuthList.push(auth.type + '#' + auth.authUuid);
    });
    this.$set(this.formConfig.authList, 'value', this.localAuthList);
  },
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
    save() {
      this.$emit('close', this.localAuthList);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
