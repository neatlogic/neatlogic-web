<template>
  <div>
    <div class="tip-title">{{ config.typeName }}</div>
    <div class="activity-content">
      <div v-if="config.changeType =='clear'" class="text-grey pr8 flew-shrink0">{{ $t('button.delete') }}</div>
      <div v-if="config.oldContent">
        <div v-imgViewer v-html="config.oldContent"></div>
      </div>
      <div v-if="config.changeType == 'update'" class="change-text text-grey flew-shrink0">改为</div>
      <div v-if="config.newContent">
        <div v-imgViewer v-html="config.newContent"></div>
      </div>
    </div>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: '',
  components: {},
  directives: { imgViewer },
  filters: {},
  props: {
    config: Object
  },
  data() {
    return {};
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
<style lang='less' scoped>
.activity-content {
  display: flex;
  .pr8{
    padding-right: 8px;
  }
  .flew-shrink0{
    flex-shrink:0
  }
}
</style>
