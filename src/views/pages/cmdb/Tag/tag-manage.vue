<template>
  <div>
    <Loading :loadingShow="showLoading" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <span v-auth="'RESOURCECENTER_TAG_MODIFY'" class="text-action tsfont-plus" @click="addTag()">{{ $t('page.tag') }}</span>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="keyword"
          @change="getTableData(1)"
        ></InputSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          :theadList="theadList"
          v-bind="tableData"
          :hideAction="hasTagModifyAuth"
          @changeCurrent="getTableData"
          @changePageSize="getTableData(1, ...arguments)"
        >
          <template v-slot:name="{ row }">
            <span v-if="hasTagModifyAuth" class="text-href" @click.stop="editTag(row)">{{ row.name }}</span>
            <span v-else>{{ row.name }}</span>
          </template>
          <template v-slot:action="{ row }">
            <div v-auth="'RESOURCECENTER_TAG_MODIFY'" class="tstable-action">
              <ul class="tstable-action-ul">
                <li
                  class="tsfont-trash-o"
                  :class="row.assetsCount>0?'disable':''"
                  :title="row.assetsCount>0?'当前标签已被引用，不可删除':''"
                  @click="deleteTag(row)"
                >{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <NewTag
      v-if="isNewTagShow"
      :id="id"
      :data="selectData"
      @close="closeNewTag"
    ></NewTag>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    NewTag: () => import('./new-tag')
  },
  filters: {},
  props: {},
  data() {
    return {
      id: null,
      selectData: null,
      isNewTagShow: false,
      showLoading: false,
      searchParams: {
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'assetsCount', title: this.$t('page.assets') },
        { key: 'description', title: this.$t('page.description') },
        { key: 'action', title: '' }
      ],
      tableData: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      keyword: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getTableData(1);
    this.isurl();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getTableData(currentPage, pageSize) {
      let data = {
        keyword: this.keyword,
        currentPage: currentPage || this.tableData.currentPage,
        pageSize: pageSize || this.tableData.pageSize
      };
      this.showLoading = true;
      this.$api.cmdb.tagManage.searchTag(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = Object.assign(this.tableData, res.Return);
          this.showLoading = false;
        }
      });
    },
    isurl() {
      if (this.$route.fullPath.includes('isNewAccountShow')) {
        this.isNewTagShow = true;
      }
    },
    addTag() {
      this.id = null;
      this.isNewTagShow = true;
    },
    closeNewTag(needFresh) {
      this.isNewTagShow = false;
      if (needFresh) {
        this.getTableData(1);
      }
    },
    editTag(row) {
      this.selectData = row;
      this.id = row.id;
      this.isNewTagShow = true;
    },
    deleteTag(relType) {
      if (relType.assetsCount > 0) {
        return;
      }
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', { target: relType.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.tagManage
            .tagManage(relType.id)
            .then(res => {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.getTableData(1);
            })
            .catch(error => {
              if (error.data.Message) {
                this.$Message.error(error.data.Message);
              } else {
                this.$Message.error(this.$t('message.deletefailed'));
              }
            });
        }
        // 'on-cancel': vnode => {
        //   vnode.isShow = false;
        // }
      });
    }
  },
  computed: {
    hasTagModifyAuth() { //判断资源中心-标签管理权限
      return this.$store.getters.userAuthList.includes('RESOURCECENTER_TAG_MODIFY');
    }
  },
  watch: {}
};
</script>
