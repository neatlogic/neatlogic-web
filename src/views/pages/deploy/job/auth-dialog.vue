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
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    authList: {type: Array, default: () => { return []; }}
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.deploy.jobauthorization'),
        width: 'small',
        isShow: true,
        maskClose: false
      },
      formConfig: {
        authList: {
          type: 'userselect',
          isMultiple: true,
          label: this.$t('term.deploy.authorizeduser'),
          transfer: true,
          desc: this.$t('term.deploy.authorizedusercanexecutebatchjob'),
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
