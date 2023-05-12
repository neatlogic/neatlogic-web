<template>
  <div v-if="!phase.error">
    <div v-if="result" class="grid">
      <div class="title">{{ $t('term.pbc.batchid') }}：</div>
      <div>{{ result.branchId }}</div>
      <div class="title">{{ $t('page.returncode') }}：</div>
      <div>{{ result.code }}</div>
      <div class="title">{{ $t('term.pbc.message') }}：</div>
      <div>{{ result.msg }}</div>
      <div v-if="result.data" class="title">{{ $t('page.detail') }}：</div>
      <div v-if="result.data">
        <div v-for="(d,index) in result.data" :key="index">
          <span v-if="d.code" class="mr-md">
            <span>{{ $t('page.errorcode') }}：</span>
            <span>{{ d.code }}</span>
          </span>
          <span v-if="d.facilityCategory" class="mr-md">
            <span>{{ $t('term.pbc.classifyidentifier') }}：</span>
            <span>{{ d.facilityCategory }}</span>
          </span>
          <span v-if="d.facilityDescriptor" class="mr-md">
            <span>{{ $t('page.uniquekey') }}：</span>
            <span>{{ d.facilityDescriptor }}</span>
          </span>
          <span v-if="d.msg" class="mr-md">
            <span>{{ $t('term.pbc.message') }}：</span>
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
