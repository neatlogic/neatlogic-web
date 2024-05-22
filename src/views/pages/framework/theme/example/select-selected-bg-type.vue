<template>
  <div>
    <TsFormSelect
      v-model="value"
      :dataList="dataList"
      :class="type"
    ></TsFormSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {item: Object, type: String},
  data() {
    return {
      dataList: [
        {
          text: 'yes',
          value: 'yes'
        },
        {
          text: 'no',
          value: 'no'
        }
      ],
      value: 'yes'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init(this.item.value);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init(val) {
      if (this.type == 'light') {
        document.body.style.setProperty('--light-select-selected-bg', val);
      } else {
        document.body.style.setProperty('--dark-select-selected-bg', val);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.dark{
  /deep/ .ivu-input:not([disabled]):focus, /deep/ .ivu-input:not([disabled]):hover {
    border-color: var(--dark-select-selected-bg, #1670f0);
  }
  /deep/.ivu-dropdown-item {
    &:hover{
      background-color: var(--dark-select-selected-bg, #F0F0F0)!important;
    }
    &.selected {
      color: #212121;
      background-color: var(--dark-select-selected-bg, #F0F0F0);
    }
  }
}
.light{
   /deep/ .ivu-input:not([disabled]):focus, /deep/ .ivu-input:not([disabled]):hover {
    border-color: var(--light-select-selected-bg, #1670f0);
  }
  /deep/.ivu-dropdown-item {
    &:hover{
      background-color: var(--light-select-selected-bg, #F0F0F0)!important;
    }
    &.selected {
      color: #212121;
      background-color: var(--light-select-selected-bg, #F0F0F0);
    }
  }
}
</style>
