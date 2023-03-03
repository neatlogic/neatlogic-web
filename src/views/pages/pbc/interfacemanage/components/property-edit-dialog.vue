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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    propertyUid: { type: Number },
    interfaceId: {type: String}
  },
  data() {
    return {
      propertyData: {},
      dialogConfig: {
        title: '编辑属性',
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
          label: '属性传输标识',
          maxlength: 50,
          validateList: ['required', 'key-special']
        },
        {
          type: 'text',
          name: 'name',
          label: '属性传输名称',
          maxlength: 50,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'complexId',
          label: '复合属性传输标识',
          validateList: ['key-special'],
          maxlength: 50
        },
        {
          type: 'text',
          name: 'complexName',
          label: '复合属性传输名称',
          maxlength: 50
        },
        {
          type: 'text',
          name: 'alias',
          label: '别名',
          maxlength: 50,
          desc: '导出数据时可使用此字段作为表头名称，如果不设，则使用原来的名称'
        },
        {
          type: 'select',
          name: 'dataType',
          label: '数据类型',
          validateList: ['required'],
          transfer: true,
          url: '/api/rest/pbc/interface/property/datatype/list'
        },
        {
          type: 'select',
          name: 'valueRange',
          label: '值域', 
          transfer: true,
          url: '/api/rest/pbc/interface/property/valuerange/list'
        },
        {
          type: 'radio',
          name: 'restraint',
          label: '约束条件',
          dataList: [{value: 'M', text: '必填'}, {value: 'O', text: '选填'}, {value: 'C', text: '条件非空'}],
          validateList: ['required']
        },
        {
          type: 'textarea',
          name: 'definition',
          label: '定义',
          maxlength: 500
        },
        {
          type: 'textarea',
          name: 'description',
          label: '说明',
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
            this.$Message.success(this.$t('message.content.savesuccess'));
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
