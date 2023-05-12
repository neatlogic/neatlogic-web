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
        title: this.$t('term.pbc.cromexpression'),
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
          label: this.$t('page.apply'),
          type: 'text',
          disabled: true
        },
        isActive: {
          type: 'radio',
          label: this.$t('term.report.isactive'),
          validateList: [
            {
              name: 'required',
              message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.status')})
            }
          ],
          dataList: [
            {
              value: 1,
              text: this.$t('page.enabled')
            },
            {
              value: 0,
              text: this.$t('page.disable')
            }
          ]
        },
        cron: {
          type: 'quartz',
          label: this.$t('term.pbc.timeplan'),
          showType: 'edit',
          validateList: ['required'],
          config: {direction: 'down'}
        },
        timerange: {
          label: this.$t('page.startplan') + '/' + this.$t('page.finishplan'),
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
            this.$Message.success(this.$t('message.executesuccess'));
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
