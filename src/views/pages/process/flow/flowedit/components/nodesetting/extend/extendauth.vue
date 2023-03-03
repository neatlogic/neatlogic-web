<template>
  <div v-if="!noUserExtendList.includes(type)">
    <item
      :is="type"
      :config="config"
      :formConfig="formConfig"
      @updateConfig="updateConfig"
    ></item>
  </div>
</template>
<script>
import item from './index.js';
export default {
  name: '',
  components: {
    ...item
  },
  filters: {},
  props: {
    config: Object, //保存的拓展属性配置
    formConfig: Object, //关联表单数据
    noUserExtendList: Array//不需要使用的扩展属性
  },
  data() {
    return {
      type: 'cientityselect'
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
    updateConfig(config) {
      //更新拓展属性
      this.$emit('updateConfig', this.$utils.deepClone(config));
    }
    
  },
  computed: {},
  watch: {}

};

</script>
<style lang='less'>

</style>
