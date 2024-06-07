
<template>
  <div>
    <div v-for="item in tree" :key="item.id" class="titlelistBox">
      <div v-if="item.ciList.length > 0" class="treeTitle ci-label text-title">{{ item.name }}</div>
      <div v-if="item.ciList.length > 0">
        <ul>
          <li
            v-for="j in item.ciList"
            :key="j.id"
            class="text-default overflow"
            :class="['treeList', j.icon, { 'tsbg-block': j.isShow }]"
            :title="j.label"
            @click="getTemplate(item, j)"
          >
            <span>{{ j.label }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    tree: {
      type: Array
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
    getTemplate(data, nodeData) {
      this.$emit('getTemplate', data, nodeData);
    }
  },
  computed: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
@import (reference) '~@/resources/assets/css/theme.less';
.titlelistBox {
  margin-bottom: 14px;
}
.treeTitle {
  padding-left: 16px;
  font-size: 12px;
  margin-bottom: 4px;
}
.treeList {
  font-size: 13px;
  font-weight: 400;
  min-width: 130px;
  height: 32px;
  line-height: 32px;
  padding-left: 16px;
  cursor: pointer;
  span {
    padding-left: 10px;
  }
}
// .bg-block {
//   border-radius: 6px;
// }
.tsbg-block {
  border-radius: 6px;
}
</style>
