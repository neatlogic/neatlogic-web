<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="close"
      @on-ok="save"
    >
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig"></TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue')
  },
  props: {
    serverId: {
      type: Number
    }
  },
  data() {
    return {
      level: null,
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        title: this.$t('dialog.title.edittarget', { target: this.$t('page.loglevel') }),
        width: 'mini',
        height: '260px'
      },
      formConfig: [
        {
          type: 'select',
          name: 'level',
          label: this.$t('page.loglevel'),
          dataList: [
            {
              value: 'TRACE',
              text: 'TRACE'
            },
            {
              value: 'DEBUG',
              text: 'DEBUG'
            },
            {
              value: 'INFO',
              text: 'INFO'
            },
            {
              value: 'WARN',
              text: 'WARN'
            },
            {
              value: 'ERROR',
              text: 'ERROR'
            },
            {
              value: 'OFF',
              text: 'OFF'
            }
          ],
          validateList: ['required'],
          width: '200px',
          onChange: level => {
            this.level = level;
          }
        }
      ]
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
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        let param = {
          serverId: this.serverId,
          level: this.level
        };
        this.$api.framework.log.updateLogLevel(param).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
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
