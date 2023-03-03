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
  <div class="tool-setting-wrap">
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Row>
            <Col span="14">
            </Col>
            <Col span="10">
              <TsFormInput
                v-model="inputSetting.value"
                v-bind="inputSetting"
                class="bg-op mb-md radius-sm"
                @on-change="handleChange"
              ></TsFormInput>
            </Col>
          </Row>
          <TsTable
            v-if="tableSetting.tbodyList"
            v-bind="tableSetting"
            :theadList="theadList"
          >
            <template slot="CiType" slot-scope="{row}">
              <span class="overflow">{{ row.label }} <span class="overflow text-grey">({{ row.name }})</span></span>
            </template>
            <template slot="combopId" slot-scope="{row}">
              <TsFormSelect
                v-model="row.combopId"
                v-bind="formSelectSetting"
                :dataList="comboList"
                @on-change="onChange"
              >
              </TsFormSelect>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'InspectToolSetting', // 巡检工具设置
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve)
  },
  filters: {
  },
  props: {
    keyword: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputSetting: {
        placeholder: '名称',
        value: this.keyword,
        search: true,
        clearable: true
      },
      comboList: [], // 组合工具列表
      deepCloneTbodyList: [], // 深拷贝列表值
      dialogSetting: {
        type: 'modal',
        title: '巡检工具管理',
        isShow: true,
        okText: '保存',
        height: '500px',
        width: '45%'
      },
      formSelectSetting: {
        search: true,
        transfer: true,
        valueName: 'id',
        textName: 'name',
        width: '200px'
      },
      theadList: [
        {
          title: 'CiType',
          key: 'CiType',
          type: 'slot',
          width: 200
        },
        {
          title: '组合工具',
          key: 'combopId',
          type: 'slot'
        }
      ],
      tableSetting: {
        height: '350px',
        loading: false,
        tbodyList: []
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getComboList();
    this.getTableData();
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
    handleChange() {
      if (!this.$utils.isEmpty(this.deepCloneTbodyList) && this.$utils.isEmpty(this.inputSetting.value)) {
        // 不为空，显示原有值
        this.tableSetting.tbodyList.splice(0, this.tableSetting.tbodyList);
        this.$set(this.tableSetting, 'tbodyList', this.deepCloneTbodyList);
      } else {
        this.getTableData();
      }
    },
    onChange() {
      // 值改变
      this.deepCloneTbodyList = this.$utils.deepClone(this.tableSetting.tbodyList);
    },
    getComboList() {
      // 获取组合工具列表
      this.$api.inspect.definition.getCombopList().then((res) => {
        if (res.Status == 'OK') {
          this.comboList = res.Return.tbodyList;
        }
      });
    },
    okDialog() {
      // 保存
      let inspectCombopList = this.$utils.deepClone(this.tableSetting.tbodyList);
      let inspectCiCombopList = [];
      inspectCombopList.forEach((val) => {
        inspectCiCombopList.push({
          id: val.id,
          combopId: val.combopId
        });
      });
      this.$api.inspect.definition.saveCombinationTool({inspectCiCombopList: inspectCiCombopList}).then((res) => {
        if (res.Status == 'OK') {
          this.closeDialog(true);
          this.$Message.success(this.$t('message.content.savesuccess'));
        }
      });
    },
    closeDialog(needRefresh = false) {
      this.inputSetting.value = '';
      this.$emit('close', needRefresh);
    },
    getTableData() {
      // 获取列表数据
      this.tableSetting.loading = true;
      this.$api.inspect.definition.getCombinationToolList(this.inputSetting.value).then((res) => {
        if (res.Status == 'OK') {
          this.tableSetting.loading = false;
          this.tableSetting.tbodyList = res.Return;
          if (!this.$utils.isEmpty(res.Return)) {
            this.tableSetting.tbodyList.forEach((val) => {
              if (!val.combopId) {
                val.combopId = null;
              } 
            });
          }
        }
      }).catch(() => {
        this.tableSetting.loading = false;
      });
    }
  },
  computed: {},
  watch: {}
};
</script>

