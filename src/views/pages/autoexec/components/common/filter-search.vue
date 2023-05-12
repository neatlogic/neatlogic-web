/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <CombineSearcher
      v-if="!loadingShow && isSimpleMode"
      ref="combineSearcher"
      v-model="searchVal"
      searchMode="clickBtnSearch"
      class="search"
      v-bind="searchConfig"
      :disabledList="disabledList"
      :clearable="!disabledList.length"
      :isRequired="isRequired"
      :readonly="readonly"
      :showSearchNumber="showSearchNumber"
      @confirm="simpleModeSearch"
    >
      <template slot="action">
        <div style="position:relative;">
          <span
            v-if="!defaultSearchValue"
            class="tsfont-left cursor text-action"
            style="position: absolute;left: 10px;top:9px;"
            @click.stop="switchComplexMode"
          >{{ $t('page.advancedmode') }}</span>
          <div class="action-group">
            <div class="action-item">
              <Button @click="closeCombineSearch">{{ $t('page.cancel') }}</Button>
            </div>
            <div class="action-item">
              <Button type="primary" @click="searchCombineSearcher">{{ $t('page.search') }}</Button>
            </div>
          </div>
        </div>
      </template>
    </CombineSearcher>
    <ComplexSearch
      v-show="!isSimpleMode"
      ref="complexSearch"
      v-model="complexSearchVal"
      :readonly="readonly"
      :disabledUuidList="disabledUuidList"
      :disabledGroupUuidList="disabledGroupUuidList"
      @search="complexModeSearch"
      @click="switchToSimpleMode"
      @clickMoreBtn="() => $emit('clickMoreBtn')"
    >
    </ComplexSearch>
  </div>
</template>
<script>
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';
export default {
  name: '',
  components: {
    CombineSearcher,
    ComplexSearch: resolve => require(['./complex-search'], resolve)
  },
  filters: {
  },
  props: {
    defaultValue: {//搜索条件
      type: Object,
      default: null
    },
    defaultSearchValue: { //默认搜索条件，不可改变
      type: Object,
      default: null
    },
    isRequired: { //必填校验
      type: Boolean,
      default: false
    },
    readonly: { //只读
      type: Boolean,
      default: false
    },
    showSearchNumber: Number
  },
  data() {
    return {
      isSimpleMode: true, // 默认简单模式
      loadingShow: false,
      searchVal: {},
      complexSearchVal: {}, // 复杂模式搜索值
      searchConfig: {
        labelWidth: 100,
        search: true,
        keywordText: this.$t('page.keyword'),
        searchList: [
          {
            type: 'tree',
            name: 'typeIdList',
            label: this.$t('term.cmdb.citype'),
            multiple: true,
            url: '/api/rest/resourcecenter/resourcetype/tree',
            textName: 'label',
            valueName: 'id',
            search: true,
            transfer: true
          },
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
            onChange: (val) => {
              let appSystemIdList = [];
              appSystemIdList = this.searchConfig.searchList.filter((item) => {
                return item.name == 'appModuleIdList';
              });
              if (!this.$utils.isEmpty(appSystemIdList)) {
                appSystemIdList[0].params.appSystemIdList = val;
              }
              if (val) {
                this.$nextTick(() => {
                  if (this.searchVal && this.searchVal.appModuleIdList) {
                    this.$delete(this.searchVal, 'appModuleIdList');
                    this.simpleModeSearch(this.searchVal);
                  }
                });
              }
            }
          },
          {
            type: 'select',
            name: 'appModuleIdList',
            label: this.$t('page.module'),
            multiple: true,
            dynamicUrl: '/api/rest/resourcecenter/appmodule/list',
            params: {appSystemIdList: null},
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            search: true,
            transfer: true
          },
          {
            type: 'checkbox',
            name: 'envIdList',
            label: this.$t('page.environment'),
            multiple: true,
            url: '/api/rest/resourcecenter/appenv/list/forselect',
            params: { needPage: false},
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          },
          {
            type: 'select',
            name: 'protocolIdList',
            label: this.$t('page.protocol'),
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getProtocolDataList,
            multiple: true,
            transfer: true
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
            transfer: true
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
            transfer: true
          },
          {
            type: 'checkbox',
            name: 'stateIdList',
            label: this.$t('page.status'),
            multiple: true,
            url: '/api/rest/resourcecenter/state/list/forselect',
            params: { needPage: false},
            rootName: 'tbodyList',
            textName: 'description',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          }
        ]
      },
      disabledList: [], //不可更改的搜索条件
      disabledUuidList: [], // 复杂模式，禁用的搜索条件
      disabledGroupUuidList: []
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
    init() {
      this.disabledList = [];
      if (this.defaultSearchValue) {
        this.searchConfig.searchList.forEach(item => {
          if (this.defaultSearchValue[item.name]) {
            this.$set(item, 'disabled', true);
            this.disabledList.push(item.name);
          } else {
            this.$set(item, 'disabled', false);
          }
        });
        // 组合工具设置的默认值不可删除，关键词字段需要单独处理
        if (this.defaultSearchValue.hasOwnProperty('keyword') && this.defaultSearchValue.keyword) {
          this.disabledList.push('keyword');
          this.searchConfig.search = false;
        }
        Object.assign(this.searchVal, this.defaultSearchValue);
      }
    },
    complexInit() {
      // 复杂模式设置从组合工具带过来的条件，禁用问题
      this.complexSearchVal = {};
      this.disabledUuidList = [];
      this.disabledGroupUuidList = [];
      if (this.defaultSearchValue && this.defaultSearchValue.conditionGroupList && !this.$utils.isEmpty(this.defaultSearchValue.conditionGroupList)) {
        this.defaultSearchValue.conditionGroupList.forEach((item) => {
          if (item && item.uuid) {
            this.disabledGroupUuidList.push(item.uuid);
          }
          if (item && item.conditionList && !this.$utils.isEmpty(item.conditionList)) {
            item.conditionList.forEach((v) => {
              if (v && v.uuid) {
                this.disabledUuidList.push(v.uuid);
              }
            });
          }
        });
        // 组合工具设置的默认值不可删除，需要单独处理
        if (this.defaultSearchValue.hasOwnProperty('keyword') && this.defaultSearchValue.keyword) {
          this.disabledUuidList.push('keyword');
        }
      }
      this.complexSearchVal = (this.defaultValue && !this.$utils.isEmptyObj(this.defaultValue)) ? this.defaultValue : this.defaultSearchValue;
    },
    switchComplexMode() {
      // 切换到复杂模式
      this.isSimpleMode = !this.isSimpleMode;
      this.$refs.complexSearch && this.$refs.complexSearch.openDropdown();
    },
    switchToSimpleMode() {
      // 切换到简单模式
      this.isSimpleMode = !this.isSimpleMode;
      this.$refs.complexSearch && this.$refs.complexSearch.openDropdown(); // 切换到简单模式，把高级模式关闭
      this.$nextTick(() => {
        this.$refs.combineSearcher && this.$refs.combineSearcher.handleToggleOpen(); // 打开简单模式面板
      });
    },
    simpleModeSearch(searchVal) {
      // 简单模式搜索
      this.$emit('changeValue', searchVal);
    },
    closeCombineSearch() {
      if (this.$refs && this.$refs.combineSearcher) {
        this.$refs.combineSearcher.handleToggleOpen(); // 关闭面板
      }
    },
    searchCombineSearcher() {
      if (this.$refs.combineSearcher) {
        this.$refs.combineSearcher.refreshTextConfig();
        this.$refs.combineSearcher.handleToggleOpen(); // 关闭面板
      }
      this.complexSearchVal = {}; // 清空复杂模式值
      this.simpleModeSearch(this.searchVal);
    },
    complexModeSearch(searchVal) {
      this.searchVal = {}; // 清空简单模式的值
      this.$emit('complexModeSearch', searchVal);
    }
  },
  computed: {},
  watch: {
    defaultValue: {
      handler(val) {
        this.isSimpleMode = true; // 重置简单模式，防止编辑执行目标时，模式回显不正确问题
        if (val) {
          if (val && val.hasOwnProperty('conditionGroupList')) {
            this.complexSearchVal = this.$utils.deepClone(val);
            this.isSimpleMode = !this.isSimpleMode;
          } else {
            this.searchVal = this.$utils.deepClone(val);
          }
        }
      },
      deep: true,
      immediate: true
    },
    defaultSearchValue: {
      handler(val) {
        if (val) {
          if (val && val.hasOwnProperty('conditionGroupList')) {
            this.isSimpleMode = true;
            this.isSimpleMode = !this.isSimpleMode;
            this.complexInit(); // 复杂模式设置禁用值
          } else {
            this.init();
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
