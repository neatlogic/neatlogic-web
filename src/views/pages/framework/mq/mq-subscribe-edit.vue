<template>
  <div>
    <TsDialog :is-show="true" v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="id">编辑订阅</div>
        <div v-if="!id">添加订阅</div>
      </template>
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve =>
      require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: {type: Number}
  },
  data() {
    const _this = this;
    return {
      dialogConfig: { 
        type: 'modal',
        maskClose: false,
        isShow: false,
        width: '600px'
      },
      subscribeData: {},
      formConfig: [
        {
          type: 'text',
          name: 'name',
          label: '唯一标识',
          width: '100%',
          readonly: !!_this.name,
          maxlength: 30,
          validateList: ['required'],
          onChange: (name) => {
            this.subscribeData.name = name;
          }
        },
        {
          type: 'select',
          name: 'className',
          label: '处理器',
          width: '100%',
          url: '/api/rest/mq/subscribehandler/list',
          valueName: 'className',
          validateList: ['required'],
          textName: 'name',
          onChange: (name) => {
            this.subscribeData.className = name;
          }
        },
        {
          type: 'select',
          name: 'topicName',
          label: '主题',
          width: '100%',
          readonly: !!_this.name,
          url: '/api/rest/mq/topic/list',
          valueName: 'name',
          validateList: ['required'],
          textName: 'label',
          onChange: (name) => {
            this.subscribeData.topicName = name;
          }
        },
        {
          type: 'radio',
          name: 'isActive',
          label: '激活',
          validateList: ['required'],
          dataList: [{value: 1, text: '是'}, {value: 0, text: '否'}],
          onChange: (name) => {
            this.subscribeData.isActive = name;
          }
        },
        {
          type: 'radio',
          name: 'isDurable',
          label: '订阅方式',
          width: '100%',
          validateList: ['required'],
          dataList: [{value: 1, text: '持久订阅'}, {value: 0, text: '临时订阅'}],
          desc: '持久订阅：本系统异常期间，消息队列会保存当前订阅主题收到的消息，待本系统恢复正常后重新推送。临时订阅：本系统异常期间，消息队列不会保存消息，这段期间收到的消息将会被丢弃。',
          onChange: (name) => {
            this.subscribeData.isDurable = name;
          }
        },
        {
          type: 'textarea',
          name: 'description',
          label: '说明',
          width: '100%',
          maxlength: 200,
          onChange: (name) => {
            this.subscribeData.description = name;
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getSubscribeById();
  },
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
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.framework.mq.saveSubscribe(this.subscribeData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.close(true);
          } 
        });
      }
    },
    getSubscribeById() {
      if (this.id) {
        this.$api.framework.mq.getSubscribeById(this.id).then(res => {
          this.subscribeData = res.Return;
          this.formConfig.forEach(element => {
            this.$set(element, 'value', this.subscribeData[element.name]);
          });
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
