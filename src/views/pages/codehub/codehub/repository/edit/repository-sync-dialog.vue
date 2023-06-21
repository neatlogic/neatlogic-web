<template>
  <TsDialog v-bind="setting" @on-close="close" @on-ok="confirmSync">
    <div>
      <TsForm ref="editform" :itemList="formConfig">
      </TsForm>
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  filters: {},
  props: {
    id: {type: [String, Number]}
  },
  data() {
    return {
      setting: {
        title: this.$t('term.codehub.warehousesynchronization'),
        maskClose: false,
        isShow: true
      },
      selectSub: null,
      vaildConfig: ['required'],
      checkoutBranchesVal: [],
      formConfig: [{
        type: 'select',
        label: this.$t('term.codehub.branchtobesynchronized'),
        name: 'checkoutBranchesVal',
        validateList: ['required'],
        transfer: true,
        url: '/api/rest/codehub/repository/branch/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'name',
        multiple: true,
        params: {'repositoryId': this.id},
        onChange: (val) => {
          this.checkoutBranchesVal = val;
        }
      }
      ],
      editvalList: {
        name: '',
        type: '',
        id: ''
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
    close() {
      this.$emit('close');
    },
    confirmSync() {
      if (this.$refs.editform.valid() && this.checkoutBranchesVal.length > 0) {
        let param = {
          'id': this.id,
          'checkoutBranches': this.checkoutBranchesVal
        };
        this.$api.codehub.repository.sync(param).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('term.codehub.syncexecuteandback'));
            this.$emit('close', true);
          } else {
            this.$Message.error(res.Message);
          }
        });
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
