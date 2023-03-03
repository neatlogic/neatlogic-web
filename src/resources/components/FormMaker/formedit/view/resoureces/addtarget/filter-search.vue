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
        searchList: [
          {
            type: 'tree',
            name: 'typeIdList',
            label: '模型类型',
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
            label: '应用',
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
            label: '模块',
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
            label: '环境',
            multiple: true,
            url: '/api/rest/resourcecenter/appenv/list/forselect',
            params: {needPage: false},
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true,
            className: 'block-span'
          },
          {
            type: 'select',
            name: 'protocolIdList',
            label: '连接协议',
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
            name: 'tagIdList',
            label: '标签',
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
            label: '状态',
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
