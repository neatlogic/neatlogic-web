<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="blackWhiteData.id">{{ $t('dialog.title.edittarget', { target: $t('page.availableobject') }) }}</div>
        <div v-if="!blackWhiteData.id">{{ $t('dialog.title.addtarget', { target: $t('page.availableobject') }) }}</div>
      </template>
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
        </TsForm>
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
    TsForm: resolve =>
      require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    const _this = this;
    return { 
      dialogConfig: { 
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      blackWhiteData: {},
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'itemName',
          label: this.$t('page.itemname'),
          maxlength: 50,
          desc: this.$t('term.report.describe.itemnamedescribe'),
          validateList: [{name: 'required', message: this.$t('page.inputtypename')}],
          onChange: (name) => {
            this.blackWhiteData.itemName = name;
          }
        },
        {
          type: 'radio',
          name: 'itemType',
          label: this.$t('page.itemtype'),
          dataList: [{value: 'table', text: $t('page.table')}, {value: 'column', text: $t('page.field')}],
          validateList: [{name: 'required'}],
          onChange: (val) => {
            this.blackWhiteData.itemType = val;
          }
        },
        {
          type: 'radio',
          name: 'type',
          label: this.$t('page.type'),
          dataList: [{value: 'whitelist', text: this.$t('page.whitelist')}, {value: 'blacklist', text: this.$t('page.blacklist')}],
          desc: this.$t('term.report.describe.typedescribe'),
          validateList: [{name: 'required'}],
          onChange: (val) => {
            this.blackWhiteData.type = val;
          }
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.memo'),
          maxlength: 500,
          onChange: (name) => {
            this.blackWhiteData.description = name;
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { this.getBlackWhite(); },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getBlackWhite() {
      if (this.id) {
        this.$api.report.report.getBlackWhiteById(this.id).then(res => {
          this.blackWhiteData = res.Return;
          this.formConfig.forEach(element => {
            this.$set(element, 'value', this.blackWhiteData[element.name]);
          });
        });
      } else {
        this.blackWhiteData = {};
        this.formConfig.forEach(element => {
          this.$set(element, 'value', this.blackWhiteData[element.name]);
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.report.report.saveBlackWhite(this.blackWhiteData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
</style>
