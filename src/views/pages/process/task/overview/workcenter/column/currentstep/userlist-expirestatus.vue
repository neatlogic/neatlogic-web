<template>
  <div style="height:100%;">
    <CenterExpireStatus v-if="row.expireStatus !== 'no-expired-time'" :row="row"></CenterExpireStatus>
    <UserList
      v-else
      :row="row"
      :type="type"
      class="carouse-user-list"
    ></UserList>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserList: () => import('@/views/pages/process/task/overview/workcenter/column/currentstep/user-list.vue'),
    CenterExpireStatus: () => import('@/views/pages/process/task/overview/CenterExpireStatus.vue')
  },
  filters: {},
  props: {
    row: Object,
    type: String
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
  computed: {},
  watch: {}

};

</script>
<style lang='less'>

</style>
