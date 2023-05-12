<template>
  <div class="changeDispatch">
    <div class="change-infor">
      <TsRow>
        <Col span="8">
          <div class="change-tip text-grey fz10">
            <span id="planStartEndTime" class="require-label" :class="validConfig.planStartEndTime == false?'text-danger':''">{{ $t('term.process.planStartEndTime') }}</span>
            <span class="change-line dividing-color"></span>
            <span>{{ $t('term.process.autostart') }}</span>
            <span class="change-switch">
              <TsFormSwitch
                v-model="changeReport.autoStart"
                :true-value="1"
                :false-value="0"
                :disabled="actionConfig.complete?false:true"
              ></TsFormSwitch>
            </span>
          </div>
          <div class="change-planStartEndTime">
            <TsFormDatePicker
              ref="planStartEndTime"
              v-model="changeReport.planStartEndTime"
              format="yyyy-MM-dd HH:mm"
              type="datetimerange"
              class="formItem"
              transfer
              :readonly="actionConfig.complete?false:true"
            ></TsFormDatePicker>
          </div>
        </Col>
        <Col span="8">
          <div class="change-tip text-grey fz10">{{ $t('term.process.startTimeWindow') }}</div>
          <div class="change-timeWindow">
            <template v-if="actionConfig.complete">
              <span class="time-select">
                <TsFormDatePicker
                  ref="startTimeWindow"
                  v-model="changeReport.startTimeWindow"
                  :placeholder="$t('page.starttime')"
                  format="HH:mm"
                  type="time"
                  class="formItem"
                ></TsFormDatePicker>
              </span>
              <span class="timeWindow-line text-grey">-</span>
              <span class="time-select">
                <TsFormDatePicker
                  ref="endTimeWindow"
                  v-model="changeReport.endTimeWindow"
                  :placeholder="$t('page.endtime')"
                  format="HH:mm"
                  type="time"
                  class="formItem"
                ></TsFormDatePicker>
              </span>
            </template>
            <template v-else>
              <span v-if="changeReport.startTimeWindow || changeReport.endTimeWindow">
                {{ changeReport.startTimeWindow }}-{{ changeReport.endTimeWindow }}
              </span>
              <span v-else>-</span>
            </template>
          </div>
        </Col>
        <Col span="8">
          <div id="owner" class="change-tip require-label fz10" :class="validConfig.ownerChange == false?'text-danger':'text-grey'">{{ $t('term.process.changeowner') }}</div>
          <div class="change-owner">
            <template v-if="actionConfig.complete">
              <UserSelect
                ref="changeReportOwner"
                v-model="changeReport.owner"
                :groupList="groupList"
                :multiple="false"
                class="formItem"
              ></UserSelect>
            </template>
            <template v-else>
              <UserCard :uuid="changeReport.owner"></UserCard>
            </template>
          </div>
        </Col>
      </TsRow>
    </div>
    <div v-if="actionConfig.complete" class="comment-box">
      <div class="text-grey comment-title fz10">{{ $t('term.process.changecontent') }}</div>
      <div>
        <div class="order-list mb-sm">
          <TsCkeditor
            ref="taskContent"
            v-model="newTaskContent"
            :editorDataS="defaultTaskContent"
            width="100%"
            :showIconToggle="true"
          ></TsCkeditor>
        </div>
        <TsUpLoad
          data-type="itsm"
          styleType="button"
          className="smallUpload"
          :multiple="uploadMultiple"
          :defaultList="defaultTaskFileList"
          dataType="change"
          @getFileList="getTaskFileList"
          @remove="removeTastFile"
        ></TsUpLoad>
      </div>
    </div>
    <div v-else-if="defaultTaskContent || defaultTaskFileList.length > 0" class="comment-box">
      <div class="text-grey comment-title fz10">{{ $t('term.process.changecontent') }}</div>
      <div v-if="defaultTaskContent" v-imgViewer>
        <p v-html="defaultTaskContent"></p>
      </div>
      <div v-if="defaultTaskFileList && defaultTaskFileList.length > 0">
        <div v-for="(file, flindex) in defaultTaskFileList" :key="flindex" class="file-list-down">
          <span class="tsfont-attachment text-grey">
            {{ file.name }}
          </span>
          <i v-download="downurl('/api/binary/file/download',file.id)" class="tsfont-download text-action text-padding"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
import TsUpLoad from '@/resources/components/UpLoad/UpLoad.vue';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
import UserSelect from '@/resources/components/UserSelect/UserSelect';
import download from '@/resources/directives/download.js';
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: '',
  components: {
    TsUpLoad,
    TsCkeditor,
    TsFormDatePicker,
    UserSelect,
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  directives: { download, imgViewer },
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
      newHandlerStepInfo: null, //变更信息
      uploadMultiple: true,
      draftFile: [],
      defaultTaskContent: '',
      newTaskContent: '',
      defaultTaskFileList: [],
      isEditContent: false,
      isTaskSave: true, //是否回复（上报内容无修改不能回复）
      changeReport: {
        planStartEndTime: null,
        autoStart: 1,
        startTimeWindow: null,
        endTimeWindow: null,
        owner: null,
        fileIdList: null,
        fileList: null
      },
      validConfig: {
        planStartEndTime: true,
        ownerChange: true
      },
      groupList: ['user'],
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
    this.$nextTick(() => {
      this.$emit('update');
    });
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
        }
        if (!handlerStepInfo.owner) {
          this.getUser();
        }
      } else {
        this.getUser();
      }
    },
    getTaskFileList(val) {
      this.draftFile = val;
      this.defaultTaskFileList = val;
    },
    removeTastFile(val) {
      this.draftFile = val;
      this.defaultTaskFileList = val;
    },
    getChangecreateData() {
      //保存变更数据
      let data = Object.assign({}, this.changeReport);
      this.$set(data, 'content', this.newTaskContent);
      let fileIdList = [];
      if (this.defaultTaskFileList.length > 0) {
        fileIdList = this.defaultTaskFileList.map(f => {
          return f.id;
        });
      }
      this.$set(data, 'fileList', this.defaultTaskFileList);
      this.$set(data, 'fileIdList', fileIdList);
      return data;
    },
    changeValid() {
      //校验
      let validList = [];
      if (!this.changeReport.planStartEndTime || this.changeReport.planStartEndTime[0] == '') {
        this.validConfig.planStartEndTime = false;
        let o = {
          focus: '#planStartEndTime',
          msg: this.$t('form.validate.required', {target: this.$t('term.process.planStartEndTime')})
        };
        validList.push(o);
      } else {
        this.validConfig.planStartEndTime = true;
      }
      if (!this.changeReport.owner) {
        let o = {
          focus: '#owner',
          msg: this.$t('message.process.required', {target: this.$t('term.process.changeowner')})
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
      let _this = this;
      this.$api.framework.user.getUser().then(res => {
        if (res.Status == 'OK') {
          let userDetail = res.Return;
          _this.changeReport.owner = 'user#' + userDetail.uuid;
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
    handlerStepInfo: {
      handler(val) {
        if (val) {
          for (let j in this.changeReport) {
            if (j != 'autoStart') {
              this.changeReport[j] = val[j] || null;
            } else {
              this.changeReport[j] = val[j];
            }
          }
        }
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
    .change-tip {
      display: flex;
      padding-bottom: 12px;
      align-items: center;
      .change-switch{
        padding: 0 6px;
      }
    }
    .change-text {
      font-size: 16px;
      padding: 0;
    }
  }
  .comment-box {
    position: relative;
    padding-top: 16px;
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
    /deep/ .ivu-date-picker .ivu-input {
      padding-right: 0;
    }
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
  .change-main{
    display: flex;
    align-items: center;
  }
  .change-planStartEndTime,
  .change-owner{
    padding-right: 20px;
  }
}
</style>
