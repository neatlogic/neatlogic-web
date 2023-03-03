<template>
  <div>
    <template v-if="value && !$utils.isEmpty(value)">
      <UserCard
        v-for="item in value"
        :key="item"
        v-bind="getConfig(item)"
        :hideAvatar="true"
        class="pr-xs"
      ></UserCard>
    </template>
    <template v-else>{{ $t('page.notarget', {target: $t('page.defaultvalue')}) }}</template>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  props: {
    value: [Array]
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
    getConfig() {
      return item => {
        let list = item.split('#');
        let data = {
          initType: list[0],
          uuid: list[1]
        };
        return data;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
