
<template>
  <TsRow>
    <Col v-for="(item, index) in list" :key="index" span="8">
      <div class="select-box" :class="item.id == id ? 'active' : ''" @click="selecStep(item)">
        <div class="select-icon">
          <i></i>
        </div>
        <div v-if="item.flowDirection" class="text-grey select-flowDirection">{{ item.flowDirection }}</div>
        <div class="select-name" :title="item.name">{{ item.name }}</div>
      </div>
    </Col>
  </TsRow>
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {
  },
  props: {
    list: Array, //步骤列表
    id: [String, Number] //选中id
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
  methods: {
    selecStep(item) {
      this.$emit('selecStep', item);
    }
  },
  computed: {},
  watch: {}
};
</script>
