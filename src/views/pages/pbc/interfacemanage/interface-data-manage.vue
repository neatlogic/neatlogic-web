<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">
          {{ $getFromPage() }}
        </span>
      </template>
      <template slot="topLeft">
        <div>
          <div v-if="searchParam.interfaceId && searchParam.corporationId" class="action-group">
            <div class="action-item tsfont-plus" @click="addInterfaceItem()">{{ $t('page.data') }}</div>
            <div class="action-item tsfont-upload" @click="showImportDialog()">{{ $t('page.importdata') }}</div>
            <div v-download="exportData()" class="action-item tsfont-download">{{ $t('term.pbc.exportdata') }}</div>
            <div v-if="hasSelectItem" class="action-item tsfont-trash-o" @click="batchDelInterfaceItem">{{ $t('page.batchdelete') }}</div>
            <div class="action-item"><TsFormSwitch
              v-model="isUseAlias"
              :showStatus="true"
              :trueValue="1"
              :falseValue="0"
              :trueText="$t('page.showalias')"
              :falseText="$t('page.showalias')"
            ></TsFormSwitch></div>
          </div>
        </div>
      </template>
      <template slot="topRight">
        <InputSearcher v-model="searchParam.keyword" @change="searchInterfaceItem(1)"></InputSearcher>
      </template>
      <template v-slot:sider>
        <InterfaceList :id="searchParam.interfaceId" :needItemCount="true" @click="changeInterface"></InterfaceList>
      </template>
      <template v-slot:content>
        <div v-if="searchParam.interfaceId">
          <Tabs v-if="corporationList && corporationList.length > 0" @on-click="changeTag">
            <TabPane
              v-for="corporation in corporationList"
              :key="corporation.id"
              :label="getLabel(corporation)"
              :name="corporation.id.toString()"
            >
              <Loading :loadingShow="isLoading" type="fix"></Loading>
              <div v-if="interfaceItemData && interfaceItemData.tbodyList && interfaceItemData.tbodyList.length > 0" class="tstable-container tstable-normal tstable-allborder tstable-no-fixedHeader radius-lg">
                <div v-custom-scrollbar class="tstable-main bg-op">
                  <table class="table-main tstable-body">
                    <thead>
                      <tr v-if="hasComplexProp">
                        <th :colspan="hasDeleteItem ? 4 : 3"></th>
                        <th
                          v-for="(prop, pindex) in propertyList"
                          :key="pindex"
                          nowrap
                          :colspan="prop.subPropertyList ? prop.subPropertyList.length : 1"
                        >
                          {{ prop.complexName || '' }}
                        </th>
                      </tr>
                      <tr style="text-align:center">
                        <th></th>
                        <th v-if="hasDeleteItem">
                          <Checkbox
                            :value="isCheckAll"
                            :indeterminate="isIndeterminate"
                            style="margin:0px"
                            @on-change="toggleSelectAll"
                          ></Checkbox>
                        </th>
                        <th>{{ $t('page.exception') }}</th>
                        <th>{{ $t('page.updatetime') }}</th>
                        <th v-for="(prop, pindex) in allPropertyList" :key="pindex" nowrap>
                          <span v-if="!isUseAlias">{{ prop.name }}</span>
                          <span v-else>{{ prop.alias || prop.name }}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody v-if="interfaceItemData.tbodyList && interfaceItemData.tbodyList.length > 0" class="tbody-main">
                      <tr v-for="(interfaceItem, index) in interfaceItemData.tbodyList" :key="index">
                        <td>
                          <Dropdown placement="bottom-start" :transfer="true">
                            <a href="javascript:void(0)" class="tsfont-option-horizontal"></a>
                            <DropdownMenu slot="list">
                              <DropdownItem @click.native="editInterfaceItem(interfaceItem.id)">{{ $t('page.edit') }}</DropdownItem>
                              <DropdownItem @click.native="validInterfaceItem(interfaceItem.id)">{{ $t('page.validate') }}</DropdownItem>
                              <DropdownItem v-if="!interfaceItem.isImported" @click.native="delInterfaceItem(interfaceItem.id)">{{ $t('page.delete') }}</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </td>
                        <td v-if="hasDeleteItem"><Checkbox v-if="!interfaceItem.isImported" v-model="interfaceItem.isSelected" style="margin:0px"></Checkbox></td>
                        <td><Badge :count="interfaceItem.errorCount"></Badge></td>
                        <td>
                          <span v-if="interfaceItem.lcd">{{ interfaceItem.lcd | formatDate }}</span>
                          <span v-else-if="interfaceItem.fcd">{{ interfaceItem.fcd | formatDate }}</span>
                        </td>
                        <td v-for="(prop, pindex) in allPropertyList" :key="pindex">
                          <div v-if="interfaceItem.dataText && !prop.complexId" class="divContent">
                            <Poptip
                              v-if="interfaceItem.error && interfaceItem.error[prop.id]"
                              :transfer="true"
                              trigger="hover"
                              :title="$t('page.exception')"
                              class="error"
                              word-wrap
                              width="400"
                              :content="interfaceItem.error[prop.id]"
                            >
                              <i class="text-error tsfont-warning-s"></i>
                            </Poptip>
                            {{ interfaceItem.dataText[prop.id] }}
                          </div>
                          <div v-else-if="interfaceItem.dataText && prop.complexId && interfaceItem.dataText[prop.complexId] && interfaceItem.dataText[prop.complexId].length > 0">
                            <div v-for="(d, dindex) in interfaceItem.dataText[prop.complexId]" :key="dindex" class="mb-xs divContent">
                              <div v-if="dindex < 5 || isShowMore(interfaceItem.id, prop.complexId)">
                                <Poptip
                                  v-if="interfaceItem.error && interfaceItem.error[prop.complexId] && interfaceItem.error[prop.complexId][dindex.toString()] && interfaceItem.error[prop.complexId][dindex.toString()][prop.id]"
                                  :transfer="true"
                                  trigger="hover"
                                  :title="$t('page.exception')"
                                  class="error"
                                  word-wrap
                                  width="400"
                                  :content="interfaceItem.error[prop.complexId][dindex.toString()][prop.id]"
                                >
                                  <span class="text-error tsfont-warning-s mr-xs"></span>
                                </Poptip>
                                <span v-if="d[prop.id]">{{ d[prop.id] }}</span>
                                <span v-else>-</span>
                                <Divider v-if="dindex < interfaceItem.dataText[prop.complexId].length - 1" style="margin:0px;padding:0px" />
                              </div>
                            </div>
                            <div v-if="!isShowMore(interfaceItem.id, prop.complexId) && interfaceItem.dataText[prop.complexId].length > 5" class="text-href" @click="showMore(interfaceItem.id, prop.complexId)">{{ $t('page.viewmore') }}...</div>
                            <div v-if="isShowMore(interfaceItem.id, prop.complexId) && interfaceItem.dataText[prop.complexId].length > 5" class="text-href" @click="hideMore(interfaceItem.id, prop.complexId)">{{ $t('page.packup') }}</div>
                          </div>
                          <div v-else-if="interfaceItem.error && interfaceItem.error[prop.complexId]" class="divContent">
                            <Poptip
                              :transfer="true"
                              trigger="hover"
                              :title="$t('page.exception')"
                              class="error"
                              word-wrap
                              width="400"
                              :content="interfaceItem.error[prop.complexId]"
                            >
                              <i class="text-error tsfont-warning-s"></i>
                            </Poptip>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <NoData v-else :text="$t('page.nodata')"></NoData>
              <div v-if="interfaceItemData.pageCount > 1" class="tstable-page text-right">
                <ul class="ivu-page mini">
                  <span class="ivu-page-total">{{ $t('page.intotaltarget', {target: interfaceItemData.rowNum}) }}</span>
                  <li
                    v-if="interfaceItemData.currentPage > 1"
                    :title="$t('page.previouspage')"
                    class="ivu-page-prev"
                    @click="changePage(interfaceItemData.currentPage - 1)"
                  >
                    <a><i class="ivu-icon ivu-icon-ios-arrow-back"></i></a>
                  </li>
                  <li v-else :title="$t('page.previouspage')" class="ivu-page-prev ivu-page-disabled">
                    <a><i class="ivu-icon ivu-icon-ios-arrow-back"></i></a>
                  </li>
                  <li
                    v-for="(p, index) in pageRange(interfaceItemData.currentPage, interfaceItemData.pageCount)"
                    :key="index"
                    :title="p"
                    class="ivu-page-item"
                    :class="interfaceItemData.currentPage == p ? 'ivu-page-item-active' : ''"
                  >
                    <a href="javascript:void(0)" @click="changePage(p)">{{ p }}</a>
                  </li>
                  <li
                    v-if="interfaceItemData.currentPage < interfaceItemData.pageCount"
                    :title="$t('page.nextpage')"
                    class="ivu-page-next"
                    @click="changePage(interfaceItemData.currentPage + 1)"
                  >
                    <a><i class="ivu-icon ivu-icon-ios-arrow-forward"></i></a>
                  </li>
                  <li v-else :title="$t('page.nextpage')" class="ivu-page-next ivu-page-disabled">
                    <a><i class="ivu-icon ivu-icon-ios-arrow-forward"></i></a>
                  </li>
                </ul>
              </div>
            </TabPane>
          </Tabs>
          <div v-else>
            <NoData :text="$t('term.pbc.noorganization')"></NoData>
          </div>
        </div>
        <div v-else><NoData :text="$t('term.pbc.chooseinterface')"></NoData></div>
      </template>
    </TsContain>
    <InterfaceItemEdit
      v-if="isInterfaceItemDialogShow && searchParam.interfaceId && searchParam.corporationId"
      :interfaceId="searchParam.interfaceId"
      :corporationId="searchParam.corporationId"
      :interfaceItemId="currentInterfaceItemId"
      @close="closeInterfaceItemDialog"
    ></InterfaceItemEdit>
    <InterfaceItemImportDialog
      v-if="isImportShow && searchParam.interfaceId"
      :corporationId="searchParam.corporationId"
      :interfaceId="searchParam.interfaceId"
      @close="closeImportDialog"
    ></InterfaceItemImportDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
import customScrollbar from '@/resources/directives/v-custom-scrollbar.js';
export default {
  name: '',
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    InterfaceItemEdit: () => import('./interface-item-edit.vue'),
    InterfaceList: () => import('./components/interface-list.vue'),
    InterfaceItemImportDialog: () => import('./components/interface-item-import-dialog.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  directives: { download, customScrollbar },
  props: {},
  data() {
    return {
      corporationList: [],
      isInterfaceItemDialogShow: false,
      currentInterfaceItemId: null,
      interfaceUid: null,
      isImportShow: false,
      searchParam: {},
      interfaceItemData: {},
      propertyList: [],
      processingIdList: [],
      timmer: null,
      isExporting: false,
      isLoading: false,
      moreMap: [],
      isUseAlias: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    // this.getCorporationList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toggleSelectAll(val) {
      this.interfaceItemData.tbodyList.forEach(element => {
        this.$set(element, 'isSelected', val);
      });
    },
    batchDelInterfaceItem() {
      const idList = [];
      this.interfaceItemData.tbodyList.forEach(element => {
        if (element.isSelected) {
          idList.push(element.id);
        }
      });
      if (idList.length > 0) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('term.pbc.deletedataconfirm'),
          btnType: 'error',
          'on-ok': vnode => {
            this.$api.pbc.interfaceitem.batchDeleteInterfaceItem(idList).then(res => {
              if (res.Status === 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.searchInterfaceItem();
              }
            });
          }
        });
      }
    },
    getLabel(corporation) {
      return h => {
        return h('div', [
          h('span', corporation.name),
          h('Badge', {
            props: {
              count: corporation.itemCount
            }
          })
        ]);
      };
    },
    isShowMore(interfaceItemId, complexId) {
      return this.moreMap[interfaceItemId + '_' + complexId];
    },
    showMore(interfaceItemId, complexId) {
      this.$set(this.moreMap, interfaceItemId + '_' + complexId, true);
    },
    hideMore(interfaceItemId, complexId) {
      this.$set(this.moreMap, interfaceItemId + '_' + complexId, false);
    },
    changeTag(name) {
      if (name) {
        const corporationId = parseInt(name);
        if (this.searchParam.corporationId !== corporationId) {
          this.$set(this.searchParam, 'corporationId', corporationId);
          this.searchInterfaceItem();
        }
      }
    },
    async getCorporationList() {
      await this.$api.pbc.corporation.searchCorporation(true, this.searchParam.interfaceId).then(res => {
        this.corporationList = res.Return;
        if (this.corporationList.length > 0) {
          this.$set(this.searchParam, 'corporationId', this.corporationList[0].id);
        }
      });
    },
    async init() {
      await this.getCorporationList();
      this.getProperty();
      this.searchInterfaceItem();
    },
    showImportDialog() {
      this.isImportShow = true;
    },
    closeImportDialog(needRefresh) {
      this.isImportShow = false;
      if (needRefresh) {
        this.searchInterfaceItem();
      }
    },
    downloadTemplate() {
      return {
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
    },
    exportData() {
      return {
        url: 'api/binary/pbc/interfaceitem/export',
        params: { ...this.searchParam, isUseAlias: this.isUseAlias },
        changeStatus: status => {
          if (status == 'start') {
            this.isExporting = true;
          } else if (status == 'success' || status == 'error') {
            this.isExporting = false;
          }
        }
      };
    },
    syncData() {
      this.$api.pbc.interfaces.syncInterfaceData(this.searchParam.interfaceId).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    changePage(currentPage) {
      this.searchInterfaceItem(currentPage);
    },
    pageRange(currentPage, pageCount) {
      const pageRange = [];
      for (let i = Math.max(1, currentPage - 2); i <= Math.min(currentPage + 2, pageCount); i++) {
        pageRange.push(i);
      }
      return pageRange;
    },
    statusClass(status) {
      if (status == 'invalid' || status == 'failed' || status == 'report_failed') {
        return 'text-error';
      } else if (status == 'valid' || status == 'success' || status == 'report-success') {
        return 'text-success';
      }
      return '';
    },
    searchInterfaceItem(currentPage) {
      if (this.searchParam.corporationId) {
        this.searchParam.currentPage = currentPage || 1;
        this.isLoading = true;
        this.$api.pbc.interfaceitem
          .searchInterfaceItem(this.searchParam)
          .then(res => {
            this.interfaceItemData = res.Return;
            this.processingIdList = [];
            this.interfaceItemData.tbodyList.forEach(d => {
              if (d.isProcessing) {
                this.processingIdList.push(d.id);
              }
            });
            if (this.processingIdList.length > 0) {
              this.timmer = setTimeout(() => {
                this.getInterfaceItemByIdList();
              }, 3000);
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    },
    getInterfaceItemByIdList() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      if (this.processingIdList && this.processingIdList.length > 0) {
        this.$api.pbc.interfaceitem.getInterfaceItemByIdList(this.processingIdList).then(res => {
          const processingItemList = res.Return;
          this.processingIdList = [];
          if (processingItemList && processingItemList.length > 0) {
            processingItemList.forEach(d => {
              const index = this.interfaceItemData.tbodyList.findIndex(sd => sd.id == d.id);
              if (index > -1) {
                this.$set(this.interfaceItemData.tbodyList, index, d);
              }
              if (d.isProcessing) {
                this.processingIdList.push(d.id);
              }
            });
          }
          if (this.processingIdList.length > 0) {
            this.timmer = setTimeout(() => {
              this.getInterfaceItemByIdList();
            }, 3000);
          }
        });
      }
    },
    getProperty() {
      this.$api.pbc.property.getPropertyByInterfaceId(this.searchParam.interfaceId).then(res => {
        this.propertyList = res.Return;
      });
    },
    addInterfaceItem() {
      this.isInterfaceItemDialogShow = true;
      this.currentInterfaceItemId = null;
    },
    closeInterfaceItemDialog(needRefresh) {
      this.isInterfaceItemDialogShow = false;
      if (needRefresh) {
        this.searchInterfaceItem();
      }
    },
    editInterfaceItem(id) {
      this.isInterfaceItemDialogShow = true;
      this.currentInterfaceItemId = id;
    },
    delInterfaceItem(id) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.data')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.pbc.interfaceitem.deleteInterfaceItem(id).then(res => {
            if (res.Status === 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchInterfaceItem();
            }
          });
        }
      });
    },
    validInterfaceItem(id) {
      this.$api.pbc.interfaceitem.validInterfaceItem(id).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.searchInterfaceItem();
        }
      });
    },
    changeInterface(inter) {
      this.$set(this.searchParam, 'interfaceId', inter.id);
      this.init();
    }
  },
  filter: {},
  computed: {
    hasComplexProp() {
      return this.propertyList.findIndex(d => d.subPropertyList && d.subPropertyList.length > 0) > -1;
    },
    allPropertyList() {
      const allPropertyList = [];
      this.propertyList.forEach(d => {
        if (!d.subPropertyList) {
          allPropertyList.push(d);
        } else {
          d.subPropertyList.forEach(sd => {
            allPropertyList.push(sd);
          });
        }
      });
      return allPropertyList;
    },
    hasSelectItem() {
      if (this.interfaceItemData && this.interfaceItemData.tbodyList) {
        for (let i = 0; i < this.interfaceItemData.tbodyList.length; i++) {
          const element = this.interfaceItemData.tbodyList[i];
          if (element.isSelected) {
            return true;
          }
        }
      }
      return false;
    },
    isCheckAll() {
      let hasTrue = false;
      let hasFalse = false;
      if (this.interfaceItemData && this.interfaceItemData.tbodyList) {
        for (let i = 0; i < this.interfaceItemData.tbodyList.length; i++) {
          const element = this.interfaceItemData.tbodyList[i];
          if (element.isSelected) {
            hasTrue = true;
          } else {
            hasFalse = true;
          }
          if (hasTrue && hasFalse) {
            return false;
          }
        }
      }
      if (hasTrue) {
        return true;
      }
      return false;
    },
    isIndeterminate() {
      let hasTrue = false;
      let hasFalse = false;
      if (this.interfaceItemData && this.interfaceItemData.tbodyList) {
        for (let i = 0; i < this.interfaceItemData.tbodyList.length; i++) {
          const element = this.interfaceItemData.tbodyList[i];
          if (element.isSelected) {
            hasTrue = true;
          } else {
            hasFalse = true;
          }
          if (hasTrue && hasFalse) {
            return true;
          }
        }
      }
      return false;
    },
    hasDeleteItem() {
      if (this.interfaceItemData && this.interfaceItemData.tbodyList) {
        for (let i = 0; i < this.interfaceItemData.tbodyList.length; i++) {
          const element = this.interfaceItemData.tbodyList[i];
          if (!element.isImported) {
            return true;
          }
        }
      }
      return false;
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
