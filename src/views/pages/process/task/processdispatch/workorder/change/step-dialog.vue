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
                  ref="fileList"
                  styleType="button"
                  className="smallUpload"
                  dataType="change"
                  :multiple="uploadMultiple"
                  :defaultList="defaultFileList"
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
      defaultFileList: [],
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
      workerVo: null,
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
      this.$set(data, 'fileList', this.fileList);
      this.$set(data, 'fileIdList', this.fileIdList);
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
      let fileIdList = [];
      fileIdList = this.fileList.map(f => {
        return f.id;
      });
      this.fileIdList = fileIdList;
    },
    removeFile(val) {
      this.fileList = val;
      let fileIdList = [];
      if (this.fileList.length > 0) {
        fileIdList = this.fileList.map(f => {
          return f.id;
        });
      }
      this.fileIdList = fileIdList;
    },
    getUserText(val, item) {
      if (item) {
        this.workerVo = item;
        this.$set(this.workerVo, 'initType', item.value.split('#')[0]);
        this.$set(this.workerVo, 'uuid', item.value.split('#')[1]);
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
          if (val.fileList && val.fileList.length > 0) {
            this.fileList = val.fileList;
            this.defaultFileList = this.$utils.deepClone(val.fileList);
          }

          this.workerVo = val.workerVo || '';
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
