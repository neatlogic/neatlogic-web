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
    <div class="formsetting-block">
      <label class="formsetting-label text-grey require-label label-switch">集成
        <span class="label-right">
          <i
            v-if="setting.integrationUuid"
            class="tsfont-edit text-tip-active"
            title="编辑选择集成"
            @click="addDataSource(setting.integrationUuid)"
          ></i>
          <i class="ts-refresh text-tip-active" title="刷新数据源" @click="getIntegrationUuidList()"></i>
        </span>
      </label>
      <div class="formsetting-text">
        <TsFormSelect
          ref="integrationUuid"
          v-model="setting.integrationUuid"
          v-bind="integrationConfig"
          :dataList="integrationUuidList"
          @on-change="changeIntegration()"
        >
          <template v-slot:first-ul>
            <li class="tsfont-plus text-href first-slot" @click="addDataSource()">数据源</li>
          </template>
        </TsFormSelect>
      </div>
    </div>
    <div v-if="setting.mode=='normal'" class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        分页
        <i-switch v-model="setting.needPage" class="label-right" @on-change="changeNeedPage" />
      </label>
    </div>
    <div v-if="setting.dataConfig && setting.dataConfig.length > 0 && (setting.mode=='dialog' || (setting.needPage && setting.mode=='normal'))" class="formsetting-block">
      <label class="formsetting-label text-grey require-label">每页显示条数</label>
      <div class="formsetting-text ">
        <TsFormInput
          ref="pageSize"
          v-model="setting.pageSize"
          type="number"
          :validateList="validJson"
        ></TsFormInput>
      </div>
    </div>
    <div v-if="setting.integrationUuid" class="formsetting-block">
      <label class="formsetting-label text-grey">过滤条件</label>
      <div class="formsetting-text bg-block">
        <DataFilter
          v-model="setting.sourceColumnList"
          :dataList="setting.dataConfig"
          :integrationUuid="setting.integrationUuid"
        ></DataFilter>
      </div>
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import DataFilter from './dataFilter.vue';
export default {
  name: '',
  components: {
    TsFormSelect,
    TsFormInput,
    DataFilter
  },
  filters: {
  },
  props: {
    setting: Object
  },
  data() {
    return {
      integrationUuidList: [],
      integrationConfig: {
        dynamicUrl: '/api/rest/integration/search',
        params: {handler: 'FormIntegrationHandler', isActive: 1},
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        search: true,
        multiple: false,
        transfer: true,
        validateList: ['required']
      },
      validJson: ['required', 'integer_p']
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$nextTick(function() {
      this.changeIntegration(true);
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getIntegrationUuidList() {
      this.$refs.integrationUuid.initDataListByUrl();
      this.$nextTick(() => {
        this.$Message.success('刷新成功');
        this.changeIntegration();
      }, 1000);
    },
    addDataSource(val) {
      if (val) {
        //跳转到集成编辑的页面
        window.open(HOME + '/framework.html#/integration-manage?isIntegrationDialogShow=true' + '&&integrationUuid=' + this.setting.integrationUuid, '_blank');
      } else {
        //跳转到集成管理的页面
        window.open(HOME + '/framework.html#/integration-manage?isIntegrationDialogShow=true', '_blank');
      }
    },
    validComponent() {
      let _this = this;
      let componet = [{ ref: 'integrationUuid', message: '集成数据源:不可为空' }];
      let validList = [];
      componet.forEach(item => {
        _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && validList.push('集成数据源:' + _this.$refs[item.ref].validMesage);
      });
      return validList;
    },
    changeNeedPage() {
      this.setting.pageSize = 10;
    },
    changeIntegration(isInit) {
      let _this = this;
      if (!isInit) {
        this.setting.dataConfig = [];
        this.setting.sourceColumnList = [];
        this.$set(this.setting, 'uuidColumn', null);
      }
      if (_this.setting.integrationUuid) {
        this.$api.framework.integration.getIntegrationColumnList({integrationUuid: _this.setting.integrationUuid}).then(res => {
          if (res.Status == 'OK') {
            let dataList = res.Return.tbodyList || [];
            let uuidList = [];
            //添加没有的数据
            dataList &&
              dataList.forEach(item => {
                uuidList.push(item.uuid);
                if (item.primaryKey) { //唯一标识，必须存在
                  _this.$set(_this.setting, 'uuidColumn', item.uuid);
                }
                if (isInit && _this.setting.dataConfig.length > 0) {
                  let hasItem = false;
                  _this.setting.dataConfig.forEach(data => {
                    if (data.uuid == item.uuid) {
                      data.name = item.name;
                      data.isSearchable = item.isSearchable;
                      hasItem = true;
                      data.type = item.type || 'input';
                    }
                  });
                  //urlAttributeValue: 表示选择属性跳转链接的字段
                  !hasItem && _this.setting.dataConfig.push({ uuid: item.uuid, name: item.name, isPC: item.hasOwnProperty('isPC') ? item.isPC : true, isMobile: item.hasOwnProperty('isMobile') ? item.isMobile : false, isSearch: item.isSearch, isSearchable: item.isSearchable, urlAttributeValue: item.hasOwnProperty('urlAttributeValue') ? item.urlAttributeValue : '' });
                } else {
                  _this.setting.dataConfig.push({ uuid: item.uuid, name: item.name, isPC: item.hasOwnProperty('isPC') ? item.isPC : true, isMobile: item.hasOwnProperty('isMobile') ? item.isMobile : false, isSearch: item.isSearch, isSearchable: item.isSearchable, urlAttributeValue: item.hasOwnProperty('urlAttributeValue') ? item.urlAttributeValue : '' });
                }
              });
            if (isInit) {
              //删除没有的数据
              _this.setting.dataConfig = _this.setting.dataConfig.filter(data => {
                return uuidList.indexOf(data.uuid) >= 0;
              });
            }
          }
        });
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.label-right{
  top: 0 !important;
}
</style>
