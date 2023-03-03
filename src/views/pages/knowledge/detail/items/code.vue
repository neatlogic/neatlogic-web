<template>
  <div :class="changeType?'bg-'+changeType:''" class="edit-code" :data_id="uuid">
    <TsCodemirror
      ref="code"
      :value="content"
      :codeMode="config.codeMode"
      :isReadOnly="true"
      :disabled="true"
    ></TsCodemirror>
  </div>
</template>
<script>
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
export default {
  name: '',
  components: {
    TsCodemirror
  },
  filters: {},
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object,
    changeType: String
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
<style lang="less" scoped>
.edit-code{
  padding:10px 0px ;
  /deep/.tscodemirror.disabled .CodeMirror-line{
    opacity: 1;
  }
}
</style>
