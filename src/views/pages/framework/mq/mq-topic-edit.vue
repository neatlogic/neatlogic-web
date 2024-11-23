<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <div>
        <component
          :is="config[topicData.name]"
          v-if="topicData && topicData.isEmbed && config[topicData.name]"
          :config="topicData.config"
          @setConfig="setConfig"
        ></component>
        <TsForm v-else-if="!topicData || !topicData.isEmbed" v-model="topicData" :item-list="formConfig">
          <template v-slot:handler>
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
            <span v-else class="text-grey">没有可用的消息队列</span>
          </template>
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button v-if="handlerList && handlerList.length > 0" type="primary" @click="confirm()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import config from '@/views/pages/framework/mq/config/index.js';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
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
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('page.uniquekey'),
          validateList: ['required'],
          maxlength: 50
        },
        label: {
          type: 'text',
          label: this.$t('page.name'),
          validateList: ['required'],
          maxlength: 50
        },
        handler: {
          type: 'slot',
          label: '消息队列'
        },
        isActive: {
          type: 'switch',
          label: this.$t('term.report.isactive')
        },
        description: {
          type: 'textarea',
          label: this.$t('page.explain'),
          maxlength: 500
        }
      },
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
