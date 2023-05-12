<template>
  <TsDialog
    type="modal"
    className="dynamicList-modal"
    title="添加行"
    :isShow.sync="showModal"
    width="600px"
    @on-ok="okAdd"
  >
    <TsForm ref="form" :itemList="matrixDataDialogForm"></TsForm>
  </TsDialog>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
export default {
  name: 'FormdynamicList',
  components: { TsForm},
  props: {
    matrixUuid: String,
    isShowModal: Boolean
  },
  data() {
    let _this = this;
    return {
      showModal: true,
      matrixDataDialogForm: []
    };
  },
  beforeCreate() {},
  created() {
    this.initConfig();
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
    okAdd() {
      let data = {
        rowData: this.$refs.form.getFormValue(),
        matrixUuid: this.matrixUuid
      };
      this.$api.framework.matrix.saveMatrixData(data).then(res => {
        if (res.Status == 'OK') {
          this.$emit('on-ok');
          this.showModal = false;
        }
      });
    },
    //渲染添加行数据表单
    initConfig() {
      this.$api.framework.matrix.getMatrixAttributeByUuid({matrixUuid: this.matrixUuid }).then(res => {
        if (res.Status == 'OK') {
          let list = res.Return.tbodyList;
          let typeObject = {
            'input': {type: 'text'}, 
            'select': {type: 'select', dataList: []}, 
            'date': {type: 'datetime', valueType: 'format'}, 
            'user': {type: 'userselect', groupList: ['user'], multiple: false}, 
            'role': {type: 'userselect', groupList: ['role'], multiple: false}, 
            'team': {type: 'userselect', groupList: ['team'], multiple: false}
          };
          list.forEach(item => {
            let data = { name: item.uuid, label: item.name, type: item.type, maxlength: 50, transfer: true };
            data = Object.assign(data, typeObject[item.type]);

            if (item.type == 'select') {
              let dataList = [];
              if (item.config != undefined) {
                dataList = item.config.dataList || [];
              }
              data.dataList = dataList;
              data.dataList.forEach(item => {
                if (item.defaultValue == '1') {
                  data.value = item.value;
                }
              });
            }

            this.matrixDataDialogForm.push(data);
          });
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    'showModal': function(val) {
      this.$emit('update:isShowModal', val);
      val && this.initConfig();
    }
  }
};
</script>

