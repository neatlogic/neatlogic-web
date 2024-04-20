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
          <template v-slot:attributeMappingList>
            <div>
              <div v-for="(conItem, conIdex) in formSetting.attributeMappingList.value" :key="conIdex">
                <TsRow :gutter="0">
                  <Col span="10">
                    <div class="pr-sm">
                      <TsFormSelect
                        v-model="conItem.label"
                        :dataList="getDataList(conItem.label)"
                        :validateList="['required']"
                        search
                        transfer
                      ></TsFormSelect>
                    </div>
                  </Col>
                  <Col span="10">
                    <div class="pr-sm">
                      <TsFormInput
                        v-model="conItem.uniqueIdentifier"
                        :maxlength="50"
                        type="text"
                        :placeholder="$t('page.uniquekey')"
                        :validateList="['required']"
                      ></TsFormInput>
                    </div>
                  </Col>
                  <Col span="2">
                    <div class="btn-group text-tip">
                      <span class="tsfont-plus" style="padding-right:8px;" @click="addAttr(conItem, conIdex)"></span>
                      <span v-if="formSetting.attributeMappingList.value.length > 1" class="tsfont-minus" @click="delAttr(conItem, conIdex)"></span>
                    </div>
                  </Col>
                </TsRow>
              </div>
            </div>
          </template>
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  filters: {},
  props: {
    fileObj: Object,
    editTsDialogCmdb: Object,
    modelAttributeList: Array, // 属性
    attributeMappingList: Array,
    typeView: String,
    ciId: Number
  },
  data() {
    let _this = this;
    return {
      integrationUuid: null,
      defaultModelAttributeList: _this.$utils.deepClone(_this.modelAttributeList), // 默认模型属性值列表
      defaultAttributeMappingList: _this.$utils.deepClone(_this.attributeMappingList), // 默认模型属性选中列表
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
            let emptyRow = {
              label: '',
              uniqueIdentifier: ''
            };
            let newList = [];
            newList.push(emptyRow);
            _this.formSetting.attributeMappingList.value = newList;
            if (val) {
              _this.showAttribute(val);
            }
          }
        },
        attributeMappingList: {
          type: 'slot',
          label: this.$t('page.attribute'),
          value: _this.attributeMappingList,
          transfer: true,
          width: '100%',
          validateList: ['required']
        }
      },
      cmdbCiEntityAttrList: []
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
            this.cmdbCiEntityAttrList = newData;
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
      let attributeMappingList = this.formSetting.attributeMappingList.value || []; // 当前属性模型值
      let defaultAttributeMappingLabelList = this.defaultAttributeMappingList.map(item => item.label);
      delModelAttributeList = attributeMappingList && attributeMappingList.filter((item) => {
        return defaultAttributeMappingLabelList.includes(item.label);
      });
      if (delModelAttributeList.length < this.defaultAttributeMappingList.length) {
        let delModelAttributeLabelList = delModelAttributeList.map(item => item.label);
        delAttrList = this.defaultModelAttributeList && this.defaultModelAttributeList.filter((item) => {
          return item.label != 'const_id' && !delModelAttributeLabelList.includes(item.label);
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
        if (this.formSetting.attributeMappingList.value && this.formSetting.attributeMappingList.value.length > 0) {
          let attributeMappingList = this.formSetting.attributeMappingList.value;
          for (let i = 0; i < attributeMappingList.length; i++) {
            let attributeMapping = attributeMappingList[i];
            if (!attributeMapping.label) {
              this.$Notice.error({
                title: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.attribute') }),
                duration: 1.5
              });
              return false;
            }
            if (!attributeMapping.uniqueIdentifier) {
              this.$Notice.error({
                title: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.uniquekey')}),
                duration: 1.5
              });
              return false;
            }
          }
        } else {
          this.$Notice.error({
            title: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.attribute') }),
            duration: 1.5
          });
          return false;
        }
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
            attributeMappingList: []
          },
          type: datas.type
        };
        data.ciId = this.formSetting.externalId.value;
        data.config = {
          attributeMappingList: this.formSetting.attributeMappingList.value
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
    },
    addAttr(conItem, conIdex) {
      let emptyRow = {
        label: '',
        uniqueIdentifier: ''
      };
      this.formSetting.attributeMappingList.value.push(emptyRow);
    },
    delAttr(conItem, conIdex) {
      this.$delete(this.formSetting.attributeMappingList.value, conIdex);
    }
  },
  computed: {
    getDataList() {
      return (label) => {
        let list = this.$utils.deepClone(this.cmdbCiEntityAttrList);
        list.forEach(item => {
          let find = this.formSetting.attributeMappingList.value.find(v => v.label === item.value && v.label !== label);
          if (find) {
            this.$set(item, '_disabled', true);
          } else {
            this.$set(item, '_disabled', false);
          }
        });
        return list;
      };
    }
  },
  watch: {}
};
</script>
<style scoped lang="less">

</style>
