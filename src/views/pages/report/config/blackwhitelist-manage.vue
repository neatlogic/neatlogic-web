<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addBlackWhiteList()">{{ $t('page.availableobject') }}</span>
      </template>
      <div slot="content" ref="maintable" class="content">
        <TsTable v-if="blackWhiteListData" :theadList="theadList" v-bind="blackWhiteListData">
          <template v-slot:itemType="{ row }">
            <span v-if="row.itemType == 'table'">{{ $t('page.table') }}</span>
            <span v-else-if="row.itemType == 'column'">{{ $t('page.field') }}</span>
          </template>
          <template v-slot:type="{ row }">
            <span v-if="row.type == 'blacklist'" class="text-error">{{ $t('page.blacklist') }}</span>
            <span v-else-if="row.type == 'whitelist'" class="text-success">{{ $t('page.whitelist') }}</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li
                  class="tsfont-edit"
                  @click="editBlackWhiteList(row)"
                >{{ $t('term.report.edittemplate') }}
                </li>
                <li
                  class="tsfont-trash-o"
                  @click="deleteBlackWhiteList(row)"
                >{{ $t('term.report.deletetemplate') }}
                </li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <BlackWhiteEdit v-if="isShow" :id="currentId" @close="closeEditDialog"></BlackWhiteEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    BlackWhiteEdit: resolve => require(['./blackwhitelist-edit.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isShow: false,
      currentId: null,
      theadList: [
        {key: 'itemName', title: this.$t('page.itemname')},
        {key: 'itemType', title: this.$t('page.itemtype')},
        {key: 'type', title: this.$t('page.type')},
        {key: 'description', title: this.$t('page.explain')},
        {key: 'action'}
      ],
      blackWhiteListData: {},
      searchParam: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { this.searchBlackWhiteList(); },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchBlackWhiteList(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.report.report.searchBlackWhiteList(this.searchParam).then(res => {
        this.blackWhiteListData = res.Return;
      });
    },
    addBlackWhiteList() {
      this.currentId = null;
      this.isShow = true;
    },
    editBlackWhiteList(item) {
      this.currentId = item.id;
      this.isShow = true;
    },
    deleteBlackWhiteList(item) {

    },
    closeEditDialog(needRefresn) {
      this.isShow = false;
      if (needRefresn) {
        this.searchBlackWhiteList();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
