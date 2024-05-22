<template>
  <div>
    <TsDialog
      type="modal"
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
          <TsForm ref="stepDialogForm" :item-list="stepDialogForm" :label-width="100">
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
              <div style="width:90%">
                <TsUpLoad
                  styleType="button"
                  className="smallUpload"
                  dataType="change"
                  :multiple="uploadMultiple"
                  :defaultList="fileList"
                  @getFileList="getFileList"
                  @remove="removeFile"
                ></TsUpLoad>
              </div>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
export default {
  name: '',
  components: {
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    TsFormDatePicker
  },
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
          width: '90%',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput') }, { name: 'stepindex' }]
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          width: '90%',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.name')}) }, { name: 'name-special' }]
        },
        {
          type: 'textarea',
          name: 'content',
          label: this.$t('page.description'),
          width: '90%',
          transfer: true
        },
        {
          type: 'userselect',
          name: 'worker',
          label: this.$t('term.process.dealwithuser'),
          width: '90%',
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
          width: '90%',
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
      workerName: '',
      startTimeWindow: '',
      endTimeWindow: ''
      // code: null,
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
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
      this.$set(data, 'fileIdList', this.fileIdList);
      this.$set(data, 'fileList', this.fileList);

      this.$set(data, 'workerName', this.workerName);
      this.$set(data, 'startTimeWindow', this.startTimeWindow);
      this.$set(data, 'endTimeWindow', this.endTimeWindow);
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
    getUserText(val, label) {
      if (label) {
        this.workerName = label.text;
      } else {
        this.workerName = '';
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
          this.fileIdList = val.fileIdList;
          this.uuid = val.uuid;
          this.fileList = val.fileList || [];
          this.workerName = val.workerName || '';
          this.startTimeWindow = val.startTimeWindow || '';
          this.endTimeWindow = val.endTimeWindow || '';
          // this.code = val.code;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less'>
</style>
