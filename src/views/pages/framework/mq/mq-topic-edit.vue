<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <div>
        <component :is="config[topic.name]" :config="topic.config" @setConfig="setConfig"></component>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="confirm()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import config from '@/views/pages/framework/mq/config/index.js';
export default {
  name: '',
  components: {},
  props: {
    topic: { type: Object }
  },
  data() {
    return {
      config: config,
      configLocal: null,
      dialogConfig: {
        title: this.$t('dialog.title.edittarget', { target: this.$t('page.theme') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      }
    };
  },
  beforeCreate() {},
  created() {
  },
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
    confirm() {
      this.topic.config = this.configLocal;
      this.$api.framework.mq.saveTopic(this.topic).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', true);
        }
      });
    },
    setConfig(config) {
      this.configLocal = config;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
