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
          <div
            v-for="(item,index) in currentStepList"
            :key="index"
            class="step-li cursor-pointer border-color"
            @click="selectItem(item)"
          >
            <span class="stepindex border-primary" :class="item.id === id?'active':''"></span>
            <span>{{ item.name }}</span>
          </div>
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
.step-li{
  position: relative;
  display: block;
  height: 60px;
  padding-left: 30px;
  &:not(:last-child){
    &:before{
      content: '';
      position: absolute;
      width: 0;
      top: 18px;
      left: 8px;
      border: 0 none;
      border-left: 1px solid;
      border-color: inherit;
      bottom: -2px;
    }
  }
  .stepindex{
    position: absolute;
    top: 1px;
    width: 18px;
    height: 18px;
    left: 0;
    border-radius: 50%;
    border: 1px solid;
    text-align: center;
    line-height: 18px;
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
}
</style>
