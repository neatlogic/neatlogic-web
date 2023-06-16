<template>
  <div>
    <span v-if="isFavorite" class="tsfont-star text-warning" @click="toggleFavorite(0)">
    </span>
    <span v-else class="tsfont-star-border text-warning" @click="toggleFavorite(1)">
    </span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    issueData: { type: Object },
    issueId: {type: Number},
    readonly: {type: Boolean}
  },
  data() {
    return {
      isFavorite: 0
    };
  },
  beforeCreate() {},
  created() {
    if (!this.issueData) {
      this.getIssueFavorityById();
    } else {
      this.isFavorite = this.issueData.isFavorite;
    }
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
    toggleFavorite(isFavorite) {
      this.$api.rdm.issue.toggleIssueIsFavorite(this.issueId, isFavorite).then(res => {
        if (res.Status === 'OK') {
          this.isFavorite = isFavorite;
        }
      });
    },
    getIssueFavorityById() {
      if (this.issueId) {
        this.$api.rdm.issue.checkIssueIsFavorite(this.issueId).then(res => {
          if (res.Return) {
            this.isFavorite = res.Return;
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
