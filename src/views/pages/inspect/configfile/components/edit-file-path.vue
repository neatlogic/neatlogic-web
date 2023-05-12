<template>
  <div>
    <TsDialog
      :title="$t('term.inspect.configpath')"
      type="slider"
      width="medium"
      :isShow="true"
      @on-ok="saveFilePath"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsCodemirror ref="filePath" v-model="filePath" :placeholder="$t('term.inspect.inputreturn')"></TsCodemirror>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve)
  },
  props: {
    pathList: Array,
    resourceId: Number
  },
  data() {
    return {
      filePath: null
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
    closeDialog() {
      this.$emit('close');
    },
    saveFilePath() {
      let pathList = [];
      if (this.$refs.filePath) {
        let list = this.$refs.filePath.codemirror.getValue().split('\n');
        if (list && list.length) {
          list.forEach(i => {
            if (i.trim()) {
              pathList.push(i.trim());
            }
          });
        }
      }
      this.$api.inspect.configfile.saveFilePath({
        resourceId: this.resourceId,
        pathList: pathList
      }).then(res => {
        if (res && res.Status == 'OK') {
          this.$Notice.success({
            title: this.$t('message.savesuccess')
          });
        }
      });
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {
    pathList: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.filePath = val.join('\n');
        }
      }, 
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
