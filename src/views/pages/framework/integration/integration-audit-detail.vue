<template>
  <div>
    <TsDialog :is-show="isShow" v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        {{ $t('page.detail') }}
      </template>
      <template v-slot><pre>{{ contentFormated }}</pre></template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button v-if="hasMore" v-download="auditDetailDownloadParams" type="primary">{{ $t('page.download') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  directives: {download},
  components: {
  },
  props: { filePath: {type: String}},
  data() {
    return {
      isShow: false,
      content: null,
      hasMore: false,
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: false,
        width: '600px'
      }};
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
    getAuditDetail: function() {
      this.$api.framework.integration.getIntegrationAuditDetail({filePath: this.filePath}).then(res => {
        if (res.Status == 'OK') {
          this.content = res.Return.content;
          this.hasMore = res.Return.hasMore;
          this.isShow = true;
        }
      });
    },
    close: function() {
      this.isShow = false;
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    contentFormated: function() {
      try {
        let j = JSON.parse(this.content);
        return JSON.stringify(j, null, 2);
      } catch (e) {
        return this.content;
      }
    },
    auditDetailDownloadParams() {
      return {
        url: 'api/binary/integration/audit/detail/download',
        params: {
          filePath: this.filePath
        }
      };
    }
  },
  watch: {
    filePath: {handler: function(val) {
      if (val) {
        this.getAuditDetail();
      }
    }}
  }
};
</script>
<style lang="less">
</style>
