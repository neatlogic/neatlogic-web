<template>
  <div>
    <div slot="content" :class="type">
      <div>
        {{ $t('page.buttontype') }}：
        <Button type="primary" class="mr-md">{{ $t('page.background') }}</Button>
        <Button class="mr-md">{{ $t('page.border') }}</Button>
        <span class="text-href">{{ $t('page.text') }}</span>
      </div>
      <div class="width80 mt-md">
        {{ $t('page.input') }}
        <Input v-model="value"></Input>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {item: Object, type: String, list: Array},
  data() {
    return {
      value: ''
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
      let hoverValue = this.getByValue('--primary-hover-color');
      if (this.type === 'light') {
        document.body.style.setProperty('--light-primaryBtn', val);
        document.body.style.setProperty('--light-primaryBtnHover', hoverValue);
      } else {
        document.body.style.setProperty('--dark-primaryBtnHover', hoverValue);
        document.body.style.setProperty('--dark-primaryBtn', val);
      }
    },
    getByValue(param) {
      let value = '';
      this.list.forEach(v => {
        if (v.param === param && v.value) {
          value = v.value;
        }
      });
      return value;
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
.width80 {
  width: 80%;
}
.dark{
  /deep/.ivu-btn-primary{
    border-color: var(--dark-primaryBtn, #c6d9f6);
    background-color: var(--dark-primaryBtn, #F0F0F0);
    &:hover {
      border-color: var(--dark-primaryBtnHover, #c6d9f6);
      background-color: var(--dark-primaryBtnHover, #c6d9f6);
    }
  }
  /deep/.ivu-input:not([disabled]):hover{
    border-color: var(--dark-primaryBtn, #c6d9f6);
  }
  /deep/.ivu-btn-default{
    border-color: var(--dark-primaryBtnHover, #c6d9f6);
    color: var(--dark-primaryBtn, #c6d9f6);
  }
  .text-href{
    color: var(--dark-primaryBtn, #c6d9f6);
    &:hover{
      color: var(--dark-primaryBtnHover, #c6d9f6);
    }
  }
}
.light{
  /deep/.ivu-btn-primary{
    background-color: var(--light-primaryBtn, #c6d9f6);
    border-color: var(--light-primaryBtn, #c6d9f6);
    &:hover {
      border-color: var(--light-primaryBtn, #c6d9f6);
      background-color: var(--light-primaryBtn, #c6d9f6);
    }
  }
  /deep/.ivu-input:not([disabled]):hover{
    border-color: var(--light-primaryBtn, #c6d9f6);
  }
  /deep/.ivu-btn-default{
    border-color: var(--light-primaryBtnHover, #c6d9f6);
    color: var(--light-primaryBtn, #c6d9f6);
  }
  .text-href{
    color: var(--light-primaryBtn, #c6d9f6);
    &:hover{
      color: var(--light-primaryBtnHover, #c6d9f6);
    }
  }
}
</style>
