<!-- 工作时间窗口管理 -->
<template>
  <div class="WorktimeManagement">
    <TsContain border="border">
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addRow()">{{ $t('term.process.serwindow') }}</span>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="searchParam.keyword"
          @change="getTableDataSearch(1)"
        ></InputSearcher>
      </template>
      <div slot="content">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          @changeCurrent="getPageData"
          @changePageSize="changePageSize"
        >
          <template slot="isActive" slot-scope="{ row }">
            <div v-if="row.isActive == 1" class="text-success">{{ $t('page.enable') }}</div>
            <div v-else class="text-danger">{{ $t('page.disable') }}</div>
          </template>
          <template slot="name" slot-scope="{ row }">
            <span class="text-href" @click.stop="editRow(row.uuid)">{{ row.name }}</span>
          </template>
          <template slot="yearList" slot-scope="{ row }">
            <div>{{ row.yearList | yearListToText }}</div>
          </template>
          <template slot="workingHoursSet" slot-scope="{ row }">
            <div v-for="(item, index) in row.workingHoursSet" :key="index">
              <div class="tsfont-formtime text-left">{{ item }}</div>
            </div>
          </template>
          <template slot="referenceCount" slot-scope="{ row }">
            <ReferenceSelect
              :isTable="true"
              calleeType="worktime"
              :uuid="row.uuid"
              :referenceCount="row.referenceCount"
            ></ReferenceSelect>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <!-- <li class="tsfont-edit icon" @click="editRow(row.uuid)">{{ $t('page.edit') }}</li> -->
                <li class="ts-calendar icon" @click="editCalendar(row.uuid, row.name)">{{ $t('term.framework.calendar') }}</li>
                <li class="tsfont-trash-o icon" :class="row.referenceCount>0?'disable':''" @click="deleteRow(row.uuid, row.name,row.referenceCount)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <TsDialog
      v-bind="editTsDialog"
      :isShow.sync="editTsDialog.isShow"
      :okBtnDisable="disabledConfig.rowSaving"
      @on-ok="saveEditRow"
      @on-close="cancelEditRow"
    >
      <template v-slot>
        <div class="editForm">
          <TsForm
            ref="mainForm"
            :itemList="formSetting"
            type="type"
            labelPosition="right"
          >
            <template slot="monday">
              <div class="editFormTable input-border">
                <span :title="$t('dialog.title.addtarget',{target:$t('page.timequantum')})" class="addBtn tsfont-plus text-action" @click="addConfigRow('monday')">
                </span>
                <span :title="$t('page.copy')" class="copyBtn text-action ts-pages" @click="copyConfigGroup">
                </span>
                <Table
                  ref="editFormTable"
                  :columns="configColumns"
                  :data="config.monday"
                  size="small"
                >
                  <template slot="time" slot-scope="{ index }">
                    <TsFormDatePicker
                      v-model="config.monday[index].time"
                      type="timerange"
                      format="HH:mm"
                      :transfer="true"
                      @on-change="setTime(index,'monday',...arguments)"
                    />
                  </template>
                  <template slot="btn" slot-scope="{ index }">
                    <span
                      class="tsfont-trash-o text-action"
                      @click="deleteConfigRow('monday', index)"
                    ></span>
                  </template>
                </Table>
              </div>
            </template>

            <template v-for="(name,oi) in weekdayList" :slot="name">
              <div :key="oi" class="editFormTable input-border">
                <span class="addBtn tsfont-plus text-action" :title="$t('dialog.title.addtarget',{target:$t('page.timequantum')})" @click="addConfigRow(name)">
                </span>
                <span class="deleteBtn text-action tsfont-trash-o" :title="$t('page.delete')" @click="deleteConfigGroup(name)">
                </span>
                <Table
                  ref="editFormTable"
                  :columns="configColumns"
                  :data="config[name]"
                  size="small"
                >
                  <template slot="time" slot-scope="{ index }">
                    <TsFormDatePicker
                      v-model="config[name][index].time"
                      type="timerange"
                      format="HH:mm"
                      :transfer="true"
                      @on-change="setTime(index,name,...arguments)"
                    />
                  </template>
                  <template slot="btn" slot-scope="{ index }">
                    <span
                      class="tsfont-trash-o text-action"
                      @click="deleteConfigRow(name, index)"
                    ></span>
                  </template>
                </Table>
              </div>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
    <TsDialog
      v-bind="calendarTsDialog"
      :isShow.sync="calendarTsDialog.isShow"
      :okBtnDisable="disabledConfig.calendarSaving"
      @on-close="cancelEditCalendar"
      @on-ok="saveEditCalendar"
    >
      <div class="editForm">
        <TsForm
          ref="calendarForm"
          :itemList="calendarFormSetting"
          type="type"
          labelPosition="right"
        >
          <template slot="calendar">
            <div>
              <span class="input-mgr">
                {{ $t('page.selected') }}：
                <span class="weekendSelected divbox"></span>
                <span class="workdaySelected divbox"></span>
              </span>
              <span class="input-mgr">
                {{ $t('page.unselected') }}：
                <span class="weekendNoSelected divbox"></span>
                <span class="workdayNoSelected divbox"></span>
              </span>
              <table class="table table-condensed">
                <tbody>
                  <tr v-for="(tr, index) in calendarList" :key="index">
                    <td v-for="(month, dindex) in tr.monthList" :key="dindex" class="td-content border-color">
                      <div class="month-div">{{ month.name }}</div>
                      <div style="width: 13%;" class="headStyle">{{ $t('page.da') }}</div>
                      <div style="width: 13%;" class="headStyle">{{ $t('page.one') }}</div>
                      <div style="width: 13%;" class="headStyle">{{ $t('page.two') }}</div>
                      <div style="width: 13%;" class="headStyle">{{ $t('page.three') }}</div>
                      <div style="width: 13%;" class="headStyle">{{ $t('page.four') }}</div>
                      <div style="width: 13%;" class="headStyle">{{ $t('page.five') }}</div>
                      <div style="width: 13%;" class="headStyle">{{ $t('page.six') }}</div>
                      <div class="clear"></div>
                      <div v-for="(date, ddindex) in month.dateList" :key="ddindex">
                        <div
                          style="width: 13%;"
                          class="bodyStyle"
                          :class="{
                            dayStyle: date.dayOfWeek !== -1,
                            workdayNoSelected: date.selected === 0 && [1,2,3,4,5].includes(date.dayOfWeek),
                            workdaySelected: date.selected === 1 && [1,2,3,4,5].includes(date.dayOfWeek),
                            weekendSelected: date.selected === 1 && [0,6].includes(date.dayOfWeek),
                            weekendNoSelected: date.selected === 0 && [0,6].includes(date.dayOfWeek)
                          }"
                          :dateName="date.name"
                          :dayOfWeek="date.dayOfWeek"
                          @click="date.selected = (date.selected === 0) ? 1 : 0"
                        >{{ date.dayOfMonth }}</div>
                      </div>
                      <div class="clear"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="help-div">
                <b>{{ $t('page.tip') }}</b>
                ：{{ $t('message.framework.worktimetip') }}
              </div>
            </div>
          </template>
        </TsForm>
      </div>
    </TsDialog>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  filters: {
    yearListToText: function(value) {
      if (value) {
        let str = '';
        value.forEach(item => {
          str = str + '、' + item;
        });
        return str.substring(1);
      }
      return;
    }
  },
  props: [],
  data() {
    let _this = this;
    return {
      selectStartTime: '', //当前选中的开始时间
      selectEndTime: '', //当前选中的结束时间
      loadingShow: true,
      tableheight: 0,
      weekdayList: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      pageSize: 20,
      theadList: [
        { title: this.$t('page.name'), key: 'name' },
        { title: this.$t('term.framework.selectyear'), key: 'yearList' },
        {
          title: this.$t('term.framework.workinghours'),
          key: 'workingHoursSet'
        },
        { title: this.$t('page.referencecount'), key: 'referenceCount' },
        { title: this.$t('page.status'), key: 'isActive' },
        { title: ' ', key: 'action', align: 'right', width: 10 }
      ],
      tableData: null,
      editTsDialog: {
        type: 'modal',
        title: '',
        maskClose: false,
        isShow: false,
        width: 'medium'
      },
      calendarTsDialog: {
        type: 'modal',
        title: this.$t('term.framework.calendarinfor'),
        maskClose: false,
        isShow: false,
        width: 'large'
      },
      formSetting: [
        {
          type: 'text',
          name: 'uuid',
          value: null,
          defaultValue: null,
          isHidden: true,
          label: this.$t('page.primarykey')
        },
        {
          type: 'text',
          name: 'name',
          value: '',
          defaultValue: '',
          maxlength: 30,
          width: '100%',
          label: this.$t('page.name'),
          validateList: ['required', { name: 'searchUrl', url: 'api/rest/worktime/save', params: () => ({ uuid: this.formSetting[0].value }) }]
        },
        {
          type: 'radio',
          name: 'isActive',
          value: 1,
          defaultValue: 1,
          label: this.$t('page.status'),
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 1, text: this.$t('page.enable') },
            { value: 0, text: this.$t('page.disable') }
          ]
        },
        {
          name: 'monday',
          type: 'slot',
          label: this.$t('page.monday')
        },
        {
          name: 'tuesday',
          type: 'slot',
          isHidden: true,
          label: this.$t('page.tuesday')
        },
        {
          name: 'wednesday',
          type: 'slot',
          isHidden: true,
          label: this.$t('page.wednesday')
        },
        {
          name: 'thursday',
          type: 'slot',
          isHidden: true,
          label: this.$t('page.thursday')
        },
        {
          name: 'friday',
          type: 'slot',
          isHidden: true,
          label: this.$t('page.firday')
        },
        {
          name: 'saturday',
          type: 'slot',
          isHidden: true,
          label: this.$t('page.saturday')
        },
        {
          name: 'sunday',
          type: 'slot',
          isHidden: true,
          label: this.$t('page.sunday')
        }
      ],
      calendarFormSetting: {
        year: {
          type: 'select',
          name: 'year',
          value: '',
          defaultValue: '',
          width: 80,
          label: this.$t('page.particularyear'),
          clearable: false,
          transfer: true,
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 2020, text: '2020' },
            { value: 2021, text: '2021' },
            { value: 2022, text: '2022' },
            { value: 2023, text: '2023' },
            { value: 2024, text: '2024' },
            { value: 2025, text: '2025' },
            { value: 2026, text: '2026' },
            { value: 2027, text: '2027' },
            { value: 2028, text: '2028' },
            { value: 2029, text: '2029' },
            { value: 2030, text: '2030' }
          ],
          onChange: function(value) {
            _this.getCalendarByYear(value);
          }
        },
        batchSelect: {
          type: 'checkbox',
          name: 'batchSelect',
          value: [],
          defaultValue: [],
          label: this.$t('page.batchselect'),
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 0, text: this.$t('page.sunday') },
            { value: 1, text: this.$t('page.monday') },
            { value: 2, text: this.$t('page.tuesday') },
            { value: 3, text: this.$t('page.wednesday')},
            { value: 4, text: this.$t('page.thursday') },
            { value: 5, text: this.$t('page.firday')},
            { value: 6, text: this.$t('page.saturday') }
          ],
          onChange: function(list) {
            _this.calendarList.forEach(item => {
              item.monthList.forEach(month => {
                month.dateList.forEach(date => {
                  if (list.includes(date.dayOfWeek)) {
                    date.selected = 1;
                  } else {
                    date.selected = 0;
                  }
                });
              });
            });
          }
        },
        calendar: {
          type: 'slot',
          name: 'calendar',
          label: this.$t('page.calendar')
        }
      },
      configColumns: [
        { title: this.$t('page.timequantum'), slot: 'time' },
        { title: ' ', slot: 'btn', with: 100, align: 'right' }
      ],
      config: {
        monday: [{ startTime: '', endTime: '', time: []}],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      },
      searchParam: {
        keyword: null,
        currentPage: 1,
        pageSize: 20,
        timestamp: null
      },
      searchParamCalendar: {
        worktimeUuid: null,
        year: null,
        calendarList: null,
        timestamp: null
      },
      calendarList: [],
      disabledConfig: {
        //禁止按钮连续调用接口
        rowSaving: false,
        rowDeleting: false,
        calendarSaving: false
      }
    };
  },
  created() {},
  mounted() {
    let _this = this;
    this.getTableDataSearch(1);
    let isCatalogManage = this.$route.query.isCatalogManage;
    if (isCatalogManage == '1') {
      this.addRow();
    }
  },
  beforeDestroy() {
  },
  methods: {
    setTime(index, type, time) {
      this.config[type][index].startTime = time[0] || null;
      this.config[type][index].endTime = time[1] || null;
    },
    getTableDataSearch(currentPage, pageSize) {
      let _this = this;
      if (currentPage) {
        _this.searchParam.currentPage = currentPage;
      }
      if (pageSize) {
        _this.searchParam.pageSize = pageSize;
      } else {
        _this.searchParam.pageSize = this.pageSize;
      }
      _this.searchParam.timestamp = new Date().getTime();
      _this.$api.framework.worktime
        .search(_this.searchParam)
        .then(res => {
          if (res.Status == 'OK') {
            _this.tableData = res.Return;
            _this.tableData.theadList = _this.theadList;
            this.loadingShow = false;
          }
        });
    },
    //改变页数
    changePageSize(size) {
      this.pageSize = size;
      this.getTableDataSearch();
    },
    getPageData(currentPage) {
      this.getTableDataSearch(currentPage);
    },
    initConfig() {
      return {
        monday: [{ startTime: '', endTime: '', time: []}],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      };
    },
    addRow() {
      let _this = this;
      this.$set(_this.formSetting[2], 'disabled', false);
      _this.formSetting.forEach(item => {
        item.value = item.defaultValue;
        if (_this.weekdayList.indexOf(item.name) != -1) {
          item.isHidden = true;
        }
      });
      this.config = this.initConfig();
      this.editTsDialog.isShow = true;
      this.editTsDialog.title = this.$t('dialog.title.addtarget', {'target': this.$t('term.process.serwindow')});
    },
    getRowData(uuid) {
      let _this = this;
      let params = { uuid: uuid, timestamp: new Date().getTime() };
      _this.$api.framework.worktime
        .get(params)
        .then(res => {
          if (res.Status == 'OK') {
            let config = JSON.parse(res.Return.config);
            for (let key in config) {
              config[key] && config[key].forEach(cc => {
                cc.time = cc.time || [cc.startTime || '', cc.endTime || ''];
              });
            }
            this.config = config;
            if (res.Return.referenceCount > 0) {
              this.$set(_this.formSetting[2], 'disabled', true);
            } else {
              this.$set(_this.formSetting[2], 'disabled', false);
            }
            _this.formSetting.forEach(item => {
              item.value = res.Return[item.name];
              if (_this.weekdayList.indexOf(item.name) != -1) {
                if (_this.config[item.name] && _this.config[item.name].length > 0) {
                  item.isHidden = false;
                } else {
                  item.isHidden = true;
                }
              }
            });
            _this.editTsDialog.isShow = true;
          }
        });
    },
    editRow(uuid) {
      this.getRowData(uuid);
      this.editTsDialog.title = this.$t('dialog.title.edittarget', {'target': this.$t('term.process.serwindow')});
    },
    deleteRow(uuid, name, referenceCount) {
      if (referenceCount > 0) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          if (!this.disabledConfig.rowDeleting) {
            vnode.isShow = false;
            let params = { uuid: uuid };
            this.disabledConfig.rowDeleting = true;
            this.$api.framework.worktime
              .delete(params)
              .then(res => {
                this.disabledConfig.rowDeleting = false;
                if (res.Status == 'OK') {
                  this.$Message.success(this.$t('message.deletesuccess'));
                  this.getTableDataSearch(1);
                }
              })
              .catch(error => {
                this.disabledConfig.rowDeleting = false;
              });
          }
        }
      });
    },
    saveEditRow() {
      var form = this.$refs.mainForm;
      if (form.valid()) {
        let data = form.getFormValue();
        data.config = this.config;
        const validList = [];
        for (let i in data.config) {
          if (data.config[i].length > 0) {
            data.config[i].forEach(citem => {
              if (!citem.endTime || !citem.startTime) {
                validList.push(false);
              }
            });
          }
        }
        if (validList.length > 0) {
          this.$Message.warning(this.$t('message.completerequired', {'target': this.$t('page.time')}));
          return;
        }
        if (!this.disabledConfig.rowSaving) {
          this.disabledConfig.rowSaving = true;
          this.$api.framework.worktime
            .save(data)
            .then(res => {
              this.disabledConfig.rowSaving = false;
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.savesuccess'));
                this.editTsDialog.isShow = false;
                this.getTableDataSearch();
              }
            })
            .catch(error => {
              this.disabledConfig.rowSaving = false;
              if (error.data.Message) {
                this.$Message.error(this.$t('message.savefailed') + '：' + error.data.Message);
              } else {
                this.$Message.error(this.$t('message.apierror'));
              }
            });
        }
      }
    },
    cancelEditRow() {
      this.editTsDialog.isShow = false;
    },
    addConfigRow(key) {
      let configRowObj = { startTime: '', endTime: '', time: []};
      this.$set(this.config[key], this.config[key].length, configRowObj);
    },
    deleteConfigRow(key, index) {
      this.config[key].splice(index, 1);
    },
    copyConfigGroup() {
      let _this = this;
      let count = 1;
      _this.formSetting.forEach(item => {
        if (_this.weekdayList.indexOf(item.name) != -1) {
          if (item.isHidden && count == 1) {
            let list = [];
            _this.config['monday'].forEach(mon => {
              let configRowObj = {
                startTime: mon.startTime,
                endTime: mon.endTime,
                time: [mon.startTime, mon.endTime]
              };
              list.push(configRowObj);
            });
            _this.config[item.name] = list;
            item.isHidden = false;
            count--;
          }
        }
      });
    },
    deleteConfigGroup(key) {
      this.formSetting.forEach(item => {
        if (item.name == key) {
          item.isHidden = true;
          this.config[key] = [];
        }
      });
    },
    getCalendarByYear(year) {
      let _this = this;
      _this.searchParamCalendar.year = year;
      _this.searchParamCalendar.calendarList = null;
      _this.searchParamCalendar.timestamp = new Date().getTime();
      _this.$api.framework.worktime
        .calendarGet(_this.searchParamCalendar)
        .then(res => {
          if (res.Status == 'OK') {
            _this.calendarList = res.Return;
            _this.calendarFormSetting.batchSelect.value = [];
            _this.calendarTsDialog.isShow = true;
          }
        });
    },
    initYearSelectOption() {
      let yearList = [];
      let option = {};
      let date = new Date();
      let lastYear = date.getFullYear() + 1;
      for (let i = 2020; i <= lastYear; i++) {
        option = { value: i, text: i };
        yearList.push(option);
      }
      return yearList;
    },
    editCalendar(uuid, name) {
      let _this = this;
      _this.calendarTsDialog.title = this.$t('term.framework.calendarinfor') + ' - ' + name;
      _this.searchParamCalendar.calendarList = null;
      _this.searchParamCalendar.worktimeUuid = uuid;
      let date = new Date();
      let year = date.getFullYear();
      for (let key in _this.calendarFormSetting) {
        let item = _this.calendarFormSetting[key];
        if (key == 'year') {
          item.dataList = _this.initYearSelectOption();
          item.value = year;
        } else {
          item.value = item.defaultValue;
        }
      }
      _this.getCalendarByYear(year);
    },
    saveEditCalendar() {
      let _this = this;
      if (!_this.disabledConfig.calendarSaving) {
        _this.searchParamCalendar.calendarList = _this.calendarList;
        _this.searchParamCalendar.timestamp = new Date().getTime();
        _this.disabledConfig.calendarSaving = true;
        _this.$api.framework.worktime
          .calendarSave(_this.searchParamCalendar)
          .then(res => {
            _this.disabledConfig.calendarSaving = false;
            if (res.Status == 'OK') {
              _this.calendarTsDialog.isShow = false;
              _this.getTableDataSearch(1);
            }
          })
          .catch(error => {
            _this.disabledConfig.calendarSaving = false;
            if (error.data.Message) {
              this.$Message.error(this.$t('message.savefailed') + '：' + error.data.Message);
            } else {
              this.$Message.error(this.$t('message.apierror'));
            }
          });
      }
    },
    cancelEditCalendar() {
      this.calendarTsDialog.isShow = false;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.WorktimeManagement {
  .content {
    background: #fff;
    padding: 16px;
  }
  tr {
    cursor: default;
  }
}
.editForm {
  .ivu-input-word-count {
    background: #fff;
  }
  /deep/tr {
    th, td{
      &:first-child{
        padding-left: 8px;
      }
    }
  }
}
.editFormTable {
  position: relative;
  .addBtn {
    position: absolute;
    top: 10px;
    right: 60px;
    z-index: 100;
  }
  .copyBtn {
    position: absolute;
    top: 10px;
    right: 32px;
    z-index: 100;
  }
  .deleteBtn {
    position: absolute;
    top: 10px;
    right: 32px;
    z-index: 100;
  }

}

.table {
  width: 100%;
  border-collapse: collapse;
}
.table > thead > tr > th,
.table > tbody > tr > th,
.table > thead > tr > td,
.table > tbody > tr > td {
  padding: 8px;
  vertical-align: top;

  //border-top: 1px solid #ddd;
}
.monthTitle {
  text-align: center;
}

.dayStyle {
  cursor: pointer;
}

.divbox {
  height: 11px;
  width: 11px;
  border: 1px solid rgb(204, 204, 204);
  padding: 0px;
  font-size: 5px;
  background-position: initial initial;
  background-repeat: initial initial;
  display: inline-block;
  margin-right: 5px;
}
.month-div {
  text-align: center;
  vertical-align: middle;
  font-weight: bold;
  padding: 8px 0px;
}
.bodyStyle {
  vertical-align: middle;
  text-align: center;
  float: left;
  margin: 1px;
  width: 38px;
  height: 20px;
}
.headStyle {
  float: left;
  margin: 1px;
  width: 38px;
  height: 20px;
  text-align: center;
  vertical-align: middle;
}
.td-content {
  vertical-align: top;
  width: 25%;
  border: 1px solid;
  line-height: 1.5;
}

.theme(@blockbg,@greybg) {
  .weekendNoSelected {
    background-color: @greybg;
  }

  .workdayNoSelected {
    background-color: @blockbg;
  }

  .weekendSelected {
    background-color: fade(@primary-color, 15%);
  }

  .workdaySelected {
    background-color: fade(@success-color, 15%);
  }
}

html {
  .theme(@default-blockbg, @default-gray);

  &.theme-dark {
    .theme(@dark-blockbg, @dark-gray);
  }
}
</style>
