<template>
  <div v-if="!phase.error">
    <div v-if="result" class="grid">
      <div class="title">批次ID：</div>
      <div>{{ result.branchId }}</div>
      <div class="title">返回码：</div>
      <div>{{ result.code }}</div>
      <div class="title">信息：</div>
      <div>{{ result.msg }}</div>
      <div v-if="result.data" class="title">详情：</div>
      <div v-if="result.data">
        <div v-for="(d,index) in result.data" :key="index">
          <span v-if="d.code" class="mr-md">
            <span>错误码：</span>
            <span>{{ d.code }}</span>
          </span>
          <span v-if="d.facilityCategory" class="mr-md">
            <span>分类标识：</span>
            <span>{{ d.facilityCategory }}</span>
          </span>
          <span v-if="d.facilityDescriptor" class="mr-md">
            <span>唯一标识：</span>
            <span>{{ d.facilityDescriptor }}</span>
          </span>
          <span v-if="d.msg" class="mr-md">
            <span>信息：</span>
            <span>{{ d.msg }}</span>
          </span>
          <Divider v-if="index<result.data.length -1" class="mt-md mb-md" />
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <Alert type="error">{{ phase.error }}</Alert>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: { phase: { type: Object}},
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
  methods: {},
  filter: {},
  computed: { result() {
    if (this.phase && this.phase.result) {
      try {
        return JSON.parse(this.phase.result);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  error() {
    if (this.phase && this.phase.error) {
      try {
        return JSON.parse(this.phase.error);
      } catch (e) {
        return null;
      }
    }
    return null;
  }},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 100px auto;
  grid-gap: 10px;
  .title {
    text-align: right;
  }
}
</style>
