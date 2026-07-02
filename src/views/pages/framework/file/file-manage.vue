<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-setting" @click="openFileTypeRuleDialog">{{ $t('term.framework.filetyperule') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <CombineSearcher v-model="searchParam" v-bind="searchConfig" @change="searchFile(1)"></CombineSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          v-if="fileData"
          v-bind="fileData"
          :theadList="theadList"
          :sortList="['uploadTime', 'size']"
          :sortOrder="sortOrder"
          @updateSort="updateSort"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:size="{ row }">
            {{ row.sizeText }}
          </template>
          <template v-slot:name="{ row }">
            <span v-download="downurl('/api/binary/file/download', row.id)" class="text-href">{{ row.name }}</span>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <TsDialog
      type="modal"
      :is-show.sync="isShowFileTypeRuleDialog"
      :title="$t('term.framework.filetyperule')"
      width="large"
      :has-footer="false"
      @on-close="closeFileTypeRuleDialog"
    >
      <template v-slot>
        <div class="filetype-rule-dialog">
          <div class="text-right mb-sm">
            <Button type="primary" @click="openAddFileTypeRuleDialog">{{ $t('dialog.title.addtarget', { target: $t('term.framework.filetyperule') }) }}</Button>
          </div>
          <TsTable
            v-if="fileTypeRuleData"
            v-bind="fileTypeRuleData"
            :theadList="fileTypeRuleTheadList"
            @operation="operateFileTypeRule"
          >
            <template v-slot:whiteList="{ row }">
              {{ formatList(row.whiteList) }}
            </template>
            <template v-slot:blackList="{ row }">
              {{ formatList(row.blackList) }}
            </template>
            <template v-slot:maxSize="{ row }">
              {{ row.maxSize || '-' }}
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
    <TsDialog
      type="modal"
      :is-show.sync="isShowAddFileTypeRuleDialog"
      :title="fileTypeRuleDialogTitle"
      width="medium"
      :mask-close="false"
      @on-ok="saveFileTypeRule"
      @on-close="closeAddFileTypeRuleDialog"
    >
      <template v-slot>
        <TsForm
          ref="fileTypeRuleForm"
          v-model="fileTypeRuleFormValue"
          :item-list="fileTypeRuleFormConfig"
          :label-width="120"
        >
          <template v-slot:name>
            <span>{{ fileTypeRuleTypeText }}</span>
          </template>
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';

export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  directives: { download },
  props: {},
  data() {
    return {
      sortConfig: {},
      searchParam: {
        keyword: ''
      },
      searchConfig: {
        labelWidth: 100,
        searchList: [
          {
            type: 'select',
            name: 'type',
            label: this.$t('page.type'),
            transfer: true,
            dynamicUrl: 'api/rest/file/type/list',
            valueName: 'name',
            textName: 'displayName'
          },
          {
            type: 'timeselect',
            name: 'uploadTimeRange',
            label: this.$t('page.timerange'),
            transfer: true
          }
        ]
      },
      theadList: [
        { key: 'id', title: '#' },
        { key: 'name', title: this.$t('page.name') },
        { key: 'typeText', title: this.$t('page.type') },
        { key: 'size', title: this.$t('page.size') },
        { key: 'userUuid', title: this.$t('page.uploaduser'), type: 'user' },
        { key: 'uploadTime', title: this.$t('page.uploadtime'), type: 'time' }
      ],
      fileData: {},
      isShowFileTypeRuleDialog: false,
      isShowAddFileTypeRuleDialog: false,
      isEditFileTypeRule: false,
      fileTypeRuleTypeText: '',
      fileTypeRuleData: {},
      fileTypeRuleFormValue: {
        name: '',
        whiteList: '',
        blackList: '',
        maxSize: null
      },
      fileTypeRuleTheadList: [
        { key: 'displayName', title: this.$t('page.type') },
        { key: 'whiteList', title: this.$t('term.framework.uploadwhitelist') },
        { key: 'blackList', title: this.$t('term.framework.uploadblacklist') },
        { key: 'maxSize', title: this.$t('term.framework.uploadmaxsize') },
        {
          key: 'action',
          title: '',
          type: 'action',
          operations: [
            { icon: 'tsfont-edit', name: this.$t('page.edit'), action: 'edit', type: 'text' },
            { icon: 'tsfont-trash-o', name: this.$t('page.delete'), action: 'delete', type: 'text' }
          ]
        }
      ],
      fileTypeRuleFormConfig: [
        {
          type: 'select',
          name: 'name',
          label: this.$t('page.type'),
          transfer: true,
          dynamicUrl: 'api/rest/file/type/list',
          valueName: 'name',
          textName: 'displayName',
          disabled: false,
          validateList: ['required']
        },
        {
          type: 'textarea',
          name: 'whiteList',
          label: this.$t('term.framework.uploadwhitelist'),
          desc: this.$t('term.framework.uploadwhitelistdesc')
        },
        {
          type: 'textarea',
          name: 'blackList',
          label: this.$t('term.framework.uploadblacklist'),
          desc: this.$t('term.framework.uploadblacklistdesc')
        },
        {
          type: 'number',
          name: 'maxSize',
          label: this.$t('term.framework.uploadmaxsize'),
          desc: this.$t('term.framework.uploadmaxsizedesc'),
          validateList: [
            {
              name: 'custom',
              message: this.$t('term.framework.uploadmaxsizevalid'),
              validator: value => {
                return this.$utils.isEmpty(value) || (/^\d+$/.test(value) && Number(value) >= 0);
              }
            }
          ]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchFile(1);
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
    updateSort(sort) {
      this.sortConfig = {};
      Object.assign(this.sortConfig, sort);
      this.searchFile(1);
    },
    changePage(currentPage) {
      this.searchFile(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchFile(1);
    },
    searchFile(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.searchParam.sortList = this.sortList;
      this.$api.framework.file.searchFile(this.searchParam).then(res => {
        this.fileData = res.Return;
      });
    },
    openFileTypeRuleDialog() {
      this.isShowFileTypeRuleDialog = true;
      this.searchFileTypeRule();
    },
    closeFileTypeRuleDialog() {
      this.isShowFileTypeRuleDialog = false;
    },
    openAddFileTypeRuleDialog() {
      this.setFileTypeRuleNameFormItem('select');
      this.resetFileTypeRuleForm();
      this.isEditFileTypeRule = false;
      this.isShowAddFileTypeRuleDialog = true;
    },
    closeAddFileTypeRuleDialog() {
      this.isShowAddFileTypeRuleDialog = false;
    },
    resetFileTypeRuleForm() {
      this.fileTypeRuleTypeText = '';
      this.fileTypeRuleFormValue = {
        name: '',
        whiteList: '',
        blackList: '',
        maxSize: null
      };
    },
    operateFileTypeRule(action, row) {
      if (action === 'edit') {
        this.openEditFileTypeRuleDialog(row);
      } else if (action === 'delete') {
        this.deleteFileTypeRule(row);
      }
    },
    openEditFileTypeRuleDialog(row) {
      this.isEditFileTypeRule = true;
      this.fileTypeRuleTypeText = row.displayName || row.name;
      this.setFileTypeRuleNameFormItem('slot');
      this.fileTypeRuleFormValue = {
        name: row.name,
        whiteList: this.getListText(row.whiteList),
        blackList: this.getListText(row.blackList),
        maxSize: row.maxSize || null
      };
      this.isShowAddFileTypeRuleDialog = true;
    },
    setFileTypeRuleNameFormItem(type, value) {
      const nameFormItem = this.fileTypeRuleFormConfig[0];
      nameFormItem.type = type;
      nameFormItem.value = value || null;
      nameFormItem.disabled = false;
    },
    searchFileTypeRule() {
      this.$api.framework.file.searchFileTypeConfig().then(res => {
        this.fileTypeRuleData = {
          tbodyList: res.Return || []
        };
      });
    },
    saveFileTypeRule() {
      if (!this.$refs.fileTypeRuleForm.valid()) {
        return false;
      }
      const config = {};
      const whiteList = this.getExtList(this.fileTypeRuleFormValue.whiteList);
      if (whiteList.length > 0) {
        config.whiteList = whiteList;
      }
      const blackList = this.getExtList(this.fileTypeRuleFormValue.blackList);
      if (blackList.length > 0) {
        config.blackList = blackList;
      }
      if (!this.$utils.isEmpty(this.fileTypeRuleFormValue.maxSize) && Number(this.fileTypeRuleFormValue.maxSize) > 0) {
        config.maxSize = Number(this.fileTypeRuleFormValue.maxSize);
      }
      this.$api.framework.file.saveFileTypeConfig({
        name: this.fileTypeRuleFormValue.name,
        config: config
      }).then(() => {
        this.$Message.success(this.$t('message.savesuccess'));
        this.isShowAddFileTypeRuleDialog = false;
        this.searchFileTypeRule();
      });
    },
    deleteFileTypeRule(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: row.displayName || row.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.file.deleteFileTypeConfig({ name: row.name }).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchFileTypeRule();
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    getExtList(value) {
      if (this.$utils.isEmpty(value)) {
        return [];
      }
      // 与 UploadFileApi 的扩展名比对保持一致：只保存小写扩展名，不保留前导点和空项。
      return Array.from(new Set(value.split(/[\n,，]/).map(item => item.trim().replace(/^\./, '').toLowerCase()).filter(item => !!item)));
    },
    formatList(list) {
      return list && list.length > 0 ? list.join(', ') : '-';
    },
    getListText(list) {
      return list && list.length > 0 ? list.join(', ') : '';
    }
  },
  filter: {},
  computed: {
    sortOrder() {
      //把{"attr_xxx":"DESC","attr_yyy":"AEC"}转换成[{"attr_xxx":"DESC"},{"attr_yyy":"ASC"}]
      const returnList = [];
      if (!this.$utils.isEmpty(this.sortConfig)) {
        for (let k in this.sortConfig) {
          const obj = {};
          obj[k] = this.sortConfig[k];
          returnList.push(obj);
        }
      }
      return returnList;
    },
    //转换成后端需要的数据结构，把{"attr_xxx":"DESC","attr_yyy":"AEC"}转换成[{key:"attr_xxx",type:"DESC"},{key:"attr_yyy",type:"ASC"}]
    sortList() {
      const returnList = [];
      if (!this.$utils.isEmpty(this.sortConfig)) {
        for (let k in this.sortConfig) {
          const obj = {};
          obj['key'] = k;
          obj['type'] = this.sortConfig[k];
          returnList.push(obj);
        }
      }
      return returnList;
    },
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    },
    fileTypeRuleDialogTitle() {
      return this.isEditFileTypeRule
        ? this.$t('dialog.title.edittarget', { target: this.$t('term.framework.filetyperule') })
        : this.$t('dialog.title.addtarget', { target: this.$t('term.framework.filetyperule') });
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
