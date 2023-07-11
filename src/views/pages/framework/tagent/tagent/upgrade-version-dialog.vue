<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog"
      @on-ok="saveDialog"
    >
      <template v-slot>
        <TsForm ref="form" v-model="formValue" :itemList="versionUpdateConfig"></TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 查看密码
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    tagentId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      formValue: {
        tagentId: this.tagentId,
        pkgVersion: ''
      },
      dialogSetting: {
        type: 'modal',
        isShow: true,
        title: this.$t('term.framework.upgradeversion')
      },
      versionUpdateConfig: {
        pkgVersion: {
          type: 'select',
          label: this.$t('term.framework.pkgversion'),
          validateList: ['required'],
          url: 'api/rest/tagent/pkg/list',
          rootName: 'tbodyList',
          dealDataByUrl: this.dealDataByUrl,
          transfer: true
        },
        tagentId: {
          type: 'text',
          isHidden: true,
          label: 'tagentId'
        }
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
    saveDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      this.$api.framework.tagent.versionUpgrade(this.formValue).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.closeDialog();
        }
      });
    },
    dealDataByUrl(nodeList) {
      let dataList = [];
      nodeList && nodeList.forEach((item) => {
        if (item && item.version) {
          dataList.push({
            text: item.version,
            value: item.version
          });
        }
      });
      return this.$utils.uniqueByField(dataList, 'value'); // 根据value去重
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
