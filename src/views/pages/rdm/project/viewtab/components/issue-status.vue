<template>
  <span
    v-if="id && label"
    :class="{ actived: actived }"
    class="cursor pl-sm pr-sm radius-lg issue-status fz10"
    :style="{
      '--scale': scale,
      '--color': color,
      'border-color': color,
      color: color,
      background: $utils.convertHexToRGBA(color, 0.2)
    }"
    @click="clickStatus()"
  >
    {{ label }}
  </span>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    issueData: { type: Object },
    status: { type: Number },
    statusData: { type: Object },
    actived: { type: Boolean },
    scale: { type: Number, default: 1 }
  },
  data() {
    return {
      color: null,
      label: null,
      id: null
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
    clickStatus() {
      this.$emit('click', this.id);
    }
  },
  filter: {},
  computed: {},
  watch: {
    issueData: {
      handler: function(val) {
        if (val) {
          this.color = val.statusColor;
          this.label = val.statusLabel;
          this.id = val.status;
        }
      },
      deep: true,
      immediate: true
    },
    statusData: {
      handler: function(val) {
        if (val) {
          this.color = val.color;
          this.label = val.label;
          this.id = val.id;
        }
      },
      deep: true,
      immediate: true
    },
    status: {
      handler: function(val) {
        if (val) {
          this.id = val;
          this.$api.rdm.status.getStatusById(val).then(res => {
            this.label = res.Return.label;
            this.color = res.Return.color;
          });
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.issue-status {
  border-width: 1px;
  border-style: solid;
  display: inline-block;
  transform: scale(var(--scale));
}
.issue-status.actived:before {
  font-family: 'tsfont' !important;
  content: '\e863';
  display: inline-block;
  color: var(--color);
  margin-right: 3px;
}
</style>
