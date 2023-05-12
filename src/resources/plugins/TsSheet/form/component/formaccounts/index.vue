<template>
  <div>
    <div v-if="!readonly && !disabled" class="text-href" @click="addAccounts">
      <i class="tsfont-plus"></i>
      <span>{{ config.placeholder }}</span>
    </div>
    <div v-if="value && value.length > 0" class="pt-sm">
      <TsTable
        :theadList="theadList"
        :tbodyList="value"
        :fixedHeader="false"
        :readonlyTextIsHighlight="readonlyTextIsHighlight"
      >
        <template v-slot:action="{ row }">
          <div class="tstable-action">
            <ul v-if="!readonly && !disabled" class="tstable-action-ul">
              <li
                class="tsfont-trash-o"
                @click="deleteItem(row)"
              >{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <RormaccountsDialog v-if="isRormaccountsDialogShow" :value="value" @close="closeRormaccountsDialog"></RormaccountsDialog>
  </div>
</template>
<script>
import base from '../base.vue';
import validmixin from '../common/validate-mixin.js';
import TsTable from '@/resources/components/TsTable/TsTable.vue';
export default {
  name: '',
  components: {
    TsTable,
    RormaccountsDialog: resolve => require(['./formaccounts-dialog.vue'], resolve)
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      theadList: [
        { key: 'name', title: this.$t('term.inspect.assetname') },
        { key: 'ip', title: this.$t('term.inspect.assetip') },
        { key: 'account', title: this.$t('page.account') },
        { key: 'accountName', title: this.$t('page.username') },
        { key: 'protocol', title: this.$t('term.inspect.connectionagreement') },
        { key: 'port', title: this.$t('page.port') },
        { key: 'action'}
      ],
      selectedItemList: [],
      isRormaccountsDialogShow: false
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
    validData() {
      return this.validDataForAllItem();
    },
    addAccounts() {
      this.isRormaccountsDialogShow = true;
    },
    closeRormaccountsDialog(selectedItemList) {
      this.isRormaccountsDialogShow = false;
      if (selectedItemList) {
        this.selectedItemList = selectedItemList;
        this.setValue(selectedItemList);
      }
    },
    deleteItem(row) {
      if (this.selectedItemList && this.selectedItemList.length > 0) {
        const index = this.selectedItemList.findIndex(d => d._selectId === row._selectId);
        if (index > -1) {
          this.selectedItemList.splice(index, 1);
        }
      }
      if (this.value && this.value.length > 0) {
        const index = this.value.findIndex(d => d._selectId === row._selectId);
        if (index > -1) {
          this.value.splice(index, 1);
          this.setValue(this.value);
        }
      }
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
