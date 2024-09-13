<template>
  <div>
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <div v-if="!isLoading && interfaceItemData && interfaceItemData.tbodyList && interfaceItemData.tbodyList.length > 0" class="tstable-container tstable-normal tstable-allborder tstable-no-fixedHeader radius-lg">
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
            <tr style="text-align: center">
              <th>{{ $t('page.exception') }}</th>
              <th>{{ $t('page.status') }}</th>
              <th>{{ $t('page.updatetime') }}</th>
              <th v-for="(prop, pindex) in allPropertyList" :key="pindex" nowrap>
                <span>{{ prop.alias || prop.name }}</span>
              </th>
            </tr>
          </thead>
          <tbody v-if="interfaceItemData.tbodyList && interfaceItemData.tbodyList.length > 0" class="tbody-main">
            <tr v-for="(interfaceItem, index) in interfaceItemData.tbodyList" :key="index">
              <td><Badge :count="interfaceItem.errorCount"></Badge></td>
              <td>状态</td>
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
                      <Divider v-if="dindex < interfaceItem.dataText[prop.complexId].length - 1" style="margin: 0px; padding: 0px" />
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
        <span class="ivu-page-total">{{ $t('page.intotaltarget', { target: interfaceItemData.rowNum }) }}</span>
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
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    auditId: {type: Number},
    phaseId: {type: Number},
    interfaceId: { type: String },
    corporationId: { type: Number }
  },
  data() {
    return {
      isLoading: false,
      propertyList: [],
      searchParam: {},
      interfaceList: [],
      interfaceItemData: {},
      moreMap: []
    };
  },
  beforeCreate() {},
  created() {
    this.getProperty();
    this.searchInterfaceItem();
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
    pageRange(currentPage, pageCount) {
      const pageRange = [];
      for (let i = Math.max(1, currentPage - 2); i <= Math.min(currentPage + 2, pageCount); i++) {
        pageRange.push(i);
      }
      return pageRange;
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
    changePage(currentPage) {
      this.searchInterfaceItem(currentPage);
    },
    getProperty() {
      if (this.interfaceId) {
        this.$api.pbc.property.getPropertyByInterfaceId(this.interfaceId).then(res => {
          this.propertyList = res.Return;
        });
      }
    },

    searchInterfaceItem(currentPage) {
      if (this.interfaceId && this.corporationId) {
        this.searchParam.corporationId = this.corporationId;
        this.searchParam.interfaceId = this.interfaceId;
        this.searchParam.phaseId = this.phaseId;
        this.searchParam.auditId = this.auditId;
        this.searchParam.currentPage = currentPage || 1;
        this.isLoading = true;
        this.$api.pbc.interfaceitem
          .searchInterfaceItem(this.searchParam)
          .then(res => {
            this.interfaceItemData = res.Return;
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
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
  watch: {
    interfaceId: {
      handler(val) {
        if (val) {
          this.getProperty();
          this.searchInterfaceItem();
        }
      }
    }
  }
};
</script>
<style lang="less"></style>
