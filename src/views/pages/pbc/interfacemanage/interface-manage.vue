<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">
          {{ $getFromPage() }}
        </span>
      </template>
      <template slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-upload" @click="showInterfaceImportDialog()">{{ $t('term.pbc.importinterface') }}</div>
          <div class="action-item tsfont-plus" @click="addInterface()">{{ $t('page.interface') }}</div>
          <div v-if="searchParam.interfaceId" class="action-item tsfont-plus" @click="addProperty()">{{ $t('page.attribute') }}</div>
          <div v-if="searchParam.interfaceId" class="action-item tsfont-auto" @click="editMapping()">{{ $t('term.pbc.mappingconfig') }}</div>
          <div v-if="searchParam.interfaceId" class="action-item tsfont-download" @click="exportTemplate()">
            {{ $t('term.pbc.exporttemplate') }}
          </div>
        </div>
      </template>
      <template slot="topRight">
        <div>
          <InputSearcher
            v-if="searchParam.interfaceId"
            @change="
              val => {
                $set(searchParam, 'keyword', val);
              }
            "
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:sider>
        <div>
          <InterfaceList
            v-if="isInterfaceReload"
            :id="searchParam.interfaceId"
            ref="interfaceList"
            @click="changeInterface"
          ></InterfaceList>
        </div>
      </template>
      <template v-slot:content>
        <div v-if="searchParam.interfaceId">
          <TsTable
            :tbodyList="filtedPropertyList"
            :theadList="theadList"
            :canDrag="true"
            @updateRowSort="updatePropertySort"
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
              <span v-if="row.restraint == 'M'">{{ $t('page.require') }}(M)</span>
              <span v-else-if="row.restraint == 'O'">{{ $t('page.optional') }}(O)</span>
              <span v-else-if="row.restraint == 'C'">{{ $t('page.conditionnotnull') }}(C)</span>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-edit" @click="editProperty(row)">{{ $t('page.edit') }}</li>
                  <li class="tsfont-auto" @click="editPropertyRel(row)">{{ $t('page.relation') }}</li>
                  <li class="tsfont-trash-o" @click="deleteProperty(row)">{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
        <div v-else><NoData :text="$t('term.pbc.chooseinterface')"></NoData></div>
      </template>
    </TsContain>
    <InterfaceImportDialog v-if="isImportInterfaceShow" @close="closeImportInterfaceDialog"></InterfaceImportDialog>
    <InterfaceMappingEdit v-if="isInterfaceMappingDialogShow && searchParam.interfaceId" :interfaceId="searchParam.interfaceId" @close="closeInterfaceMappingDialog"></InterfaceMappingEdit>
    <EditProperty
      v-if="isEditPropertyDialogShow && searchParam.interfaceId"
      :interfaceId="searchParam.interfaceId"
      :propertyUid="currentPropertyUid"
      @close="closeEditPropertyDialog"
    ></EditProperty>
    <EditInterface
      v-if="isEditInterfaceDialogShow"
      @close="closeEditInterfaceDialog"
    >
    </EditInterface>
    <PropertyRelEdit v-if="isRelDialogShow" :propertyUid="currentPropertyUid" @close="closePropertyRelDialog"></PropertyRelEdit>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';

export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InterfaceImportDialog: resolve => require(['./components/interface-import-dialog.vue'], resolve),
    InterfaceMappingEdit: resolve => require(['./interface-mapping-edit.vue'], resolve),
    InterfaceList: resolve => require(['./components/interface-list.vue'], resolve),
    EditProperty: resolve => require(['./components/property-edit-dialog.vue'], resolve),
    EditInterface: resolve => require(['./components/interface-edit-dialog.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    PropertyRelEdit: resolve => require(['./components/property-edit-rel-dialog.vue'], resolve)
  },
  mixins: [download],
  props: {},
  data() {
    return {
      isRelDialogShow: false,
      isInterfaceReload: true,
      isImportInterfaceShow: false,
      isInterfaceMappingDialogShow: false,
      isEditPropertyDialogShow: false,
      isEditInterfaceDialogShow: false,
      currentInterfaceItemId: null,
      currentPropertyUid: null,
      interfaceUid: null,
      searchParam: { keyword: '' },
      interfaceItemData: {},
      propertyList: [],
      processingIdList: [],
      timmer: null,
      isExporting: false,
      theadList: [
        { key: 'id', title: this.$t('term.pbc.propertytransferid') },
        { key: 'complexId', title: this.$t('term.pbc.complexid') },
        { key: 'interfaceId', title: this.$t('term.pbc.datatransferid') },
        { key: 'dataType', title: this.$t('term.report.datatype.name') },
        { key: 'valueRange', title: this.$t('term.pbc.valuerange') },
        { key: 'restraint', title: this.$t('term.pbc.restraintcondition') },
        { key: 'action', title: '' }
      ]
    };
  },
  beforeCreate() {},
  created() {
    //this.$set(this.searchParam, 'interfaceId', this.$route.params['id']);
  },
  beforeMount() {},
  mounted() {
    //this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      this.searchProperty();
    },
    updatePropertySort(event, propertyList) {
      this.$api.pbc.property.updatePropertySort(propertyList);
    },
    refreshInterfaceList() {
      this.isInterfaceReload = false;
      this.$nextTick(() => {
        this.isInterfaceReload = true;
      });
    },
    closeImportInterfaceDialog(needRefresh) {
      this.isImportInterfaceShow = false;
      if (needRefresh) {
        this.refreshInterfaceList();
      }
    },
    showInterfaceImportDialog() {
      this.isImportInterfaceShow = true;
    },
    closeEditPropertyDialog(needRefresh) {
      this.isEditPropertyDialogShow = false;
      if (needRefresh) {
        this.searchProperty();
      }
    },
    closeEditInterfaceDialog(interfaceId) {
      this.isEditInterfaceDialogShow = false;
      if (interfaceId) {
        this.$set(this.searchParam, 'interfaceId', interfaceId);
        this.refreshInterfaceList();
      }
    },
    exportTemplate() {
      const p = {
        url: 'api/binary/pbc/interfaceitem/template/download',
        params: this.searchParam,
        changeStatus: status => {
          if (status == 'start') {
            this.isExporting = true;
          } else if (status == 'success' || status == 'error') {
            this.isExporting = false;
          }
        }
      };
      this.download(p);
    },
    closeInterfaceMappingDialog() {
      this.isInterfaceMappingDialogShow = false;
    },
    editMapping(row) {
      this.isInterfaceMappingDialogShow = true;
    },
    addInterface() {
      this.isEditInterfaceDialogShow = true;
    },
    addProperty() {
      this.isEditPropertyDialogShow = true;
      this.currentPropertyUid = null;
    },
    editProperty(row) {
      this.isEditPropertyDialogShow = true;
      this.currentPropertyUid = row.uid;
    },
   
    deleteProperty(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.attribute')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.pbc.property.deleteProperty(row.uid).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.searchProperty();
            }
          });
        }
      });
    },
    searchProperty() {
      this.$api.pbc.property.getPropertyByInterfaceId(this.searchParam.interfaceId, 1).then(res => {
        this.propertyList = res.Return;
      });
    },
    changeInterface(inter) {
      this.$set(this.searchParam, 'interfaceId', inter.id);
      this.init();
    },
    editPropertyRel(row) {
      this.currentPropertyUid = row.uid;
      this.isRelDialogShow = true;
    },
    closePropertyRelDialog(needRefresh) {
      this.isRelDialogShow = false;
      if (needRefresh) {
        this.searchProperty();
      }
    }
  },
  filter: {},
  computed: {
    filtedPropertyList() {
      if (this.searchParam.keyword) {
        const k = this.searchParam.keyword.toLowerCase();
        return this.propertyList.filter(d => d.id.toLowerCase().includes(k) || d.name.toLowerCase().includes(k) || d.complexId.toLowerCase().includes(k) || d.complexName.toLowerCase().includes(k));
      } else {
        return this.propertyList;
      }
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.divContent {
  position: relative;
  .error {
    position: absolute;
    top: -10px;
    left: -10px;
    opacity: 0.5;
    cursor: pointer;
  }
}
td {
  vertical-align: top;
}
.onewith {
  position: relative;
  // margin-right: 8px;
  &:after {
    background: #e5e5e5;
  }
  i {
    right: 6px;
    position: absolute;
    width: 1px;
    background: #e5e5e5;
    top: 15px;
    height: 20px;
  }
}
</style>
