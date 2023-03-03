<template>
  <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
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
    scheduleData: {
      type: Object
    }
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
      formData: {},
      formConfig: {
        appSystemId: {
          type: 'text',
          isHidden: true
        },
        name: {
          label: '应用',
          type: 'text',
          disabled: true
        },
        isActive: {
          type: 'radio',
          label: '是否激活',
          validateList: [
            {
              name: 'required',
              message: '请选择状态'
            }
          ],
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
          type: 'datetimerange'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getSchedule();
  },
  beforeMount() {},
  mounted() {},
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
        }
        this.$api.inspect.applicationInspect.saveSchedule(this.formData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.executesuccess'));
            this.close(true);
          }
        });
      }
    },
    getSchedule() {
      if (this.scheduleData.id) {
        this.$api.inspect.applicationInspect.getSchedule(this.scheduleData.id).then(res => {
          this.formData = res.Return;
          this.$set(this.formData, 'name', this.scheduleData.appSystemAbbrName + '(' + this.scheduleData.appSystemName + ')');
          if (this.formData.beginTime && this.formData.endTime) {
            this.$set(this.formData, 'timerange', [this.formData.beginTime, this.formData.endTime]);
          }
        });
      } else {
        this.$set(this.formData, 'name', this.scheduleData.appSystemAbbrName + '(' + this.scheduleData.appSystemName + ')');
        this.$set(this.formData, 'appSystemId', this.scheduleData.appSystemId);
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style scoped lang="less"></style>
