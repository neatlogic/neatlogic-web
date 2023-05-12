<template>
  <span
    v-if="name"
    class="ml-xs pl-sm pr-sm radius-lg issue-status"
    :style="{
      '--color': color,
      'border-color': color,
      color: color,
      background: $utils.convertHexToRGBA(color, 0.2)
    }"
  >
    <strong>{{ label }}</strong>
  </span>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    issueData: { type: Object },
    status: { type: Number }
  },
  data() {
    return {
      color: null,
      label: null,
      name: null
    };
  },
  beforeCreate() {},
  created() {
    if (this.issueData && !this.$utils.isEmpty(this.issueData)) {
      this.name = this.issueData.status;
      this.color = this.issueData.statusColor;
      this.label = this.issueData.statusLabel;
    } else if (this.status) {
      this.$api.rdm.status.getStatusById(this.status).then(res => {
        this.name = res.Return.name;
        this.label = res.Return.label;
        this.color = res.Return.color;
      });
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.issue-status {
  border-width: 2px;
  border-style: solid;
}
</style>
