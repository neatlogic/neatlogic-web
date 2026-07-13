<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="id">{{ $t('dialog.title.edittarget', { target: $t('term.framework.subscribe') }) }}</div>
        <div v-if="!id">{{ $t('dialog.title.addtarget', { target: $t('term.framework.subscribe') }) }}</div>
      </template>
      <template v-slot>
        <TsForm ref="form" v-model="subscribeData" :item-list="formConfig">
          <template v-slot:handler>
            <TsFormRadio
              v-if="handlerList && handlerList.length > 0"
              :readonly="!!id"
              :value="subscribeData.handler"
              :dataList="handlerList"
              :validateList="['required']"
              @on-change="
                name => {
                  $set(subscribeData, 'handler', name);
                  getTopicList(name);
                }
              "
            ></TsFormRadio>
            <span v-else class="text-grey">{{ $t('term.framework.noavailablemq') }}</span>
          </template>
          <template v-slot:config>
            <div>
              <component
                :is="subscribeData.subscribeHandlerName + '_config'"
                v-if="subscribeData && subscribeData.subscribeHandlerName && handlers[subscribeData.subscribeHandlerName + '_config']"
                ref="configComponent"
                :config="subscribeData.config"
              ></component>
            </div>
          </template>
          <template v-slot:topicName>
            <div>
              <span v-if="!subscribeData.handler" class="text-grey">{{ $t('term.framework.selectmqtypefirst') }}</span>
              <TsFormSelect
                v-else
                :value="subscribeData.topicName"
                :dataList="topicList"
                transfer
                border="border"
                valueName="name"
                :validateList="['required']"
                textName="label"
                @on-change="
                  name => {
                    $set(subscribeData,'topicName', name);
                  }
                "
              ></TsFormSelect>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button v-if="handlerList && handlerList.length > 0" type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import handlers from '@/views/pages/framework/mq/subscribe/config/index.js';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    ...handlers
  },
  props: {
    id: { type: Number }
  },
  data() {
    const _this = this;
    return {
      handlers: handlers,
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      currentHandler: null,
      topicList: [],
      handlerList: [],
      subscribeData: {},
      formConfig: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.uniquekey'),
          readonly: !!_this.name,
          maxlength: 30,
          validateList: ['required'],
          onChange: name => {
            this.subscribeData.name = name;
          }
        },
        {
          type: 'slot',
          name: 'handler',
          label: this.$t('term.framework.mqhandler')
        },
        {
          type: 'select',
          name: 'className',
          label: this.$t('page.handler'),
          dataList: [],
          valueName: 'className',
          validateList: ['required'],
          textName: 'label',
          onChange: (name, opt, item) => {
            this.$set(this.subscribeData, 'className', name);
            this.$set(this.subscribeData, 'subscribeHandlerName', item.name);
          }
        },
        {
          type: 'slot',
          name: 'config'
        },
        {
          type: 'slot',
          name: 'topicName',
          label: this.$t('page.theme')
        },
        {
          type: 'radio',
          name: 'isActive',
          label: this.$t('page.enable'),
          validateList: ['required'],
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ],
          onChange: name => {
            this.subscribeData.isActive = name;
          }
        },
        /*{
          type: 'radio',
          name: 'isDurable',
          label: this.$t('term.framework.isdurable'),
          width: '100%',
          validateList: ['required'],
          dataList: [
            { value: 1, text: this.$t('term.framework.dursubs') },
            { value: 0, text: this.$t('term.framework.tempsubs') }
          ],
          desc: this.$t('message.framework.isdurabledesc'),
          onChange: name => {
            this.subscribeData.isDurable = name;
          }
        },*/
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.explain'),
          width: '100%',
          maxlength: 200,
          onChange: name => {
            this.subscribeData.description = name;
          }
        }
      ]
    };
  },
  beforeCreate() {},
  async created() {
    await this.getSubscribeById();
    await this.getSubscribeHandlerList();
    this.getMqHandlerList();
    this.getTopicList(this.subscribeData.handler);
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
    getSubscribeHandlerList() {
      return this.$api.framework.mq.listSubscribeHandler().then(res => {
        const subscribeHandlerList = (res.Return || []).filter(item => !item.isEmbed);
        const formItem = this.formConfig.find(item => item.name === 'className');
        if (formItem) {
          this.$set(formItem, 'dataList', subscribeHandlerList);
        }
      });
    },
    getTopicList(mq) {
      this.topicList = [];
      if (mq) {
        this.$api.framework.mq.listTopic({ handler: mq }).then(res => {
          this.topicList = res.Return;
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs['form'];
      const configComponent = this.$refs['configComponent'];
      let isValid = true;
      if (form && !form.valid()) {
        isValid = false;
      }
      if (configComponent && configComponent.valid && !configComponent.valid()) {
        isValid = false;
      }
      if (isValid) {
        this.subscribeData.config = configComponent && configComponent.getConfig && configComponent.getConfig();
        this.$api.framework.mq.saveSubscribe(this.subscribeData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    async getSubscribeById() {
      if (this.id) {
        await this.$api.framework.mq.getSubscribeById(this.id).then(res => {
          this.subscribeData = res.Return;
          /*this.formConfig.forEach(element => {
            this.$set(element, 'value', this.subscribeData[element.name]);
          });*/
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
