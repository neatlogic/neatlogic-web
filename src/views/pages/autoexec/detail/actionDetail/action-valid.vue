<template>
  <div v-if="visible" class="valid-div">
    <Card v-if="validList && validList.length>0 " :padding="0">
      <p slot="title">{{ $t('page.validate') }}</p>
      <span slot="extra" class="tsfont-close remove text-grey" @click="onClose"></span>
      <CellGroup class="contain">
        <Cell
          v-for="(valid, index) of validList"
          :key="index"
          :title="valid.text"
          @click.native="clickItem(valid)"
        >
          <i slot="icon" :class="getClass(valid.type)"></i>
        </Cell>
      </CellGroup>
    </Card>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {},
  model: {
    prop: 'visible',
    event: 'change'
  },
  props: {
    visible: {//是否显示
      type: Boolean,
      default: false
    },
    validList: {//校验列表
      type: Array,
      default() { return [{text: this.$t('form.validate.validatefailed'), type: 'error'}, {text: this.$t('message.validatesuccess'), type: 'success'}]; }
    }
  },
  data() {
    return {};
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
    onClose() {
      this.$emit('change', false);
    },
    clickItem(item) {
      this.$emit('on-click', item);
    }
  },
  computed: {
    getClass() {
      return (type) => {
        let classJson = ['icon'];
        if (type == 'success') {
          classJson.push(['ts-complete', 'text-success']);
        } else if (type == 'error') {
          classJson.push(['tsfont-close-o', 'text-danger']);
        }
        return classJson;
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
.valid-div{
  width:320px;
  position: absolute; 
  z-index: 10;
  right: 0px;
  .remove{
    cursor: pointer;
  }
  .contain{
    max-height: 350px;
    overflow: auto;
    .icon{
      font-size: 20px;
    }
    /deep/ .ivu-cell-item{
      position: relative;
      padding-left: 30px;
      word-break: initial;
      white-space: initial;
      .ivu-cell-icon{
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(0, -50%);
        margin-right: 0;
      }
    }

  }
}
</style>
