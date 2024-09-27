<template>
  <div>
    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <!-- 外圈 -->
      <circle
        fill="none"
        stroke="#fff"
        stroke-width="2"
        cx="8"
        cy="8"
        r="6"
      />
    
      <!-- 内圈 -->
      <circle
        fill="#fff"
        stroke="#fff"
        stroke-width="1"
        opacity="0.8"
        cx="12"
        cy="12"
        r="2"
      >
        <animateTransform 
          attributeName="transform"
          type="rotate"
          dur="2s"
          from="0 8 8"
          to="360 8 8"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
    };
  },
  beforeCreate() {},
  async created() {
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
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
