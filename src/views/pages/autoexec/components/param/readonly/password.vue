
<template>
  <div>
    <template v-if="value && !$utils.isEmpty(value)">
      ********
    </template>
    <template v-else>{{ $t('page.notarget', {target: $t('page.defaultvalue')}) }}</template>
  </div>
   
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {
  },
  props: {
    value: String,
    config: Object
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
