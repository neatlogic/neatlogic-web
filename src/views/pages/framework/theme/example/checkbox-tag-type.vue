<template>
  <div>
    <div class="text-title mb-md">优先级</div>
    <TsFormCheckbox
      v-model="value"
      :dataList="dataList"
      className="block-span"
      :class="type"
    ></TsFormCheckbox>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormCheckbox: resolve => require(['@/resources/plugins/TsForm/TsFormCheckbox'], resolve)
  },
  props: {item: Object, type: String},
  data() {
    return { 
      dataList: [
        {
          text: '普通',
          value: '普通'
        },
        {
          text: '特急',
          value: '特急'
        },
        {
          text: '紧急',
          value: '紧急'
        }
      ],
      value: ['普通']
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
      if (this.type === 'light') {
        document.body.style.setProperty('--light-checkbox-tag-color', val);
      } else {
        document.body.style.setProperty('--dark-checkbox-tag-color', val);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    'item.value': {
      handler(val) {
        this.init(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.dark{
  /deep/.block-span .ivu-checkbox-wrapper-checked{
    background: var(--dark-checkbox-tag-color, #6ac0ff) !important;
  }
}
.light{
  /deep/.block-span .ivu-checkbox-wrapper-checked{
    background: var(--light-checkbox-tag-color, #6ac0ff) !important;
  }
}
</style>
