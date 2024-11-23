<template>
  <div>
    <TsContain>
      <template v-slot:top>
        <div class="top-grid">
          <div>
            <ProcessTaskSearcher
              v-if="workcenterData"
              :workcenterData="workcenterData"
              :selectedWorkList="selectedWorkList"
              :workcenterUuid="workcenterUuid"
              @search="search"
              @batchAction="batchAction"
            ></ProcessTaskSearcher>
          </div>
          <div style="text-align:center">
            <RadioGroup v-model="showMode" type="button">
              <Radio label="card"><i class="tsfont-blocklist"></i></Radio>
              <Radio label="table"><i class="tsfont-list"></i></Radio>
            </RadioGroup>
          </div>
          <div style="text-align:right">
            <Button
              v-if="isDownloading"
              :loading="true"
            >
            </Button>
            <Button
              v-else
              v-download="downloadUrl"
              ghost
              type="default"
            ><span class="tsfont-import"></span>
            </Button>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <!--搜索结果-->
        <div class="position">
          <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
          <div v-if="showMode === 'table'" ref="workcentertable" class="workcenter-table">
            <div v-if="tableConfig && tableConfig.theadList.length > 2">
              <TsTable
                v-bind="tableConfig"
                :sortOrder="tableConfig.sortList"
                :isBigDataPage="true"
                :canEdit="true"
                :theadPopTipBtnList="theadPopTipBtnList"
                keyName="id"
                multiple
                class="tstable-box"
                @changeCurrent="changePage"
                @changePageSize="changePageSize"
                @updateSort="updateSort"
                @checkshow="checkshow"
                @getSelected="(value,selectList)=>{ getSelected(selectList) }"
                @theadPopTipSettingClick="showTheadSetting"
              >
                <template v-for="(tbody, tindex) in filtertheadList(tableConfig.theadList)" :slot="tbody.key" slot-scope="{ row }">
                  <div :key="tindex" :style="(tbody.config && tbody.config.isNewLine == 1)?'':tbody.key == 'currentstep' ? {overflow: 'hidden', height: '50px',display: 'flex',alignItems: 'center'} : {overflow: 'hidden',height: '50px',lineHeight: '50px'}">
                    <WorkcenterColumnHandler
                      v-if="typeof row[tbody.key] === 'object' && tbody.key != 'action'"
                      :key="tindex"
                      :config="row[tbody.key]"
                      :header="tbody"
                      :row="row"
                      @updateMenu="updateMenu"
                    ></WorkcenterColumnHandler>
                    <tdBtn
                      v-else-if="tbody.key == 'action'"
                      :key="tindex"
                      :row="row"
                      :table="true"
                      :taskTypeUuid="workcenterUuid"
                      class="tstable-action"
                      v-on="$listeners"
                      @refresh="refreshProcessTask"
                      @delete="deleteProcessTask"
                      @actionTask="actionTask"
                    ></tdBtn>
                    <div v-else-if="['starttime', 'endtime'].includes(tbody.key)" :key="tindex">{{ row[tbody.key] | formatDate }}</div>
                    <div v-else-if="tbody.key == 'title'" :key="tindex">
                      <span
                        v-if="tbody.config && tbody.config.isNewLine == 1"
                        class="text-href"
                        :class="(tbody.config && tbody.config.isNewLine == 1)?'text-wrap':''"
                        :title="row[tbody.key]"
                        @click.stop="clickTr(row)"
                      >{{ row[tbody.key] }}</span>
                      <span
                        v-else
                        class="text-href"
                        :title="row[tbody.key]"
                        @click.stop="clickTr(row)"
                      >{{ substr(row[tbody.key]) }}</span>
                    </div>
                    <div v-else :key="tindex">{{ row[tbody.key] }}</div>
                  </div>
                </template>
              </TsTable>
            </div>
            <div v-else-if="!isLoading">
              <NoData></NoData>
            </div>
          </div>
          <div v-else class="workcenter-card">
            <CardInfo
              :cardInfo="tableConfig"
              :taskTypeUuid="workcenterUuid"
              @changeCurrent="changePage"
              @changePageSize="changePageSize"
              @refresh="refreshProcessTask"
              @delete="deleteProcessTask"
              @updateMenu="updateMenu"
              @actionTask="actionTask"
              @getSelected="getSelected"
            ></CardInfo>
          </div>
        </div>
      </template>
    </TsContain>
    <TsDialog
      v-if="isShowModal"
      :title="processTaskConfig.text"
      type="modal"
      :isShow.sync="isShowModal"
      :okBtnDisable="okBtnDisable"
      @on-ok="okDialog"
      @on-close="() => closeDialog(false)"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="reasonForm"
            :itemList="reasonForm"
            labelPosition="top"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
    <WorkcenterTheadSetting
      v-if="isShowTheadSetting"
      :isShowTheadSetting="isShowTheadSetting"
      :currentSettingThead="currentSettingThead"
      @close="closeTheadSetting"
      @ok="saveTheadSetting"
    ></WorkcenterTheadSetting>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';

export default {
  name: '',
  components: {
    ProcessTaskSearcher: () => import('@/resources/components/ProcessTaskSearcher/processtask-searcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CardInfo: () => import('./overview/CenterCard.vue'),
    WorkcenterColumnHandler: () => import('./overview/workcenter/workcenter-column-handler.vue'),
    tdBtn: () => import('./overview/ControllerBtn.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    WorkcenterTheadSetting: () => import('./workcenter-thead-setting.vue')

  },
  directives: { download },
  props: {},
  data() {
    return {
      workcenterUuid: this.$route.params['taskTypeid'] || '',
      showMode: 'table', //列表模式或块模式
      cancelAxios: null, //实时搜索，取消接口调用
      isLoading: true,
      timmer: null, //定时刷新工单中心
      timmerInterval: 30000, //定时刷新工单中心间隔(毫秒)
      isAutoRefresh: true,
      isNewPage: false, // 是否是新页面打开
      workcenterData: null,
      isDownloading: false,
      tableConfig: {
        rowNum: 100,
        currentPage: 1,
        pageSize: 20,
        pageCount: 1,
        //pageSizeOpts: [10, 20, 30, 40],
        classKey: ['expireStatus', 'rowClassName'],
        keyName: 'id',
        sortMulti: false,
        theadList: [],
        tbodyList: []
      },
      isShowModal: false,
      reasonForm: {
        content: {
          type: 'ckeditor',
          value: '',
          width: '95%',
          label: this.$t('page.reason'),
          validateList: ['required']
        }
      },
      okBtnDisable: false,
      processTaskConfig: {},
      selectedWorkList: [],
      theadPopTipBtnList: [
        {
          text: this.$t('page.workcentertitleresettheadsetting'), 
          type: 'default',
          ghost: false,
          loading: false,
          fn: vnode => {
            this.$createDialog({
              title: this.$t('page.resetconfirm'),
              content: this.$t('page.workcenterresettheadsetting'),
              btnType: 'error',
              okText: this.$t('page.confirm'),
              'on-ok': vnode => {
                this.$api.process.processtask.workcenterTheadDelete({uuid: this.workcenterUuid}).then(res => {
                  if (res.Status == 'OK') {
                    this.searchProcessTask();
                    this.$Message.success(this.$t('message.deletesuccess'));
                    vnode.isShow = false;
                  }
                });
              }
            });
          }
        }
      ],
      currentSettingThead: null, //当前点击poptip中thead配置的thead
      isShowTheadSetting: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getWorkcenterByUuid();
    this.searchProcessTask();
    this.intervalRefreshSearch(true);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.$store.commit('clearTimer');
    this.clearTimmer();
    this.cancelAxios && this.cancelAxios.cancel();
  },
  destroyed() {},
  methods: {
    showTheadSetting(th) {
      this.currentSettingThead = th;
      this.isShowTheadSetting = true;
    },
    closeTheadSetting() {
      this.isShowTheadSetting = false;
    },
    saveTheadSetting(theadSettingFormData) {
      this.tableConfig.theadList.forEach(th => { 
        if (th.key === this.currentSettingThead.key) {
          th.config = theadSettingFormData;
        }
      });
      this.checkshow(this.tableConfig.theadList, 1);
    },
    async getWorkcenterByUuid() {
      if (this.workcenterUuid && !this.workcenterData) {
        await this.$api.process.processtask.getWorkcenterByUuid(this.workcenterUuid).then(res => {
          this.workcenterData = res.Return;
        });
      }
    },
    clickTr(item) {
      if (typeof item.route === 'object') {
        let route = item.route;
        sessionStorage.setItem('processTaskUuid', this.taskTypeUuid);
        let url = '/task-detail';
        if (item.status.value === 'draft') {
          url = '/task-dispatch';
        }
        if (this.isNewPage) {
          window.open(HOME + `/process.html#${url}?processTaskId=${route.taskid}`, '_blank');
        } else {
          this.$router.push({
            path: url,
            query: {
              processTaskId: route.taskid
            }
          });
        }
      }
    },
    search(workcenterConditionData, currentPage) {
      this.selectedWorkList = [];
      if (currentPage) {
        this.tableConfig.currentPage = currentPage;
      }
      this.$set(this.workcenterData, 'conditionConfig', workcenterConditionData);
      this.searchProcessTask();
    },
    searchProcessTask(isNeedLoading = true) {
      if (this.cancelAxios) {
        this.cancelAxios.cancel();
        this.cancelAxios = null;
      }
      this.cancelAxios = this.$https.CancelToken.source();
      this.workcenterData.pageSize = this.tableConfig.pageSize;
      this.workcenterData.currentPage = this.tableConfig.currentPage;
      this.workcenterData.sortConfig = this.tableConfig.sortConfig;
      if (isNeedLoading) {
        this.isLoading = true;
      }
      this.$addHistoryData('workcenterData', this.workcenterData);
      this.$api.process.processtask
        .searchWorkcenter(this.workcenterData, { cancelToken: this.cancelAxios.token })
        .then(res => {
          if (res && res.Status == 'OK') {
            let {isAutoRefresh, isNewPage} = res.Return || {};
            this.handlerSearchResult(res.Return);
            this.isAutoRefresh = isAutoRefresh;
            this.isNewPage = isNewPage;
          }
        })
        .catch(res => {
          this.isLoading = false;
        });
    },
    restoreHistory(historyData) {
      if (historyData && historyData.workcenterData) {
        this.workcenterData = historyData.workcenterData;
      }
    },
    refreshProcessTask(isNeedLoading = true) {
      //处理完毕后刷新左侧分类菜单和列表（目的是更新待办数量）
      this.updateMenu();
      this.searchProcessTask(isNeedLoading);
    },
    deleteProcessTask(id) {
      //删除工单
      const index = this.tableConfig.tbodyList.findIndex(d => d.id == id);
      this.tableConfig.tbodyList.splice(index, 1);
      // 刷新左侧菜单
      this.updateMenu();
      //刷新列表
      this.searchProcessTask();
    },
    updateMenu() { // 刷新左侧菜单
      this.$store.dispatch('leftMenu/getWorkCenterMenuData');
    },
    substr(value) {
      return this.$utils.substr(value, 20);
    },
    checkshow(headList, val) {
      //设置表格列是否可视
      let theadList = headList
        .filter(item => !['action', 'focususers', 'score', 'selection'].includes(item.key))
        .map((d, currentIndex) => ({
          name: d.key,
          sort: currentIndex,
          isShow: d.isShow,
          type: d.type,
          width: 1,
          disabled: d.disabled,
          className: d.className,
          config: d.config
        }));
      this.$api.process.processtask
        .workcenterTheadSave({
          uuid: this.workcenterUuid,
          //type: this.activeClassify.type,看后端代码已经不需要这个参数了
          theadList: theadList
        })
        .then(res => {
          if (res && res.Status == 'OK') {
            this.searchProcessTask();
          }
        });
      this.isShowTheadSetting = false;
    },
    changePageSize(pageSize) {
      this.tableConfig.pageSize = pageSize;
      this.tableConfig.currentPage = 1;
      this.searchProcessTask();
    },
    changePage(page) {
      this.tableConfig.currentPage = page;
      this.searchProcessTask();
    },
    updateSort(sortConfig) {
      this.$set(this.tableConfig, 'sortConfig', sortConfig);
      this.searchProcessTask();
    },
    handlerSearchResult(data) {
      // 处理搜索条件过来的数据
      let theadList = data.theadList.map(d => ({
        title: d.displayName,
        key: d.name,
        isShow: d.isShow,
        type: d.type,
        disabled: d.name == '_' ? 1 : d.disabled,
        isDisabled: d.name == 'title',
        className: d.className,
        isSortable: d.isSortable,
        sort: d.sort,
        config: d.config
      }));
      let newTheadList = theadList.filter((item) => item && item.key).map((v) => this.getColumnWidth(v));
      // 添加操作
      if (!newTheadList.some(d => d.key === 'action')) {
        newTheadList.push({
          key: 'action',
          align: 'right',
          width: 20,
          isShow: 1
        });
      }
      // 添加选择列
      if (!newTheadList.find(d => d.key === 'selection')) {
        newTheadList.unshift({
          key: 'selection'
        });
      }
      this.tableConfig.theadList = newTheadList;
      this.tableConfig.rowNum = data.rowNum;
      this.tableConfig.pageSize = data.pageSize;
      this.tableConfig.currentPage = data.currentPage;
      this.tableConfig.pageCount = data.pageCount;
      this.tableConfig.sortList = theadList.filter(d => d.isSortable).map(d => d.key);
      this.tableConfig.theadList.forEach(th => {
        let newTh = theadList.find(thNew => thNew.key === th.key);
        if (newTh) {
          th.isShow = newTh.isShow;
          th.sort = newTh.sort;
          th.config = newTh.config;
          if (th.key === 'title' && !newTh.config) {
            th.config = {};
          }
        }
      });
      // 大数据分页
      this.tableConfig.endPage = data.endPage; //结束页
      this.tableConfig.processingOfMineCount = data.processingOfMineCount;
      this.tableConfig.startPage = data.startPage; //起始页
      //设置我的待办数量
      this.$set(this.workcenterData, 'processingOfMineCount', data.processingOfMineCount);
      let idList = [];
      let tbodyList = data.tbodyList.map(item => {
        item.action = {
          firstActionList: [],
          secondActionList: []
        };
        idList.push(item.id);
        this.$set(item, 'isDisabled', !item.isShow);
        if (!this.$utils.isEmpty(this.selectedWorkList)) {
          let findItem = this.selectedWorkList.find(s => s.id === item.id);
          if (findItem) {
            this.$set(item, '_selected', true);
          } else {
            this.$set(item, '_selected', false);
          }
        }
        return {
          ...item,
          ...this.checkExpire(item.expiretime),
          get rowClassName() {
            if (this.isShow === 0) {
              return 'hide-task';
            }
            return this.expireStatus;
          }
        };
      });
      this.tableConfig.tbodyList = tbodyList;
      // 在这里必须赋值一次，不然在点击是否隐藏的时候，就会有个卡顿问题及要等到 listOperation 接口请求完之后才显示列表
      if (this.tableConfig.tbodyList.length > 0) {
        // 表格里面的 action 显示列表接口信息
        this.getListOperation(idList);
      } else {
        this.isLoading = false;
      }
    },
    getColumnWidth(item = {}) {
      const newItem = {...item };
      if (item && item.key == 'focususers') {
        // 解决关注工单字段，没有title导致页面宽度会有抖动的问题
        newItem.width = 3;
        newItem.style = {display: 'inline-block', width: '3px', textAlign: 'right'};
      } else if (item && item.key == 'currentstep') {
        newItem.width = 260;
        newItem.style = {display: 'inline-block', width: '260px'}; // 修复当前步骤宽度被撑大，页面有抖动问题
      }
      return newItem;
    },
    checkExpire(timeList) {
      let timeLeftMin, expireStatus, expireTimeMin, expiredSlaName, willOverTimeMin, willOverSlaName;
      if (this.$utils.isEmpty(timeList)) {
        return {
          expireStatus: 'no-expired-time',
          expireConfig: {
            timeLeftMin: null,
            expireTimeMin: null,
            expiredSlaName: null,
            willOverTimeMin: null,
            willOverSlaName: null
          }
        };
      }
      let now = Date.now();
      expireTimeMin = Math.min(...timeList.filter(item => 'expireTime' in item).map(item => item.expireTime)); // 假设多个步骤存在超时取最大
      willOverTimeMin = Math.min(...timeList.filter(item => 'timeLeft' in item).map(item => item.timeLeft));// 假设多个步骤未超时取最小
      if (expireTimeMin === Infinity) {
        expireTimeMin = null;
        expiredSlaName = null;
        timeLeftMin = null;
      } else {
        expiredSlaName = timeList.find(item => item.expireTime === expireTimeMin).slaName;
        let timeItem = timeList.find(item => item.expireTime === expireTimeMin);
        let {slaTimeDisplayMode = '', timeLeft = 0} = timeItem || {};
        if (slaTimeDisplayMode === 'naturalTime') {
          timeLeftMin = expireTimeMin - now;
        } else if (slaTimeDisplayMode === 'workTime') {
          timeLeftMin = Math.abs(timeLeft);
        }
      }
      if (willOverTimeMin === Infinity) {
        willOverTimeMin = null;
        willOverSlaName = null;
      } else {
        willOverSlaName = timeList.find(item => item.timeLeft === willOverTimeMin).slaName;
      }
      if (!expireTimeMin) {
        expireStatus = 'no-expired-time';
      } else if (now > expireTimeMin) {
        expireStatus = 'is-expired';
      } else if (willOverTimeMin && willOverTimeMin < expireTimeMin) {
        expireStatus = now > willOverTimeMin ? 'will-be-expired' : 'not-expired';
      } else {
        expireStatus = 'not-expired';
      }
      return {
        expireStatus,
        expireConfig: {
          timeLeftMin,
          expireTimeMin,
          expiredSlaName,
          willOverTimeMin,
          willOverSlaName
        }
      };
    },
    getListOperation(idList) {
      let data = {
        processTaskIdList: idList
      };
      this.$api.process.processtask.listOperation(data).then(res => {
        if (res.Status === 'OK') {
          let resList = res.Return;
          Object.keys(resList).forEach(v => {
            this.tableConfig.tbodyList.forEach(item => {
              if (v == item.id) {
                item.action = {
                  firstActionList: resList[v].firstActionList,
                  secondActionList: resList[v].secondActionList
                };
              }
            });
          });
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    clearTimmer() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
    },
    intervalRefreshSearch(isFirst) {
      //全局自动刷新且在当前浏览器tab，才执行刷新
      if (!this.isAutoRefresh) {
        this.clearTimmer();
      } else {
        //第一次无需执行刷新操作
        if (!isFirst && document.visibilityState === 'visible') {
          this.refreshProcessTask(false);
        }
        this.timmer = setTimeout(() => {
          this.intervalRefreshSearch(false);
        }, this.timmerInterval);
      }
    },
    actionTask(data) {
      this.processTaskConfig = data;
      this.isShowModal = true;
    },
    okDialog() {
      let reasonForm = this.$refs.reasonForm;
      if (reasonForm.valid()) {
        this.okBtnDisable = true;
        if (this.processTaskConfig.name === 'recoverprocessTask') {
          this.$api.process.processtask.recoverTaskDetail({
            processTaskId: this.processTaskConfig.config.taskid,
            content: reasonForm.getFormValue().content
          }).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              this.refreshProcessTask();
            }
          }).finally(() => {
            this.closeDialog();
          });
        } else if (this.processTaskConfig.name === 'abortprocessTask') {
          this.$api.process.processtask.cancelTaskDetail({
            processTaskId: this.processTaskConfig.config.taskid,
            content: reasonForm.getFormValue().content
          }).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              this.refreshProcessTask();
            }
          }).finally(() => {
            this.closeDialog();
          });
        } else if (this.processTaskConfig.name === 'batchAbort') { //批量取消工单
          this.$api.process.processtask.batchAbort({
            content: reasonForm.getFormValue().content,
            processTaskIdList: this.$utils.mapArray(this.selectedWorkList, 'id'),
            source: 'pc'
          }).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              this.refreshProcessTask();
              this.selectedWorkList = [];
            }
          }).finally(() => {
            this.closeDialog();
          });
        } else if (this.processTaskConfig.name === 'batchPause') { //批量暂停工单
          this.$api.process.processtask.batchPause({
            content: reasonForm.getFormValue().content,
            processTaskIdList: this.$utils.mapArray(this.selectedWorkList, 'id'),
            source: 'pc'
          }).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              this.refreshProcessTask();
              this.selectedWorkList = [];
            }
          }).finally(() => {
            this.closeDialog();
          });
        }
      }
    },
    closeDialog(isClearValue = true) {
      this.reasonForm.content.value = '';
      this.okBtnDisable = false;
      this.isShowModal = false;
      if (isClearValue) {
        this.selectedWorkList = [];
      }
    },
    filtertheadList(theadList) {
      let list = theadList.filter(item => {
        return item.key != 'selection';
      });
      return list;
    },
    getSelected(itemList) {
      this.selectedWorkList = itemList;
    },
    batchAction(type) { //批量操作
      let data = {
        processTaskIdList: this.$utils.mapArray(this.selectedWorkList, 'id'),
        source: 'pc'
      };
      if (type === 'batchAbort') {
        //取消
        this.processTaskConfig.name = 'batchAbort';
        this.processTaskConfig.text = this.$t('page.batchabort');
        this.isShowModal = true;
      } else if (type === 'batchUrge') {
        //催办
        this.$api.process.processtask.batchUrge(data).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.refreshProcessTask();
            this.selectedWorkList = [];
          }
        });
      } else if (type === 'batchHide') {
        //隐藏
        this.$api.process.processtask.batchHide(data).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.refreshProcessTask();
            this.selectedWorkList = [];
          }
        });
      } else if (type === 'batchPause') {
        //暂停
        this.processTaskConfig.name = 'batchPause';
        this.processTaskConfig.text = this.$t('page.batchpause');
        this.isShowModal = true;
      } else if (type === 'batchDelete') {
        //删除
        this.$createDialog({
          title: this.$t('page.batchdelete'),
          content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.process.selecttask')}),
          btnType: 'error',
          'on-ok': vnode => {
            this.$api.process.processtask.batchDelete(data)
              .then(res => {
                if (res.Status == 'OK') {
                  const withoutAuthTaskList = res.Return;
                  if (!this.$utils.isEmpty(withoutAuthTaskList)) {
                    let withoutAuthTasks = '';
                    withoutAuthTaskList.forEach(processTask => {
                      withoutAuthTasks += processTask.title + '(' + processTask.serialNumber + ')、';
                    });
                    withoutAuthTasks = withoutAuthTasks.slice(0, -1);
                    this.$Notice.warning({
                      title: this.$t('message.deletefailed'),
                      desc: this.$t('page.workcenternoauthbatchdelete', {target: withoutAuthTasks})
                    });
                  } else {
                    this.$Notice.success({
                      title: this.$t('message.deletesuccess')
                    });
                  }
                  this.refreshProcessTask();
                  this.selectedWorkList = [];
                  vnode.isShow = false;
                }
              });
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    downloadUrl() {
      const param = {
        url: 'api/binary/workcenter/export',
        params: this.workcenterData,
        changeStatus: status => {
          if (status == 'start') {
            this.isDownloading = true;
          } else if (status == 'success' || status == 'error') {
            this.isDownloading = false;
          }
        }
      };
      return param;
    }
  },
  watch: {
    showMode: {
      handler: function(val) {
        let tablePageSizeOpts = [10, 20, 30, 40];
        let cardPageSizeopts = [12, 24, 36, 48];
        if (val === 'card') {
          if (tablePageSizeOpts.includes(this.tableConfig.pageSize)) {
            this.tableConfig.pageSize = this.tableConfig.pageSize + this.tableConfig.pageSize * 0.2;
          } else {
            this.tableConfig.pageSize = 24;
          }
          this.tableConfig.pageSizeOpts = cardPageSizeopts;
        } else {
          if (cardPageSizeopts.includes(this.tableConfig.pageSize)) {
            this.tableConfig.pageSize = this.tableConfig.pageSize - this.tableConfig.pageSize / 6;
          } else {
            this.tableConfig.pageSize = 20;
          }
          this.tableConfig.pageSizeOpts = tablePageSizeOpts;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';

.workcenter-container {
  .hideLeft-left,
  .hideLeft-right {
    overflow: auto;
  }

  .hideLeft-left {
    padding: 10px;
  }
  .hideLeft-right {
    overflow: hidden !important;
  }
  td {
    .Carousel {
      .item-img {
        text-align: left;
      }
    }
  }
}

.ivu-table-header-resizable:after {
  content: '';
  position: absolute;
  width: 1px;
  background: @background-color;
  height: 100%;
  right: 5px;
  top: 0;
}

.search-top {
  padding: 13px 24px;
  /*padding-bottom: 0px;*/
  position: relative;
  z-index: 100;
  border-bottom: 1px solid @dividing-color;
  background-color: @default-background;
}

.theme(@text-color, @error-bg-color, @gray-color, @icon-color) {
  .workcenter-table {
    .is-expired:not(:hover) {
      background-color: @error-bg-color !important;
      td {
        color: @text-color;
      }
    }
    .hide-task {
      background-color: @gray-color;
      background-image: repeating-linear-gradient(45deg, transparent, transparent 14.4px, @icon-color 15.4px, @icon-color 15.4px) !important;
      .table-Carousel {
        background-color: unset;
      }
      td:not(.action-tr) {
        filter: blur(1px);
        opacity: 0.2;
        > div {
          pointer-events: none;
        }
      }
    }
  }
}
html {
  .theme(@default-text, @default-error-bg-color, @default-gray, @default-icon);
  &.theme-dark {
    .theme(@white, @dark-error-bg-color, @dark-gray, @dark-icon);
  }
}
</style>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
.top-grid {
  display: grid;
  grid-template-columns: auto 150px 50px;
}
.search-container {
  width: calc(100% - 90px);
}
.position {
  position: relative;
  height: 100%;
}
.mode-change {
  position: absolute;
  top: 0px;
  right: 16px;
  text-align: center;
  /*z-index: 90;*/
  .icon {
    display: inline-block;
    width: 32px;
    height: 34px;
    line-height: 32px;
    border: 1px solid;
    cursor: pointer;
    &:first-child {
      border-top-left-radius: @item-border-radius;
      border-bottom-left-radius: @item-border-radius;
      &:not(:last-child) {
        border-right: none;
      }
    }
    &:last-child {
      border-top-right-radius: @item-border-radius;
      border-bottom-right-radius: @item-border-radius;
    }
  }
}
.workcenter-table {
  /deep/ .table-action {
    .icon-setting {
      padding-right: 9px;
      padding-left: 4px;
    }
  }
}
.tstable-box {
  // 修复关注工单列左右间隙过大问题
  /deep/ td:nth-of-type(1) {
    padding-right: 0 !important;
  }
  /deep/ td:nth-of-type(2) {
    padding-right: 0 !important;
  }
  /deep/ td:nth-of-type(2) {
    padding-left: 4px !important;
  }
  /deep/ th:nth-of-type(3) {
    padding-left: 0 !important;
  }
  /deep/ td:nth-of-type(3) {
    padding-left: 0 !important;
  }
  .text-wrap {
    display: inline-block;
    width: 300px;
    white-space: normal; /* 允许正常的换行 */
    word-wrap: break-word; /* 强制长单词换行 */
    word-break: break-all; /* 可以在任意字符处换行 */
  }
}
</style>
