<template>
  <div v-if="value">
    <div v-if="attrEntity.config.type == 'outterlink'">
      <a :href="value" target="_blank"><span v-if="attrEntity.config.text">{{ attrEntity.config.text }}</span>
        <span v-else class="tsfont-bind"></span></a>
    </div>
    <div v-else-if="attrEntity.config.type == 'innerlink'">
      <a href="javascript:void(0)" @click="toInnerLink()"><span v-if="attrEntity.config.text">{{ attrEntity.config.text }}</span>
        <span v-else class="tsfont-bind"></span></a>
    </div>
    <div v-else-if="attrEntity.config.type == 'route'">
      <a href="javascript:void(0)" @click="toRoute()"><span v-if="attrEntity.config.text">{{ attrEntity.config.text }}</span>
        <span v-else class="tsfont-bind"></span></a>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  directives: {},
  components: {
  },
  props: {
    mode: {type: String, default: 'list'},
    attrEntity: {type: Object}
  },
  data() {
    return {
      fileData: {}
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
  methods: {
    toInnerLink() {
      const link = this.value.toLowerCase();
      if (link.startsWith('http')) {
        window.location.href = this.value;
      } else {
        const protocal = window.location.protocol;
        const host = window.location.host;
        const port = window.location.port;
        const tenant = TENANT;
        window.location.href = protocal + '//' + host + '/' + tenant + this.value; 
      }
    },
    toRoute() {
      this.$router.push({path: this.value});
    }
  },
  filter: {},
  computed: {
    value: function() {
      if (this.attrEntity.valueList && this.attrEntity.valueList.length > 0) {
        return this.attrEntity.valueList[0];
      }
      return '';
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
