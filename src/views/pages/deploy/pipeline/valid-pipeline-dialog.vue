<template>
  <div class="valid-div">
    <Card v-if="validList && validList.length>0 " :padding="0">
      <p slot="title">{{ $t('page.validate') }}</p>
      <span slot="extra" class="tsfont-close remove text-grey" @click="onClose"></span>
      <CellGroup class="contain">
        <Cell
          v-for="(valid, index) of validList"
          :key="index"
          :title="valid.message"
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
  props: {
    validList: {
      type: Array,
      default: () => { return []; }
    }
  },
  data() {
    return {

    };
  },
  beforeCreate() {},
  created() {
   
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
    clickItem(valid) {
      this.$emit('clickItem', valid);
    },
    onClose() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    getClass() {
      return (type) => {
        let classJson = ['icon'];
        if (type == 'success') {
          classJson.push(['tsfont-check-o', 'text-success']);
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
  width:360px;
  position: absolute; 
  z-index: 10;
  right: 0px;
  top: 0;
  .remove{
    cursor: pointer;
  }
  .contain{
    max-height: 350px;
    overflow: auto;
    .icon{
      font-size: 20px;
    }
    ::v-deep .ivu-cell-item{
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
