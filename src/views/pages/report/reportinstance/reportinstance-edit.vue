<template>
  <div>
    <TsDialog
      v-if="reportInstanceData"
      :is-show="isShow"
      v-bind="reportDialogConfig"
      @on-close="close"
    >
      <template v-slot:header>
        <div v-if="reportInstanceData.id">{{ $t('term.report.editreport') }}</div>
        <div v-if="!reportInstanceData.id">{{ $t('term.report.addreport') }}</div>
      </template>
      <template v-slot>
        <TsForm ref="reportForm" :item-list="reportInstanceFormConfig">
          <template v-slot:isActive>
            <TsFormSwitch
              v-model="reportInstanceData.isActive"
              :true-value="1"
              :false-value="0"
              showStatus
            ></TsFormSwitch>
          </template>
          <template v-slot:config>
            <div v-if="paramList && paramList.length > 0" class="tstable-container padding">
              <table class="tstable-body">
                <thead>
                  <tr>
                    <th style="width:50px">{{ $t('page.display') }}</th>
                    <th>{{ $t('page.name') }}</th>
                    <th>{{ $t('page.tag') }}</th>
                    <th>{{ $t('page.defaultvalue') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(param, index) in paramList" :key="index">
                    <td>
                      <Checkbox v-model="param.isDisplay" style="z-index:9"></Checkbox>
                    </td>
                    <td>
                      {{ param.name }}
                    </td>
                    <td>
                      {{ param.label }}
                    </td>
                    <td>
                      <component :is="param.type" :config="param.config" @setParam="setParam(param.name, $event)"></component></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else>
              {{ $t('page.withoutparam') }}
            </div>
          </template>
          <template v-slot:tableConfig>
            <ul>
              <li v-for="table in tableList" :key="table.id">
                <div class="text-default">{{ table.title }}</div>
                <div class="bg-op thead-check-list radius-lg">
                  <CheckboxGroup v-model="table.valueList">
                    <Checkbox 
                      v-for="item in table.columnList" 
                      :key="item.value"
                      :label="item.value"
                      :disabled="table.valueList.length === 1 && table.valueList.includes(item.value)" 
                      class="checkbox-item"
                    >{{ item.text }}</Checkbox>
                  </CheckboxGroup>
                  <Divider :style="{margin:'8px 0 16px'}" />
                  <Draggable
                    v-model="table.valueList"
                    tag="ol"
                    :animation="150"
                    :group="table.id"
                    handle=".handle"
                  >
                    <li v-for="(value, index) in table.valueList" :key="value" class="checked-item bg-grey radius-mi">
                      <i class="ts-bars handle"></i>
                      <span>{{ value }}</span>
                      <i v-if="table.valueList.length > 1" class="tsfont-close close-button text-action" @click="table.valueList.splice(index, 1)"></i>
                    </li>
                  </Draggable>
                </div>
              </li>
            </ul>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :loading="isSaving" @click="saveReportInstance()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import * as paramhandler from '../report/paramhandler';
export default {
  name: '',
  components: {
    TsForm,
    ...paramhandler,
    Draggable: resolve => require(['vuedraggable'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    id: {type: Number},
    isShow: {type: Boolean}
  },
  data() {
    var _this = this;
    return { 
      isSaving: false,
      reportDialogConfig: {
        type: 'slider',
        maskClose: false,
        isShow: false,
        className: 'reportinstance-edit',
        width: '1000px'
      },
      reportInstanceData: {},
      reportInstanceFormConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required'],
          width: 400,
          onChange: function(name) {
            _this.reportInstanceData.name = name;
          }
        },
        reportId: {
          type: 'select',
          label: this.$t('page.template'),
          width: 400,
          validateList: ['required'],
          valueName: 'id',
          textName: 'name',
          dynamicUrl: '/api/rest/report/list',
          rootName: 'tbodyList',
          onChange: function(name) {
            _this.reportInstanceData.reportId = name;
            _this.getReportParamList();
          }
        }, 
        authList: {
          type: 'userselect',
          label: this.$t('page.auth'),
          width: 400,
          groupList: ['user', 'team', 'role', 'common'],
          onChange: function(name) {
            _this.reportInstanceData.authList = name;
            _this.reportInstanceData.reportInstanceAuthList = [];
          }
        },
        isActive: {
          type: 'slot',
          label: this.$t('term.report.isactive')
        },
        config: {
          type: 'slot',
          label: this.$t('page.condition')
        },
        tableConfig: {
          type: 'slot',
          label: this.$t('term.report.displayfield'),
          /* get value() {
            return _this.tableList.map(table => {
              const {id: tableId, valueList: columnList} = table;
              return {tableId, columnList};
            });
          }, */
          get isHidden() {
            return !_this.tableList || _this.tableList.length === 0;
          }
        }
      },
      paramList: [],
      tableList: [],
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('term.report.isactive'),
          key: 'isActive'
        },
        {
          title: this.$t('page.template'),
          key: 'reportName'
        },
        {
          title: this.$t('term.report.visits'),
          key: 'visitCount'
        },
        {
          title: '',
          key: 'action',
          align: 'right'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    //this.getReportList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getReportParamList: function() {
      const reportId = this.reportInstanceData.reportId;
      if (reportId) {
        return this.$api.report.report.getReportById(reportId).then(res => {
          if (res.Status == 'OK') {
            if (res.Return.paramList) {
              this.paramList = res.Return.paramList;
              if (this.paramList && this.paramList.length > 0 && this.reportInstanceData.config && this.reportInstanceData.config.param) {
                this.paramList.forEach(element => {
                  const p = this.reportInstanceData.config.param[element.name] ? this.reportInstanceData.config.param[element.name] : element.config.isRequired;
                  if (p) {
                    element.isDisplay = true;
                    element.config.defaultValue = p.defaultValue;
                  }
                });
              }
            }
            this.tableList = res.Return.tableList || [];
            this.tableList.forEach(table => {
              this.$set(table, 'valueList', table.columnList.slice());
              table.columnList = table.columnList.map(column => ({value: column, text: column}));
            });
          }
        });
      } else {
        this.paramList = [];
      }
    },
    getReportList: function() {
      this.$api.report.report.getReportDatalist({needPage: false}).then(res => {
        if (res.Status == 'OK') {
          this.reportInstanceFormConfig.reportId.dataList = res.Return.tbodyList;
        }
      });
    },
    getReportInstanceById: function() {
      if (this.id) {
        this.$api.report.report.getReportInstanceById(this.id).then(res => {
          this.reportInstanceData = res.Return;
          for (var key in this.reportInstanceData) {
            if (this.reportInstanceFormConfig[key]) {
              this.reportInstanceFormConfig[key].value = this.reportInstanceData[key];
            }
          }
          this.getReportParamList().then(() => {
            this.tableList.forEach(table => {
              const valueList = this.reportInstanceData.tableColumnsMap[table.id] || [];
              this.$set(table, 'valueList', valueList);
            });
          });
        });
      } else {
        this.reportInstanceData = {id: null, name: null, reportId: null, isActive: 0, authList: [], config: {}};
        for (var key in this.reportInstanceData) {
          if (this.reportInstanceFormConfig[key]) {
            this.reportInstanceFormConfig[key].value = this.reportInstanceData[key];
          }
        }
        this.getReportParamList();
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    },
    saveReportInstance: function() {
      let reportForm = this.$refs['reportForm'];
      if (reportForm.valid()) {
        if (this.paramList && this.paramList.length > 0) {
          let param = {param: {}};
          this.paramList.forEach(element => {
            if (element.isDisplay) {
              param.param[element.name] = {
                defaultValue: element.config.defaultValue
              };
            }
          });
          this.reportInstanceData.config = param;
        }
        if (this.tableList && this.tableList.length > 0) {
          this.reportInstanceData.tableConfig = this.tableList.map(table => {
            const {id: tableId, valueList: columnList} = table;
            return {tableId, columnList};
          });
        }
        this.isShow = true;
        this.$api.report.report.saveReportInstance(this.reportInstanceData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        }).finally(() => {
          this.isSaving = false;
        });
      }
    },
    setParam: function(paramName, paramValue) {
      if (this.paramList && this.paramList.length > 0) {
        this.paramList.forEach(element => {
          if (element.name == paramName) {
            element.config.defaultValue = paramValue;
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    isShow: {
      handler: function(val) {
        if (val) {
          this.getReportInstanceById();
        } else {
          this.tableList = [];
          this.paramList = [];
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/.tstable-container tbody td{
    white-space: inherit!important;
}
.reportinstance-edit {
  .thead-check-list {
    padding: 8px 16px 6px;
    .checkbox-item {
     margin-right: 16px;
    }
  }
  
  .checked-item {
    display: inline-block;
    margin-bottom: 10px;
    margin-right: 16px;
    padding: 0 10px;
    position: relative;
    .handle {
      cursor: move;
      margin-right: 8px;
    }
    .close-button {
      display: none;
      position: absolute;
      right: -10px;
      top: -14px;
    }
    &:hover .close-button {
      display: unset;
    }
  }
}
</style>
