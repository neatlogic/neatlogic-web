
<template>
  <colgroup v-if="list && list.length">
    <col v-for="(hitem,hindex) in list" :key="hitem.key+'_'+hindex+'_'+hitem.width" :width="(typeof hitem.width =='number' || hitem.width) ?hitem.width:''" />
  </colgroup>
</template>
<script>
export default {
  name: 'ColGroup',
  components: {
    
  },
  filters: {
  },
  props: {
    list: Array,
    canResize: Boolean
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
