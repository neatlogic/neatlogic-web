<template>
  <div>
    <TsDialog
      :is-show="true"
      v-bind="dialogConfig"
      @on-close="close"
      @on-ok="save"
    >
      <template v-slot:header>
        <div v-if="id">{{ $t('dialog.title.edittarget',{'target':$t('term.framework.subscribe')}) }}</div>
        <div v-if="!id">{{ $t('dialog.title.addtarget',{'target':$t('term.framework.subscribe')}) }}</div>
      </template>
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
        </TsForm>
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
          label: this.$t('page.uniquekey'),
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
          label: this.$t('page.handler'),
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
          label: this.$t('page.theme'),
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
          label: this.$t('page.enable'),
          validateList: ['required'],
          dataList: [{value: 1, text: this.$t('page.yes')}, {value: 0, text: this.$t('page.no')}],
          onChange: (name) => {
            this.subscribeData.isActive = name;
          }
        },
        {
          type: 'radio',
          name: 'isDurable',
          label: this.$t('term.framework.isdurable'),
          width: '100%',
          validateList: ['required'],
          dataList: [{value: 1, text: this.$t('term.framework.dursubs')}, {value: 0, text: this.$t('term.framework.tempsubs')}],
          desc: this.$t('message.framework.isdurabledesc'),
          onChange: (name) => {
            this.subscribeData.isDurable = name;
          }
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.explain'),
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
            this.$Message.success(this.$t('message.savesuccess'));
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
