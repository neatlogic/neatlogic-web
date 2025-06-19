<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <div class="mb-xs" style="display: grid;grid-template-columns: 40% 60%">
            <div>
              <Dropdown v-if="selectedSystemNameList && selectedSystemNameList.length > 0" trigger="click" placement="bottom-start">
                <div>
                  <span>{{ $t('page.batchoperation') }}</span>
                  <span class="tsfont-down"></span>
                </div>
                <DropdownMenu slot="list">
                  <DropdownItem>
                    <div class="more-action" @click="addTag">{{ $t('dialog.title.addtarget', { target: $t('page.tag') }) }}</div>
                  </DropdownItem>
                  <DropdownItem>
                    <div class="more-action" @click="delTag">{{ $t('dialog.title.deletetarget', { target: $t('page.tag') }) }}</div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <CombineSearcher
              v-model="searchParams"
              v-bind="searchConfig"
              @change="searchTag"
            ></CombineSearcher>
          </div>
          <TsTable
            v-bind="tableConfig"
            :theadList="theadList"
            :loading="isLoading"
            keyName="id"
            :multiple="true"
            :selectedRemain="selectedRemain"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
            @getSelected="getSelected"
          >
            <template slot="tag" slot-scope="{row}">
              <Tag v-if="row.tag">{{ row.tag }}</Tag>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-edit" @click="editRow(row)">{{ $t('page.edit') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
    <TagEditDialog
      v-if="isShowTagEditDialog"
      :type="operationType"
      :systemIdList="selectedSystemNameList"
      @close="closeTagEditDialog"
    />
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TagEditDialog: () => import('./tag-edit-dialog.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue')
  },
  props: {},
  data() {
    return {
      dialogSetting: {
        title: this.$t('page.tagmanage'),
        width: 'medium',
        type: 'slider',
        isShow: true,
        hasFooter: false
      },
      operationType: '',
      selectedSystemNameList: [],
      isShowTagEditDialog: false,
      selectedRemain: false,
      isLoading: false,
      searchParams: {},
      tableConfig: {
        tbodyList: [{
          systemName: 'neatlogic',
          tag: 'DEV'
        }, {
          systemName: 'ATMS',
          tag: 'TEST'
        }],
        currentPage: 1,
        pageSize: 10
      },
      theadList: [
        {
          key: 'selection',
          multiple: true,
          width: 20
        },
        {
          title: '系统名称',
          key: 'systemName'
        },
        {
          title: this.$t('page.tag'),
          key: 'tag'
        },
        {
          key: 'action'
        }
      ],
      searchConfig: {
        search: true,
        placeholder: '请输入',
        searchList: [
          {
            type: 'select',
            name: 'typeIdList',
            label: '系统名称',
            placeholder: this.$t('page.pleaseselect'),
            dynamicUrl: '/api/rest/resourcecenter/appsystem/list/fortree',
            params: {},
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            search: true,
            multiple: true,
            transfer: true
          },
          {
            type: 'select',
            label: '标签',
            name: 'riskIdList',
            dynamicUrl: '/api/rest/resourcecenter/tag/search',
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeCurrent(current) {
      this.tableConfig.currentPage = current;
      this.tableConfig.pageSize = 20;
      this.searchTag();
    },
    changePageSize(pageSize) {
      this.tableConfig.currentPage = 1;
      this.tableConfig.pageSize = pageSize;
      this.searchTag();
    },
    closeDialog() {
      this.$emit('close');
    },
    editRow(row) {
      let { id } = row || {};
      this.selectedSystemNameList = id ? [id] : [];
      this.operationType = '';
      this.isShowTagEditDialog = true;
    },
    addTag() {
      this.operationType = 'batchAddTag';
      this.isShowTagEditDialog = true;
    },
    delTag() {
      this.operationType = 'batchdelTag';
      this.isShowTagEditDialog = true;
    },
    closeTagEditDialog(needRefresh) {
      this.isShowTagEditDialog = false;
      if (needRefresh) {
        this.searchTag();
      }
    },
    getSelected(indexList, itemList) {
      this.selectedSystemNameList = itemList;
      this.selectedRemain = true;
    },
    searchTag() {
      this.isLoading = true;
      let params = {
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize,
        ...this.searchParams
      };
      this.$api.cmdb.applicationManage.searchTagList(params).then(res => {
        if (res.Status == 'OK') {
          console.log('log');
          this.tableConfig = res.Return || {};
        }
      }).finally(() => {
        this.isLoading = false;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
