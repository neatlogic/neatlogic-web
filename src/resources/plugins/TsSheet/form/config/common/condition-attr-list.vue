<template>
  <div>
    <span v-for="(attr, index) in formAttrList" :key="index">
      <Tag>
        <span v-clipboard="getScriptParam(attr)" v-clipboard:success="clipboardSuc" class="cursor">{{ attr.label }}</span>
        <span v-if="attr.handlerName" class="text-grey fz10">({{ attr.handlerName }})</span>
      </Tag>
    </span>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';

export default {
  name: '',
  directives: { clipboard },
  components: {},
  props: {
    formAttrList: { type: Array }
  },
  data() {
    return {
      showMap: {}
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
    clipboardSuc() {
      this.$Message.success(this.$t('message.copysuccess'));
    },
    getScriptParam(attr) {
      return 'data' + "['" + attr.label + "']";
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
