<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsForm ref="form" v-model="statusData" :item-list="formConfig">
        <template v-slot:color>
          <ColorPicker
            v-model="statusData.color"
            :transfer="true"
            recommend
            class="colorPicker"
            transfer-class-name="color-picker-transfer-class"
          />
        </template>
      </TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: {
      type: Number
    },
    appId: {
      type: Number
    }
  },
  data() {
    return {
      statusData: { appId: this.appId },
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('page.status')}) : this.$t('dialog.title.addtarget', {'target': this.$t('page.status')}),
        isShow: true,
        width: 'small',
        type: 'modal',
        maskClose: false
      },
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          label: this.$t('page.uniquekey'),
          validateList: ['required', 'char']
        },
        label: {
          type: 'text',
          label: this.$t('page.name'),
          validateList: ['required']
        },
        color: {
          type: 'slot',
          label: this.$t('page.color')
        },
        description: {
          type: 'textarea',
          label: this.$t('page.description')
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getAppStatusById();
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
    getAppStatusById() {
      if (this.id) {
        this.$api.rdm.status.getStatusById(this.id).then(res => {
          this.statusData = res.Return;
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.rdm.status.saveStatus(this.statusData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
