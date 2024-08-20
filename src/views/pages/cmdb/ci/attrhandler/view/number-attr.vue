<template>
  <div>{{ value }}</div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    mode: { type: String, default: 'list' },
    attrEntity: { type: Object }
  },
  data() {
    return {
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
  methods: {},
  filter: {},
  computed: {
    value: function() {
      if (this.attrEntity.actualValueList && this.attrEntity.actualValueList.length > 0) {
        return this.attrEntity.actualValueList[0];
      }
      return '-';
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
