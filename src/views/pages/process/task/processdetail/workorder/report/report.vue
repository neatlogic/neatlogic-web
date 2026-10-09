<template>
  <div id="taskReport" class="report-detail">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <template v-if="!loadingShow">
      <div v-if="startHandler == 'changecreate' && isEditchange" class="tsfont-edit text-action edit-report" @click="edit()"></div>
      <template v-if="startHandler !== 'changecreate'">
        <div v-if="dataConfig.content || (dataConfig.fileList && dataConfig.fileList.length > 0)" class="report-description-item">
          <div ref="descriptionSection" class="report-description-section">
            <div class="report-description-header" :class="{ 'is-sticky': descriptionIsTall }">
              <span class="text-grey">{{ $t('page.description') }}</span>
              <Tooltip
                v-if="isView"
                :content="descriptionCollapsed ? $t('page.viewmore') : $t('page.clickandputaway')"
                transfer
              >
                <span
                  class="text-tip-active"
                  :class="descriptionCollapsed?'tsfont-down':'tsfont-up'"
                  @click="toggleDescription"
                >
                </span>
              </Tooltip>
              <span
                v-if="actionConfig.update"
                class="tsfont-edit text-action cursor description-edit"
                :title="$t('page.revise')"
                role="button"
                tabindex="0"
                @click="edit()"
                @keydown.enter="edit()"
              ></span>
            </div>
            <div v-if="dataConfig.content" class="padding radius-md bg-op" :class="{ 'description-card-with-files': dataConfig.fileList.length > 0 }">
              <div
                v-imgViewer
                class="content-detail"
                :style="{ height: descriptionCollapsed ? '200px' : 'auto' }"
              >
                <div ref="getheight" v-dompurify-html="dataConfig.content" class="ck-content"></div>
              </div>
            </div>
          </div>
          <div v-if="dataConfig.fileList.length > 0" class="padding radius-md bg-op" :class="{ 'description-files-after-content': dataConfig.content }">
            <Divider orientation="start">
              <span class="text-grey">{{ $t('page.accessory') }}</span>
            </Divider>
            <ImagePreview class="report-content" :fileList="dataConfig.fileList"></ImagePreview>
          </div>
        </div>
        <div v-else class="padding border-base radius-md" style="border-style: dotted !important; text-align: center">
          <span v-if="actionConfig.update" class="tsfont-plus cursor text-grey" @click="edit()">{{ $t('dialog.title.addtarget', { target: $t('page.description') }) }}</span>
          <span v-else class="text-grey">{{ $t('page.nocomment') }}</span>
        </div>
      </template>
      <template v-else-if="startHandler === 'changecreate'">
        <TsFormItem v-if="handlerStepInfo" :label="$t('term.process.change')" labelPosition="top">
          <div class="padding bg-op radius-md">
            <div class="change-infor dividing-color">
              <TsRow>
                <Col span="8">
                  <div class="text-grey">
                    <span>{{ $t('term.process.planStartEndTime') }}</span>
                    <span><Divider type="vertical" /></span>
                    <span v-if="handlerStepInfo.autoStart">{{ $t('term.process.autostart') }}</span>
                  </div>
                  <div class="change-text">
                    <template v-if="handlerStepInfo.planStartEndTime && handlerStepInfo.planStartEndTime.length > 0">{{ handlerStepInfo.planStartEndTime[0] }} ~ {{ handlerStepInfo.planStartEndTime[1] }}</template>
                    <template v-else>-</template>
                  </div>
                </Col>
                <Col span="8">
                  <div class="text-grey">{{ $t('term.process.startTimeWindow') }}</div>
                  <div>
                    <span v-if="handlerStepInfo.startTimeWindow || handlerStepInfo.endTimeWindow">{{ handlerStepInfo.startTimeWindow || '~' }} - {{ handlerStepInfo.endTimeWindow || '~' }}</span>
                    <span v-else>-</span>
                  </div>
                </Col>
                <Col span="8">
                  <div class="text-grey">{{ $t('term.process.changeowner') }}</div>
                  <div>
                    <UserCard v-if="handlerStepInfo.owner" :uuid="handlerStepInfo.owner"></UserCard>
                    <span v-else>-</span>
                  </div>
                </Col>
              </TsRow>
            </div>
            <div v-if="handlerStepInfo.content || draftFile.length > 0" class="comment-box">
              <template v-if="handlerStepInfo.content || (handlerStepInfo.fileList && handlerStepInfo.fileList.length > 0)">
                <div v-if="handlerStepInfo.content" class="report-content">
                  <div class="text-grey comment-title fz10">
                    {{ $t('term.process.changecontent') }}
                  </div>
                  <div class="pt-md">
                    <div v-imgViewer class="content-detail" :style="{ height: maxheight }">
                      <div ref="getheight" v-html="handlerStepInfo.content"></div>
                    </div>
                    <div
                      v-if="isView"
                      class="text-href pt-xs"
                      @click="viewMoreContent"
                      v-text="maxheight == '200px' ? $t('page.viewmore') : $t('page.clickandputaway')"
                    ></div>
                  </div>
                </div>
                <div v-if="handlerStepInfo.fileList.length > 0" class="report-content pt16">
                  <div class="text-grey pb10 fz10">{{ $t('page.accessory') }}</div>
                  <ImagePreview :fileList="handlerStepInfo.fileList"></ImagePreview>
                </div>
              </template>
            </div>
          </div>
        </TsFormItem>
      </template>
      <slot name="changeStep"></slot>
    </template>
    <TsDialog
      type="slider"
      v-bind="dataDialog"
      :isShow.sync="isShow"
      :loading="isUpdatingChange"
      :okBtnDisable="isUpdatingChange"
      @on-close="close()"
      @on-ok="save()"
    >
      <template>
        <div>
          <TsForm
            v-if="startHandler != 'changecreate'"
            ref="form"
            v-model="omnipotentConfig"
            :itemList="omnipotentForm"
            labelPosition="top"
          ></TsForm>
          <TsForm
            v-else-if="startHandler == 'changecreate'"
            ref="form"
            v-model="changecreateConfig"
            :itemList="changecreateForm"
            labelPosition="top"
          >
            <template v-slot:startTimeWindow>
              <div class="timeWindow">
                <TsFormDatePicker
                  v-model="changecreateConfig.startTimeWindow"
                  type="time"
                  format="HH:mm"
                  :placeholder="$t('page.starttime')"
                  width="120px"
                ></TsFormDatePicker>
                <div class="item-line">-</div>
                <TsFormDatePicker
                  v-model="changecreateConfig.endTimeWindow"
                  type="time"
                  format="HH:mm"
                  :placeholder="$t('page.endtime')"
                  width="120px"
                ></TsFormDatePicker>
              </div>
            </template>
          </TsForm>
          <div v-if="isShowUploadFile" class="file-box">
            <TsUpLoad
              :dataType="startHandler == 'changecreate' ? 'change' : 'itsm'"
              styleType="button"
              className="smallUpload"
              rowSpan="24"
              :multiple="uploadMultiple"
              :defaultList="defaultTaskFileList"
              @getFileList="getTaskFileList"
              @remove="removeTastFile"
            ></TsUpLoad>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
export default {
  name: '',
  components: {
    TsFormItem,
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    ImagePreview: () => import('@/resources/components/image-preview/index.vue')
  },
  directives: { imgViewer },
  filters: {},
  props: {
    processTaskConfig: Object,
    actionConfig: Object,
    processTaskId: {
      type: [String, Number],
      default: null
    },
    processTaskStepId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      loadingShow: true,
      startHandler: 'omnipotent', //开始节点的类型：omnipotent(普通节点)、changecreate(变更创建)、autoexec(自动化)
      handler: 'omnipotent', //处理节点类型
      ckeditorRequired: false, //上报描述是否必填
      dataConfig: {
        content: null,
        fileList: [],
        fileIdList: []
      },
      isView: false, //内容超过200px时显示展开/收起按钮
      descriptionCollapsed: false,
      descriptionIsTall: false,
      maxheight: '18px',
      isShow: false,
      dataDialog: {
        type: 'slider',
        title: this.$t('page.revise'),
        width: 'large'
      },
      omnipotentConfig: {
        content: '',
        fileList: [],
        fileIdList: []
      },
      omnipotentForm: {
        content: {
          type: 'ckeditor',
          label: this.$t('page.description'),
          isHidden: false,
          params: {
            uploadVideoConfig: {
              type: 'itsm'
            }
          }
        }
      },
      changecreateConfig: {
        owner: null,
        autoStart: '1',
        planStartEndTime: null,
        startTimeWindow: null,
        endTimeWindow: null,
        content: null
      },
      changecreateForm: {
        owner: {
          name: 'owner',
          value: '',
          label: this.$t('term.process.changeowner'),
          type: 'userselect',
          multiple: false,
          groupList: ['user'],
          validateList: ['required'],
          disabled: true
        },
        autoStart: {
          name: 'autoStart',
          value: 1,
          label: this.$t('term.process.autostart'),
          type: 'select',
          validateList: ['required'],
          search: false,
          dataList: [
            {
              text: this.$t('page.open'),
              value: 1
            },
            {
              text: this.$t('page.close'),
              value: 0
            }
          ]
        },
        planStartEndTime: {
          name: 'planStartEndTime',
          value: [],
          label: this.$t('term.process.planStartEndTime'),
          type: 'datetimerange',
          format: 'yyyy-MM-dd HH:mm',
          validateList: ['required']
        },
        startTimeWindow: {
          type: 'slot',
          name: 'startTimeWindow',
          label: this.$t('term.process.startTimeWindow'),
          format: 'HH:mm',
          transfer: true
        },
        content: {
          type: 'ckeditor',
          label: this.$t('page.description'),
          value: '',
          isHidden: false,
          params: {
            uploadVideoConfig: {
              type: 'itsm'
            }
          }
        }
      },
      uploadMultiple: true,
      defaultTaskFileList: [],
      draftFile: [],
      isNeedContent: true, //流程上报可配置隐藏描述框
      isShowUploadFile: true, //流程上报可配置隐藏上传文件组件
      handlerStepInfo: null, //变更上报信息
      isEditchange: false, //编辑变更信息
      validConfig: {
        planStartEndTime: true,
        ownerChange: true
      },
      isUpdatingChange: false,
      changeId: null //变更id
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initData();
    this.$nextTick(() => {
      // 页面渲染完成后的回调
      this.getHeight();
      this.observeDescriptionHeight();
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.descriptionResizeObserver) this.descriptionResizeObserver.disconnect();
  },
  destroyed() {},
  methods: {
    initData() {
      this.loadingShow = true;
      let startProcessTaskStep = this.processTaskConfig.startProcessTaskStep;
      let processTaskStepConfig = this.processTaskConfig.currentProcessTaskStep;
      this.startHandler = startProcessTaskStep.handler;
      this.handler = processTaskStepConfig ? processTaskStepConfig.handler : 'omnipotent';
      this.ckeditorRequired = startProcessTaskStep.isRequired;
      if (this.ckeditorRequired) {
        this.$set(this.omnipotentForm.content, 'validateList', ['required']);
        this.$set(this.changecreateForm.content, 'validateList', ['required']);
      }
      if (startProcessTaskStep.comment) {
        if (startProcessTaskStep.comment.content) {
          this.dataConfig.content = startProcessTaskStep.comment.content;
        }
        if (startProcessTaskStep.comment.fileList && startProcessTaskStep.comment.fileList.length > 0) {
          this.dataConfig.fileList = startProcessTaskStep.comment.fileList;
          this.defaultTaskFileList = startProcessTaskStep.comment.fileList;
        }
      }
      //流程上报可配置隐藏描述框
      this.isNeedContent = startProcessTaskStep.hasOwnProperty('isNeedContent') ? !!startProcessTaskStep.isNeedContent : true;
      this.$set(this.omnipotentForm.content, 'isHidden', !this.isNeedContent);
      this.$set(this.changecreateForm.content, 'isHidden', !this.isNeedContent);

      //流程上报可配置隐藏上传文件组件
      this.isShowUploadFile = startProcessTaskStep.hasOwnProperty('isNeedUploadFile') ? !!startProcessTaskStep.isNeedUploadFile : true;
      //变更上报
      let handlerStepInfo = null;
      if (this.handler == 'changecreate') {
        //当前节点是变更创建时，拿当前节点的数据
        handlerStepInfo = processTaskStepConfig.handlerStepInfo;
        if (this.actionConfig.complete) {
          this.isEditchange = true;
        }
      } else if (this.startHandler == 'changecreate') {
        handlerStepInfo = startProcessTaskStep.handlerStepInfo;
      }
      if (handlerStepInfo) {
        this.handlerStepInfo = this.$utils.deepClone(handlerStepInfo);
        this.changeId = handlerStepInfo.id || null;
        this.changeStepList = handlerStepInfo.changeStepList;
        Object.keys(this.changecreateConfig).forEach(key => {
          this.changecreateConfig[key] = this.handlerStepInfo[key];
        });
        this.defaultTaskFileList = this.handlerStepInfo.fileList || [];
        this.draftFile = this.handlerStepInfo.fileList || [];
        if (!handlerStepInfo.owner) {
          this.getUser();
        }
        if (handlerStepInfo.actionList && handlerStepInfo.actionList.length > 0) {
          let editchange = handlerStepInfo.actionList.find(h => h.value === 'editchange');
          if (editchange) {
            this.isEditchange = true;
          }
        }
      }
      if (!handlerStepInfo && this.startHandler == 'changecreate') {
        this.getUser();
      }
      if (this.handler == 'changecreate') {
        //只有在变更创建节点可以修改变更经理
        this.$set(this.changecreateForm.owner, 'disabled', false);
      }
      this.loadingShow = false;
    },
    viewMoreContent() {
      if (this.maxheight == '200px') {
        this.maxheight = 'auto';
      } else {
        this.maxheight = '200px';
      }
    },
    toggleDescription() {
      if (!this.descriptionCollapsed) {
        const scrollContainer = this.$el.closest('.CenterDetail');
        const section = this.$refs.descriptionSection;
        if (scrollContainer && section) {
          const sectionTop = section.getBoundingClientRect().top;
          const containerTop = scrollContainer.getBoundingClientRect().top;
          if (sectionTop < containerTop) {
            scrollContainer.scrollTop += sectionTop - containerTop;
          }
        }
      }
      this.descriptionCollapsed = !this.descriptionCollapsed;
      this.$nextTick(this.getHeight);
    },
    observeDescriptionHeight() {
      if (this.startHandler === 'changecreate' || typeof ResizeObserver === 'undefined') return;
      if (this.descriptionResizeObserver) this.descriptionResizeObserver.disconnect();
      const content = this.$refs.getheight;
      const scrollContainer = this.$el.closest('.CenterDetail');
      if (!content || !scrollContainer) return;
      this.descriptionResizeObserver = new ResizeObserver(() => this.getHeight());
      this.descriptionResizeObserver.observe(content);
      this.descriptionResizeObserver.observe(scrollContainer);
    },
    edit() {
      if (this.startHandler == 'changecreate') {
        this.handlerStepInfo &&
          Object.keys(this.changecreateConfig).forEach(key => {
            this.changecreateConfig[key] = this.handlerStepInfo[key];
          });
        const {fileList = []} = this.handlerStepInfo || {}; // 处理文件列表为空的时候，控制台报错
        this.defaultTaskFileList = fileList;
        this.draftFile = fileList;
      } else {
        Object.keys(this.omnipotentConfig).forEach(key => {
          this.omnipotentConfig[key] = this.dataConfig.content;
        });
        this.defaultTaskFileList = this.dataConfig.fileList || [];
        this.draftFile = this.dataConfig.fileList || [];
      }
      this.isShow = true;
    },
    close() {
      this.isShow = false;
    },
    getTaskFileList(val) {
      this.draftFile = val;
    },
    removeTastFile(val) {
      this.draftFile = val;
    },
    updateWorkData() {
      //上报：普通节点
      let data = {
        processTaskId: this.processTaskId,
        processTaskStepId: this.processTaskStepId
      };
      Object.assign(data, this.dataConfig);
      return this.$api.process.processtask.updateWorkData(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.$emit('upActivityList');
        }
      });
    },
    updateChange() {
      //上报：变更创建节点
      let data = {
        processTaskStepId: this.processTaskStepId,
        changeId: this.changeId
      };
      if (JSON.stringify(this.draftFile) != JSON.stringify(this.defaultTaskFileList)) {
        let fileIdList = this.draftFile.map(f => {
          return f.id;
        });
        this.$set(data, 'fileIdList', fileIdList);
      }
      data = Object.assign(data, this.changecreateConfig);
      return this.$api.process.processtask.updateChange(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.$router.push({
            path: '/task-detail',
            query: {
              processTaskId: this.processTaskId,
              type: Date.now()
            }
          });
        }
      });
    },
    save() {
      if (this.isUpdatingChange || (this.$refs.form && !this.$refs.form.valid())) {
        return;
      }
      if (this.startHandler == 'changecreate') {
        Object.assign(this.handlerStepInfo, this.changecreateConfig);
        this.$set(this.handlerStepInfo, 'fileList', this.draftFile);
        if (this.handler == 'changecreate') {
          this.$emit('saveTaskD');
        } else {
          this.isUpdatingChange = true;
          this.updateChange().finally(() => {
            this.isUpdatingChange = false;
          });
          return;
        }
      } else {
        Object.assign(this.dataConfig, this.omnipotentConfig);
        this.$set(this.dataConfig, 'fileList', this.draftFile);
        let fileIdList = this.draftFile.map(f => {
          return f.id;
        });
        this.$set(this.dataConfig, 'fileIdList', fileIdList);
        this.updateWorkData();
      }
      this.close();
      this.$nextTick(() => {
        this.getHeight();
      });
    },
    getChangecreateData() {
      //保存变更数据
      let data = Object.assign({}, this.changecreateConfig);
      let fileIdList = [];
      if (this.draftFile.length > 0) {
        fileIdList = this.draftFile.map(f => {
          return f.id;
        });
      }
      this.$set(data, 'fileList', this.draftFile);
      this.$set(data, 'fileIdList', fileIdList);
      return data;
    },
    changeValid() {
      //校验
      let validList = [];
      if (!this.changecreateConfig.planStartEndTime || this.changecreateConfig.planStartEndTime.length == 0) {
        this.validConfig.planStartEndTime = false;
        let o = {
          focus: '#taskReport',
          msg: this.$t('form.validate.required', { target: this.$t('term.process.planStartEndTime') })
        };
        validList.push(o);
      } else {
        this.validConfig.planStartEndTime = true;
      }
      if (!this.changecreateConfig.owner) {
        let o = {
          focus: '#taskReport',
          msg: this.$t('form.validate.required', { target: this.$t('term.process.changeowner') })
        };
        this.validConfig.ownerChange = false;
        validList.push(o);
      } else {
        this.validConfig.ownerChange = true;
      }
      return validList;
    },
    //获取当前登录用户信息
    getUser() {
      this.$api.framework.user.getUser().then(res => {
        if (res.Status == 'OK') {
          let userDetail = res.Return;
          this.changecreateConfig.owner = 'user#' + userDetail.uuid;
          if (this.handlerStepInfo == null) {
            this.handlerStepInfo = {}; // 处理为null时，使用$set报错Cannot read properties of null (reading '__ob__')
          }
          this.$set(this.handlerStepInfo, 'owner', this.changecreateConfig.owner);
        }
      });
    },
    getHeight() {
      if (this.$refs.getheight) {
        if (this.startHandler !== 'changecreate') {
          const scrollContainer = this.$el.closest('.CenterDetail');
          const contentHeight = this.$refs.getheight.offsetHeight;
          this.isView = contentHeight > 200;
          this.descriptionIsTall = !this.descriptionCollapsed && !!scrollContainer && contentHeight >= scrollContainer.clientHeight;
          return;
        }
        if (this.$refs.getheight.offsetHeight > 200) {
          this.isView = true;
          this.maxheight = '200px';
        } else if (!this.isView) {
          this.isView = false;
          this.maxheight = this.$refs.getheight.offsetHeight + 'px';
        }
      }
    }
  },
  computed: {},
  watch: {
    'dataConfig.content'() {
      if (this.startHandler === 'changecreate') return;
      this.descriptionCollapsed = false;
      this.$nextTick(() => {
        this.getHeight();
        this.observeDescriptionHeight();
      });
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.report-description-header.is-sticky {
  background-color: @default-background;
}
html.theme-dark .report-description-header.is-sticky {
  background-color: @dark-background;
}
</style>
<style lang="less" scoped>
.report-detail {
  position: relative;
  .report-description-item {
    margin-bottom: 24px;
  }
  .report-description-header {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
    padding-bottom: 8px;
    &.is-sticky {
      position: sticky;
      top: 0;
      z-index: 11;
    }
  }
  .description-edit {
    flex-shrink: 0;
  }
  .description-card-with-files {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .description-files-after-content {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .content-detail {
    overflow: hidden;
  }
  .pb10 {
    padding-bottom: 10px;
  }
  .pt16 {
    padding-top: 16px;
  }
  .edit-report {
    position: absolute;
    right: 6px;
    top: 6px;
    z-index: 2;
  }
  .report-content {
    .content-bg {
      padding: 10px 16px;
    }
    .content-detail {
      overflow: hidden;
    }
  }
  .file-title {
    padding-bottom: 6px;
  }
}
.file-box {
  padding-top: 16px;
}
.timeWindow {
  display: flex;
  align-items: center;
  .item-line {
    padding: 0 4px;
  }
}
::v-deep .tsslider-body {
  overflow-x: hidden;
}
.changeDispatch {
  .change-infor {
    .change-tip {
      font-size: 12px;
      display: flex;
      align-items: center;
      line-height: 20px;
      padding-bottom: 10px;
      .autoStart {
        border-left: 1px solid;
        padding: 0 8px;
        margin-left: 8px;
      }
    }
  }
  .comment-box {
    position: relative;
    .comment-title {
      font-size: 12px;
      padding: 10px 0;
    }
  }
}
</style>
