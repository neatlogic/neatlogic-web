<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close()">
      <template v-slot:header>
        <div>{{ $t('term.pbc.importinterfacedefine') }}</div>
      </template>
      <template v-slot>
        <div>
          <Alert type="error" class="mb-xs">{{ $t('term.pbc.importintefacewarning') }}</Alert>
          <TsUpLoad
            dataType="PBC_INTERFACE_IMPORT"
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
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
  props: {},
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      }
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
<style lang="less"></style>
