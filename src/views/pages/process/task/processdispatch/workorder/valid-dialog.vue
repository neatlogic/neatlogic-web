<template>
  <div v-if="validCardOpen" class="tsscroll-container valid-main">
    <Card style="width:100%;" :padding="0">
      <p slot="title">{{ $t('page.validate') }}</p>
      <a slot="extra" href="javascript:void(0);" @click.prevent="close()">
        <Icon custom="tsfont-close text-title"></Icon>
      </a>
      <CellGroup class="valid-list">
        <Cell
          v-for="(item, index) in validList"
          :key="index"
          :title="item.msg"
          @click.native="focus(item.focus, item)"
        >
          <Icon
            slot="icon"
            :custom="item.icon"
            size="20"
            :class="'text-' + item.type"
          ></Icon>
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
  filters: {
  },
  props: {
    isShow: Boolean,
    validList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      validCardOpen: false
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
    close() {
      this.validCardOpen = false;
      this.$emit('update:isShow', false);
    },
    focus(selector, item) {
      this.$emit('validItem', selector, item);
    }
  },
  computed: {},
  watch: {
    isShow(val) {
      this.validCardOpen = val;
    }
  }
};
</script>
<style lang="less" scoped>
.valid-main {
  position: absolute;
  top: 38px;
  right: 8px;
  z-index: 100;
  width: 320px;
  .valid-list {
    max-height: 300px; 
    overflow-y: auto;
  }
}
</style>
