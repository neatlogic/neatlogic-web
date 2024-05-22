<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="editObject()">
            {{ $t('page.object') }}
          </div>
        </div>
      </template>
      <template v-slot:topRight>
        <CombineSearcher
          v-model="searchVal"
          v-bind="searchConfig"
          style="width: 500px; display: inline-block"
          @change="
            searchParam.currentPage = 1;
            searchObject();
          "
        ></CombineSearcher>
      </template>
      <template v-slot:content>
        <TsCard
          v-bind="objData"
          :sm="8"
          :lg="6"
          :xl="6"
          :xxl="4"
          :boxShadow="false"
          @updateSize="changePageSize"
          @updatePage="changePage"
        >
          <template slot-scope="{ row }">
            <div class="padding-xs">
              <div class="grid mb-sm">
                <div class="text-grey">{{ $t('term.cmdb.objectcategory') }}</div>
                <div>{{ row.objCategory }}</div>
              </div>
              <div class="grid mb-sm">
                <div class="text-grey">{{ $t('term.cmdb.objecttype') }}</div>
                <div>{{ row.objType }}</div>
              </div>
              <div class="grid">
                <div class="text-grey">{{ $t('page.model') }}</div>
                <div>{{ row.ciLabel }}</div>
              </div>
            </div>
          </template>
          <template v-slot:control="{ row }">
            <div class="tsfont-edit" @click="editObject(row)">{{ $t('page.edit') }}</div>
            <div class="tsfont-trash-o" @click="deleteObject(row)">{{ $t('page.delete') }}</div>
          </template>
        </TsCard>
      </template>
    </TsContain>
    <ObjectEdit v-if="isObjectShow" :id="currentObjId" @close="closeDialog"></ObjectEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    ObjectEdit: () => import('@/views/pages/cmdb/discovery/obj-edit-dialog.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue')
  },
  props: {},
  data() {
    return {
      objData: {},
      searchVal: {},
      searchParam: {},
      isObjectShow: false,
      currentObjId: null,
      searchConfig: {
        search: true,
        labelPosition: 'left',
        labelWidth: 70,
        searchList: [
          {
            type: 'select',
            name: 'ciId',
            url: 'api/rest/cmdb/ci/list',
            label: this.$t('page.model'),
            transfer: true
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchObject();
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
    changePage(page) {
      this.searchParam.currentPage = page;
      this.searchObject();
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchParam.currentPage = 1;
      this.searchObject();
    },
    closeDialog(needRefresh) {
      this.isObjectShow = false;
      this.currentObjId = null;
      if (needRefresh) {
        this.searchObject();
      }
    },
    editObject(obj) {
      if (obj) {
        this.currentObjId = obj.id;
      }
      this.isObjectShow = true;
    },
    deleteObject(obj) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: '对象' }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.sync.deleteObject(obj.id).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.searchObject();
            }
          });
        }
      });
    },
    searchObject() {
      this.$api.cmdb.sync.searchObject({ ...this.searchParam, ...this.searchVal }).then(res => {
        this.objData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 80px auto;
}
</style>
