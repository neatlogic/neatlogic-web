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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
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
            let dataList = null;
            let data = {};
            let params = {};
            if (item.config != undefined) {
              dataList = item.config.dataList;
            }
            switch (item.type) {
              case 'input':
                data = {
                  name: item.uuid,
                  label: item.name,
                  type: 'text',
                  maxlength: 50,
                  transfer: true
                };
                break;
              case 'select':
                dataList.forEach(item => {
                  if (item.defaultValue == '1') {
                    data.value = item.value;
                  }
                });
                data = {
                  name: item.uuid,
                  label: item.name,
                  type: 'select',
                  maxlength: 50,
                  dataList: dataList,
                  transfer: true
                };
                break;
              case 'date':
                data = {
                  name: item.uuid,
                  label: item.name,
                  type: 'datetime',
                  maxlength: 50,
                  valueType: 'format',
                  transfer: true
                };
                break;
              case 'user':
                data = {
                  name: item.uuid,
                  label: item.name,
                  type: 'userselect',
                  groupList: ['user'],
                  maxlength: 50,
                  multiple: false,
                  transfer: true
                };
                break;
              case 'role':
                data = {
                  name: item.uuid,
                  label: item.name,
                  type: 'userselect',
                  groupList: ['role'],
                  maxlength: 50,
                  multiple: false,
                  transfer: true
                };
                break;
              case 'team':
                data = {
                  name: item.uuid,
                  label: item.name,
                  type: 'userselect',
                  groupList: ['team'],
                  maxlength: 50,
                  multiple: false,
                  transfer: true
                };
                break;
              case 'cmdbci':
                if (!this.$utils.isEmpty(item.config) && !this.$utils.isEmpty(item.config.cmdbCi)) {
                  params = {ciId: item.config.cmdbCi.ciId, label: item.config.cmdbCi.label};
                }
                data = {
                  name: item.uuid,
                  label: item.name,
                  type: 'select',
                  dynamicUrl: 'api/rest/cmdb/cientity/data/list/forselect',
                  rootName: 'tbodyList',
                  groupList: ['user'],
                  params: params,
                  maxlength: 50,
                  transfer: true
                };
                break;
              case 'region':
                data = {
                  name: item.uuid,
                  label: item.name,
                  type: 'tree',
                  url: '/api/rest/region/tree/search',
                  textName: 'name',
                  valueName: 'id',
                  transfer: true
                };
                break;
              case 'processtaskuser':
                data = {
                  name: item.uuid,
                  label: item.name,
                  type: 'userselect',
                  groupList: ['processUserType'],
                  excludeList: ['processUserType#minor', 'processUserType#worker', 'processUserType#reporter'],
                  maxlength: 50,
                  multiple: false,
                  transfer: true
                };
                break;
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
