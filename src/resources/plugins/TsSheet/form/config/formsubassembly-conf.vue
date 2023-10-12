<template>
  <div>
    <!-- 场景编辑暂不支持子组件编辑 -->
    <Button
      v-if="!formItem.hasOwnProperty('inherit')"
      :disabled="!!formItem.inherit || disabled"
      type="primary"
      style="width:100%"
      ghost
      @click="editForm()"
    >
      <span class="tsfont-edit">
        编辑组件
      </span>
    </Button>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    
  },
  extends: base,
  props: {},
  data() {
    return {
     
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editForm() {
      if (this.disabled) {
        return;
      }
      this.$emit('editSubForm');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
