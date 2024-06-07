<template>
  <div>
    <TsDialog
      :title="$t('term.inspect.targetfilter')"
      :okText="$t('page.save')"
      width="medium"
      type="slider"
      :isShow.sync="isShowDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsTable
            v-model="selectedList"
            v-bind="tableConfig"
            @cancelSelected="cancelSelected"
          >
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 指标过滤
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    inspectName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShowDialog: true,
      selectedList: [],
      defaultFieldsList: [],
      tableConfig: {
        keyName: 'name',
        showPager: false,
        fixedHeader: false,
        tbodyList: [],
        theadList: [
          {
            key: 'selection',
            multiple: true
          },
          {
            key: 'name',
            title: this.$t('page.name')
          },
          {
            key: 'desc',
            title: this.$t('page.description')
          },
          {
            key: 'type',
            title: this.$t('term.autoexec.valuetype')
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getTargetFilter();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getTargetFilter() {
      let params = {
        name: this.inspectName
      };
      this.$api.inspect.definition.getTargetFilter(params).then((res) => {
        this.selectedList = [];
        this.defaultFieldsList = [];
        if (res && res.Status == 'OK') {
          this.tableConfig.tbodyList = res.Return;
          if (!this.$utils.isEmpty(this.tableConfig.tbodyList)) {
            this.tableConfig.tbodyList.forEach((item) => {
              this.defaultFieldsList.push({
                name: item.name,
                selected: item.selected
              });
              if (item.selected) {
                this.selectedList.push(item.name);
              }
            });
          }
        }
      });
    },
    okDialog() {
      let targetList = [];
      this.defaultFieldsList.forEach((item) => {
        item.selected = this.selectedList.includes(item.name) ? 1 : 0;
      });
      let params = {
        name: this.inspectName,
        fields: this.defaultFieldsList
      };
      targetList = this.defaultFieldsList.filter((item) => {
        return item.selected;
      });
      if (this.$utils.isEmpty(targetList)) {
        this.$Notice.warning({
          title: this.$t('form.placeholder.checkrule'),
          desc: this.$t('term.inspect.selecttargetatleast')
        });
        return false;
      }
      this.$api.inspect.definition.saveTargetFilter(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true);
        }
      });
    },
    cancelSelected(currentRow) {
      if (currentRow && !this.$utils.isEmptyObj(currentRow)) {
        this.$createDialog({
          title: this.$t('page.tip'),
          content: this.$t('term.inspect.cancelselectedtargetconfirm'),
          btnType: 'error',
          'on-ok': vnode => {
            vnode.isShow = false;
          },
          'on-close': () => {
            this.selectedList.push(currentRow.name);
          }
        });
      }
    },
    closeDialog(needRefresh = false) {
      this.$emit('closeTargetFilterDialog', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
