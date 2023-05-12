<template>
  <div class="step-topo">
    <ul v-if="list && list.length>0" class="stepList">
      <template v-for="(ary, sindex) in list">
        <li   
          v-if="ary && ary.length"
          :key="sindex"
          class="step-li border-color"
        >
          <span class="stepIndex tips border-color"> {{ sindex+1 }} </span>
          <ul>
            <li
              v-for="(step, iindex) in ary"
              :key="iindex"
              class="dividing-color radius-sm padding-sm"
              @click="changeSelectStep(step)"
            >    
              <div>
                <div class="step-name overflow" :title="step.name && step.name.length > 9 ? step.name : ''">{{ step.name || '-' }}</div>
                <div class="step-type">
                  <span class="text-grey fz10">{{ getExecModeText(step.execMode) }}</span>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    stepList: Array,
    execModeList: Array
  },
  data() {
    return {
      list: []
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
    updateStepList() {
      let list = [];
      if (this.stepList.length) {
        for (let sort = 0, index = 0; index < this.stepList.length;) {
          let arr = [];
          this.stepList.filter(l => {
            if (l.groupSort == sort) {
              arr.push(l);
              index++;
              return true;
            }
          });
          sort++;
          list.push(arr);
        }
      }
      return list;
    },
    changeSelectStep(step) {
      this.$emit('jumpToStep', step);
    }
  },
  filter: {},
  computed: {
    getExecModeText() {
      return function(value) {
        let currentItem = this.execModeList && this.execModeList.find(li => {
          return li.value == value;
        });
        return currentItem ? currentItem.text : '';
      };
    }
  },
  watch: {
    stepList: {
      handler() {
        this.list = this.updateStepList();
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@iconWidth: 24px;
ul.stepList {
  word-break: keep-all;
  white-space: nowrap;
  >li{
    padding-left: 30px;
    &:not(:last-child):before {
        content: '';
        position: absolute;
        width: 0;
        top: 28px;
        left: 11px;
        border: 0 none;
        border-left: 1px solid;
        border-color: inherit;
        border-style: dashed;
        bottom: -15px;
      }
    .stepIndex {
      &::before {
        content: attr(data-index);
        display: block;
        min-width: auto;
      }
    }
    .stepIndex {
      position: absolute;
      top: 1px;
      width: @iconWidth;
      height: @iconWidth;
      left: 0;
      border-radius: 50%;
      border: 1px solid;
      text-align: center;
      line-height: calc(@iconWidth - 1px);
      font-size: 12px;
      &:before {
        margin-right: 0;
      }
    }
  }
  li {
    position: relative;
    display: block;
    min-height: 58px;
    margin-bottom:16px;
    >ul{
      >li{
          position: relative;
          margin-bottom: 6px;
          width: 200px;
          border: 1px solid;
        &:last-of-type{
          margin-bottom: 0px;
        }
        .setp-check {
          position: absolute;
          top: 50%;
          left: 210px;
          transform: translateY(-50%);
        }
      }
    }
  }
}
</style>
