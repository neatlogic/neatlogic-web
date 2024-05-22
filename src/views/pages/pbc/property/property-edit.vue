<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="uid">{{ $t('term.pbc.editproperty') }}</div>
        <div v-if="!uid">{{ $t('term.pbc.addproperty') }}</div>
      </template>
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig"></TsForm>
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: { uid: { type: Number } },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      formConfig: [
        {
          type: 'text',
          name: 'uid',
          isHidden: true
        },
        {
          type: 'select',
          name: 'interfaceId',
          label: this.$t('term.pbc.gatherinterface'),
          dynamicUrl: '/api/rest/pbc/interface/search',
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          transfer: true,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'id',
          label: this.$t('term.pbc.propertytransferid'),
          maxlength: 50,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('term.pbc.propertyname'),
          maxlength: 50,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'complexId',
          label: this.$t('term.pbc.complexid'),
          maxlength: 50
        },
        {
          type: 'text',
          name: 'alias',
          label: this.$t('page.alias'),
          maxlength: 50,
          desc: this.$t('term.pbc.propertyaliasdescribe')
        },
        {
          type: 'text',
          name: 'complexName',
          label: this.$t('term.pbc.complexname'),
          maxlength: 50
        },
        {
          type: 'textarea',
          name: 'definition',
          label: this.$t('page.definition'),
          maxlength: 300
        },
        {
          type: 'select',
          dynamicUrl: '/api/rest/pbc/property/datatype/search',
          name: 'dataType',
          label: this.$t('term.report.datatype.name'),
          transfer: true,
          validateList: ['required']
        },
        {
          type: 'select',
          dynamicUrl: '/api/rest/pbc/property/valuerange/search',
          name: 'valueRange',
          transfer: true,
          label: this.$t('term.pbc.valuerange')
        },
        {
          type: 'radio',
          name: 'restraint',
          label: this.$t('term.pbc.restraint'),
          dataList: [
            { value: 'M', text: this.$t('page.require') },
            { value: 'O', text: this.$t('page.optional') },
            { value: 'C', text: this.$t('page.conditionnotnull') }
          ],
          validateList: ['required']
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.explain'),
          maxlength: 500
        }
      ],
      propertyData: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getPropertyByUid();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getPropertyByUid() {
      if (this.uid) {
        this.$api.pbc.property.getPropertyByUid(this.uid).then(res => {
          this.propertyData = res.Return;
          if (this.propertyData) {
            this.formConfig.forEach(element => {
              element.value = this.propertyData[element.name];
            });
          }
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.pbc.property.saveProperty(form.getFormValue()).then(res => {
          if (res.Status == 'OK') {
            this.close(true);
            this.$Message.success(this.$t('message.savesuccess'));
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
