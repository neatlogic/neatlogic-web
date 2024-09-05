<template>
  <div v-if="pageCount > 1">
    <div class="item-edge" @click="change(Math.max(currentPage - 1, 1))"><span class="tsfont-up fz10" :class="{ 'text-disabled': currentPage === 1 }"></span></div>
    <div
      v-if="currentPage - 3 >= 1"
      class="item overflow"
      title="1"
      @click="change(1)"
    >1</div>
    <div v-if="currentPage - 3 >= 1" class="item overflow" @click="change(Math.max(currentPage - 5, 1))"><span class="text-grey tsfont-option-vertical"></span></div>
    <div
      v-if="currentPage - 2 >= 1"
      :title="currentPage - 2"
      class="item overflow"
      @click="change(currentPage - 2)"
    >{{ currentPage - 2 }}</div>
    <div
      v-if="currentPage - 1 >= 1"
      :title="currentPage - 1"
      class="item overflow"
      @click="change(currentPage - 1)"
    >{{ currentPage - 1 }}</div>
    <div class="item overflow">
      <strong class="text-primary" :title="currentPage">{{ currentPage }}</strong>
    </div>
    <div
      v-if="currentPage + 1 <= pageCount"
      class="item overflow"
      :title="currentPage + 1"
      @click="change(currentPage + 1)"
    >{{ currentPage + 1 }}</div>
    <div
      v-if="currentPage + 2 <= pageCount"
      class="item overflow"
      :title="currentPage + 2"
      @click="change(currentPage + 2)"
    >{{ currentPage + 2 }}</div>
    <div v-if="currentPage + 3 <= pageCount" class="item overflow" @click="change(Math.min(currentPage + 5, pageCount))"><span class="text-grey tsfont-option-vertical"></span></div>
    <div
      v-if="currentPage + 3 <= pageCount"
      :title="pageCount"
      class="item overflow"
      @click="change(pageCount)"
    >{{ pageCount }}</div>
    <div class="item-edge" @click="change(Math.min(currentPage + 1, pageCount))"><span class="tsfont-down fz10" :class="{ 'text-disabled': currentPage === pageCount }"></span></div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    currentPage: { type: Number },
    pageCount: { type: Number }
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
    change(page) {
      this.$emit('change', page);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.item {
  text-align: center;
  cursor: pointer;
  line-height: 20px;
  width: 24px;
  height: 20px;
}
.item-edge {
  text-align: center;
  cursor: pointer;
  width: 24px;
}
</style>
