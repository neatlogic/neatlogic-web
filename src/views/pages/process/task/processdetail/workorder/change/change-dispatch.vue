<template>
  <div class="changeDispatch">
    <div class="change-infor">
      <TsRow>
        <Col span="8">
          <div class="change-tip text-grey fz10">
            <span class="require-label">{{ $t('term.process.planStartEndTime') }}</span>
            <span class="change-line dividing-color"></span>
            <span>{{ $t('term.process.autostart') }}</span>
            <span v-if="isEditchange" class="change-switch">
              <TsFormSwitch
                v-model="newHandlerStepInfo.autoStart"
                :true-value="1"
                :false-value="0"
                @on-change="changeAutoStart"
              ></TsFormSwitch>
            </span>
          </div>
          <div class="change-planStartEndTime" :class="isEditchange?'bg-hover-grey':''">
            <TsFormDatePicker
              v-model="newHandlerStepInfo.planStartEndTime"
              width="100%"
              type="datetimerange"
              format="yyyy-MM-dd HH:mm"
              :validateList="validateList.planStartEndTime"
              :clearable="false"
              :readonly="!isEditchange?true:false"
              class="formItem"
              transfer
              @on-ok="changePlanTime"
              @on-clickoutside="changePlanTime"
            >
            </TsFormDatePicker>
          </div>
        </Col>
        <Col span="8">
          <div class="change-tip text-grey fz10">{{ $t('term.process.startTimeWindow') }}</div>
          <div v-if="isEditchange == true" class="change-timeWindow">
            <div class="time-select">
              <TsFormDatePicker
                v-model="newHandlerStepInfo.startTimeWindow"
                :placeholder="$t('page.starttime')"
                format="HH:mm"
                type="time"
                :confirm="true"
                class="formItem"
                @on-ok="changeStartTimeWindow"
                @on-clickoutside="changeStartTimeWindow"
                @on-clear="changeStartTimeWindow"
              >
              </TsFormDatePicker>
            </div>
            <span class="timeWindow-line text-grey">-</span>
            <div class="time-select">
              <TsFormDatePicker
                v-model="newHandlerStepInfo.endTimeWindow"
                :placeholder="$t('page.endtime')"
                format="HH:mm"
                type="time"
                :confirm="true"
                class="formItem"
                @on-ok="changeEndTimeWindow"
                @on-clickoutside="changeEndTimeWindow"
                @on-clear="changeEndTimeWindow"
              >
              </TsFormDatePicker>
            </div>
          </div>
          <div v-else>
            <span v-if="newHandlerStepInfo.startTimeWindow || newHandlerStepInfo.endTimeWindow">{{ newHandlerStepInfo.startTimeWindow || '~' }} - {{ newHandlerStepInfo.endTimeWindow || '~' }}</span>
            <span v-else>-</span>
          </div>
        </Col>
        <Col span="8">
          <div class="change-tip text-grey require-label fz10">{{ $t('term.process.changeowner') }}</div>
          <UserCard v-if="newHandlerStepInfo.ownerVo" :uuid="newHandlerStepInfo.ownerVo.uuid" :initType="newHandlerStepInfo.ownerVo.initType"></UserCard>
        </Col>
      </TsRow>
    </div>
    <div v-if="isEditchange" class="comment-box">
      <div class="text-grey comment-title fz10">{{ $t('term.process.changecontent') }}</div>
      <div class="order-list">
        <TsCkeditor
          ref="taskContent"
          v-model="newTaskContent"
          :showIconToggle="true"
          :editorDataS="defaultTaskContent"
          width="100%"
        ></TsCkeditor>
      </div>
      <TsUpLoad
        styleType="button"
        className="smallUpload"
        :multiple="uploadMultiple"
        :defaultList="defaultTaskFileList"
        dataType="change"
        @getFileList="getTaskFileList"
        @remove="removeTastFile"
      ></TsUpLoad>
      <!-- <div class="changecontent-save">
        <Button
          type="primary"
          :disabled="isTaskSave"
          :title="isTaskSave ? '描述没有修改时无需保存' : null"
          @click="saveChangeContent()"
        >{{ $t('page.save') }}</Button>
      </div> -->
    </div>
    <div v-else-if="defaultTaskContent || defaultTaskFileList.length > 0" class="comment-box">
      <div class="text-grey comment-title fz10">{{ $t('term.process.changecontent') }}</div>
      <div v-if="defaultTaskContent" v-imgViewer>
        <p v-html="defaultTaskContent"></p>
      </div>
      <div v-if="defaultTaskFileList && defaultTaskFileList.length > 0">
        <div
          v-for="(file, flindex) in defaultTaskFileList"
          :key="flindex"
          v-download="downurl('/api/binary/file/download',file.id)"
          class="text-action file-list-down"
        >
          <span class="tsfont-attachment">
            {{ file.name }}
          </span>
          <i class="tsfont-download text-padding"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
import TsUpLoad from '@/resources/components/UpLoad/UpLoad.vue';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
import download from '@/resources/directives/download.js';
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: '',
  components: {
    TsUpLoad,
    TsCkeditor,
    TsFormDatePicker,
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  directives: { download, imgViewer},
  filters: {},
  props: {
    actionConfig: Object,
    handlerStepInfo: Object,
    processTaskId: {
      type: [String, Number],
      default: null
    },
    processTaskStepId: {
      type: [String, Number],
      default: null
    },
    isEditchange: {
      type: Boolean,
      default: false
    },
    handler: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      defaultHandlerStepInfo: null, //原始变更信息
      newHandlerStepInfo: null, //变更信息
      uploadMultiple: true,
      draftFile: [],
      defaultTaskContent: '',
      newTaskContent: '',
      defaultTaskFileList: [],
      isTaskSave: true, //是否回复（上报内容无修改不能回复）
      validateList: {
        owner: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.dealwithuser')}) }],
        planStartEndTime: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.time')}) }]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getTaskComment();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getTaskComment() {
      //变更说明
      let handlerStepInfo = this.handlerStepInfo;
      if (handlerStepInfo) {
        if (handlerStepInfo.content) {
          this.defaultTaskContent = handlerStepInfo.content;
          this.newTaskContent = handlerStepInfo.content;
        }
        if (handlerStepInfo.fileList && handlerStepInfo.fileList.length > 0) {
          this.defaultTaskFileList = handlerStepInfo.fileList;
          this.draftFile = handlerStepInfo.fileList;
        }
      }
    },
    changeAutoStart(val) {
      let data = {
        autoStart: val
      };
      this.saveChangeInfo(data);
    },
    getTaskFileList(val) {
      //修改上报附件
      this.draftFile = val;
    },
    removeTastFile(val) {
      this.draftFile = val;
    },
    changePlanTime() {
      //保存计划起止时间
      let planStartEndTime = this.newHandlerStepInfo.planStartEndTime;
      if (planStartEndTime != '' && planStartEndTime[0] != '') {
        if (planStartEndTime != this.defaultHandlerStepInfo.planStartEndTime) {
          let data = {
            planStartEndTime: this.newHandlerStepInfo.planStartEndTime
          };
          this.saveChangeInfo(data);
          this.defaultHandlerStepInfo.planStartEndTime = planStartEndTime;
        }
      } else {
        // this.$Notice.success({
        //   title: '请选择时间',
        //   duration: 1.5
        // });
      }
    },
    changeStartTimeWindow() {
      let startTimeWindow = this.newHandlerStepInfo.startTimeWindow;
      if (startTimeWindow != this.defaultHandlerStepInfo.startTimeWindow) {
        let data = {
          startTimeWindow: this.newHandlerStepInfo.startTimeWindow
        };
        this.saveChangeInfo(data, 'timeWindow');
      }
    },
    changeEndTimeWindow() {
      let endTimeWindow = this.newHandlerStepInfo.endTimeWindow;
      if (endTimeWindow != this.defaultHandlerStepInfo.endTimeWindow) {
        let data = {
          endTimeWindow: this.newHandlerStepInfo.endTimeWindow
        };
        this.saveChangeInfo(data, 'timeWindow');
      }
    },
    saveChangeContent() {
      let data = {};
      if (!this.isTaskSave) {
        let val = this.$refs.taskContent.currentValue;
        if (val != this.defaultTaskContent) {
          this.$set(data, 'content', val);
        }
        if (JSON.stringify(this.draftFile) != JSON.stringify(this.defaultTaskFileList)) {
          let fileIdList = this.draftFile.map(f => {
            return f.id;
          });
          this.$set(data, 'fileIdList', fileIdList);
        }
        if (JSON.stringify(data) != '{}') {
          this.saveChangeInfo(data, 'content');
          this.defaultTaskFileList = this.draftFile;
          this.defaultTaskContent = val;
          this.isTaskSave = true;
        }
      }
    },
    saveChangeInfo(obj, type) {
      let data = {
        processTaskStepId: this.processTaskStepId,
        changeId: this.newHandlerStepInfo.id
      };
      data = Object.assign(data, obj);
      this.$api.process.processtask.updateChange(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          if (type && (type == 'timeWindow' || type == 'content')) {
            this.$emit('updataActive');//改变时间窗口或者变更说明，只更新活动
          } else {
            //改变起止时间和自动开始时，需要改变整个变更（刷新页面）
            this.$router.push({
              path: '/task-detail',
              query: {
                processTaskId: this.processTaskId,
                type: Date.now()
              }
            });
          }
        }
      });
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    }
  },
  watch: {
    newTaskContent(val) {
      if (val != this.defaultTaskContent) {
        this.isTaskSave = false;
      } else {
        this.isTaskSave = true;
      }
    },
    draftFile: {
      handler(val) {
        if (val != this.defaultTaskFileList) {
          this.isTaskSave = false;
        } else {
          this.isTaskSave = true;
        }
      },
      deep: true,
      immediate: true
    },
    handlerStepInfo: {
      handler(val) {
        this.newHandlerStepInfo = this.$utils.deepClone(val);
        this.defaultHandlerStepInfo = this.$utils.deepClone(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.changeDispatch {
  .change-infor {
    padding-bottom: 8px;
    .change-tip {
        display: flex;
        padding-bottom: 12px;
        align-items: center;
      .change-switch{
        padding: 0 6px;
      }
    }
  }
  .comment-box {
    position: relative;
    padding-bottom: 16px;
    .comment-title {
      padding-bottom: 8px;
    }
  }
  .user-img {
    display: inline-block;
    vertical-align: top;
    padding-right: 4px;
  }
  .Avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
  .change-timeWindow{
    display: flex;
    align-items: center;
    .time-select {
      display: inline-block;
      .formItem{
        width: 86px;
      }
    }
    .timeWindow-line{
      padding: 0 4px;
    }
  }
  .formItem {
    /deep/ .ivu-input {
      background: transparent;
      cursor: pointer;
    }
    /deep/ .ivu-input-suffix {
      .ivu-icon-ios-time-outline{
        display: none;
      }
    }
  }
  .change-line {
    padding-left: 8px;
    margin-right: 8px;
    border-right: 1px solid;
    height: 1rem;
  }
  .changecontent-save{
    text-align: right;
  }
}
</style>
