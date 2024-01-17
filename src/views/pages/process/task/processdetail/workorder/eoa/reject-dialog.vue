<template>
  <div>
    <TsDialog
      title="驳回到"
      type="slider"
      :isShow="true"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div class="pl-lg">
          <Timeline class="ts-dialog-timeline-item-head-bg">
            <TimelineItem
              v-for="(item,index) in currentStepList"
              :key="index"
              class="cursor-pointer"
              @click.native="selectItem(item)"
            >
              <div slot="dot" class="icon-index border-primary" :class="item.id === id?'active':''"></div>
              <div class="pl-sm">
                {{ item.name }}
              </div>
            </TimelineItem>
          </Timeline>
          <div v-if="validMessage" class="text-error">{{ validMessage }}</div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    stepList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      id: null,
      currentStepList: [],
      validMessage: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (!this.$utils.isEmpty(this.stepList)) {
        this.currentStepList = this.stepList.filter(item => {
          return !item.isHistory;
        });
      }
    },
    selectItem(item) {
      this.id = item.id;
      this.validMessage = '';
    },
    okDialog() {
      if (!this.id) {
        this.validMessage = this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.process.step')});
        return;
      }
      this.closeDialog(this.id);
    },
    closeDialog(id) {
      this.validMessage = '';
      this.$emit('close', id);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
/deep/ .ivu-timeline-item-head-custom {
  margin-top: 12px;
  width: 20px;
  height: 20px;
  line-height: 19px;
  text-align: center;
  padding: 0;
  left: -3px;
  top: -5px;
}
.icon-index {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  &.active {
    &:before{
      content: '';
      display: inline-block;
      border-radius: 50%;
      border: 5px solid;
      border-color: inherit;
    }
  }
}
</style>
