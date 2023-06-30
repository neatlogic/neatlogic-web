<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">
          {{ $getFromPage() }}
        </span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="editRule()">{{ $t('page.rule') }}</div>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <TsFormInput
            v-model="searchParam.keyword"
            :search="true"
            :placeholder="$t('form.placeholder.pleaseinput', { target: $t('page.keyword') })"
            clearable
            @on-enter="searchRule(1)"
          ></TsFormInput>
        </div>
      </template>
      <template v-slot:content>
        <TsTable
          :theadList="theadList"
          v-bind="ruleData"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit" @click="editRule(row)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o" @click="deleteRule(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <RuleEdit v-if="isEditShow" :rule="currentRule" @close="closeEditDialog"></RuleEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    RuleEdit: resolve => require(['./discovery-rule-edit-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      currentRule: null,
      searchParam: {},
      isEditShow: false,
      theadList: [
        { key: 'sysObjectId', title: this.$t('term.cmdb.targetoid') },
        { key: 'sysDescrPattern', title: this.$t('term.cmdb.matchrule') },
        { key: '_OBJ_CATEGORY', title: this.$t('term.cmdb.objecttype') },
        { key: '_OBJ_TYPE', title: this.$t('term.cmdb.objectname') },
        { key: 'VENDOR', title: this.$t('page.manufacturer') },
        { key: 'MODEL', title: this.$t('term.cmdb.model') },
        { key: 'action', title: '' }
      ],
      ruleData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.searchRule(1);
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
    editRule(row) {
      this.isEditShow = true;
      if (row) {
        this.currentRule = row;
      }
    },
    changeCurrent(page) {
      this.searchRule(page);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchRule(1);
    },
    searchRule(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.cmdb.discovery.searchDiscoveryRule(this.searchParam).then(res => {
        this.ruleData = res.Return;
      });
    },
    closeEditDialog(needRefresh) {
      this.isEditShow = false;
      this.currentRule = null;
      if (needRefresh) {
        this.searchRule(1);
      }
    },
    deleteRule(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.rule') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.discovery.deleteDiscoveryRule(row._id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.searchRule(1);
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
