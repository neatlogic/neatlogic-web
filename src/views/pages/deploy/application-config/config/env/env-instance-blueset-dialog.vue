<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog()"
      @on-close="closeDialog()"
    >
      <template v-slot>
        <div>
          <TsFormSelect
            ref="bluesetForm"
            v-model="blueSetId"
            v-bind="bluesetFormConfig"
          ></TsFormSelect>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    
  },
  data() {
    return {
      dialogSetting: {
        title: this.$t('term.deploy.blueSet'),
        isShow: true,
        type: 'modal'
      },
      dataList: [],
      blueSetId: null,
      bluesetFormConfig: {
        dataList: [],
        validateList: ['required'],
        border: 'border',
        transfer: true
      }
    };
  },
  beforeCreate() {},
  created() {

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
    getDataList() {
      let data = {};
      this.$api.deploy.applicationConfig.getBluesetList(data).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this.bluesetFormConfig, 'dataList', res.Return || []);
        }
      });
    },
    okDialog() {
      if (!this.$refs.bluesetForm.valid()) {
        return false; 
      }
      let data = {};
      this.$api.deploy.applicationConfig.saveBlueset(data).then(res => {
        if (res && res.Status == 'OK') {
          this.$t('message.savesuccess');
          this.closeDialog();
        }
      });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less">
</style>
