<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsForm
          ref="form"
          v-model="propertyData"
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    propertyUid: { type: Number },
    interfaceId: {type: String}
  },
  data() {
    return {
      propertyData: {},
      dialogConfig: {
        title: this.$t('term.pbc.editproperty'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      dataTypeList: [],
      valueRangeList: [],
      formConfig: [
        {
          type: 'text',
          name: 'uid',
          isHidden: true
        },
        {
          type: 'text',
          name: 'id',
          label: this.$t('term.pbc.propertytransferid'),
          maxlength: 50,
          validateList: ['required', 'key-special']
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('term.pbc.propertytransfername'),
          maxlength: 50,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'complexId',
          label: this.$t('term.pbc.complexid'),
          validateList: ['key-special'],
          maxlength: 50
        },
        {
          type: 'text',
          name: 'complexName',
          label: this.$t('term.pbc.complexname'),
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
          type: 'select',
          name: 'dataType',
          label: this.$t('term.report.datatype.name'),
          validateList: ['required'],
          transfer: true,
          url: '/api/rest/pbc/interface/property/datatype/list'
        },
        {
          type: 'select',
          name: 'valueRange',
          label: this.$t('term.pbc.valuerange'),
          transfer: true,
          url: '/api/rest/pbc/interface/property/valuerange/list'
        },
        {
          type: 'radio',
          name: 'restraint',
          label: this.$t('term.pbc.restraintcondition'),
          dataList: [{value: 'M', text: this.$t('page.require')}, {value: 'O', text: this.$t('page.optional')}, {value: 'C', text: this.$t('page.conditionnotnull')}],
          validateList: ['required']
        },
        {
          type: 'switch',
          name: 'needTransfer',
          label: '尝试转换',
          desc: '尝试对属性数据进行转换，一般用在数字类型的属性，例如原值是1.1234，值域是保留两位小数，则会转换成1.12。如果转换失败，将继续使用原值。'
        },
        {
          type: 'textarea',
          name: 'definition',
          label: this.$t('page.definition'),
          maxlength: 500
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.explain'),
          maxlength: 500
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.propertyUid) {
      this.getPropertyByUid();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getPropertyByUid() {
      this.$api.pbc.property.getPropertyByUid(this.propertyUid).then(res => {
        this.propertyData = res.Return;
      });
    },
    save() {
      const form = this.$refs['form'];
      if (form && form.valid && form.valid()) {
        this.propertyData.interfaceId = this.interfaceId;
        this.$api.pbc.property.saveProperty(this.propertyData).then(res => {
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
  computed: { },
  watch: {}
};
</script>
<style lang="less"></style>
