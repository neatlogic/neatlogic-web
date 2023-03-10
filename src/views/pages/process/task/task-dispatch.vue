<template>
  <div class="dispatch">
    <loading :loadingShow="taskLoading" type="fix"></loading>
    <TsContain
      v-if="!taskLoading"
      border="none"
      :isSiderHide.sync="isOrderLeftHide"
      :siderWidth="246"
      :clearStyle="true"
    >
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/catalog-overview')">{{ $getFromPage('router.process.servicecatalog') }}</span>
      </template>
      <template v-slot:topLeft>
        <div>
          <span v-if="draftData.channelVo" class="top-title pr-sm">{{ draftData.channelVo.name }}</span>
          <span class="text-action tsfont-indent" @click="isTslayout()"></span>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span :class="{disable: disabledConfig.submiting}" class="action-item tsfont-check" @click="submitForm()">{{ $t('button.submit') }}</span>
          <span :class="{disable: disabledConfig.saving}" class="action-item tsfont-save" @click="save()">{{ $t('button.draft') }}</span>
          <span class="action-item tsfont-topo" @click="lookSitemap()">{{ $t('term.process.viewflowchart') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="task-list">
          <div class="search-main">
            <div class="text-title pl-nm pb-sm">{{ $t('term.process.cataloglist') }}</div>
            <div class="task-search pl-nm pr-nm">
              <TsFormInput
                v-model="keyword"
                :placeholder="$t('form.placeholder.name')"
                border="border"
                search
                clearable
                @on-change="getChannel"
              ></TsFormInput>
            </div>
          </div>
          <div class="channel-list" style="overflow:auto">
            <ul v-if="channelList && channelList.length > 0" ref="channel">
              <li
                v-for="(item, index) in channelList"
                :id="item.uuid"
                :ref="'id'+item.uuid"
                :key="index"
                class="li-text radius-sm overflow"
                :class="item.uuid == channelUuid ? 'bg-grey-select' : 'bg-td-hover'"
                :title="item.name"
                @click="channelClick(item)"
              >{{ item.name }}</li>
            </ul>
            <div v-else-if="!taskLoading">
              <no-data></no-data>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <DispatchCommon 
          ref="dispatchCommon"
          :handler="handler"
          :draftData="draftData"
          :isOrderRightHide="isOrderRightHide"
          @updateMenu="updateMenu"
          @rightSiderToggle="rightSiderToggle"
        ></DispatchCommon>
      </template>
    </TsContain>
    <TsDialog :isShow.sync="isShowFlowmap" v-bind="flowmapConfig">
      <div ref="topo" style="min-height: 480px; height: 100%;"></div>
    </TsDialog>
    <ValidDialog :isShow.sync="validCardOpen" :validList="validList" @validItem="validItem"></ValidDialog>
    <SubmitDialog
      v-if="submitModel"
      :processTaskId="processTaskId"
      :channelUuid="channelUuid"
      @close="submitModel=false"
    ></SubmitDialog>
    <AssignDialog
      v-if="assignModal"
      :nextstepList="nextstepList"
      @selectStep="selectStep"
      @saveStep="saveStep"
      @close="assignModal=false"
    ></AssignDialog>
  </div>
</template>
<script>
import '@/views/pages/process/flow/topoComponent/index.js';
import {store, mutations} from './processdispatch/dispatchState.js';
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    DispatchCommon: resolve => require(['./processdispatch/dispatch-common.vue'], resolve),
    ValidDialog: resolve => require(['./processdispatch/workorder/valid-dialog.vue'], resolve),
    SubmitDialog: resolve => require(['./processdispatch/workorder/submit-dialog.vue'], resolve),
    AssignDialog: resolve => require(['./processdispatch/workorder/assign-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      taskLoading: true,
      isOrderLeftHide: true,
      isOrderRightHide: false,
      keyword: '',
      handler: 'omnipotent',
      channelUuid: null,
      processTaskId: null,
      fromProcessTaskId: null, //????????????id(??????)
      channelTypeRelationId: null, // ????????????id????????????
      copyProcessTaskId: null, //??????????????????
      draftData: {},
      disabledConfig: {
        submiting: false,
        saving: false
      },
      validCardOpen: false,
      isShowFlowmap: false, //???????????????
      flowmapConfig: {
        title: this.$t('term.process.viewflowchart'),
        width: 'medium',
        height: '600px',
        fullscreen: true,
        hasFooter: false,
        maskClose: true
      },
      channelList: [],
      validList: [],
      autoSaveKey: false, //????????????????????????????????????????????????????????????????????????
      timer: null,
      submitModel: false,
      assignModal: false,
      convenienceDetail: null,
      nextstepList: [],
      showDetailConfig: { //??????????????????/??????
        title: true,
        form: true,
        content: true,
        file: true,
        handlerStepInfo: true
      }
    };
  },
  beforeCreate() {},
  async created() {
    await this.getProfile();
    this.channelUuid = this.$route.query.uuid || null;
    this.processTaskId = this.$route.query.processTaskId || sessionStorage.getItem('processTaskId') || null;
    this.fromProcessTaskId = this.$route.query.fromProcessTaskId || null;
    this.channelTypeRelationId = this.$route.query.channelTypeRelationId || null;
    this.copyProcessTaskId = this.$route.query.copyProcessTaskId || null;
    await this.getChannel();
    this.getChannelInfo();
    this.$nextTick(() => {
      this.setTimer();
    });
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {
    sessionStorage.removeItem('processTaskId');
    this.clearObservable();
    this.clearTimer();
  },
  methods: {
    beforeLeaveCompare(oldData) {
      // ?????????????????????????????????
      let newData = this.$refs.dispatchCommon.getData();
      this.$delete(newData, 'formAttributeDataList');
      this.$delete(newData, 'hidecomponentList');
      this.$delete(newData, 'readcomponentList');
      this.$delete(oldData, 'formAttributeDataList');
      this.$delete(oldData, 'hidecomponentList');
      this.$delete(oldData, 'readcomponentList');
      return this.$utils.isSame(oldData, newData);
    },
    async beforeLeave() {
      //????????????????????????????????????'????????????'???????????????,
      return await this.save();
    },
    //?????????????????????
    async getProfile() {
      let data = {};
      await this.$api.framework.user.getProfile(data).then(res => {
        if (res.Status == 'OK') {
          let data = res.Return;
          data.forEach(item => {
            if (item.config) {
              item.config = JSON.parse(item.config);
            }
          });
          let list = data.find(d => d.moduleId == 'process');
          let obj = list.config.find(d => d.value == 'processtasksuccess');
          if (!this.$utils.isEmpty(obj)) {
            this.convenienceDetail = obj;
          }
        }
      });
    },
    getChannelInfo() {
      mutations.setShowDetailConfig(this.showDetailConfig);
      let param = {};
      this.taskLoading = true;
      this.channelUuid && Object.assign(param, {
        channelUuid: this.channelUuid
      });
      this.processTaskId && Object.assign(param, {
        processTaskId: this.processTaskId
      });
      this.fromProcessTaskId && Object.assign(param, {
        fromProcessTaskId: this.fromProcessTaskId
      });
      this.channelTypeRelationId && Object.assign(param, {
        channelTypeRelationId: this.channelTypeRelationId
      });
      this.copyProcessTaskId && Object.assign(param, {
        copyProcessTaskId: this.copyProcessTaskId
      });
      this.$api.process.process.getDraft(param).then(res => {
        if (res.Status == 'OK') {
          this.handler = res.Return.startProcessTaskStep.handler;
          this.draftData = res.Return;
          this.channelUuid = this.draftData.channelUuid;
          this.getInitData();
          if (res.Return.id) {
            this.autoSaveKey = true;
          }
        }
      }).finally(() => {
        this.taskLoading = false;
      });
    },
    getInitData() {
      this.initData = {
        channelUuid: this.channelUuid,
        title: this.draftData.title,
        tagList: this.draftData.tagList || [],
        focusUserUuidList: this.draftData.focusUserUuidList || []
      };
      if (!this.$utils.isEmpty(this.draftData.formConfig)) {
        this.$set(this.initData, 'hidecomponentList', []);
        this.$set(this.initData, 'readcomponentList', []);
      }
      if (this.draftData.hasOwnProperty('isNeedPriority') && this.draftData.isNeedPriority) {
        this.$set(this.initData, 'priorityUuid', this.draftData.priorityUuid);
      }
      if (this.draftData.owner) {
        this.$set(this.initData, 'owner', this.draftData.owner);
      } else {
        this.$set(this.initData, 'owner', 'user#' + this.$AuthUtils.getCurrentUser().uuid);
      }
      if (!this.$utils.isEmpty(this.draftData.startProcessTaskStep)) {
        if (this.handler === 'omnipotent') {
          if (this.draftData.startProcessTaskStep.comment) {
            let content = this.draftData.startProcessTaskStep.comment.content || '';
            let fileIdList = this.draftData.startProcessTaskStep.comment.fileIdList || [];
            this.$set(this.initData, 'content', content);
            this.$set(this.initData, 'fileIdList', fileIdList);
          }
        } else if (this.handler === 'changecreate') {
          let handlerStepInfo = {
            owner: null,
            planStartEndTime: null,
            autoStart: 1,
            startTimeWindow: null,
            endTimeWindow: null,
            content: null,
            fileIdList: [],
            fileList: [],
            changeTemplateId: null,
            changeStepList: [],
            paramDataMap: null
          };
          Object.keys(handlerStepInfo).forEach(key => {
            if (this.draftData.startProcessTaskStep.handlerStepInfo && this.draftData.startProcessTaskStep.handlerStepInfo.hasOwnProperty(key)) {
              handlerStepInfo[key] = this.draftData.startProcessTaskStep.handlerStepInfo[key];
            }
          });
          this.$set(this.initData, 'handlerStepInfo', handlerStepInfo);
        }
      }
      this.$addWatchData(this.initData);
    },
    getChannel(val) { //??????????????????
      let key = val || '';
      let data = {
        needPage: false,
        keyword: key,
        isAuthenticate: 1
      };
      return this.$api.process.service.searchService(data).then(res => {
        if (res.Status == 'OK') {
          this.channelList = res.Return.channelList;
        }
      });
    },
    updateMenu() {
      // ??????????????????
      this.$store.dispatch('leftMenu/getWorkCenterMenuData');
    },
    async lookSitemap() {
      //???????????????
      let data = await this.$api.process.processtask.stepFlowTop({ channelUuid: this.channelUuid }); //???????????????
      this.isShowFlowmap = true;
      this.sitemapFullscreen = false;
      if (data.Status == 'OK') {
        this.processConfig = data.Return.config;
        // this.flowmapConfig.title = '?????????' + this.processConfig.process.processConfig.name;
        this.initTopo(data.Return);
      }
    },
    initTopo(data) { //???????????????
      if (!data) return;
      let viewOpts = {
        'canvas.autoadjust': true, //???????????????
        'anchor.size': 4, //???????????????
        'link.deleteable': false,
        'link.selectable': false,
        'node.selectable': false,
        'node.dragable': false,
        'node.deleteable': false,
        'node.connectable': false
      };
      this.$nextTick(() => {
        var topodata = this.processConfig.topo || { nodes: startEndNode, links: [] };
        this.$topoVm = new Topo(this.$refs.topo, viewOpts);
        this.$topoVm.draw();
        topodata.links.forEach(link => { link.type = link.dirType || link.type; });
        this.$topoVm.fromJson(JSON.parse(JSON.stringify(topodata)));
        this.$topoVm.center(0);
        this.changeNodeStatus(data.processTaskStepList, data.processTaskStepRelList);
      });
    },
    changeNodeStatus(stepList, relList) { //????????????????????????????????????
      let allNodes = this.$topoVm.getNodes();
      let process = this.processConfig.process;
      let startUuid = process.stepList.find(s => s.handler == 'start').uuid;
      let startDispatchUuid = process.connectionList.find(c => c.fromStepUuid == startUuid).toStepUuid;
      let node = allNodes.find(a => a.getUuid() === startDispatchUuid);
      node.setFill('#2d84fb');
      node.setLoadingcolor('#fff');

      //????????????????????? ???????????????????????????????????????????????????????????????????????????????????????
      let allLinks = this.$topoVm.links;
      let startNodeUuid = allNodes.find(a => a.getType() === 'start');
      startNodeUuid = startNodeUuid ? startNodeUuid.getUuid() : null;
      startNodeUuid && allLinks.find(item => {
        if (item.getSource() == startNodeUuid) {
          item.setClass('linkPath success');
          return true;
        }
        return false;
      });
      relList.forEach(rel => {
        if (rel.isHit > 0) {
          let link = this.$topoVm.getLinkByUuid(rel.processStepRelUuid);
          link && link.setClass('linkPath success');
        }
      });
    },
    isTslayout() {
      this.isOrderLeftHide = !this.isOrderLeftHide;
      this.$nextTick(() => {
        this.isOrderRightHide = !this.isOrderLeftHide;
        if (this.channelUuid != null && document.getElementById(this.channelUuid)) {
          document.getElementById(this.channelUuid).scrollIntoView();
        }
      });
    },
    channelClick(item) {
      this.$router.replace({ query: { uuid: item.uuid } });
    },
    save() { //??????
      let _this = this;
      let workdata = this.$refs.dispatchCommon.getData();
      this.initData = this.$utils.deepClone(workdata);
      this.validList = [];
      this.validCardOpen = false;
      let titleValid = this.$refs.dispatchCommon.validTitle();
      if (!this.$utils.isEmpty(titleValid)) {
        this.validList.push(...titleValid);
        this.validCardOpen = true;
        return false;
      }
      if (this.processTaskId) {
        workdata.processTaskId = this.processTaskId;
      }
      if (this.fromProcessTaskId) {
        this.$set(workdata, 'fromProcessTaskId', this.fromProcessTaskId);
      }
      if (this.channelTypeRelationId) {
        this.$set(workdata, 'channelTypeRelationId', this.channelTypeRelationId);
      }
      
      return new Promise((resolve, reject) => {
        if (!this.disabledConfig.saving) {
          this.disabledConfig.saving = true;
          this.$api.process.processtask.save(workdata).then(res => {
            this.disabledConfig.saving = false;
            if (res.Status == 'OK') {
              let data = res.Return;
              _this.processTaskId = data.processTaskId;
              _this.processTaskStepId = data.processTaskStepId;
              sessionStorage.setItem('processTaskId', _this.processTaskId);
              resolve(data);
              _this.$Message.success(this.$t('page.saved', {target: this.$utils.getCurrenttime('HH:mm:ss')}));
              _this.autoSaveKey = true;
              _this.initData = _this.$refs.dispatchCommon.getData();
              _this.$addWatchData(_this.initData);
            }
          }).finally(() => {
            _this.disabledConfig.saving = false;
          });
        }
      });
    },
    async submitForm() { //??????
      this.validList = await this.$refs.dispatchCommon.valid();
      if (this.$utils.isEmpty(this.validList)) {
        this.startprocess();
      } else {
        this.validCardOpen = true;
      }
    },
    async startprocess() { //??????????????????
      try {
        var data = await this.save();
        //???????????????id??????????????????????????????
      } catch (err) {
        console.log(err);
      }
      this.$api.process.processtask.getNextStep(data).then(res => {
        let list = res.Return || [];
        if (list.length) {
          this.nextstepList = list;
          this.nextStepId = list[0].id;
          let assignableWorkerStepList = list[0].assignableWorkerStepList || [];
          if (list.length > 1 || assignableWorkerStepList.length > 0) {
            this.assignModal = true;
          } else {
            this.saveStep();
          }
        }
      });
    },
    saveStep(assignWorkerList) { //??????????????????
      if (!this.disabledConfig.submiting) {
        this.disabledConfig.submiting = true;
        this.disabledConfig.saving = true;
        let data = {
          processTaskId: this.processTaskId,
          nextStepId: this.nextStepId,
          assignWorkerList: assignWorkerList
        };
        this.$api.process.processtask.startprocess(data).then(res => {
          if (res.Status == 'OK') {
            this.updateMenu();
            this.assignModal = false;
            //?????????????????????????????????
            this.clearTimer();
            if (this.convenienceDetail && this.convenienceDetail.checked == '1') {
              this.submitModel = true;
            } else {
              let data = this.convenienceDetail.userProfileOperateList.find(d => d.checked == '1');
              let value = data.value;
              switch (value) {
                //??????????????????
                case 'backcataloglist':
                  this.$router.push({
                    path: '/catalog-overview'
                  });
                  break;
                //????????????
                case 'viewprocesstaskdetail':
                  this.viewWork();
                  break;
                //????????????
                case 'keeponcreatetask':
                  this.continueSubmit();
                  break;
              }
            }
          }
        }).catch((e) => {
          this.disabledConfig.submiting = false;
          this.disabledConfig.saving = false;
        });
      }
    },
    viewWork() {
      this.$router.push({
        path: '/task-detail',
        query: {
          processTaskId: this.processTaskId
        }
      });
    },
    //????????????
    continueSubmit() {
      this.$router.push({
        path: '/task-dispatch',
        query: {
          uuid: this.channelUuid,
          type: Date.now()
        }
      });
    },
    validItem(selector, item) { //??????????????????????????????
      if (item && item.showDetail) {
        this.showDetailConfig[item.showDetail] = true;
        mutations.setShowDetailConfig(this.showDetailConfig);
      }
      if (this.$el.querySelector(selector)) {
        document.querySelector(selector).scrollIntoView();
        if (selector === '#formPreview') {
          try {
            this.showDetailConfig.form = true;
            let errortips = document.querySelectorAll('.form-error-tip') || null;
            let errtop = 0;
            let offsetp = this.$el.querySelector('.workorder-main');
            //????????????????????????100ms
            setTimeout(() => {
              if (errortips && errortips.length > 0) {
                try {
                  errortips.forEach(err => {
                    errtop = err.getBoundingClientRect().top;
                    throw Error('?????????????????????');
                  });
                } catch (err) {
                // console.log(err);
                }
                if (offsetp) {
                  offsetp.scrollTo({
                    top: errtop - offsetp.getBoundingClientRect().top + offsetp.scrollTop - 40
                  });
                }
              }
            }, 100);
          } catch (e) {
            console.log(e);
          }
        }
      } else if (selector === '#base') {
        this.isOrderRightHide = false;
        this.isOrderLeftHide = true;
      }
    },
    selectStep(id) {
      this.nextStepId = id;
    },
    rightSiderToggle() {
      this.isOrderRightHide = !this.isOrderRightHide;
      if (!this.isOrderRightHide) {
        this.isOrderLeftHide = true;
      }
    },
    setTimer() {
      this.timer = setInterval(() => { 
        let isSame = this.beforeLeaveCompare(this.initData);
        if (this.autoSaveKey && !isSame) {
          this.save();
        } else {
          return;
        }
      }, 30000);
    },
    clearObservable() { //???????????????????????????
      store.showDetailConfig = {}; 
    },
    clearTimer() {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  filter: {},
  computed: {},
  watch: {},
  beforeRouteUpdate(to, from, next, url) {
    if (!this.beforeLeaveCompare(this.initData)) {
      let _this = this;
      this.$utils.jumpDialog.call(
        this,
        {
          save: {
            fn: async vnode => {
              return await _this.save();
            }
          }
        },
        to,
        from,
        next,
        url
      );
    } else {
      next();
    }
  }
};
</script>
<style lang="less" scoped>
.dispatch {
  .channel-list {
    position: relative;
    margin-top: 8px;
    height: calc(100vh - 38px - 32px - 120px);
    ul {
      height: 100%;
      overflow-y: auto;
      padding-right: 16px;
    }
    li {
      width: 100%;
      height: 36px;
      line-height: 36px;
      margin-bottom: 4px;
      padding: 0 16px;
      cursor: pointer;
    }
  }
}  
</style>
