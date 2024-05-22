<template>
  <div>
    <UserSelect
      :value="value"
      :multiple="!!config.isMultiple"
      :transfer="true"
      :groupList="config.groupList"
      :includeList="['common#loginuser']"
      :excludeList="['common#alluser']"
      border="border"
      @change="change"
    ></UserSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue')
  },
  props: {
    config: {type: Object},
    value: {type: [Object, String, Number, Array]}
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
  methods: {
    change(val) {
      this.$emit('change', val);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
