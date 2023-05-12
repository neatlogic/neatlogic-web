<template>
  <TsCkeditor :value="content" :readonly="true" width="100%"></TsCkeditor>
</template>
<script>
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
export default {
  name: '',
  components: {
    TsCkeditor
  },
  filters: {},
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object
  },
  data() {
    return {};
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
  },
  computed: {},
  watch: {}
};
</script>
