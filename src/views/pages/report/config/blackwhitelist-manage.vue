<template>
  <div>
    <TsContain> 
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addBlackWhiteList()">可用对象</span>
      </template>
      <div slot="content" ref="maintable" class="content">
        <TsTable v-if="blackWhiteListData" :theadList="theadList" v-bind="blackWhiteListData">
          <template v-slot:itemType="{ row }">
            <span v-if="row.itemType == 'table'">表</span>
            <span v-else-if="row.itemType == 'column'">字段</span>
          </template>
          <template v-slot:type="{ row }">
            <span v-if="row.type == 'blacklist'" class="text-error">黑名单</span>
            <span v-else-if="row.type == 'whitelist'" class="text-success">白名单</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li
                  class="tsfont-edit"
                  @click="editBlackWhiteList(row)"
                >编辑</li>
                <li
                  class="tsfont-trash-o"
                  @click="deleteBlackWhiteList(row)"
                >删除</li>
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
        {key: 'itemName', title: '对象名称'},
        {key: 'itemType', title: '对象类型'},
        {key: 'type', title: '类型'},
        {key: 'description', title: '说明'},
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
