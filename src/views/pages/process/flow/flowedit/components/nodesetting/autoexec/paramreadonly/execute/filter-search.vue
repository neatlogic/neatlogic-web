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
    <CombineSearcher
      v-model="searchVal"
      class="search"
      v-bind="searchConfig"
      :disabledList="disabledList"
      :clearable="!disabledList.length"
      :isRequired="isRequired"
      :readonly="readonly"
      :showSearchNumber="1"
      @change="changeValue()"
    ></CombineSearcher>
  </div>
</template>
<script>
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';
export default {
  name: '',
  components: {
    CombineSearcher
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
    }
  },
  data() {
    return {
      searchVal: {},
      searchConfig: {
        labelWidth: 100,
        // placeholder: '请输入节点ip、端口、名称',
        search: true,
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
                    this.changeValue();
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
            label: this.$t('term.inspect.connectionagreement'),
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getProtocolDataList,
            multiple: true,
            search: true,
            clearable: true,
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
            params: {needPage: false},
            rootName: 'tbodyList',
            textName: 'description',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          }
        ]
      },
      disabledList: [] //不可更改的搜索条件
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
      }
    },
    changeValue() {
      this.$emit('changeValue', this.searchVal);
    },
    dealDataByUrl(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];
      nodeList.forEach(v => {
        let text = '';
        if (v.port) {
          text = v.name + '(' + v.port + ')';
        } else {
          text = v.name;
        }
        columlist.push({ text: text, value: v.id });
      });
      return columlist;
    }
  },
  computed: {},
  watch: {
    defaultValue: {
      handler(val) {
        val && (this.searchVal = this.$utils.deepClone(val));
      },
      deep: true,
      immediate: true
    },
    defaultSearchValue: {
      handler(val) {
        val && this.init();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
