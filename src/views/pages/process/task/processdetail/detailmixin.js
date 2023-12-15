import dealFormMix from '@/views/pages/process/task/taskcommon/dealNewFormData.js';
export default {
  mixins: [dealFormMix],
  props: {
    isShowTaskList: {
      type: Boolean,
      default: false
    },
    processTask: Object, //工单信息
    actionList: Array, //按钮权限列表
    isMoreStep: Boolean, //是否有可处理的步骤
    defaultStartList: Array, //可处理的步骤列表
    initProcessTaskStepId: [String, Number],
    replaceableTextConfig: Object //文案替换
  },
  data() {
    return {
      prevPath: {
        router: '/task-overview',
        name: this.$t('term.process.workordercenter')
      },
      startHandler: 'omnipotent', //开始节点的类型：omnipotent(普通节点)、changecreate(变更创建)
      handler: 'omnipotent', //处理节点类型
      medium: 'medium', // 弹窗的宽度
      taskLoading: true,
      pocesstaskview: false, //查看权限
      processTaskId: null, //工单id
      processTaskStepId: null, //步骤id
      processTaskConfig: {}, //所有基本信息
      processTaskStepConfig: null, //步骤基本信息
      formConfig: {}, //场景表单数据
      sitemapTitle: this.$t('term.process.viewflowchart'), //流程图弹框名称
      processConfig: null, //流程图数据
      lookSitemapModel: false, //流程图显示隐藏
      tsDialoglookSitemap: {//流程图显示隐藏
        type: 'modal',
        maskClose: false,
        isShow: false
      },
      stepTooltip: null,
      tooltipStyle: {
        position: 'absolute',
        left: 0,
        top: 0
      },
      sitemapFullscreen: false, //流程图弹框全屏
      // stepStatusList: [], //流程图状态列表展示
      isNextTask: false, //判断下一步骤
      startProcessTaskStep: null, //上报内容
      draftData: '', //暂存数据
      isEditTitle: false, //是否编辑标题
      isStepRequired: 0, //回复是否必填
      stepDialogClass: 'task-step', //弹框样式
      timer: null, //定时器
      leftWidth: 280,
      isOrderRight: false, //是否展示右侧基本信息（接口控制isShowBaseInfo：1展示，0不展示）
      isOrderLeft: false,
      transferModal: false, //转交弹框
      transferContent: '', //转交原因
      assistModal: false, //子任务弹框
      completeModal: false, //流转弹框
      nextStepList: [], //流转任务列表
      selectStepConfig: null, //选择流转节点
      retreatModal: false, //撤回弹框
      backStepList: [], //回退列表
      selectBackConfig: null,
      backModal: false,
      startModal: false,
      startId: null,
      startList: [],
      isEdit: false, //子任务编辑
      processTaskStepSubtaskId: null, //子任务id
      assistList: [
        {
          //添加子任务
          isDefault: false,
          type: 'userselect',
          name: 'workerList',
          label: this.$t('term.process.dealwithuser'),
          value: [],
          width: '100%',
          groupList: ['user'],
          multiple: false,
          validateList: ['required']
        },
        {
          type: 'datetime',
          name: 'targetTime',
          value: '',
          width: '100%',
          label: this.$t('term.process.targettime'),
          valueType: 'timestamp',
          transfer: true
        },
        {
          type: 'ckeditor',
          name: 'content',
          width: '100%',
          value: '',
          label: this.$t('page.description'),
          validateList: ['required']
        }
      ],
      assignableWorkerStepList: [], //需指派的步骤列表
      assignTitle: this.$t('term.process.assigntitle'),
      assignModal: false,
      assignGroupList: ['user', 'team', 'role'],
      nestStepId: null, //下一个节点id
      validCardOpen: false, //校验
      validList: [], //校验列表展示
      valieTypeStyle: [
        {
          icon: 'tsfont-close-o',
          iconColor: '#FF625A',
          type: 'error'
        },
        {
          icon: 'tsfont-check-o',
          iconColor: '#81D655',
          type: 'success'
        }
      ],
      validateList: ['required'],
      completeList: [
        //流转
        // {
        //     type: "slot",
        //     name: "step"
        // },
        {
          type: 'ckeditor',
          name: 'content',
          value: '',
          width: '100%',
          label: this.$t('page.reason'),
          validateList: ['required']
        }
      ],
      backList: [
        //回退回复
        {
          type: 'slot',
          name: 'step'
        },
        {
          type: 'ckeditor',
          name: 'content',
          value: '',
          width: '100%',
          label: this.$t('page.reply'),
          validateList: ['required']
        }
      ],
      retreatConfig: [
        {
          //撤回步骤
          type: 'slot',
          name: 'processTaskStepId',
          label: this.$t('term.process.processsteplist'),
          validateList: ['required'],
          value: ''
        },
        {
          //撤回回复
          type: 'ckeditor',
          name: 'content',
          value: '',
          label: this.$t('page.reply'),
          width: '100%',
          validateList: ['required']
        }
      ],
      retreatList: null, //可撤回步骤列表
      retreatId: '', //撤回步骤id
      formEdit: false, //表单是否有编辑权限，查看模式肯定没有
      showActive: false,
      actionConfig: {
        //当前权限按钮展示
        start: null, //开始
        accept: null,
        update: null, //修改上报内容
        abortprocessTask: null, //终止||取消
        recoverprocessTask: null, //恢复
        complete: null, //完成||流转
        retreat: null, //撤回
        save: null, //暂存
        transfer: null, //转交
        comment: null, //回复
        createsubtask: null, //创建子任务
        back: null, //回退
        pocesstaskview: null, //查看工单权限
        urge: null, //催办
        pause: null, //暂停工单步骤
        recover: null, // 恢复工单步骤
        tranferreport: null, // 转报
        copyprocesstask: null, //复制上报
        redo: null, //评分之前回退
        markrepeat: null, // 标记重复事件
        reapproval: null, // 重审
        createtask: null //创建任务（新的子任务）
      },
      disabledConfig: { //禁止按钮连续调用接口
        starting: false, //开始
        accepting: false,
        saving: false, //暂存
        transferring: false, //转交
        pausing: false, //暂停
        recoverstep: false, //恢复步骤
        focusing: false, //关注
        retreating: false, //撤回
        subtasking: false, //子任务
        aborting: false, //取消工单
        recovertask: false, //恢复工单
        urging: false, //催办
        backing: false, //回退
        completing: false, //流转
        reapproval: false // 重审
      },
      sessionName: 'task-detail',
      tabValue: 'report', //默认展示tab：当前节点信息（上报信息、步骤信息）
      processTaskStepRemindList: [], //顶部提示
      priorityList: [], //当前服务优先级列表
      isDisableCommet: false
    };
  },
  created() {
    this.processTaskId = parseInt(this.$route.query.processTaskId);
    this.processTaskStepId = this.initProcessTaskStepId;
  },
  mounted() {
    let prevItem = sessionStorage.getItem('taskdetailPrev');
    if (prevItem) {
      let prevsetting = JSON.parse(prevItem);
      if (prevsetting.router != '/') {
        if (prevsetting.router.indexOf('/task-overview-') < 0) {
          sessionStorage.removeItem('taskdetailPrev');
        } else {
          this.prevPath = prevsetting;
          return;
        }
      }
    }
    if (this.allClassifyData && this.allClassifyData.length) {
      this.prevPath = {
        router: '/task-overview-' + this.allClassifyData[0].uuid,
        name: this.$t('term.process.workordercenter')
      };
    }
  },
  destroyed() {
 
  },
  beforeDestroy() { 
    sessionStorage.removeItem('taskdetailPrev');
  },
  methods: {
    //初始化数据
    getAllData() {
      this.getTaskActionObj();
      if (this.actionConfig.pocesstaskview) {
        if (this.processTaskStepId) {
          this.formEdit = true;
        } else {
          this.formEdit = false;
          if (this.isMoreStep) {
            this.initStartList();
          }
        }
        this.getConmmonData();
        // this.getStepStatus();
      } else {
        this.taskLoading = false;
        this.pocesstaskview = true;
      }
    },
    getConmmonData() { //获取工单和步骤信息接口
      this.processTaskConfig = this.processTask;
      if (this.processTaskConfig.hasOwnProperty('isShowBaseInfo')) {
        //默认是否展示基本信息
        this.isOrderRight = !!this.processTaskConfig.isShowBaseInfo;
        if ((this.isOrderRight && window.innerWidth <= 1280) || this.isOrderLeft) {
          this.isOrderRight = false;
        }
      }
      if (this.processTaskConfig.formConfig) {
        let formSceneUuid = this.processTaskConfig.currentProcessTaskStep ? this.processTaskConfig.currentProcessTaskStep.formSceneUuid : null;
        this.formConfig = this.processTaskConfig.formConfig; //主表单
        if (this.formConfig._type == 'new' && !this.$utils.isEmpty(this.processTask.currentProcessTaskStep)) {
          //场景表单：步骤进行中展示设置的节点场景或者默认场景
          this.formConfig = this.initNewFormConfig(formSceneUuid, this.formConfig);
        }
      }
      if (this.processTaskConfig.startProcessTaskStep) {
        this.startProcessTaskStep = this.processTaskConfig.startProcessTaskStep;
        this.startHandler = this.startProcessTaskStep.handler;
      }
      if (this.processTask.currentProcessTaskStep) {
        this.handler = this.processTask.currentProcessTaskStep.handler;
        this.processTaskStepConfig = this.processTaskConfig.currentProcessTaskStep;
        this.isStepRequired = this.processTaskStepConfig.isRequired;
        this.processTaskStepRemindList = this.processTaskStepConfig.processTaskStepRemindList || [];
        if (this.formConfig._type != 'new') {
          if (this.processTaskStepConfig.formAttributeActionMap) {
            let formAttributeActionMap = this.processTaskStepConfig.formAttributeActionMap;
            this.formConfig.controllerList.forEach(formItem => {
              if (formAttributeActionMap[formItem.uuid] && formAttributeActionMap[formItem.uuid] == 'read') {
                this.$set(formItem, 'isReadonly', true);
              }
              if (formAttributeActionMap[formItem.uuid] && formAttributeActionMap[formItem.uuid] == 'hide') {
                this.$set(formItem, 'isHide', true);
              }
            });
          }
        }
    
        if (this.processTaskStepConfig.forwardNextStepList) {
          // 流转步骤
          this.nextStepList = this.processTaskStepConfig.forwardNextStepList;
          if (this.nextStepList.length > 1) {
            this.selectStepConfig = this.nextStepList[0];
          }
          this.nextStepList.length && this.selecStep(this.nextStepList[0]);
        }
        if (this.processTaskStepConfig.backwardNextStepList) {
          //回退步骤
          this.backStepList = this.processTaskStepConfig.backwardNextStepList;
          this.selectBackConfig = this.backStepList[0];
        }
      }
      if (!this.processTaskConfig.hasOwnProperty('isNeedPriority') || (this.processTaskConfig.hasOwnProperty('isNeedPriority') && this.processTaskConfig.isNeedPriority)) {
        this.getPriority();
      }
      this.getMessage();
      this.taskLoading = false;
    },
    onFull() {
      if (this.medium === 'medium') {
        this.medium = '100%';
      } else {
        this.medium = 'medium';
      }
    },
    toTask(taskId, taskStepId) {
      //刷新
      this.$router.push({
        path: '/task-detail',
        query: {
          processTaskId: taskId,
          processTaskStepId: taskStepId,
          type: Date.now()
        }
      });
      this.$emit('updateMenu');
    },
    getTaskActionObj() {
      //操作权限
      this.actionList.forEach(item => {
        for (let j in this.actionConfig) {
          if (j == item.value) {
            this.actionConfig[j] = item.text;
            if (j == 'save') {
              //当有保存按钮时才需要定时保存
              this.setTimer();
            }
          }
        }
      });
    },
    setTimer() {
      let _this = this;
      _this.timer = setInterval(() => {
        _this.saveTask();
      }, 30000);
    },
    isTslayout() {
      this.isOrderLeft = !this.isOrderLeft;
      if (this.isOrderLeft) {
        if (this.isOrderRight) {
          this.isOrderRight = false;
        } else {
          this.updateFormWidth();
        }
      } else {
        this.isOrderRight = true;
      }
      this.$store.commit('leftTaskMenu/setIsShowTaskList', this.isOrderLeft);
      this.$emit('getTastHeight', this.isOrderLeft);
    },
    //修改工单标题
    editTitle() {
      this.isEditTitle = true;
    },
    changeTitle(val) { //标题与上报页保持一致，只校验不为空（客户要求）
      if (val != '' && this.processTaskConfig.title != val) {
        let data = {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId,
          title: val
        };
        this.$api.process.processtask.updateWorkData(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.processTaskConfig.title = val;
            this.isEditTitle = false;
            this.$refs.TaskCenterDetail.getActivityList();
          }
        });
      } else {
        this.isEditTitle = false;
      }
    },
    // getProcessConfig() {
    //   //上报获取流程图信息
    //   let data = {
    //     processTaskId: this.processTaskId
    //   };
    //   this.$api.process.processtask.getTaskMessage(data).then(res => {
    //     if (res.Status == 'OK') {
    //       this.processTaskConfig = res.Return.processTask;
    //       let processConfig = JSON.parse(this.processTaskConfig.config);
    //       this.processConfig = processConfig;
    //     }
    //   });
    // },
    async lookSitemap() {
      //查看流程图
      let data = await this.$api.process.processtask.stepFlowTop({ processTaskId: this.processTaskId }); //绘制流程图
      this.lookSitemapModel = true;
      this.tsDialoglookSitemap.isShow = true;
      this.sitemapFullscreen = false;
      if (data.Status == 'OK') {
        this.processConfig = data.Return.config;
        // this.sitemapTitle = '流程图';// + this.processConfig.process.processConfig.name;
        this.initTopo(data.Return);
      }
    },
    //注释原因，可以通this.$api.process.processtask.stepFlowTop这个接口拿取所有数据
    // getStepStatus() {
    //   //流程图数据
    //   let data = {
    //     processTaskId: this.processTaskId
    //   };
    //   this.$api.process.processtask.stepStatus(data).then(res => {
    //     if (res.Status == 'OK') {
    //       this.stepStatusList = res.Return;
    //     }
    //   });
    // },
    initTopo(data) {
      //获取流程图
      let Vm = this;
      let viewOpts = {
        'canvas.autoadjust': true, //显示辅助线
        'anchor.size': 4, //连接点大小
        'link.deleteable': false,
        'link.selectable': false,
        'node.selectable': false,
        'node.dragable': false,
        'node.deleteable': false,
        'node.connectable': false,
        'node.mouseenterFn': function(vm) {
          let top = Vm.$topoVm.positionTransform({x: vm.getX() + vm.getWidth() + 20, y: vm.getY()}, 'apply');
          Vm.stepTooltip = vm.stepDate;
          if (!vm.stepDate) return;
          Vm.stepTooltip.className = 'tipright';
          Vm.tooltipStyle.top = top.y + 'px';
          Vm.tooltipStyle.left = top.x + 'px';
        },
        'node.mouseleaveFn': function(vm) {
          Vm.stepTooltip = null;
        }
      };
      this.$nextTick(() => {
        var topodata = this.processConfig.topo || { nodes: startEndNode, links: [] };
        this.$topoVm = new Topo(this.$refs.isLookSitemap.$refs.topo, viewOpts);
        // this.$topoVm = new Topo(this.$refs.topo, viewOpts);
        this.$topoVm.draw();
        topodata.links.forEach(link => { link.type = link.dirType || link.type; });
        this.$topoVm.fromJson(JSON.parse(JSON.stringify(topodata)));
        this.$topoVm.center(0);
        this.changeNodeStatus(data.processTaskStepList, data.processTaskStepRelList);
      });
    },
    changeNodeStatus(stepList, relList) { //改变节点和连线的颜色状态
      //节点的改变
      let allNodes = this.$topoVm.getNodes();
      stepList.forEach(d => {
        let node = allNodes.find(a => a.getUuid() === d.processStepUuid);
        if (d.handler == 'end' || d.handler == 'start') {
          return;
        }
        if (d.status != 'running') {
          node.setFill(d.statusVo.color);
          node.setStroke(d.statusVo.color);
          node.setIconcolor('#fff');
        } else {
          node.setFill(d.statusVo.color);
          node.setLoadingcolor('#fff');
        }
        node.stepDate = d;
      });

      //连线的颜色改变 ，开始节点的连线需要额外操作，因为接口不返回对应的连线信息
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
        } else if (rel.isHit < 0) { //不会激活的节点
          let errorLink = this.$topoVm.getLinkByUuid(rel.processStepRelUuid);
          errorLink && errorLink.setClass('linkPath error');
        }
      });
    },
    update(data) {
      if (data) {
        this.draftData = this.$utils.deepClone(data);
      }
    },
    isDraftData(to, from, next, url) { //路由跳转比较对比  父组件beforeRouterLeave调用
      let _this = this;
      if (_this.actionConfig.save && _this.$refs.TaskCenterDetail) {
        let draftData = _this.$refs.TaskCenterDetail.getData();
        let isSame = _this.$utils.isSame(_this.draftData, draftData);
        if (isSame || _this.draftData == '') {
          // 没有改变
          url ? this.$utils.gotoHref(url) : next();
        } else {
          this.$utils.jumpDialog.call(this, {
            save: {//保存数据
              fn: async(vnode) => {
                return await _this.saveTaskData(true);
              }
            }
          }, to, from, next, url);
        }
      } else {
        url ? this.$utils.gotoHref(url) : next();
      }
    },
    isDataChangeSwitchTsak() { // 切换任务列表时，对比数据是否变化
      let draftData = this.$refs.TaskCenterDetail ? this.$refs.TaskCenterDetail.getData() : '';
      let isSame = this.$utils.isSame(this.draftData, draftData);
      let isDataChange = false;
      if (isSame || this.draftData == '') {
        isDataChange = false;
      } else {
        isDataChange = true;
      }
      return isDataChange;
    },
    updateAllData() {
      this.wipeData();
      this.getAllData();
    },
    saveTask(val) {
      //暂存 数据对比
      let _this = this;
      if (_this.$refs.TaskCenterDetail) {
        let draftData = _this.$refs.TaskCenterDetail.getData();
        let isSame = this.$utils.isSame(_this.draftData, draftData);
        if (!isSame) {
          // 有改变
          _this.saveTaskData(val);
          _this.draftData = _this.$utils.deepClone(draftData);
        }
      }
    },
    saveTaskData(val) {
      //暂存 保存
      let _this = this;
      let data = _this.$refs.TaskCenterDetail.getData();
      return new Promise((resolve, reject) => {
        let isTime = val || false;
        if (_this.$refs.eventConfig) {
          let eventConfig = _this.$refs.eventConfig.getEventData();
          _this.$set(data, 'content', eventConfig.content);
          _this.$set(data, 'fileIdList', eventConfig.fileIdList);
          _this.$set(data, 'handlerStepInfo', eventConfig.handlerStepInfo);
        }
        if (_this.startHandler != 'changecreate' && _this.handler == 'changecreate') {
          let handlerStepInfo = {};
          if (_this.$refs.changecreateData) {
            let changecreateInfo = _this.$refs.changecreateData.getChangecreateData();
            Object.assign(handlerStepInfo, changecreateInfo);
          }
          if (_this.$refs.changeStepList) {
            let stepData = _this.$refs.changeStepList.saveChangeStepData();
            Object.assign(handlerStepInfo, stepData);
          }
          _this.$set(data, 'handlerStepInfo', handlerStepInfo);
        }
        if (!_this.disabledConfig.saving) {
          _this.disabledConfig.saving = true;
          this.$api.process.processtask.saveTaskDetail(data).then(res => {
            _this.disabledConfig.saving = false;
            if (res.Status == 'OK') {
              _this.draftData = _this.$utils.deepClone(data);
              _this.auditId = res.Return;
              if (!isTime) {
                this.$Message.success(this.$t('page.saved', { target: _this.$utils.getCurrenttime('HH:mm:ss') }));
              }
              resolve(res);
            }
          }).catch(error => {
            _this.disabledConfig.saving = false;
          });
        }
      });
    },
    assignOk() {
      let isSave = true;
      for (let i = 0; i < this.assignableWorkerStepList.length; i++) {
        if (this.assignableWorkerStepList[i].isRequired == 1 && !this.assignableWorkerStepList[i].value.length) {
          isSave = false;
          this.$Notice.error({
            title: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.stepuser')}),
            duration: 1.5
          });
          break;
        }
      }
      if (isSave) {
        this.saveCompleData();
      }
    },
    transferTask() {
      //转交
      this.transferContent = this.$refs.TaskCenterDetail.getTaskStepContent();
      this.transferModal = true;
    },
    //回退
    backTask() {
      let val = this.$refs.TaskCenterDetail ? this.$refs.TaskCenterDetail.getTaskStepContent() : null;
      this.backList.forEach(item => {
        if (item.name == 'content') {
          item.value = val;
        }
      });
      this.backModal = true;
    },
    async backOk() {
      if (!this.disabledConfig.backing) {
        let backForm = this.$refs.backForm;
        if (backForm.valid()) {
          this.disabledConfig.backing = true;
          await this.saveTaskData(true);
          let obj = backForm.getFormValue();
          let data = {
            processTaskId: this.processTaskId,
            processTaskStepId: this.processTaskStepId,
            nextStepId: this.selectBackConfig.id,
            content: obj.content,
            action: 'back'
          };
          this.$api.process.processtask.complete(data).then(res => {
            this.disabledConfig.backing = false;
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              this.backModal = false;
              this.toTask(this.processTaskId);
            }
          }).catch(error => {
            this.disabledConfig.backing = false;
          });
        }
      }
    },
    cancelTask() {
      //取消工单
      this.$emit('operation', 'abortprocessTask');
    },
    recoverTask() {
      //恢复
      this.$emit('operation', 'recoverprocessTask');
    },
    updateFocus() {
      // 工单关注
      if (!this.disabledConfig.focusing) {
        this.disabledConfig.focusing = true;
        this.processTaskConfig.isFocus = this.processTaskConfig.isFocus ? 0 : 1;
        const params = {
          processTaskId: this.processTaskId,
          isFocus: this.processTaskConfig.isFocus
        };
        this.$api.process.processtask.updateFocus(params).then(res => {
          this.disabledConfig.focusing = false;
          if (res.Status === 'OK') {
            this.processTaskConfig.isFocus = res.Return.isFocus;
            this.$Message.success(this.$t('message.executesuccess'));
            this.updateFocusUser();
          }
        }).catch(error => {
          this.disabledConfig.focusing = false;
          this.processTaskConfig.isFocus = this.processTaskConfig.isFocus ? 0 : 1;
        });
      }
    },
    addAssist(obj, isEdit) {
      //添加子任务
      this.isEdit = isEdit || false;
      if (obj) {
        this.processTaskStepSubtaskId = obj.id;
        this.assistList.forEach(item => {
          if (item.name == 'workerList' && obj.userUuid) {
            item.value = 'user#' + obj.userUuid;
          }
          if (item.name == 'targetTime' && obj.targetTime) {
            item.value = obj.targetTime;
          }
          if (item.name == 'content' && obj.content) {
            item.value = obj.content;
          }
        });
      } else {
        this.assistList.forEach(item => {
          item.value = null;
        });
      }
      this.assistModal = true;
    },
    assistOk() {
      //子任务确认
      let _this = this;
      if (!_this.disabledConfig.subtasking) {
        let assistForm = _this.$refs.assistForm;
        if (assistForm.valid()) {
          _this.disabledConfig.subtasking = true;
          let assistList = assistForm.getFormValue();
          if (_this.isEdit) {
            _this.$set(assistList, 'processTaskStepSubtaskId', _this.processTaskStepSubtaskId);
            this.$api.process.processtask.subEditable(assistList).then(res => {
              _this.disabledConfig.subtasking = false;
              if (res.Status == 'OK') {
                _this.isEdit = false;
                _this.assistList.forEach(item => {
                  item.value = '';
                });
                _this.toTask(_this.processTaskId, _this.processTaskStepId);
              }
            }).catch(error => {
              _this.disabledConfig.subtasking = false;
            });
          } else {
            _this.$set(assistList, 'processTaskStepId', _this.processTaskStepId);
            this.$api.process.processtask.createSubtask(assistList).then(res => {
              _this.disabledConfig.subtasking = false;
              if (res.Status == 'OK') {
                _this.toTask(_this.processTaskId, _this.processTaskStepId);
              }
            }).catch(error => {
              _this.disabledConfig.subtasking = false;
            });
          }
          _this.assistModal = false;
        }
      }
    },
    retreatTaskStep() {
      //撤回按钮,默认选中第一个步骤
      //回显步骤评论？？？
      //let val = this.$refs.TaskCenterDetail.getTaskStepContent();
      let _this = this;
      _this.$api.process.processtask.getRetreatlist(_this.processTaskId).then(res => {
        if (res.Status == 'OK') {
          _this.retreatList = res.Return || [];
          _this.retreatList.forEach((re, index) => {
            if (index == 0) {
              _this.retreatId = re.id;
            }
          });
          _this.retreatModal = true;
        }
      });
    },
    retreatOk() {
      //撤回确认
      if (!this.disabledConfig.retreating) {
        let retreatForm = this.$refs.retreatForm;
        if (retreatForm.valid()) {
          let formList = retreatForm.getFormValue();
          this.$set(formList, 'processTaskStepId', this.retreatId);
          this.$set(formList, 'processTaskId', this.processTaskId);
          this.disabledConfig.retreating = true;
          this.$api.process.processtask.retreatTask(formList).then(res => {
            this.disabledConfig.retreating = false;
            if (res.Status == 'OK') {
              this.toTask(this.processTaskId);
              this.retreatModal = false;
            }
          }).catch(error => {
            this.disabledConfig.retreating = false;
          });
        }
      }
    },
    retreatStep(item) {
      //选择撤回步骤
      this.retreatId = item.id;
    },
    validItemClick(selector, tabValue) {
      this.$refs.TaskCenterDetail.tabValue = tabValue;
      if (selector && selector == '#form') {
        this.$refs.TaskCenterDetail.isShowForm = false;
        this.$nextTick(() => {
          this.$refs.TaskCenterDetail.isShowForm = true;
        });
      }
      if (this.$el.querySelector(selector)) {
        // document.querySelector(selector).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }); 
        document.querySelector(selector).scrollIntoView();
      } else if (selector == '#priority') {
        this.isOrderLeft = false;
        this.isOrderRight = true;
        let isShow = !this.isOrderRight;
        this.$store.commit('leftTaskMenu/setIsShowTaskList', isShow);
        this.$emit('getTastHeight', this.isOrderLeft);
        this.$nextTick(() => {
          document.querySelector(selector) && document.querySelector(selector).scrollIntoView();
        });
      }
    },
    selecStartStep(item) {
      this.startId = item.id;
      this.startOk();
    },
    startTaskStep(type) {
      //开始按钮
      let disableType = type + 'ing';
      if (!this.disabledConfig[disableType]) {
        this.disabledConfig[disableType] = true;
        let data = {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId,
          action: type
        };
        this.$api.process.processtask.startTask(data).then(res => {
          this.disabledConfig[disableType] = false;
          if (res.Status == 'OK') {
            this.toTask(this.processTaskId, this.processTaskStepId);
          }
        }).catch(error => {
          this.disabledConfig[disableType] = false;
        });
      }
    },
    initStartList() {
      this.startList = this.defaultStartList;
      if (this.startList.length > 0) {
        this.startId = this.startList[0].id;
        this.startModal = true;
      }
    },
    // getStartList(action) { //后期需要开始处理按钮时可用
    //   //开始处理按钮
    //   let isAction = action || null;
    //   let data = {
    //     processTaskId: this.processTaskId,
    //     action: isAction
    //   };
    //   this.$api.process.processtask.getNextsteplist(data).then(res => {
    //     if (res.Status == 'OK') {
    //       this.startList = res.Return;
    //       if (this.startList.length > 0) {
    //         this.startId = this.startList[0].id;
    //         if (isAction != null) {
    //           if (this.startList.length == 1) {
    //             this.startOk(true);
    //           }
    //           if (this.startList.length > 1) {
    //             this.startModal = true;
    //           }
    //         } else {
    //           if (this.startList.length == 1) {
    //             this.toTask(this.processTaskId, this.startId);
    //           }
    //           if (this.startList.length > 1) {
    //             this.startModal = true;
    //           }
    //         }
    //       }
    //     }
    //   });
    // },
    startOk(isStart) {
      //选择步骤，确认处理
      this.processTaskStepId = this.startId;
      if (isStart) {
        let data = {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId
        };
        this.$api.process.processtask.startTask(data).then(res => {
          if (res.Status == 'OK') {
            this.toTask(this.processTaskId, this.processTaskStepId, 'start');
          }
        });
      } else {
        this.toTask(this.processTaskId, this.processTaskStepId);
      }

      this.startModal = false;
    },
    userList(arr, type) {
      //处理人
      let userList = arr;
      let textList = [];
      userList.forEach(item => {
        if (type == 'minorUser') { //处理人
          textList.push(item.userVo.name);
        } else if (type == 'worker') { //待处理人
          textList.push(item.name);
        }
      });
      textList = textList.join('、');
      return textList;
    },
    wipeData() {
      //切换任务前清空当前数据
      let _this = this;
      _this.formConfig = {};
      clearInterval(_this.timer);
      _this.timer = null;
      _this.isNextTask = true;
      _this.draftData = '';
      for (let index in _this.actionConfig) {
        _this.actionConfig[index] = null;
      }
    },
    updateFocusUser() { //更新工单关注人
      this.getCurrentFocususerList();
      return this.$refs.TaskCenterDetail.getActivityList();
    },
    selecStep(obj, type) { //选择步骤
      this.assignableWorkerStepList = [];
      if (type && type == 'back') {
        this.selectBackConfig = obj;
      } else {
        this.selectStepConfig = obj;
        this.assignableWorkerStepList = obj.assignableWorkerStepList || [];
        if (this.assignableWorkerStepList.length > 0) {
          this.assignableWorkerStepList.forEach(a => {
            this.$set(a, 'value', []);
          });
        }
      }
    },
    async completeStep(obj) {
      //单个节点流转
      this.nestStepId = obj.id;
      this.selectStepConfig = obj;
      this.assignableWorkerStepList = obj.assignableWorkerStepList || [];
      let isComplete = await this.taskValid();
      if (isComplete) {
        await this.saveTaskData(true);
        if (this.assignableWorkerStepList.length > 0) {
          this.assignModal = true;
        } else {
          this.saveCompleData();
        }
      }
    },
    urgeTask() {
      //催办
      if (!this.disabledConfig.urging) {
        this.disabledConfig.urging = true;
        let data = {
          processTaskId: this.processTaskId
        };
        this.$api.process.processtask.urgeProcesssTask(data).then(res => {
          this.disabledConfig.urging = false;
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        }).catch(error => {
          this.disabledConfig.urging = false;
        });
      }
    },
    pauseStep() {
      //暂停工单步骤
      this.$emit('operation', 'pause');
    },
    recoverStep() {
      //恢复工单步骤
      this.$emit('operation', 'recover');
    },
    //转报
    openRanferreport() {
      this.ranferreportModel = true;
    },
    // 复制上报
    copyProcessTask() {
      window.open(HOME + '/process.html#/task-dispatch?copyProcessTaskId=' + this.processTaskId, '_blank');
    },
    //单独获取该工单的关注人列表
    getCurrentFocususerList() {
      let param = {
        processTaskId: this.processTaskId
      };
      this.$api.process.processtask.getCurrentFocususerList(param).then(res => {
        if (res && res.Status == 'OK') {
          Object.assign(this.processTaskConfig, {
            focusUserUuidList: res.Return.focusUserUuidList || [],
            isFocus: res.Return.isFocus || false
          });
        }
      });
    },
    updateActiveStep(item) {
      //优先级
      if (item && item.priority) {
        this.$set(this.processTaskConfig, 'priority', item.priority);
      }
      if (item && item == 'updateFocusUser') { //关注人
        this.updateFocusUser();
      }
      //更新活动和步骤
      this.$refs.TaskCenterDetail && this.$refs.TaskCenterDetail.updateStepActive();
    },
    async reapprovalTask() { //重审
      if (!this.disabledConfig.reapproval) {
        let isValid = this.taskValid();
        if (isValid) {
          await this.saveTaskData(true);
          this.disabledConfig.reapproval = true;
          let data = {
            processTaskId: this.processTaskId,
            processTaskStepId: this.processTaskStepId

          };
          this.$api.process.processtask.reapprovalTask(data).then(res => {
            if (res.Status == 'OK') {
              this.toTask(this.processTaskId);
            }
          }).catch(error => {
            this.disabledConfig.reapproval = false;
          });
        }
      }
    },
    rightSiderToggle() {
      this.isOrderRight = !this.isOrderRight;
      if (this.isOrderRight) {
        this.isOrderLeft = false;
      }
      localStorage.setItem('isOrderRight', this.isOrderRight);
    },
    // 校验
    async taskValid() {
      this.validList = [];
      this.validCardOpen = false;
      let isComplete = true;
      if (this.handler == 'changecreate') {
        let changeValidList = [];
        if (this.startHandler == 'changecreate') { //如果上报节点是变更创建，则校验上报信息
          changeValidList = this.$refs.TaskCenterDetail.changeValid();
        } else {
          changeValidList = this.changeValid();
        }
        if (changeValidList.length == 0) {
          let o = Object.assign({}, this.validTypeList[0]);
          o.focus = '#changeInfo';
          o.msg = this.$t('message.process.success', { target: this.$t('term.process.changeinfor')});
          this.validList.push(o);
        } else {
          let o = Object.assign({}, this.validTypeList[1]);
          changeValidList.forEach(e => {
            let o = Object.assign(e, this.validTypeList[1]);
            this.validList.push(o);
          });
          this.validCardOpen = true;
          isComplete = false;
        }
      }
      //校验表单
      if (JSON.stringify(this.formConfig) != '{}') {
        let completeList = await this.$refs.TaskCenterDetail.getcompleteValid();
        if (completeList && completeList.length > 0) {
          completeList.forEach(item => {
            if (item.type == 'error') {
              this.validCardOpen = true;
              isComplete = false;
            }
          });
          this.validList.push(...completeList);
        }
      }
      //事件处理
      if (this.handler == 'event') {
        let eventValidList = (this.$refs.TaskCenterDetail && this.$refs.TaskCenterDetail.$refs.replyContent && this.$refs.TaskCenterDetail.$refs.replyContent.eventValid()) || [];
        if (eventValidList.length > 0) {
          let o = Object.assign({}, this.validTypeList[1]);
          eventValidList.forEach(e => {
            let o = Object.assign(e, this.validTypeList[1]);
            this.validList.push(o);
          });
          this.validCardOpen = true;
          isComplete = false;
        }
      }
      //回复必填
      let contentObj = {
        focus: '#content',
        icon: 'tsfont-close-o',
        iconColor: '#FF625A',
        msg: this.$t('message.process.required', { target: this.$t('page.reply') }),
        type: 'error'
      };
      if (this.isStepRequired && this.handler != 'event') {
        let taskContent = null;
        this.$refs.TaskCenterDetail && (taskContent = this.$refs.TaskCenterDetail.getTaskStepContent());
        if (!taskContent && !this.processTaskStepConfig.commentList.length) {
          this.validList.push(contentObj);
          this.validCardOpen = true;
          isComplete = false;
        } else if (!taskContent && this.processTaskStepConfig.commentList.length) {
          let valid = false;
          if (this.processTaskStepConfig.commentList.length) { //考虑回退的场景
            let startTime = this.processTaskStepConfig.startTime;
            let lcd = this.processTaskStepConfig.commentList[0].lcd;
            startTime > lcd && (valid = true);
            if (valid) {
              this.validList.push(contentObj);
              this.validCardOpen = true;
              isComplete = false;
            }
          }
        }
      }
      //eoa节点
      if (this.handler == 'eoa') {
        let eoaValidList = this.eoaValid();
        if (eoaValidList.length > 0) {
          this.validList.push(...eoaValidList);
          this.validCardOpen = true;
          isComplete = false;
        }
      }
      this.completeValid();
      return isComplete;
    },
    completeValid() { //流转时定位必填项
      for (let i = 0; i < this.validList.length; i++) {
        if (this.validList[i].type == 'error') {
          this.validItemClick(this.validList[i].focus, this.validList[i].tabValue);
          break;
        }
      }
    },
    getPriority() {
      //获取优先级
      let data = {
        needPage: false,
        channelUuid: this.channelUuid
      };
      this.$api.process.priority.search(data).then(res => {
        if (res.Status == 'OK') {
          this.priorityList = res.Return.tbodyList;
        }
      });
    },
    updateFormWidth() { //更新表单宽度
      setTimeout(() => {
        if (this.$refs.TaskCenterDetail && this.$refs.TaskCenterDetail.$el && this.$refs.TaskCenterDetail.$el.__vue__.$refs.formSheet) {
          this.$refs.TaskCenterDetail.$el.__vue__.$refs.formSheet.initContainerWidth();
        }
      }, 300);//动画有延迟
    },
    comment() {
      this.$refs.TaskCenterDetail.comment();
    }
  },
  computed: {
    allClassifyData() {
      return this.$store.state.leftMenu.workcenterList;
    }
    // replaceableText() {
    //   return function(name, replaceableTextList, textName) {
    //     let text = textName;
    //     let obj = replaceableTextList.find(i => i.name == name);
    //     if (obj) {
    //       text = obj.value || obj.text;
    //     }
    //     return text;
    //   };
    // },
    // isNeedPriority() {
    //   return this.processTaskConfig.hasOwnProperty('isNeedPriority') ? this.processTaskConfig.isNeedPriority : 1;
    // }
  },
  watch: {
    assistModal(val) {
      if (val == false) {
        this.assistList.forEach(item => {
          item.value = '';
        });
      }
    },
    // processTaskId(val) {
    //   if (val) {
    //     this.getProcessConfig();
    //   }
    // },
    isShowTaskList: {
      handler(val) {
        this.isOrderLeft = val;
        this.$emit('getTastHeight', this.isOrderLeft);
        if (val) {
          this.isOrderRight = false;
        }
      },
      immediate: true
    },
    isOrderRight() {
      this.updateFormWidth();
    }
  },
  '$store.state.leftTaskMenu.isTaskoverview'(newvalue) {
    this.getWorkCenterMenu(this.$store.state.leftTaskMenu.setIsShowTaskList, newvalue);
  }
};
