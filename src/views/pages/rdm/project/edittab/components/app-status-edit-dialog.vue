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
        <template v-slot:scope>
          <TsFormRadio
            v-model="statusData.scope"
            :dataList="scopeList"
          ></TsFormRadio>
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
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
      statusData: { appId: this.appId, scope: 'all' },
      scopeList: [
        { value: 'original', text: this.$t('term.rdm.original') },
        { value: 'copy', text: this.$t('term.rdm.copy') },
        { value: 'all', text: this.$t('term.rdm.allavailable') }
      ],
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
        scope: {
          type: 'slot',
          label: this.$t('term.rdm.scope')
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
          if (!this.statusData.scope) {
            this.$set(this.statusData, 'scope', 'all');
          }
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
