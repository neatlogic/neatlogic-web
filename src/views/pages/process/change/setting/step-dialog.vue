<template>
  <div class="editStepDialog">
    <TsDialog
      type="slider"
      width="medium"
      :isShow.sync="stepDialog"
      @on-ok="okStep"
      @on-cancel="cancleSetp"
      @on-close="close"
    >
      <template v-slot:header>
        <div>{{ dialogTitle }}</div>
      </template>
      <template v-slot>
        <div>
          <TsRow :gutter="0">
            <Col span="16">
              <div class="step-form">
                <TsForm ref="stepDialogForm" :item-list="stepDialogForm" :label-width="100">
                  <template slot="content">
                    <TsFormInput
                      ref="content"
                      v-model="content"
                      type="textarea"
                      style="width: 100%;"
                      :onBlur="contentInput"
                    ></TsFormInput>
                  </template>
                  <template v-slot:startTimeWindow>
                    <div>
                      <TsFormDatePicker
                        ref="startTimeWindow"
                        v-model="startTimeWindow"
                        :placeholder="$t('page.starttime')"
                        format="HH:mm"
                        width="100%"
                        type="time"
                        style="width: 24%;display: inline-block;"
                        transfer
                      ></TsFormDatePicker>
                      <span style="width: 2%;display: inline-block;text-align: center;">-</span>
                      <TsFormDatePicker
                        ref="endTimeWindow"
                        v-model="endTimeWindow"
                        :placeholder="$t('page.endtime')"
                        format="HH:mm"
                        width="100%"
                        type="time"
                        style="width: 24%;display: inline-block;"
                        transfer
                      ></TsFormDatePicker>
                    </div>
                  </template>
                  <template v-slot:fileIdList>
                    <div style="width:100%">
                      <TsUpLoad
                        styleType="button"
                        className="smallUpload"
                        dataType="change"
                        rowSpan="24"
                        :multiple="uploadMultiple"
                        :defaultList="fileList"
                        @getFileList="getFileList"
                        @remove="removeFile"
                      ></TsUpLoad>
                    </div>
                  </template>
                </TsForm>
              </div>

            </Col>
            <Col span="8">
              <div class="param-right border-color">
                <div class="search-block">
                  <div class="param-title text-title">{{ $t('term.process.paramlist') }}</div>
                  <TsFormInput
                    v-model="keyword"
                    class="input-border"
                    search
                    clearable
                    @on-enter="getParamList"
                    @on-clear="getParamList"
                  ></TsFormInput>
                </div>
                <div
                  v-for="(item, index) in paramList"
                  :key="index"
                  ref="paramContain"
                  v-click-outside:false="onClickOutside"
                  class="parma-item bg-block radius-md"
                  @click.stop="changeText(item)"
                >
                  <div class="overflow">
                    {{ item.name }}
                  </div>
                </div>
              </div>
            </Col>
          </TsRow>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker.vue';
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
export default {
  name: '',
  components: {
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve),
    TsFormDatePicker
  },
  directives: { ClickOutside },
  props: {
    dialogTitle: {
      type: String,
      default() {
        return this.$t('dialog.title.addtarget', {target: this.$t('term.process.step')});
      }
    },
    isShow: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: null
    }
  },
  data() {
    let _this = this;
    return {
      stepDialog: false,
      uploadMultiple: true,
      fileList: [], //附件
      fileIdList: [],
      uuid: null,
      stepDialogForm: [
        {
          type: 'text',
          name: 'code',
          label: this.$t('term.process.encoded'),
          maxlength: 50,
          width: '100%',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.process.encoded')}) }, { name: 'stepindex' }]
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          width: '100%',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.name') }, { name: 'name-special' }]
        },
        {
          type: 'slot',
          name: 'content',
          label: this.$t('page.description'),
          width: '100%',
          transfer: true
        },
        {
          type: 'userselect',
          name: 'worker',
          label: this.$t('term.process.dealwithuser'),
          width: '100%',
          transfer: true,
          multiple: false,
          groupList: ['user', 'team'],
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.dealwithuser')}) }],
          onChange: _this.getUserText
        },
        {
          type: 'date',
          name: 'planStartDate',
          label: this.$t('term.process.planstartdate'),
          value: '',
          placeholder: '',
          dataList: [],
          width: '100%',
          format: 'yyyy-MM-dd',
          transfer: true
          // validateList: [{ name: 'required', message: '请选择时间' }]
        },
        {
          type: 'slot',
          name: 'startTimeWindow',
          width: '50%',
          label: this.$t('term.process.startTimeWindow')
        },
        // {
        //   type: 'timerange',
        //   name: 'startEndTimeWindow',
        //   label: '时间窗口',
        //   width: '90%',
        //   transfer: true,
        //   format: 'HH:mm'
        // },
        {
          type: 'slot',
          name: 'fileIdList',
          label: this.$t('page.accessory')
        }
      ],
      startTimeWindow: '',
      endTimeWindow: '',
      // code: null,
      paramList: [],
      content: null,
      keyword: '',
      blurIndex: null,
      workerVo: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getParamList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    onClickOutside(event) {
      const $el = this.$refs.paramContain || null;
      let select = false;
      this.$refs.paramContain.find(item => {
        if (!select && (item === event.target || item.contains(event.target))) {
          select = true;
        }
        return select;
      });
      if (!select) {
        this.blurIndex = null;
      }
    },
    getParamList() {
      let data = {
        keyword: this.keyword
      };
      this.$api.process.change.getChangeParamList(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return;
          this.paramList = obj.changeParamList;
        }
      });
    },
    okStep() {
      if (!this.$refs.stepDialogForm.valid()) {
        return;
      }
      let data = this.$refs.stepDialogForm.getFormValue();
      if (!this.uuid) {
        data.uuid = this.$utils.setUuid(); //获取uuid
      } else {
        data.uuid = this.uuid;
      }
      this.$set(data, 'content', this.content);
      this.$set(data, 'fileIdList', this.fileIdList);
      this.$set(data, 'fileList', this.fileList);
      this.$set(data, 'startTimeWindow', this.startTimeWindow);
      this.$set(data, 'endTimeWindow', this.endTimeWindow);
      this.$set(data, 'workerVo', this.workerVo);
      this.stepDialog = false;
      this.cancleForm();

      this.$emit('save', data);
    },
    cancleSetp() {
      this.stepDialog = false;
      this.$emit('close', this.notifyDialog);
      this.cancleForm();
    },
    close(needRefresh) {
      this.stepDialog = needRefresh;
      this.$emit('close', needRefresh);
      this.cancleForm();
    },
    cancleForm() {
      this.stepDialogForm.forEach(e => {
        e.value = '';
      });
      this.uuid = null;
      this.fileList = [];
      this.fileIdList = [];
    },
    getFileList(val) {
      this.fileList = val;
      let newArray = [];
      val.forEach(item => {
        let fileId = item.id;
        newArray.push(fileId);
      });
      this.fileIdList = newArray;
    },
    removeFile(val) {
      this.fileList = val;
    },
    getUserText(val, list) {
      if (list) {
        this.workerVo = list;
        this.$set(this.workerVo, 'initType', val.split('#')[0]);
        this.$set(this.workerVo, 'uuid', val.split('#')[1]);
      }
    },
    contentInput() {
      let obj = this.$refs.content;
      let el = obj.$el.querySelector('textarea');
      this.blurIndex = el.selectionStart;
    },
    changeText(item) {
      let newContent = '';
      if (JSON.stringify(this.blurIndex) != 'null') {
        if (this.content) {
          let startStr = this.content.slice(0, this.blurIndex);
          let endStr = this.content.slice(this.blurIndex);
          newContent = startStr + item.freemarkerTemplate + endStr;
        } else {
          newContent = item.freemarkerTemplate;
        }
        this.content = newContent;
        let obj = this.$refs.content;
        let el = obj.$el.querySelector('textarea');
        setTimeout(() => {
          el.focus();
          el.selectionStart = this.blurIndex + item.freemarkerTemplate.length;
          el.selectionEnd = this.blurIndex + item.freemarkerTemplate.length;
        }, 250);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    isShow: {
      handler(val) {
        if (val) {
          this.stepDialog = val;
        }
      },
      immediate: true
    },
    config: {
      handler(val) {
        if (val) {
          this.stepDialogForm.forEach(i => {
            if (i.name != 'fileIdList') {
              i.value = val[i.name];
            }
          });
          this.content = val.content;
          this.fileIdList = val.fileIdList;
          this.uuid = val.uuid;
          this.fileList = val.fileList || [];
          this.startTimeWindow = val.startTimeWindow || '';
          this.endTimeWindow = val.endTimeWindow || '';
          this.workerVo = val.workerVo;
          // this.code = val.code;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.step-form {
  padding-right: 16px;
  overflow: auto;
  height: calc(100vh - 132px);
}
.param-right {
  height: calc(100vh - 132px);
  overflow: auto;
  padding-left: 16px;
  border-left: 1px solid;
  .parma-item {
    padding: 10px;
    margin-bottom: 10px;
  }
  .search-block {
    margin-bottom: 16px;
    .param-title {
      margin-bottom: 8px;
    }
  }
}
</style>
