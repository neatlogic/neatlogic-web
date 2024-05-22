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
                  format="HH:mm"
                  width="100%"
                  type="time"
                  style="width: 24%;display: inline-block;"
                  transfer
                ></TsFormDatePicker>
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    TsFormDatePicker
  },
  props: {
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
      dialogTitle: this.$t('page.edit'),
      dataConfig: null,
      stepDialog: false,
      stepDialogForm: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          width: '90%',
          // readonly: true,
          disabled: true
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
        },
        {
          type: 'slot',
          name: 'startTimeWindow',
          width: '50%',
          label: this.$t('term.process.startTimeWindow')
        }
      ],
      workerName: '',
      startTimeWindow: '',
      endTimeWindow: ''
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
      this.$set(this.dataConfig, 'planStartDate', data.planStartDate);
      this.$set(this.dataConfig, 'worker', data.worker);
      this.$set(this.dataConfig, 'workerName', this.workerName);
      this.$set(this.dataConfig, 'startTimeWindow', this.startTimeWindow);
      this.$set(this.dataConfig, 'endTimeWindow', this.endTimeWindow);

      this.stepDialog = false;
      // this.cancleForm();

      this.$emit('save', this.dataConfig);
    },
    cancleSetp() {
      this.stepDialog = false;
      this.$emit('close', this.notifyDialog);
      // this.cancleForm();
    },
    close(needRefresh) {
      this.stepDialog = needRefresh;
      this.$emit('close', needRefresh);
      // this.cancleForm();
    },
    // cancleForm() {
    //   this.stepDialogForm.forEach(e => {
    //     e.value = '';
    //   });
    // },
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
            i.value = val[i.name];
          });
          this.dataConfig = val;
          this.workerName = val.workerName || '';
          this.startTimeWindow = val.startTimeWindow || '';
          this.endTimeWindow = val.endTimeWindow || '';
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
