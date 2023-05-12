<template>
  <TsDialog
    type="modal"
    v-bind="dialogConfig"
    @on-close="close()"
    @on-ok="okAddMatrixData"
  >
    <template>
      <div v-if="matrixDataDialogForm.length > 0">
        <TsForm ref="matrixDataDialogForm" :item-list="matrixDataDialogForm"></TsForm>
      </div>
      <div v-else>
        <no-data></no-data>
      </div>
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
    matrixUuid: {type: String},
    data: {type: Object}//编辑的行数据
  },
  data() {
    return {
      dialogConfig: {
        title: this.data ? this.$t('dialog.title.edittarget', {'target': this.$t('page.row')}) : this.$t('dialog.title.addtarget', {'target': this.$t('page.row')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      matrixDataDialogForm: [] //添加编辑行属性表单
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.renderingMatrixData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    //确定添加行数据
    okAddMatrixData(val) {
      let formData = this.$refs.matrixDataDialogForm.getFormValue();
      let data = {
        rowData: formData,
        matrixUuid: this.matrixUuid
      };
      this.$api.framework.matrix.saveMatrixData(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      });
    },
    //渲染添加行数据表单
    renderingMatrixData() {
      let data = {
        matrixUuid: this.matrixUuid
      };
      this.$api.framework.matrix.getMatrixAttributeByUuid(data).then(res => {
        if (res.Status == 'OK') {
          let list = res.Return.tbodyList;
          this.matrixDataDialogForm = [];
          list.forEach(item => {
            let type = '';
            let dataList = null;
            let groupList = [];
            if (item.config != undefined) {
              dataList = item.config.dataList;
            }
            switch (item.type) {
              case 'input':
                type = 'text';
                break;
              case 'select':
                type = 'select';
                break;
              case 'date':
                type = 'datetime';
                break;
              case 'user':
                type = 'userselect';
                groupList = ['user'];
                break;
              case 'role':
                type = 'userselect';
                groupList = ['role'];
                break;
              case 'team':
                type = 'userselect';
                groupList = ['team'];
                break;
            }
            let data = {
              name: item.uuid,
              label: item.name,
              type: type,
              maxlength: 50,
              transfer: true
            };

            if (item.type == 'select') {
              data.dataList = dataList;
              dataList.forEach(item => {
                if (item.defaultValue == '1') {
                  data.value = item.value;
                }
              });
            }

            if (item.type == 'date') {
              data.valueType = 'format';
            }

            if (item.type == 'role' || item.type == 'user' || item.type == 'team') {
              data.groupList = groupList;
              data.multiple = false;
            }
            this.matrixDataDialogForm.push(data);
          });
          if (this.data != undefined) {
            let uuidData = {
              name: 'uuid',
              isHidden: true,
              value: ''
            };
            this.matrixDataDialogForm.push(uuidData);
            let data = {
              matrixUuid: this.matrixUuid,
              uuid: this.data.uuid.value
            };
            this.$api.framework.matrix.getMatrixDetail(data).then(res => {
              if (res.Status == 'OK') {
                let matrixData = res.Return;
                for (let i in matrixData) {
                  this.matrixDataDialogForm.forEach(item => {
                    if (item.name == i) {
                      item.value = matrixData[i];
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
