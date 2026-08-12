<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <div>
        <TsFormItem v-if="!topicData || !topicData.isEmbed" :label="$t('page.uniquekey')" :required="true">
          <TsFormInput
            v-model="topicData.name"
            border="border"
            :validateList="['required']"
          ></TsFormInput>
        </TsFormItem>
        <TsFormItem v-if="!topicData || !topicData.isEmbed" :label="$t('page.name')" :required="true">
          <TsFormInput
            v-model="topicData.label"
            border="border"
            :validateList="['required']"
          ></TsFormInput>
        </TsFormItem>
        <TsFormItem v-if="!topicData || !topicData.isEmbed" :label="$t('page.mq')" :required="true">
          <TsFormRadio
            v-if="handlerList && handlerList.length > 0"
            :readonly="!!name"
            :value="topicData.handler"
            :dataList="handlerList"
            :validateList="['required']"
            @on-change="
              name => {
                $set(topicData, 'handler', name);
              }
            "
          ></TsFormRadio>
          <span v-else class="text-grey">{{ $t('term.framework.noavailablemq') }}</span>
        </TsFormItem>
        <TsFormItem :label="$t('page.isactive')">
          <TsFormSwitch
            v-model="topicData.isActive"
            :trueValue="1"
            :falseValue="0"
          ></TsFormSwitch>
        </TsFormItem>
        <component
          :is="config[topicData.name]"
          v-if="topicData && topicData.isEmbed && config[topicData.name]"
          :config="topicData.config"
          @setConfig="setConfig"
        ></component>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button v-if="handlerList && handlerList.length > 0" type="primary" @click="confirm()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import config from '@/views/pages/framework/mq/topic/config/index.js';
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    name: { type: String }
  },
  data() {
    return {
      config: config,
      configLocal: null,
      handlerList: [],
      topicData: this.topic ? this.$utils.deepClone(this.topic) : { isActive: 1 },
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
    this.getMqHandlerList();
    this.getTopicByName();
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
    getMqHandlerList() {
      this.$api.framework.mq.listMqHandler({ isEnable: true }).then(res => {
        this.handlerList = res.Return;
      });
    },
    getTopicByName() {
      if (this.name) {
        this.$api.framework.mq.getTopicByName(this.name).then(res => {
          this.topicData = res.Return;
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    confirm() {
      if (this.$refs.formConfig && !this.$refs.formConfig.valid()) {
        return;
      }
      this.topicData.config = this.configLocal;
      this.$api.framework.mq.saveTopic(this.topicData).then(res => {
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
