<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
    @on-ok="save"
  >
    <template v-slot>
      <div>
        <TsForm
          ref="form"
          v-model="formData"
          :item-list="formConfig"
          type="type"
          label-position="right"
        >
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
export default {
  name: '',
  components: {
    TsForm
  },
  filters: {},
  props: {
    ciData: {type: Object}
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        title: '定时策略',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      formData: {
      },
      formConfig: {
        ciId: {
          type: 'text',
          isHidden: true
        },
        name: {
          label: '执行目标',
          type: 'text',
          disabled: true,
          placeholder: '填写模型类型名称，或者单个主机的IP（名称），不可编辑'
        },
        isActive: {
          type: 'radio',
          label: '是否激活',
          validateList: [{ name: 'required', message: '请选择状态' }],
          dataList: [
            {
              value: 1,
              text: '启用'
            },
            {
              value: 0,
              text: '禁用'
            }
          ]
        },
        cron: {
          type: 'quartz',
          label: '时间计划',
          showType: 'edit',
          validateList: ['required'],
          config: {direction: 'down'}
        },
        timerange: {
          label: '计划开始/计划结束',
          type: 'datetimerange',
          transfer: true
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getSchedule();
  },
  beforeMount() {},
  mounted() { },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs.form;
      if (form && form.valid()) {
        if (this.formData.timerange && this.formData.timerange.length > 0) {
          this.formData.beginTime = this.formData.timerange[0];
          this.formData.endTime = this.formData.timerange[1];
        } else {
          this.formData.beginTime = null;
          this.formData.endTime = null;
        }
        this.$api.inspect.assetsInspect.saveSchedule(this.formData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.executesuccess'));
            this.close(true);
          }
        });
      }
    },
    getSchedule() {
      if (this.ciData.id) {
        this.$api.inspect.assetsInspect.getSchedule(this.ciData.id).then(res => {
          this.formData = res.Return;
          this.$set(this.formData, 'name', this.ciData.ciLabel + '(' + this.ciData.ciName + ')');
          if (this.formData.beginTime && this.formData.endTime) {
            this.$set(this.formData, 'timerange', [this.formData.beginTime, this.formData.endTime]);
          }
        });
      } else {
        this.$set(this.formData, 'name', this.ciData.ciLabel + '(' + this.ciData.ciName + ')');
        this.$set(this.formData, 'ciId', this.ciData.ciId);
      }
    }
  },
  computed: {},
  watch: {
  }
};
</script>
<style scoped lang="less">
</style>
