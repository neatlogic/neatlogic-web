<template>
  <div>
    <Cascader :data="cascaderDataList" @on-change="handleChange">
      <span class="tsfont-plus"></span>
    </Cascader>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      cascaderDataList: [
        {
          value: 'heading1',
          label: 'h1'
        },
        {
          value: 'heading2',
          label: 'h2'
        },
        {
          value: 'heading3',
          label: 'h3'
        },
        {
          value: '加粗',
          label: '加粗'
        },
        {
          value: '斜体',
          label: '斜体'
        },
        {
          value: '下划线',
          label: '下划线'
        }
      ]
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
    handleChange(value, selectedData) {
      this.text = selectedData.map(o => o.label).join(', ');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
