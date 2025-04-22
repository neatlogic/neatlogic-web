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
            v-model="currentBlueGreenId"
            search
            v-bind="bluesetFormConfig"
          ></TsFormSelect>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import number from '../../../../dashboard/widget/define/number';
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    instanceId: { type: Number},
    blueGreenId: {type: Number}
  },
  data() {
    return {
      dialogSetting: {
        title: this.$t('term.deploy.blueSet'),
        isShow: true,
        type: 'modal'
      },
      dataList: [],
      bluesetFormConfig: {
        dataList: [],
        border: 'border',
        dynamicUrl: '/api/rest/deploy/bluegreen/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.dealDataByUrl,
        transfer: true
      },
      currentBlueGreenId: null
    };
  },
  beforeCreate() {},
  async created() {
    this.currentBlueGreenId = this.blueGreenId;
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
    dealDataByUrl(list) {
      let columlist = [];
      list &&
      list.forEach(v => {
        columlist.push({ text: v.name + '(' + v.sort + ')', value: v.id, config: v });
      });
      return columlist;
    },
    okDialog() {
      if (!this.$refs.bluesetForm.valid()) {
        return false; 
      }
      let data = {
        blueGreenId: this.$refs.bluesetForm.value,
        resourceId: this.instanceId,
        ...this.params
      };
      this.$api.deploy.applicationConfig.saveInstanceBlueGreen(data).then(res => {
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
