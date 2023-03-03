<template>
  <div>
    <TsFormInput
      v-model="value"
      type="text"
      maxlength="50"
    ></TsFormInput>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
export default {
  name: '',
  components: {
    TsFormInput
  },
  data() {
    return {
      value: ''
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
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
