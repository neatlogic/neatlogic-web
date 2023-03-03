<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="uid">编辑属性</div>
        <div v-if="!uid">添加属性</div>
      </template>
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig"></TsForm>
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
          label: '采集接口',
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
          label: '属性传输标识',
          maxlength: 50,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'name',
          label: '属性名称',
          maxlength: 50,
          validateList: ['required']
        },
        {
          type: 'text',
          name: 'complexId',
          label: '复合属性传输标识',
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
          type: 'text',
          name: 'complexName',
          label: '复合属性名称',
          maxlength: 50
        },
        {
          type: 'textarea',
          name: 'definition',
          label: '定义',
          maxlength: 300
        },
        {
          type: 'select',
          dynamicUrl: '/api/rest/pbc/property/datatype/search',
          name: 'dataType',
          label: '数据类型',
          transfer: true,
          validateList: ['required']
        },
        {
          type: 'select',
          dynamicUrl: '/api/rest/pbc/property/valuerange/search',
          name: 'valueRange',
          transfer: true,
          label: '值域'
        },
        {
          type: 'radio',
          name: 'restraint',
          label: '约束',
          dataList: [
            { value: 'M', text: '必填' },
            { value: 'O', text: '选填' },
            { value: 'C', text: '条件非空' }
          ],
          validateList: ['required']
        },
        {
          type: 'textarea',
          name: 'description',
          label: '说明',
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
            this.$Message.success(this.$t('message.content.savesuccess'));
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
