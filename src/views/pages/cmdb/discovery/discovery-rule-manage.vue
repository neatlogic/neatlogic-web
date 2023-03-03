<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span class="text-action tsfont-left" @click="$back('/discovery-manage')">
          返回
        </span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="editRule()">规则</div>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <TsFormInput
            v-model="searchParam.keyword"
            :search="true"
            placeholder="关键字"
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
                <li
                  class="tsfont-edit"
                  @click="editRule(row)"
                >编辑</li>
                <li
                  class="tsfont-trash-o"
                  @click="deleteRule(row)"
                >删除</li>
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
        { key: 'sysObjectId', title: '目标oid' },
        { key: 'sysDescrPattern', title: '匹配规则' },
        { key: '_OBJ_CATEGORY', title: '对象分类' },
        { key: '_OBJ_TYPE', title: '对象名' },
        { key: 'VENDOR', title: '厂商' },
        { key: 'MODEL', title: '型号' },
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
        content: '确定删除当前规则？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.discovery
            .deleteDiscoveryRule(row._id)
            .then(res => {
              this.$Message.success(this.$t('message.content.deletesuccess'));
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
