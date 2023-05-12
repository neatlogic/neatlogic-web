<template>
  <div>
    <TsDialog
      :isShow="true"
      :title="assignableWorkerStepList.length > 0 ? $t('term.process.assigntitle') : $t('term.process.selectflowpath')"
      class="vertical-center-modal"
      @on-ok="save()"
      @on-close="$emit('close')"
    >
      <div style="max-height: 400px;">
        <div v-if="nextstepList && nextstepList.length > 1">
          <TsRow>
            <Col v-for="(next, nindex) in nextstepList" :key="nindex" span="8">
              <div class="select-box" :class="nextStepId == next.id ? 'active' : ''" @click="selectStep(next)">
                <div class="select-icon">
                  <i></i>
                </div>
                <div class="text-grey select-flowDirection">{{ next.flowDirection }}</div>
                <div class="select-name" :title="next.name">{{ next.name }}</div>
              </div>
            </Col>
          </TsRow>
        </div>
        <TsForm v-if="nextStepHandler != 'end' && assignableWorkerStepForm.length > 0" ref="assignableWorkerStepForm" :itemList="assignableWorkerStepForm"></TsForm>
      </div>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    nextstepList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      assignableWorkerStepList: [],
      assignableWorkerStepForm: [],
      nextStepId: null,
      nextStepHandler: null
    };
  },
  beforeCreate() {},
  created() {
    if (!this.$utils.isEmpty(this.nextstepList)) {
      this.selectStep(this.nextstepList[0]);
    }
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
    //选择流转
    selectStep(next) {
      this.nextStepId = next.id;
      this.nextStepHandler = next.type;
      this.assignableWorkerStepList = next.assignableWorkerStepList || [];
      this.setStepForm();
    },
    setStepForm() {
      this.assignableWorkerStepForm = [];
      if (this.assignableWorkerStepList.length > 0) {
        this.assignableWorkerStepList.forEach(item => {
          let data = {
            name: item.processStepUuid,
            label: this.$t('term.process.assigntosth', {target: item.name}),
            validateList: item.isRequired == 1 ? ['required'] : [],
            type: 'userselect',
            transfer: true,
            multiple: true,
            labelPosition: 'top',
            width: '100%',
            groupList: item.groupList && item.groupList.length > 0 ? item.groupList : ['user', 'role', 'team'],
            rangeList: item.rangeList
          };
          this.assignableWorkerStepForm.push(data);
        });
      }
    },
    save() {
      this.$emit('selectStep', this.nextStepId);
      let assignWorkerList = [];
      if (this.nextstepList.length > 1 && !this.nextStepId) {
        this.$Message.warning(this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.circulationpath')}));
        return;
      }
      if (this.$refs.assignableWorkerStepForm) {
        if (!this.$refs.assignableWorkerStepForm.valid()) {
          return;
        } else {
          let data = this.$refs.assignableWorkerStepForm.getFormValue();
          for (let i in data) {
            let list = {
              processStepUuid: i,
              workerList: data[i]
            };
            let processTaskStep = this.assignableWorkerStepList.find(d => d.processStepUuid == i);
            if (processTaskStep && processTaskStep.id) {
              list.processTaskStepId = processTaskStep.id;
            }
            assignWorkerList.push(list);
          }
        }
      }
      this.$emit('saveStep', assignWorkerList);
    }
  },
  filter: {},
  computed: {
       
  },
  watch: {}
};
</script>
<style lang="less">
</style>
