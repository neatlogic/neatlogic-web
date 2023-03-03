<template>
  <div style="height:calc(100vh - 120px);overflow-y:auto">
    <ul class="mr-nm">
      <li
        v-for="(conf, index) in confList"
        :key="index"
        style="cursor:pointer"
        class="padding-xs overflow treeList text-action radius-sm"
        :class="{'bg-selected':confId === conf.id}"
        @click="click(conf)"
      >
        <div>{{ conf.name }}</div>
        <div class="text-grey fz10">{{ conf.nets }}</div>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    confId: {type: Number}
  },
  data() {
    return {
      confList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getDiscoveryConfList();
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
    getDiscoveryConfList() {
      this.$api.cmdb.discovery.getDiscoveryConfList().then(res => {
        this.confList = res.Return;
        this.confList.forEach(element => {
          this.$set(element, 'isEditing', false);
        });
      });
    },
    click(conf) {
      this.$emit('click', conf);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
