<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <TsUpLoad
            dataType="PBC_CATEGORY_IMPORT"
            className="upload_block"
            type="drag"
            rowSpan="24"
            :multiple="false"
            :silent="true"
            @getFileList="success"
          ></TsUpLoad>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve)
  },
  props: {},
  data() {
    return { 
      dialogConfig: { 
        title: this.$t('term.pbc.importclassidentifier'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      } };
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
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    success() {
      this.$Message.success(this.$t('message.importsuccess'));
      this.close(true);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
