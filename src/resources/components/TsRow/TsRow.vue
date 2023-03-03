<template>
  <div class="clearfix">
    <Row :gutter="gutter" :class="className">
      <slot></slot>
    </Row>
  </div>
</template>

<script>
export default {
  name: '',

  components: {},
  props: {
    gutter: {
      type: Number,
      default: 16
    },
    className: {
      //自定义样式
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },

  beforeMount() {},

  mounted() {},

  methods: {},

  computed: {},

  watch: {}
};
</script>
<style lang="less"></style>
