<template>
  <div class="searcher-container">
    <div>
      <!--日期范围-->
      <TimeSelect :value="workcenterTmpConditionData.startTimeCondition" v-bind="timeSelectConfig" @change="changeTimeRange"></TimeSelect>
    </div>
    <div>
      <Dropdown trigger="custom" :visible="visible">
        <Button
          type="primary"
          ghost
          :disabled="$utils.isEmpty(selectedWorkList)"
          @click.native="handleToggle"
        >
          {{ $t('page.batchoperation') }}
          <span class="tsfont-down"></span>
        </Button>
        <DropdownMenu v-if="visible" slot="list">
          <DropdownItem @click.native="batchAction('batchAbort')">{{ $t('page.cancel') }}</DropdownItem>
          <DropdownItem @click.native="batchAction('batchUrge')">{{ $t('page.urge') }}</DropdownItem>
          <DropdownItem v-if="$AuthUtils.hasRole('PROCESSTASK_MODIFY')" @click.native="batchAction('batchHide')">{{ $t('page.hide') }}</DropdownItem>
          <DropdownItem @click.native="batchAction('batchPause')">{{ $t('page.pause') }}</DropdownItem>
          <DropdownItem v-if="$AuthUtils.hasRole('PROCESSTASK_MODIFY') || getIsDraft" @click.native="batchAction('batchDelete')">{{ $t('page.delete') }}</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <!--我的待办-->
      <span v-if="workcenterData.processingOfMineCount" class="pl-sm">
        <Button :type="workcenterConditionData.isProcessingOfMine ? 'primary' : 'default'" @click="toggleIsMyProcessing">
          <Badge :text="workcenterData.processingOfMineCount"></Badge>
          <span>{{ $t('term.process.mytodo') }}</span>
        </Button>
      </span>
    </div>
    <div>
      <!--固定条件-->
      <div
        v-if="searchWidth > 0"
        class="radius-sm border-color searcher-inputer"
        style="padding:0;text-align:right"
      >
        <!--已选择的搜索条件-->
        <div style="white-space: nowrap;overflow-x: auto;">
          <div style="display:inline-block">
            <ConditionViewer
              v-if="workcenterConditionData"
              ref="conditionViewer"
              :readonly="true"
              :conditionList="conditionList"
              :workcenterConditionData="workcenterConditionData"
              @remove="removeCondition"
            ></ConditionViewer>
          </div>
        </div>
      </div>
    </div>
    <div ref="searchContainer" style="position:relative;text-align:left">
      <!--主搜索框-->
      <div v-if="searchWidth > 0" class="radius-sm bg-op border-color searcher-inputer" :style="{ width: searchWidth + 'px' }">
        <!--已选择的搜索条件-->
        <div style="white-space: nowrap;overflow-x: auto;">
          <div style="display:inline-block">
            <ConditionViewer
              v-if="workcenterTmpConditionData"
              ref="conditionViewer"
              :readonly="isDropdownShow || !isAllowEditCondition"
              :conditionList="conditionList"
              :workcenterConditionData="workcenterTmpConditionData"
              @remove="removeCondition"
            ></ConditionViewer>
          </div>
          <div style="display:inline-block">
            <Dropdown
              trigger="custom"
              :transfer="true"
              :visible="isShowKeywordList"
              placement="bottom-start"
            >
              <div><TsFormInput
                v-model="keyword"
                size="small"
                width="250px"
                :placeholder="$t('form.placeholder.pleaseinput',{target:$t('term.process.pleaseinputtaskcontent')})"
                @change="searchKeyword"
              ></TsFormInput></div>
              <DropdownMenu slot="list" style="width:250px">
                <div>
                  <DropdownItem v-if="keyword" @click.native="addKeywordCondition({ name: 'title', text: $t('page.title'), value: keyword })">
                    {{ $t('form.placeholder.searchtarget',{target:$t('page.title')}) }}：
                    <b>{{ keyword }}</b>
                  </DropdownItem>
                  <DropdownItem v-if="keyword" @click.native="addKeywordCondition({ name: 'content', text: $t('term.process.reportcontent'), value: keyword })">
                    {{ $t('form.placeholder.searchtarget',{target:$t('term.process.reportcontent')}) }}：
                    <b>{{ keyword }}</b>
                  </DropdownItem>
                  <div v-for="(k, index) in forecastKeyworkList" :key="index">
                    <div v-if="k.dataList && k.dataList.length > 0">
                      <div>
                        <Divider style="margin:0px;font-size:13px" orientation="left">{{ k.text }}</Divider>
                      </div>
                      <DropdownItem v-for="(d, dindex) in k.dataList" :key="dindex" @click.native="addKeywordCondition({ name: k.value, text: k.text, value: d })">{{ d }}</DropdownItem>
                    </div>
                  </div>
                </div>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <!--清除条件按钮-->
        <span v-if="!isDropdownShow && isAllowEditCondition && hasCondition" class="btn-remove tsfont-close-o" @click="clearCondition"></span>
        <!--展开/收起搜索面板按钮-->
        <span class="btn-filter tsfont-filter" @click="toggleDropdown"></span>
      </div>
      <div v-if="isDropdownShow" class="dropdown-container bg-op border-color radius-sm">
        <div class="condition-container pl-nm pr-nm">
          <SimplePanel
            v-if="searchMode === 'simple' && conditionList.length > 0"
            ref="searchPanel"
            :conditionList="conditionList"
            :workcenterConditionData="workcenterTmpConditionData"
          ></SimplePanel>
          <CustomPanel
            v-else-if="searchMode === 'custom' && conditionList.length > 0"
            ref="searchPanel"
            :workcenterConditionData="workcenterTmpConditionData"
            :conditionList="conditionList"
          ></CustomPanel>
        </div>
        <TsRow>
          <Col span="6">
            <div class="pl-nm">
              <span
                v-if="searchMode === 'simple' && $AuthUtils.hasRole('WORKCENTER_ADVANCED_SEARCH')"
                class="text-action tsfont-left"
                @click="changeSearchMode('custom')"
              >{{ $t('page.advancedmode') }}</span>
              <span v-else-if="searchMode === 'custom'" class="text-action tsfont-left" @click="changeSearchMode('simple')">{{ $t('page.simplemode') }}</span>
            </div>
          </Col>
          <Col span="18">
            <div class="button-container pl-nm pr-nm">
              <div class="action-group">
                <div v-if="$AuthUtils.hasRole('WORKCENTER_NEW_TYPE')" class="action-item">
                  <Button
                    type="primary"
                    ghost
                    @click="openWorkcenterAddDialog"
                  >{{ $t('page.saveasnewcategory') }}</Button>
                </div>
                <div v-if="workcenterData.type!='factory' && $AuthUtils.hasRole('WORKCENTER_MODIFY')" class="action-item">
                  <Button
                    ghost
                    type="primary"
                    @click="saveWorkcenter"
                  >{{ $t('page.save') }}</Button>
                </div>
                <div class="action-item">
                  <Button type="primary" @click="search">{{ $t('page.search') }}</Button>
                </div>
              </div>
            </div>
          </Col>
        </TsRow>
      </div>
    </div>
    <WorkcenterTypeEdit v-if="isTypeDialogShow" @save="saveNewWorkcenter" @close="closeTypeEditDialog"></WorkcenterTypeEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    SimplePanel: () => import('./simple-panel.vue'),
    CustomPanel: () => import('./custom-panel.vue'),
    ConditionViewer: () => import('./condition-viewer.vue'),
    TimeSelect: () => import('@/resources/components/TimeSelect/TimeSelect.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    WorkcenterTypeEdit: () => import('./workcenter-type-edit.vue')
  },
  props: {
    workcenterData: { type: Object },
    selectedWorkList: {
      type: Array,
      default: () => []
    },
    workcenterUuid: String
  },
  data() {
    return {
      /*
      workcenterUuid有四种出厂设置，这四种设置都不能保存搜索条件，只能另存
      allProcessTask(所有工单),
      processingOfMineProcessTask(我的待办)
      doneOfMineProcessTask（我的已办）
      draftProcessTask（我的草稿）
      */
      visible: false,
      systemTypeList: ['allProcessTask', 'processingOfMineProcessTask', 'doneOfMineProcessTask', 'draftProcessTask'],
      searchWidth: 0, //搜索栏宽度，完成计算后再显示搜索栏
      searchMode: this.workcenterData?.conditionConfig?.handlerType || 'simple',
      isDropdownShow: false,
      timeSelectConfig: {
        //时间选择器的数据（含各种默认配置）
        border: 'border',
        placement: 'bottom-start',
        clearable: false,
        transfer: true,
        width: '100%'
      },
      keyword: '',
      isTypeDialogShow: false,
      forecastKeyworkList: [], //预测输入的关键字列表
      keywordSearchTimer: null,
      isShowKeywordList: false,
      conditionList: [], //默认的条件列表，查询时也需要提供workcenteruuid
      //后端提供的workceter数据的conditionConfig是字符串
      workcenterConditionData: {},
      workcenterFixedConditionData: {}
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.getConditionByWorkcenterUuid();
    this.$nextTick(() => {
      this.$refs['searchContainer'] && (this.searchWidth = this.$refs['searchContainer'].clientWidth);
    });
    window.addEventListener('resize', () => {
      this.searchWidth = 0;
      this.$nextTick(() => {
        this.$refs['searchContainer'] && (this.searchWidth = this.$refs['searchContainer'].clientWidth);
      });
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleToggle() {
      if (this.visible) {
        this.visible = false;
      } else {
        this.visible = true;
      }
    },
    closeTypeEditDialog(needRefresh) {
      this.isTypeDialogShow = false;
      if (needRefresh) {
        //跳转到新分类页面
      }
    },
    //添加关键字条件
    addKeywordCondition(keywordData) {
      if (!this.workcenterTmpConditionData.keywordConditionList) {
        this.$set(this.workcenterTmpConditionData, 'keywordConditionList', []);
      }
      const keywordConditionList = this.workcenterTmpConditionData.keywordConditionList;
      const item = keywordConditionList.find(d => d.name == keywordData.name);
      if (!item) {
        keywordConditionList.push({ uuid: this.$utils.setUuid(), name: keywordData.name, text: keywordData.text, valueList: [keywordData.value] });
      } else {
        if (!item.valueList.includes(keywordData.value)) {
          item.valueList.push(keywordData.value);
        }
      }
      this.isShowKeywordList = false;
      this.keyword = '';
      this.search();
    },
    searchKeyword(val) {
      this.forecastKeyworkList = [];
      if (val) {
        if (this.keywordSearchTimer) {
          clearTimeout(this.keywordSearchTimer);
          this.keywordSearchTimer = null;
        }
        let param = {
          keyword: val,
          pageSize: 12,
          conditionConfig: {
            isProcessingOfMine: this.workcenterTmpConditionData.isProcessingOfMine, //是否需要过滤我的待办
            startTimeCondition: this.workcenterTmpConditionData.startTimeCondition //时间区间
          }
        };
        this.keywordSearchTimer = setTimeout(() => {
          this.$api.process.processtask
            .workcenterKeywordSearch(param)
            .then(res => {
              if (res.Status === 'OK') {
                this.forecastKeyworkList = res.Return;
              }
            })
            .finally(() => {
              this.isShowKeywordList = true;
            });
        }, 250);
      } else {
        if (this.keywordSearchTimer) {
          clearTimeout(this.keywordSearchTimer);
          this.keywordSearchTimer = null;
        }
        this.isShowKeywordList = false;
      }
    },
    //清理所有条件
    clearCondition() {
      this.$set(this.workcenterTmpConditionData, 'conditionGroupList', []);
      this.$set(this.workcenterTmpConditionData, 'keywordConditionList', []);
      this.search();
    },
    //保存当前工单分类
    // saveWorkcenter() {
    //   if (this.$refs['searchPanel'] && this.$refs['searchPanel'].valid()) {
    //     let workcenterConditionData = {};
    //     workcenterConditionData = this.$refs['searchPanel'].getData();
    //     workcenterConditionData = this.generateJoinData(workcenterConditionData);
    //     this.$api.process.processtask.workcenterConditionSave({ uuid: this.workcenterData.uuid, conditionConfig: workcenterConditionData }).then(res => {
    //       if (res.Status == 'OK') {
    //         this.$emit('search', workcenterConditionData, 1);
    //         this.isDropdownShow = false;
    //         this.$Message.success(this.$t('message.savesuccess'));
    //       }
    //     });
    //   }
    // },
    //打开另存为新类型按钮
    openWorkcenterAddDialog() {
      if (this.$refs['searchPanel'] && this.$refs['searchPanel'].valid()) {
        /*let workcenterConditionData = {};
        workcenterConditionData = this.$refs['searchPanel'].getData();
        workcenterConditionData = this.generateJoinData(workcenterConditionData);*/
        this.isTypeDialogShow = true;
      }
    },
    //另存为新的工单分类
    saveNewWorkcenter(workcenterData) {
      if (this.$refs['searchPanel'] && this.$refs['searchPanel'].valid()) {
        let workcenterTmpConditionData = {};
        workcenterTmpConditionData = this.$refs['searchPanel'].getData();
        workcenterTmpConditionData = this.generateJoinData(workcenterTmpConditionData);
        workcenterData['conditionConfig'] = workcenterTmpConditionData;
        this.$api.process.processtask.saveMenu(workcenterData).then(res => {
          if (res.Status == 'OK') {
            const uuid = res.Return;
            this.$emit('search', workcenterTmpConditionData, 1);
            this.$Message.success(this.$t('message.savesuccess'));
            this.isDropdownShow = false;
            this.isTypeDialogShow = false;
            this.$router.push({path: '/task-overview-' + uuid});
            // 刷新左侧菜单
            this.$store.dispatch('leftMenu/getWorkCenterMenuData');
          }
        });
      }
    },
    changeSearchMode(mode) {
      if (this.searchMode != mode) {
        this.searchMode = mode;
        this.getConditionByWorkcenterUuid();
      }
    },
    //修改时间范围
    changeTimeRange(val) {
      //直接设到外部数据
      this.$set(this.workcenterTmpConditionData, 'startTimeCondition', val);
      this.search();
    },
    //切换我的待办按钮
    toggleIsMyProcessing() {
      //直接设到外部数据
      if (this.workcenterTmpConditionData.isProcessingOfMine) {
        this.workcenterTmpConditionData.isProcessingOfMine = 0;
      } else {
        this.workcenterTmpConditionData.isProcessingOfMine = 1;
      }
      this.search();
    },
    //通过关闭标签移除条件
    removeCondition(condition) {
      if (this.workcenterTmpConditionData.conditionGroupList && this.workcenterTmpConditionData.conditionGroupList.length > 0) {
        let deleteGroupIndex = null;
        this.workcenterTmpConditionData.conditionGroupList.forEach((group, gindex) => {
          group.conditionList.forEach((c, index) => {
            if (c.uuid == condition.uuid) {
              //group.conditionList.splice(index, 1);
              this.$delete(group.conditionList, index);
              //删除关系
              if (index > 0) {
                //group.conditionRelList.splice(index - 1, 1);
                this.$delete(group.conditionRelList, index - 1);
              }
              //简单模式下，如果删除的是服务属性，则需要删除所有表单条件
              if (this.searchMode == 'simple' && c.name == 'channel') {
                for (let i = group.conditionList.length - 1; i >= 0; i--) {
                  if (group.conditionList[i].type == 'form') {
                    //group.conditionList.splice(i, 1);
                    this.$delete(group.conditionList, i);
                    //删除关系
                    if (i > 0) {
                      //group.conditionRelList.splice(i - 1, 1);
                      this.$delete(group.conditionRelList, i - 1);
                    }
                  }
                }
              }
              return false;
            }
          });
          if (group.conditionList.length == 0) {
            deleteGroupIndex = gindex;
          }
          if (deleteGroupIndex != null && deleteGroupIndex >= 0) {
            return false;
          }
        });
        if (deleteGroupIndex != null && deleteGroupIndex >= 0) {
          //this.workcenterTmpConditionData.conditionGroupList.splice(deleteGroupIndex, 1);
          this.$delete(this.workcenterTmpConditionData.conditionGroupList, deleteGroupIndex);
          if (deleteGroupIndex > 0) {
            //this.workcenterTmpConditionData.conditionGroupRelList.splice(deleteGroupIndex - 1, 1);
            this.$delete(this.workcenterTmpConditionData.conditionGroupRelList, deleteGroupIndex - 1);
          }
        }
      }
      if (this.workcenterTmpConditionData.keywordConditionList && this.workcenterTmpConditionData.keywordConditionList.length > 0) {
        this.workcenterTmpConditionData.keywordConditionList.forEach((keyword, index) => {
          if (keyword.uuid == condition.uuid) {
            //this.workcenterTmpConditionData.keywordConditionList.splice(index, 1);
            this.$delete(this.workcenterTmpConditionData.keywordConditionList, index);
            return false;
          }
        });
      }
      if (this.$refs['conditionViewer']) {
        this.$refs['conditionViewer'].$forceUpdate();//数据层次太深，强制更新视图
      }
      this.search();
    },
    toggleDropdown() {
      this.isDropdownShow = !this.isDropdownShow;
    },
    getConditionByWorkcenterUuid() {
      this.conditionList = [];
      this.$api.process.processtask
        .workcenterCondition({
          conditionModel: this.searchMode,
          workcenterUuid: this.workcenterData.uuid
        })
        .then(res => {
          this.conditionList = res.Return;
        });
    },
    search() {
      let data;
      if (this.$refs['searchPanel']) {
        //点击搜索时才真正更新workcenterData数据
        if (this.$refs['searchPanel'].valid()) {
          data = this.$refs['searchPanel'].getData();
        }
      } else {
        data = this.workcenterTmpConditionData;
        this.isDropdownShow = false;
      }
      if (data) {
        data = this.generateJoinData(data);
        this.$emit('search', data, 1);
        this.isDropdownShow = false;
      }
    },
    generateJoinData(workcenterTmpConditionData) {
      //为了方便删除和编辑，搜索前才会补充关系数据
      for (let g = 0; g < workcenterTmpConditionData.conditionGroupList.length; g++) {
        const conditionGroup = workcenterTmpConditionData.conditionGroupList[g];
        for (let c = 1; c < conditionGroup.conditionList.length; c++) {
          const conditionRelObj = conditionGroup.conditionRelList[c - 1];
          conditionRelObj['from'] = conditionGroup.conditionList[c - 1].uuid;
          conditionRelObj['to'] = conditionGroup.conditionList[c].uuid;
        }
        if (g >= 1) {
          const conditionGroupRelObj = workcenterTmpConditionData.conditionGroupRelList[g - 1];
          conditionGroupRelObj['from'] = workcenterTmpConditionData.conditionGroupList[g - 1].uuid;
          conditionGroupRelObj['to'] = workcenterTmpConditionData.conditionGroupList[g].uuid;
        }
      }
      return workcenterTmpConditionData;
    },
    batchAction(type) {
      this.$emit('batchAction', type);
      this.visible = false;
    }
  },
  filter: {},
  computed: {
    hasCondition() {
      if ((this.workcenterTmpConditionData.conditionGroupList && this.workcenterTmpConditionData.conditionGroupList.length > 0) ||
    (this.workcenterTmpConditionData.keywordConditionList && this.workcenterTmpConditionData.keywordConditionList.length > 0)) {
        return true;
      }
      return false;
    },
    isMineBtnShow() {
      return this.workcenterData.uuid != 'doneOfMineProcessTask' && this.workcenterData.uuid != 'draftProcessTask';
    },
    isAllowEditCondition() {
      if (this.workcenterData.type != 'custom') {
        if (this.$AuthUtils.hasRole(['WORKCENTER_MODIFY', 'WORKCENTER_NEW_TYPE'])) {
          return true;
        }
      } else {
        return this.workcenterData.isMine;
      }
      return false;
    },
    getIsDraft() {
      if (this.workcenterUuid === 'draftProcessTask') {
        return true;
      } else {
        return false;
      }
    }
  },
  watch: {
    workcenterData: {
      handler: function(val) {
        this.workcenterConditionData = val.conditionConfig;
        this.workcenterTmpConditionData = val.tmpConditionConfig;
        this.searchMode = val?.conditionConfig?.handlerType || 'simple';
      },
      deep: true
    },
    selectedWorkList: {
      handler: function(val) {
        if (this.$utils.isEmpty(this.selectedWorkList)) {
          // 没有选中复选框，批量下拉列表隐藏
          this.visible = false;
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.searcher-container {
  display: grid;
  grid-template-columns: 100px 237px 237px auto;
  grid-gap: 10px;
}
.searcher-inputer {
  text-align: left;
  width: 100%;
  position: relative;
  display: inline-block;
  border-width: 1px;
  border-style: solid;
  height: 34px;
  line-height: 32px;
  padding-right: 60px;
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
}
.dropdown-container {
  text-align: left;
  position: absolute;
  box-shadow: 5px 5px 5px 0px rgba(0, 0, 0, 0.1), -5px 5px 5px 0px rgba(0, 0, 0, 0.1);
  width: 100%;
  top: 50px;
  .condition-container {
    max-height: 400px;
    overflow: auto;
  }
  .button-container {
    text-align: right;
  }
}
</style>
