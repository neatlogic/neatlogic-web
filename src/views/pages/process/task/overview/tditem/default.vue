<template>
  <div style="height:100%;">
    <CarouseUserList :row="row" :type="type" class="carouse-user-list"></CarouseUserList>
    <CenterExpireStatus v-if="row.expireStatus !== 'no-expired-time'" :row="row"></CenterExpireStatus>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CarouseUserList: () => import('../CarouseUserList.vue'),
    CenterExpireStatus: () => import('../CenterExpireStatus.vue')
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
  computed: {
  },
  watch: {}

};

</script>
<style lang='less'>

</style>
