<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>重建确认</div>
      </template>
      <template v-slot>
        <div>是否确认重建当前类型的检索索引？</div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button
          class="ml-md"
          type="primary"
          ghost
          @click="rebuild(false)"
        >增量重建</Button>
        <Button
          class="ml-md"
          type="primary"
          @click="rebuild(true)"
        >全部重建</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    audit: {type: Object}
  },
  data() {
    return {
      dialogConfig: { 
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      description: ''
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
    rebuild(isAll) {
      this.$api.framework.fulltextindex.rebuildFullTextIndex({type: this.audit.type, isAll: isAll}).then(res => {
        if (res.Status == 'OK') {
          this.close(true);
        }
      });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
