<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>{{ $t('term.framework.rebuildconfirm') }}</div>
      </template>
      <template v-slot>
        <div>{{ $t('term.framework.rebuilddesc') }}</div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button
          class="ml-md"
          type="primary"
          ghost
          @click="rebuild(false)"
        >{{ $t('term.framework.incrementalrebuild') }}</Button>
        <Button
          class="ml-md"
          type="primary"
          @click="rebuild(true)"
        >{{ $t('term.framework.allrebuild') }}</Button>
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
