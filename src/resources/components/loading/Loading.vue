<template>
  <div v-if="loadingShow" :class="type == 'fix'?'':'part-loading'">
    <Spin
      v-if="loadingShow"
      size="large"
      :fix="getType(type)"
      class="text-primary"
    >
      <Icon type="ios-loading" size="18" class="loading"></Icon>
      <slot><div v-if="text">{{ text }}</div></slot>
    </Spin>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  components: {},
  props: {
    type: {
      type: String,
      default: ''
    },
    loadingShow: {
      type: Boolean,
      default: false
    },
    text: {
      type: [Boolean, String],
      default() {
        return this.$t('page.loadingtip');
      }     
    }
  },
  data() {
    return {
    };
  },

  created() {},

  beforeMount() {},

  mounted() {},

  methods: {},

  computed: {
    getType() {
      return function(type) {
        let finalType = false;
        if (type == 'fix') {
          finalType = true;
        }
        return finalType;
      };
    }
  },

  watch: {
  }
};
</script>
<style lang="less">
.loading {
  animation: ani-demo-spin 1s linear infinite;
}
.part-loading{
    height: 100%;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
</style>
