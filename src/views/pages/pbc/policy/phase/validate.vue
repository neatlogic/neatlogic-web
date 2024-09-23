<template>
  <div>
    <div v-if="!phase.error">
      <div v-if="result" class="grid">
        <div class="title">{{ $t('term.pbc.groupid') }}：</div>
        <div>{{ result.groupId }}</div>
        <div class="title">{{ $t('page.returncode') }}：</div>
        <div>{{ result.code }}</div>
        <div class="title">{{ $t('term.pbc.message') }}：</div>
        <div>{{ result.msg }}</div>
      </div>
    </div>
    <div v-else>
      <Alert type="error">
        <div>
          <span>{{ phase.error }}</span>
        </div>
      </Alert>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: { phase: { type: Object } },
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
  computed: {
    result() {
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
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50px auto;
  grid-gap: 10px;
  .title {
    text-align: right;
  }
}
</style>
