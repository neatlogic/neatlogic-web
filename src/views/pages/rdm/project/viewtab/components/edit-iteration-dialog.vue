<template>
  <TsDialog v-bind="dialogConfig" @on-ok="saveIteration" @on-close="close">
    <template v-slot>
      <div>
        <div class="mb-md">
          <TsRow :gutter="20">
            <Col span="12">
              <TsFormItem :label="$t('page.title')" labelPosition="top" :required="true">
                <TsFormInput
                  ref="iterationName"
                  v-model="iterationData.name"
                  border="border"
                  :maxlength="100"
                  :validateList="[{ name: 'required', message: ' ' }]"
                ></TsFormInput>
              </TsFormItem>
            </Col>
            <Col span="12">
              <TsFormItem :label="$t('page.time')" labelPosition="top" :required="true">
                <TsFormDatePicker
                  ref="startEndTime"
                  v-model="iterationData.dateRange"
                  format="yyyy-MM-dd"
                  value-type="format"
                  type="daterange"
                  transfer
                  border="border"
                  :validateList="[{ name: 'required', message: ' ' }]"
                ></TsFormDatePicker>
              </TsFormItem>
            </Col>
          </TsRow>
        </div>
        <Divider />
        <TsCkeditor v-model="iterationData.description"></TsCkeditor>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve)
  },
  props: {
    id: { type: Number },
    app: { type: Object }
  },
  data() {
    return {
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.app.name }) : this.$t('dialog.title.addtarget', { target: this.app.name }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      iterationData: {
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getIterationById();
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
    getIterationById() {
      if (this.id) {
        this.$api.rdm.iteration.getIterationById(this.id).then(res => {
          this.iterationData = res.Return;
        });
      }
    },
    saveIteration() {
      let isValid = true;
      if (!this.$refs['iterationName'].valid()) {
        isValid = false;
      }
      if (!this.$refs['startEndTime'].valid()) {
        isValid = false;
      }
      if (isValid) {
        this.iterationData.projectId = this.app.projectId;
        this.$api.rdm.iteration.saveIteration(this.iterationData).then(res => {
          if (res.Status === 'OK') {
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 20px;
}
</style>
