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
  <TsDialog
    type="slider"
    :isShow="visible"
    width="medium"
    :title="$t('dialog.title.addtarget', {target: $t('term.autoexec.executetarget')})"
    @on-close="close"
  >
    <div class="top input-border">
      <FilterSearch
        style="width:50%;display: inline-block;"
        @changeValue="changeValue"
      ></FilterSearch>
    </div>
    <TsTable
      ref="table"
      v-model="selectList"
      v-bind="tableData"
      selectedRemain
      keyName="id"
      multiple
      :fixedHeader="false"
      @getSelected="getSelected"
      @changeCurrent="getDataList('currentPage',...arguments)"
      @changePageSize="getDataList('pageSize',...arguments)"
    >
      <template v-slot:appModuleName="{row}">
        <span v-if="row.appModuleName || row.appModuleAbbrName">
          <span v-if="row.appModuleName">{{ row.appModuleName }}</span>
          <span v-if="row.appModuleAbbrName" class="text-tip">({{ row.appModuleAbbrName }})</span>
        </span>
        <span v-else>-</span>
      </template>
      <template v-slot:appSystemName="{row}">
        <span v-if="row.appSystemName || row.appSystemAbbrName">
          <span v-if="row.appSystemName">{{ row.appSystemName }}</span>
          <span v-if="row.appSystemAbbrName" class="text-tip">({{ row.appSystemAbbrName }})</span>
        </span>
        <span v-else>-</span>
      </template>
    </TsTable>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button
        v-if="isValid"
        type="primary"
        ghost
        @click="validSetting()"
      >{{ $t('page.validate') }}</Button>
      <Button type="primary" @click="onOk()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import FilterSearch from '@/views/pages/autoexec/components/common/filter-search.vue';
export default {
  name: '',
  components: {
    FilterSearch,
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  filtes: {},
  props: {
    visible: {//是否显示
      type: Boolean,
      default: false
    },
    value: Array, //已经勾选的数据
    nodeList: Array,
    isValid: { //是否需要校验节点
      type: Boolean,
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      searchVal: {},
      theadList: [
        {key: 'selection'},
        { title: 'ip', key: 'ip'},
        { title: this.$t('page.port'), key: 'port'},
        { title: this.$t('page.name'), key: 'name'},
        { title: this.$t('page.tag'), key: 'tagList', type: 'tag'},
        { title: this.$t('page.environment'), key: 'envName'},
        { title: this.$t('term.cmdb.citype'), key: 'typeLabel'},
        { title: this.$t('page.module'), key: 'appModuleName'},
        { title: this.$t('page.apply'), key: 'appSystemName'},
        { title: this.$t('term.autoexec.assetstatus'), key: 'stateName'},
        { title: this.$t('page.networkarea'), key: 'networkArea'},
        { title: this.$t('term.autoexec.subordinatedepartment'), key: 'bgList', type: 'usercards'},
        { title: this.$t('page.owner'), key: 'ownerList', type: 'usercards'},
        { title: this.$t('term.autoexec.maintenanceperiod'), key: 'maintenanceWindow'},
        { title: this.$t('page.description'), key: 'description'}
      ],
      tableData: null,
      selectList: [],
      selectNodeList: _this.$utils.deepClone(_this.nodeList),
      currentPage: 1,
      pageSize: 20
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchNodeList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchNodeList(param) {
      let data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize
      };
      if (param) {
        Object.assign(data, param);
      }
      this.$api.process.process.getResourceList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.$set(this.tableData, 'theadList', this.theadList);
        }
      });
    },
    onOk() {
      let list = this.selectNodeList.map(item => {
        let keyList = ['id', 'ip', 'port', 'name'];
        let config = {};
        keyList.forEach(key => (config[key] = item[key]));
        return config;
      });
      this.$emit('on-ok', list);
    },
    close() {
      this.$emit('close');
    },
    getDataList(type, value) {
      type == 'pageSize' && (this.pageSize = value);
      let param = {
        currentPage: type == 'currentPage' ? value : this.currentPage,
        pageSize: type == 'pageSize' ? value : this.pageSize
      };
      param = Object.assign(param, this.searchVal);
      this.searchNodeList(param);
    },
    getSelected(indexList, itemList) {
      this.selectNodeList.push(...itemList);
      let selectNodeList = [];
      if (indexList && indexList.length > 0) {
        indexList.forEach(i => {
          let findItem = this.selectNodeList.find(n => n.id == i);
          if (findItem) {
            selectNodeList.push(findItem);
          }
        });
      }
      this.selectNodeList = selectNodeList;
      // this.$emit('getSelected', ...arguments);
    },
    changeValue(val) {
      this.searchVal = this.$utils.deepClone(val);
      this.getDataList('currentPage', 1);
    },
    validSetting(type) { //true不需要提示校验信息
      let list = this.selectNodeList.map(item => {
        let keyList = ['id', 'ip', 'port', 'name'];
        let config = {};
        keyList.forEach(key => (config[key] = item[key]));
        return config;
      });
      this.$emit('validSetting', list);
    }

  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        this.selectList = val;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.top{
  padding-bottom: 16px;
  text-align: right;
}
</style>

