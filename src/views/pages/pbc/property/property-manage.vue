<template>
  <div>
    <TsContain> 
      <template slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="addProperty">属性</div>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher
          v-model="searchParam"
          v-bind="searchConfig"
          @change="searchProperty()"
        ></CombineSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          v-if="propertyData"
          v-bind="propertyData"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:id="{ row }">
            <span>{{ row.name }}</span>
            <span class="text-grey">({{ row.id }})</span>
          </template>
          <template v-slot:complexId="{ row }">
            <div v-if="row.complexId">
              <span>{{ row.complexName }}</span>
              <span class="text-grey">({{ row.complexId }})</span>
            </div>
          </template>
          <template v-slot:interfaceId="{ row }">
            <span>{{ row.interfaceName }}</span>
            <span class="text-grey">({{ row.interfaceId }})</span>
          </template>
          <template v-slot:restraint="{ row }">
            <span v-if="row.restraint=='M'">必填(M)</span>
            <span v-else-if="row.restraint=='O'">选填(O)</span>
            <span v-else-if="row.restraint=='C'">条件非空(C)</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li
                  v-if="row.dataType.includes('枚举')"
                  class="tsfont-edit"
                  @click="editEnum(row)"
                >枚举成员</li>
                <li
                  class="tsfont-edit"
                  @click="updateProperty(row)"
                >编辑</li>
                <li
                  class="tsfont-auto"
                  @click="updatePropertyRel(row)"
                >关系</li>
                <li
                  class="tsfont-trash-o"
                  @click="deleteProperty(row)"
                >删除</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <EnumEdit v-if="isEnumDialogShow" :propertyId="currentId" @close="closeEnumDialog"></EnumEdit>
    <PropertyEdit v-if="isDialogShow" :uid="currentUid" @close="closePropertyDialog"></PropertyEdit>
    <PropertyRelEdit v-if="isRelDialogShow" :uid="currentUid" @close="closePropertyRelDialog"></PropertyRelEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    EnumEdit: resolve => require(['./enum-edit-dialog.vue'], resolve),
    PropertyEdit: resolve => require(['./property-edit.vue'], resolve),
    PropertyRelEdit: resolve => require(['./property-edit-rel.vue'], resolve)
  },
  props: {},
  data() {
    return {
      currentUid: null,
      currentId: null,
      isDialogShow: false, //编辑窗口
      isRelDialogShow: false, //编辑关系窗口
      isEnumDialogShow: false,
      searchParam: {},
      searchConfig: {
        search: true,
        labelPosition: 'top',
        searchList: [
          {
            type: 'select',
            name: 'interfaceId',
            valueName: 'id',
            textName: 'name',
            url: '/api/rest/pbc/interface/list',
            label: '接口',
            transfer: true
          },
          {
            type: 'select',
            name: 'dataType',
            dynamicUrl: '/api/rest/pbc/property/datatype/search',
            label: '数据类型',
            transfer: true
          },
          {
            type: 'select',
            name: 'restraint',
            dynamicUrl: '/api/rest/pbc/property/restraint/search',
            label: '约束',
            transfer: true
          }, {
            type: 'select',
            name: 'valueRange',
            dynamicUrl: '/api/rest/pbc/property/valuerange/search',
            label: '值域',
            transfer: true
          }
        ]
      },
      propertyData: {},
      theadList: [
        {key: 'id', title: '属性传输标识'},
        {key: 'complexId', title: '复合属性传输标识'},
        {key: 'interfaceId', title: '采集数据元传输标识'},
        {key: 'dataType', title: '数据类型'},
        {key: 'valueRange', title: '值域'},
        {key: 'restraint', title: '约束条件'},
        {key: 'action', title: ''}
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchProperty(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editEnum(row) {
      this.currentId = row.id;
      this.isEnumDialogShow = true;
    },
    closeEnumDialog(needRefresh) {
      this.isEnumDialogShow = false;
      if (needRefresh) {
        this.searchProperty();
      }
    },
    changePage(currentPage) {
      this.searchProperty(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchProperty();
    },
    searchProperty(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.pbc.property.searchProperty(this.searchParam).then(res => {
        this.propertyData = res.Return;
        this.propertyData.theadList = this.theadList;
      });
    },
    addProperty() {
      this.isDialogShow = true;
      this.currentUid = null;
    },
    updateProperty(property) {
      this.currentUid = property.uid;
      this.isDialogShow = true;
    },
    updatePropertyRel(property) {
      this.currentUid = property.uid;
      this.isRelDialogShow = true;
    },
    deleteProperty(property) {
      this.$createDialog({
        title: '警告',
        content: '确定删除属性：' + property.name + '？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.pbc.property.deleteProperty(property.uid).then(res => {
            this.$Message.success(this.$t('message.content.deletesuccess'));
            vnode.isShow = false;
            this.searchProperty();
          });
        },
        'on-cancel': vnode => { 
          vnode.isShow = false;
        }
      });
    },
    closePropertyDialog(needRefresh) {
      this.isDialogShow = false;
      if (needRefresh) {
        this.searchProperty();
      }
    },
    closePropertyRelDialog() {
      this.isRelDialogShow = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
