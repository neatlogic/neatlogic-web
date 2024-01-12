<template>
  <TsDialog
    v-bind="editTsDialogCmdb"
    :is-show.sync="editTsDialogCmdb.isShow"
    class-name="matrix-external-modal"
    @on-ok="okEditTsDialog"
  >
    <template v-slot>
      <div class="editForm input-border">
        <TsForm
          ref="mainForm"
          :item-list="formSetting"
          type="type"
          label-postion="right"
        >
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  filters: {},
  props: {
    fileObj: Object,
    editTsDialogCmdb: Object, 
    showAttributeLabelList: Array,
    modelAttributeList: Array, // 属性
    typeView: String,
    ciId: Number
  },
  data() {
    let _this = this;
    return {
      integrationUuid: null,
      defaultModelAttributeList: _this.$utils.deepClone(_this.modelAttributeList), // 默认模型属性值列表
      defaultShowAttributeLabelList: _this.$utils.deepClone(_this.showAttributeLabelList), // 默认模型属性选中列表
      formSetting: {
        externalId: {
          type: 'select',
          name: 'externalId',
          label: this.$t('term.framework.cidata'),
          transfer: true,
          dataList: [],
          value: null,
          validateList: ['required'],
          disabled: false,
          disabledHoverTitle: '',
          onChange: val => {
            _this.formSetting.showAttributeLabelList.value = [];
            if (val) {
              _this.showAttribute(val);
            } else {
              _this.formSetting.showAttributeLabelList.dataList = [];
            }
          }
        },
        showAttributeLabelList: {
          type: 'select',
          label: this.$t('term.pbc.modelattribute'),
          value: _this.showAttributeLabelList,
          multiple: true,
          transfer: true,
          dataList: [],
          width: '100%',
          validateList: ['required']
        }
      }
    };
  },
  beforeCreate() {},
  async created() {
    this.cmdbList();
    if (!this.$utils.isEmptyObj(this.fileObj) && this.fileObj.uuid) {
      let isDisabled = await this.$frameworkUtils.isDependency(this.fileObj.uuid, 'matrix');
      for (let i in this.formSetting) {
        if (i == 'externalId') {
          this.formSetting[i].disabled = isDisabled;
          this.formSetting[i].disabledHoverTitle = isDisabled ? this.$t('term.framework.usedmatrixdesc') : '';
        }
      }
    }
  },
  beforeMount() {},
  mounted() { },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    showAttribute(val) {
      let data = {
        'matrixUuid': null,
        'type': 'cmdbci',
        'ciId': val
      };
      this.$api.framework.matrix
        .getMatrixAttributeByUuid(data)
        .then(res => {
          if (res.Status == 'OK') {
            let resData = res.Return.tbodyList;
            let newData = [];
            resData.forEach(v => {
              if (v.label) {
                newData.push({text: v.name, value: v.label});
              }
            });
            this.formSetting.showAttributeLabelList.dataList = newData;
          }
        })
        .catch(error => {
        });
    },
    async cmdbList() {
      let data = '';
      await this.$https.post('/api/rest/cmdb/ci/citype/search' + data).then(res => {
        if (res.Status == 'OK') {
          let resData = res.Return;
          let newData = [];
          resData.forEach(v => {
            v.ciList.forEach(j => {
              newData.push({text: j.label, value: j.id});
            });
          });
          this.formSetting.externalId.dataList = newData;
          this.formSetting.externalId.value = this.ciId;
          this.showAttribute(this.ciId);
        }
      });
    },
    getDependencyList(uuid) {
      return new Promise((resolve, reject) => {
        this.$api.framework.matrix.getDependencyList({uuid: uuid, calleeType: 'matrixattr', pageSize: 20, currentPage: 1}).then((res) => {
          if (res.Status == 'OK') {
            let dataInfo = res.Return;
            let isDependency = dataInfo && dataInfo.list ? (dataInfo.list.length > 0) : false;
            resolve(isDependency);
          } else {
            resolve(false);
          }
        });
      });
    },
    isDependency() {
      // 判断属性是否被表单引用，被表单引用需要
      let referencePropertyList = []; // 引用属性列表
      let modelPropertiesList = []; // 模型属性列表
      let delAttrList = []; // 删除属性列表
      let delModelAttributeList = []; // 删除模型属性列表
      let ajaxCount = 0;
      let showAttributeLabelList = this.formSetting.showAttributeLabelList.value || []; // 当前属性模型值
      delModelAttributeList = showAttributeLabelList && showAttributeLabelList.filter((item) => {
        return this.defaultShowAttributeLabelList.includes(item);
      });
      if (delModelAttributeList.length < this.defaultShowAttributeLabelList.length) {
        delAttrList = this.defaultModelAttributeList && this.defaultModelAttributeList.filter((item) => {
          return item.label != 'const_id' && !delModelAttributeList.includes(item.label);
        });
        return new Promise((resolve, reject) => {
          delAttrList.forEach(async(item) => {
            let isDependency = await this.getDependencyList(item.uuid);
            ajaxCount++;
            if (isDependency) {
              referencePropertyList.push(item.uuid);
            }
            if (ajaxCount == delAttrList.length) {
              this.defaultModelAttributeList && this.defaultModelAttributeList.forEach((InnerItem) => {
                if (referencePropertyList.includes(InnerItem.uuid)) {
                  modelPropertiesList.push(InnerItem.name);
                }
              });
              if (!this.$utils.isEmpty(modelPropertiesList)) {
                this.$Notice.error({
                  title: this.$t('message.executefailed'),
                  desc: this.$t('message.framework.targetattrscanotdel', {target: modelPropertiesList.join(',')})
                });
                resolve(true);
              } else {
                resolve(false);
              }
            }
          });
        });
      }
    },
    async okEditTsDialog() {
      if (this.$refs.mainForm.valid()) {
        let datas = this.fileObj;
        let data = {
          ciId: null,
          customViewId: null,
          fileId: null,
          integrationUuid: null,
          id: datas.id,
          label: datas.label,
          name: datas.name,
          uuid: datas.uuid,
          config: {
            showAttributeLabelList: []
          },
          type: datas.type
        };
        data.ciId = this.formSetting.externalId.value;
        data.config = {
          showAttributeLabelList: this.formSetting.showAttributeLabelList.value
        };
        if (this.formSetting.externalId.disabled) {
          let isDependency = await this.isDependency();
          if (isDependency) {
          // 模型属性被表单引用，不可删除被引用的属性
            return false;
          }
        }
       
        this.$api.framework.matrix.saveExternal(data).then(res => {
          if (res.Status == 'OK') {
            this.editTsDialogCmdb.isShow = false;
            this.$emit('isOk');
            this.$Message.success(this.$t('message.savesuccess'));
          }
        }).catch(error => {
          this.$Notice.error({ title: error.data.Message });
        });
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style scoped lang="less">

</style>
