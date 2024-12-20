<template>
  <div v-if="value && value.length > 0">
    <Tag v-for="(v, index) in value" :key="index">{{ v }}</Tag>
  </div>
  <div v-else>-</div>
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
    value: function() {
      if (this.attrEntity.actualValueList && this.attrEntity.actualValueList.length > 0) {
        return this.attrEntity.actualValueList;
      } else if (this.attrEntity.valueList && this.attrEntity.valueList.length > 0) {
        return this.attrEntity.valueList;
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
