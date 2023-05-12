<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsForm
          ref="form"
          v-model="interfaceData"
          :item-list="formConfig"
        ></TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    interfaceId: {type: String}
  },
  data() {
    return {
      interfaceData: {},
      dialogConfig: {
        title: this.$t('term.pbc.addinterface'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: [
        {
          type: 'text',
          name: 'id',
          label: this.$t('term.pbc.interfaceid'),
          disabled: !!this.interfaceId,
          maxlength: 50,
          validateList: ['required', 'key-special']
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('term.pbc.interfacename'),
          maxlength: 50,
          validateList: ['required']
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.interfaceId) {
      this.getInterfaceById();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getInterfaceById() {
      this.$api.pbc.interfaces.getInterfaceById(this.interfaceId).then(res => {
        this.interfaceData = res.Return;
      });
    },
    save() {
      const form = this.$refs['form'];
      if (form && form.valid && form.valid()) {
        this.$api.pbc.interfaces.saveInterface(this.interfaceData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(this.interfaceData.id);
          }
        });
      }
    },
    close(interfaceId) {
      this.$emit('close', interfaceId);
    }
  },
  filter: {},
  computed: { },
  watch: {}
};
</script>
<style lang="less"></style>
