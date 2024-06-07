<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="addProperty">{{ $t('page.attribute') }}</div>
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
            <span v-if="row.restraint=='M'">{{ $t('page.require') }}(M)</span>
            <span v-else-if="row.restraint=='O'">{{ $t('page.optional') }}(O)</span>
            <span v-else-if="row.restraint=='C'">{{ $t('page.conditionnotnull') }}(C)</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li
                  v-if="row.dataType.includes($t('page.enumerate'))"
                  class="tsfont-edit"
                  @click="editEnum(row)"
                >{{ $t('term.pbc.enumitem') }}</li>
                <li
                  class="tsfont-edit"
                  @click="updateProperty(row)"
                >{{ $t('page.edit') }}</li>
                <li
                  class="tsfont-auto"
                  @click="updatePropertyRel(row)"
                >{{ $t('page.relation') }}</li>
                <li
                  class="tsfont-trash-o"
                  @click="deleteProperty(row)"
                >{{ $t('page.delete') }}</li>
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
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    EnumEdit: () => import('./enum-edit-dialog.vue'),
    PropertyEdit: () => import('./property-edit.vue'),
    PropertyRelEdit: () => import('./property-edit-rel.vue')
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
            label: this.$t('page.interface'),
            transfer: true
          },
          {
            type: 'select',
            name: 'dataType',
            dynamicUrl: '/api/rest/pbc/property/datatype/search',
            label: this.$t('term.report.datatype.name'),
            transfer: true
          },
          {
            type: 'select',
            name: 'restraint',
            dynamicUrl: '/api/rest/pbc/property/restraint/search',
            label: this.$t('term.pbc.restraint'),
            transfer: true
          }, {
            type: 'select',
            name: 'valueRange',
            dynamicUrl: '/api/rest/pbc/property/valuerange/search',
            label: this.$t('term.pbc.valuerange'),
            transfer: true
          }
        ]
      },
      propertyData: {},
      theadList: [
        {key: 'id', title: this.$t('term.pbc.propertytransferid')},
        {key: 'complexId', title: this.$t('term.pbc.complexid')},
        {key: 'interfaceId', title: this.$t('term.pbc.datatransferid')},
        {key: 'dataType', title: this.$t('term.report.datatype.name')},
        {key: 'valueRange', title: this.$t('term.pbc.valuerange')},
        {key: 'restraint', title: this.$t('term.pbc.restraintcondition')},
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
        title: this.$t('page.warning'),
        content: this.$t('term.pbc.deletepropertyconfirm', {target: property.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.pbc.property.deleteProperty(property.uid).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
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
