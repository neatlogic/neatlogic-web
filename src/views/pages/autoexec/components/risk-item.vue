
<template>
  <span class="fz10" :style="getStyle">{{ text||'' }}</span>
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {
  },
  props: {
    text: String,
    color: {
      type: String,
      default: '#212121'
    },
    opacity: {
      type: Number,
      default: 0.2
    }
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {
    getStyle() {
      return {
        'padding': '0 8px',
        'height': '20px',
        'line-height': '20px',
        'border-radius': '10px',
        'margin-right': '6px',
        'font-weight': 'normal',
        'vertical-align': 'initial',
        'color': this.color,
        'background': this.$utils.getLightColor(this.color, this.opacity),
        'display': 'inline-block'
      };
    }
  },
  watch: {}
};
</script>
