<template>
  <div class="searcher-container">
    <div ref="searchContainer" class="text-right">
      <div class="radius-sm bg-op border-color searcher-inputer">
        <Dropdown
          trigger="custom"
          :visible="isShowDropdown"
          placement="bottom-start"
          style="max-width: 91%;"
        >
          <span class="tsfont-search text-action pl-sm" @click="enterKeword"></span>
          <div style="overflow: scroll;max-width: 100%;display: flex;">
            <div v-if="isShowDelTag()" class="pl-sm">
              <span v-for="item in searchConditionList" :key="item.uuid">
                <Tag
                  v-if="item.text"
                  :key="item.uuid"
                  style="margin-top: 0px;"
                  :closable="isShowDropdown ? false : true"
                  @on-close="delCondition(item)"
                >{{ item.label }}：{{ item.text }}</Tag>
              </span>
            </div>
            <div>
              <TsFormInput
                v-model="keyword"
                border="none"
                :placeholder="$t('term.inspect.inputargetnameip')"
                width="250px"
                @on-enter="enterKeword"
              ></TsFormInput>
            </div>
          </div>
          <DropdownMenu slot="list">
            <div v-if="isShowDropdown">
              <div class="dropdown-box pl-nm pr-nm">
                <TsForm
                  v-model="formValue"
                  labelPosition="top"
                  :item-list="formItemList"
                >
                  <template slot="batchSearchList">
                    <div>
                      <TsFormItem :label="$t('page.batchsearch')" labelPosition="left">
                        <TsFormRadio
                          v-model="formValue.searchField"
                          :dataList="searchFieldRadioDataList"
                        ></TsFormRadio>
                      </TsFormItem>
                      <TsFormItem :label="$t('page.batchsearchvalue')" labelWidth="0px" labelPosition="left">
                        <TsFormInput
                          v-model="formValue.searchValue"
                          type="textarea"
                          :placeholder="'192.168.0.1\n192.168.0.2\n192.168.0.3'"
                          :autoSize="{minRows: 4}"
                          @change="changeSearchValue"
                        >
                        </TsFormInput>
                      </TsFormItem>
                    </div>
                  </template>
                </TsForm>
              </div>
              <TsRow class="text-right bg-op">
                <Col span="24">
                  <div class="pt-nm pl-nm pr-nm mb-sm">
                    <div class="action-group">
                      <div class="action-item">
                        <Button @click="isShowDropdown = false">{{ $t('page.cancel') }}</Button>
                      </div>
                      <div class="action-item">
                        <Button
                          ghost
                          type="primary"
                          @click="saveCategory"
                        >{{ $t('page.saveasnewcategory') }}</Button>
                      </div>
                      <div v-if="id" class="action-item">
                        <!-- 编辑时才出现 -->
                        <Button
                          ghost
                          type="primary"
                          @click="updateNewClass"
                        >{{ $t('page.save') }}</Button>
                      </div>
                      <div class="action-item">
                        <Button type="primary" @click="searchNewClass">{{ $t('page.search') }}</Button>
                      </div>
                    </div>
                  </div>
                </Col>
              </TsRow>
            </div>
          </DropdownMenu>
        </Dropdown>
      </div>
      <span v-if="isShowDelTag()" class="btn-remove tsfont-close-o" @click="delAllTag"></span>
      <span class="btn-filter tsfont-filter" @click="openDropdown"></span>
    </div>
    <CategoryEditDialog
      v-if="isShowCategoryEditDialog"
      @save="saveCategoryMenu"
      @close="closeCategoryEditDialog"
    ></CategoryEditDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    CategoryEditDialog: () => import('./category-edit-dialog')
  },
  props: {
    value: {
      type: Object,
      default: function() {
        return {};
      }
    },
    treeId: {
      // 左侧资产树Id
      type: Number,
      default: null
    },
    id: {
      // 新分类id
      type: Number,
      default: null
    },
    conditionList: { type: Array, default: () => [] }
  },
  data() {
    return {
      keyword: '',
      searchFieldRadioDataList: [
        {
          value: 'ip',
          text: this.$t('page.ip')
        },
        {
          value: 'name',
          text: this.$t('page.name')
        }
      ],
      formValue: {...this.value},
      conditionConfig: {},
      isShowDropdown: false,
      isShowCategoryEditDialog: false,
      searchWidth: 0,
      searchText: {},
      searchConditionList: [], // 搜索条件列表
      formItemList: [
        {
          type: 'select',
          name: 'appSystemIdList',
          label: this.$t('page.apply'),
          multiple: true,
          value: null,
          dynamicUrl: '/api/rest/resourcecenter/appsystem/list/forselect',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          search: true,
          transfer: true,
          onChange: (val, valList) => {
            let appSystemIdList = [];
            appSystemIdList = this.formItemList.filter(item => {
              return item.name == 'appModuleIdList';
            });
            if (!this.$utils.isEmpty(appSystemIdList)) {
              appSystemIdList[0].params.appSystemIdList = val;
            }
            if (val) {
              this.$nextTick(() => {
                if (this.searchVal && this.searchVal.appModuleIdList) {
                  this.$delete(this.searchVal, 'appModuleIdList');
                  this.getTableData(1);
                }
              });
            }
            this.getSearchText('appSystemIdList', valList);
          }
        },
        {
          type: 'select',
          name: 'appModuleIdList',
          label: this.$t('page.module'),
          multiple: true,
          dynamicUrl: '/api/rest/resourcecenter/appmodule/list',
          params: { appSystemIdList: null },
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          search: true,
          transfer: true,
          onChange: (val, valList) => {
            this.getSearchText('appModuleIdList', valList);
          }
        },
        {
          type: 'checkbox',
          name: 'envIdList',
          label: this.$t('page.environment'),
          multiple: true,
          url: '/api/rest/resourcecenter/appenv/list/forselect',
          params: { needPage: false },
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          transfer: true,
          className: 'block-span',
          onChange: (val, valList) => {
            this.getSearchText('envIdList', valList, 'name');
          }
        },
        {
          type: 'checkbox',
          name: 'inspectStatusList',
          label: this.$t('term.autoexec.inspectstatus'),
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'InspectStatus' },
          dealDataByUrl: (nodeList) => this.dealInspectStatusDataByUrl(nodeList),
          multiple: true,
          className: 'block-span',
          onChange: (val, valList) => {
            this.getSearchText('inspectStatusList', valList);
          }
        },
        {
          type: 'slot',
          label: this.$t('page.batchsearch'),
          labelWidth: '0px',
          labelPosition: 'left',
          name: 'batchSearchList'
        },
        {
          type: 'select',
          name: 'vendorIdList',
          label: this.$t('page.manufacturer'),
          multiple: true,
          url: '/api/rest/resourcecenter/vendor/list/forselect',
          params: { needPage: false },
          rootName: 'tbodyList',
          textName: 'description',
          valueName: 'id',
          search: true,
          transfer: true,
          onChange: (val, valList) => {
            this.getSearchText('vendorIdList', valList, 'description');
          }
        },
        {
          type: 'select',
          name: 'tagIdList',
          label: this.$t('page.tag'),
          multiple: true,
          dynamicUrl: '/api/rest/resourcecenter/tag/list/forselect',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          search: true,
          transfer: true,
          onChange: (val, valList) => {
            this.getSearchText('tagIdList', valList);
          }
        },
        {
          type: 'select',
          name: 'protocolIdList',
          label: this.$t('page.protocol'),
          multiple: true,
          dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getProtocolDataList,
          transfer: true,
          className: 'block-span',
          onChange: (val, valList) => {
            this.getSearchText('protocolIdList', valList);
          }
        },
        {
          type: 'checkbox',
          name: 'inspectJobPhaseNodeStatusList',
          label: this.$t('page.jobstatus'),
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'JobNodeStatus' },
          multiple: true,
          className: 'block-span',
          onChange: (val, valList) => {
            this.getSearchText('inspectJobPhaseNodeStatusList', valList);
          }
        },
        {
          type: 'checkbox',
          name: 'stateIdList',
          label: this.$t('term.autoexec.assetstatus'),
          multiple: true,
          url: '/api/rest/resourcecenter/state/list/forselect',
          params: { needPage: false },
          rootName: 'tbodyList',
          textName: 'description',
          valueName: 'id',
          transfer: true,
          className: 'block-span',
          onChange: (val, valList) => {
            this.getSearchText('stateIdList', valList, 'description');
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.defaultInitData();
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
    enterKeword() {
      // 回车搜素
      let keyword = this.$utils.deepClone(this.keyword);
      if (this.keyword) {
        let hasKeyword = this.searchConditionList.filter((item) => item.name == 'keyword');
        if (this.$utils.isEmpty(hasKeyword)) {
          // 无关键字搜索条件时
          this.searchConditionList.push({
            uuid: this.$utils.setUuid(),
            name: 'keyword',
            label: this.$t('page.keyword'),
            text: keyword
          });
          this.keyword = '';
        } else {
          this.searchConditionList && this.searchConditionList.forEach((item) => {
            if (item && item.name && item.name == 'keyword') {
              this.$set(item, 'text', keyword);
              this.keyword = '';
            }
          });
        }
      } else {
        this.searchConditionList && this.searchConditionList.forEach((item, index) => {
          if (item && item.name && item.name == 'keyword') {
            this.keyword = '';
            this.searchConditionList.splice(index, 1);
          }
        });
      }
      this.$emit('search', {keyword: keyword, ...this.formValue}); // 回车搜素，但是关键字不作为搜素的条件
    },
    isShowDelTag() {
      // 根据搜索条件判断，是否显示删除的按钮
      let isShowDelTag = false;
      for (let i = 0; i < this.searchConditionList.length; i++) {
        if (this.searchConditionList[i] && this.searchConditionList[i].text) {
          isShowDelTag = true;
          break;
        }
      }
      return isShowDelTag;
    },
    defaultInitData() {
      // 设置默认初始化内容
      this.searchConditionList = [];
      this.formItemList && this.formItemList instanceof Array && this.formItemList.forEach((item) => {
        if (item.name) {
          this.searchConditionList.push({
            uuid: this.$utils.setUuid(),
            name: item.name,
            label: item.label,
            text: ''
          });
        }
      });
      // 关键字搜素
      this.searchConditionList.push({
        uuid: this.$utils.setUuid(),
        name: 'keyword',
        label: this.$t('page.keyword'),
        text: ''
      });
      if (this.id) {
        this.searchConditionList && this.searchConditionList.forEach((item) => {
          let text = this.getText(item.name);
          if (text) {
            this.$set(item, 'text', text);
          }
        });
        // 编辑时，需要回填数据
        this.conditionList && this.conditionList.forEach((item) => {
          if (item.name && item.text) {
            this.$set(this.searchText, [item.name], item.text);
          }
        });
      }
    },
    openDropdown() {
      this.isShowDropdown = true;
    },
    dealInspectStatusDataByUrl(nodeList) {
      // 处理巡检状态下拉列表数据
      let dataList = [];
      if (nodeList && nodeList.length > 0) {
        dataList = nodeList.filter(val => {
          return val && val.value != 'normal'; // 过滤非正常状态
        });
      }
      return dataList;
    },
    updateNewClass() {
      // 保存新分类
      let conditionList = this.$utils.deepClone(this.searchConditionList) || [];
      conditionList && conditionList.forEach((item) => {
        if (item && item.name && this.formValue && this.formValue.hasOwnProperty(item.name)) {
          this.$set(item, 'value', this.formValue[item.name]);
        }
        if (item && item.name && this.searchText.hasOwnProperty(item.name)) {
          this.$set(item, 'text', this.searchText[item.name]);
        }
      });
      conditionList = conditionList && conditionList.filter((item) => {
        // 过滤有值的参数
        return item.text;
      });
      let params = {
        id: this.id,
        conditionConfig: {
          treeId: this.treeId,
          searchField: this.formValue.searchField,
          searchValue: this.formValue.searchValue,
          conditionList: conditionList
        }
      };
      this.$api.inspect.assetsInspect.updateNewClassificationCondition(params).then(res => {
        if (res.Status == 'OK') {
          this.searchConditionList && this.searchConditionList.forEach((item) => {
            if (item && item.name && this.searchText.hasOwnProperty(item.name)) {
              this.$set(item, 'text', this.searchText[item.name]);
            }
          });
          this.isShowDropdown = false;
          this.$Message.success(this.$t('message.savesuccess'));
          this.emitFunction();
        }
      });
    },
    searchNewClass() {
      // 搜索
      this.searchConditionList && this.searchConditionList.forEach((item) => {
        if (item && item.name) {
          if (this.searchText.hasOwnProperty(item.name)) {
            this.$set(item, 'text', this.searchText[item.name]);
          } else {
            this.$set(item, 'text', '');
          }
        }
      });
      this.emitFunction();
      this.isShowDropdown = false;
    },
    saveCategory() {
      // 另存为新分类
      let conditionList = this.$utils.deepClone(this.searchConditionList) || [];
      conditionList && conditionList.forEach((item) => {
        if (item && item.name && this.formValue && this.formValue.hasOwnProperty(item.name)) {
          this.$set(item, 'value', this.formValue[item.name]);
        }
        if (item && item.name && this.searchText.hasOwnProperty(item.name)) {
          this.$set(item, 'text', this.searchText[item.name]);
        }
      });
      conditionList = conditionList && conditionList.filter((item) => {
        // 过滤有值的参数
        return item.text;
      });
      this.conditionConfig = {
        treeId: this.treeId,
        searchField: this.formValue.searchField,
        searchValue: this.formValue.searchValue,
        conditionList: conditionList
      };
      this.isShowCategoryEditDialog = true;
    },
    closeCategoryEditDialog() {
      this.conditionConfig = {};
      this.isShowCategoryEditDialog = false;
    },
    saveCategoryMenu(newClassData) {
      // 保存新分类，成功后跳转到新分类
      this.$api.inspect.assetsInspect.saveProblemClassification({conditionConfig: this.conditionConfig, ...newClassData}).then(res => {
        if (res.Status == 'OK') {
          let id = res.Return;
          this.$router.push({path: '/recent-issues-' + id});
          // 刷新左侧菜单
          this.$store.dispatch('leftMenu/getRecentIssuesMenuData');
        }
      });
    },
    delCondition(delValue) {
      if (delValue) {
        this.searchConditionList && this.searchConditionList.forEach((item, index) => {
          if (item && (item.uuid == delValue.uuid)) {
            // this.searchConditionList.splice(index, 1);
            item.text = '';
            if (this.formValue && this.formValue.hasOwnProperty(item.name)) {
              delete this.formValue[item.name];
              this.emitFunction();
            }
          }
        });
        if (delValue.name === 'batchSearchList') {
          this.formValue.searchValue = '';
        }
      }
    },
    delAllTag() {
      // 删除选择的所有标签
      this.searchConditionList && this.searchConditionList.forEach((item) => {
        if (item.name && item.text) {
          this.$set(item, 'text', '');
        }
      });
      var oldSearchField = this.formValue.searchField;
      this.formValue = {
        searchField: oldSearchField
      };
      this.searchText = {};
      this.emitFunction();
    },
    emitFunction() {
      this.$emit('search', this.formValue); // 点击搜索时，进行搜索
    },
    getSearchText(name, val, textName = 'text') {
      // 拿到搜索的text
      let text = '';
      if (val && val instanceof Array) {
        val.forEach((item) => {
          if (text) {
            text += '、';
          }
          text += item[textName];
        });
      } else if (val && (typeof val == Object)) {
        text = val[textName] || '';
      } else {
        text = val;
      }
      this.$set(this.searchText, [name], text);
    },
    getText(name) {
      let text = '';
      let textValue = this.conditionList && this.conditionList.find(item => item.name == name);
      if (textValue) {
        text = textValue.text;
      }
      return text;
    },
    changeSearchValue(val) {
      if (val.length > 0) {
        var batchSearchValue = val.split('\n');
        this.$set(this.formValue, 'batchSearchList', batchSearchValue);
        this.getSearchText('batchSearchList', batchSearchValue.join('、'));
      } else {
        this.$delete(this.formValue, 'batchSearchList');
        this.$delete(this.searchText, 'batchSearchList');
      }
    }

  },
  filter: {},
  computed: {},
  watch: {
    conditionList: {
      handler(val) {
        this.defaultInitData();
      },
      deep: true
    },
    value: {
      handler(val) {
        this.formValue = val || {};
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.searcher-container {
  position: relative;
  .searcher-inputer {
    display: inline-block;
    width: 100%;
    height: 34px;
    line-height: 30px;
    border-width: 1px;
    border-style: solid;
    text-align: left;
  }
  .btn-remove {
    position: absolute;
    top: 0px;
    right: 30px;
    cursor: pointer;
  }
  .btn-filter {
    position: absolute;
    top: 0px;
    right: 10px;
    cursor: pointer;
  }
.dropdown-box {
  max-height: 450px;
  overflow-y:scroll;
  overflow-x: hidden;
  white-space: pre-wrap;
}
.ivu-dropdown {
  /deep/ .ivu-dropdown-rel {
    display: flex;
  }
  /deep/ .ivu-select-dropdown {
    width: 100%;
  }
 }
}

</style>
