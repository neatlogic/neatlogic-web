<template>
  <div v-if="visible" class="valid-div">
    <Card v-if="validList && validList.length>0 " :padding="0">
      <p slot="title">{{ $t('page.validate') }}</p>
      <span slot="extra" class="tsfont-close remove text-grey" @click="close"></span>
      <div class="contain">
        <div
          v-for="(valid, index) of validList"
          :key="index"
          :title="valid.text"
          class="list li-hover"
          @click="jumpToItem(valid)"
        >
          <i :class="getClass(valid.type)"></i>
          {{ valid.text }}
        </div>
      </div>
    </Card>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
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
      default: () => []
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
    close() {
      this.$emit('change', false);
    },
    jumpToItem(item) {
      this.$emit('jumpToItem', item);
    }
  },
  filter: {},
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
  top:0;
  .remove{
    cursor: pointer;
  }
  .contain{
    max-height: 350px;
    overflow: auto;
    .list {
      position: relative;
      padding: 6px 16px 6px 46px;
      line-height: 24px;
      cursor: pointer;
    }
    .icon{
      position: absolute;
      top: 8px;
      left: 16px;
      font-size: 20px;
    }
  }
}
</style>
