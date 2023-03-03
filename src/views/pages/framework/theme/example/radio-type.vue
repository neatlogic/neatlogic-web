<template>
  <div>
    <TsFormRadio
      v-model="value"
      :dataList="dataList"
    ></TsFormRadio>
  </div>
</template>
<script>
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio';
export default {
  name: '',
  components: {
    TsFormRadio
  },
  data() {
    return {
      value: [],
      dataList: [{text: 'text', value: 'value'}]
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
