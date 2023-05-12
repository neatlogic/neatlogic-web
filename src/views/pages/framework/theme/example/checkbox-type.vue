<template>
  <div>
    <TsFormCheckbox
      v-model="value"
      :dataList="dataList"
    ></TsFormCheckbox>
  </div>
</template>
<script>
import TsFormCheckbox from '@/resources/plugins/TsForm/TsFormCheckbox';
export default {
  name: '',
  components: {
    TsFormCheckbox
  },
  data() {
    return {
      dataList: [{text: 'text', value: 'value'}],
      value: ''
    };
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
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
