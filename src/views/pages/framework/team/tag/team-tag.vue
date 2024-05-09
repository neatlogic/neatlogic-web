<template>
  <TsDialog
    type="modal"
    :isShow="true"
    :title="$t('page.teamtagtypemanage')"
    width="70%"
    @on-close="onClose()"
  >
    <TsContain>
      <div slot="content" class="dividing-color">
        <TsFormItem
          :label="$t('page.matrix')"
          :validateList="validateList"
          labelPosition="right"
          class="formItem"
        >
          <TsFormSelect
            ref="matrixUuid"
            v-model="formData.matrixUuid"
            v-bind="matrixConfig"
            :selectItemList.sync="dataSourceJson"
            @first="$utils.matrixDataSourceRedirect()"
            @on-change="changeMatrix(true)"
          >
            <template v-slot:option="{item}">
              <div>{{ item.name }}<span v-if="item.type" class="text-grey cen-align">({{ item.type }})</span></div>
            </template>
          </TsFormSelect>
          <div class="view">
            <div class="div-btn-contain action-group">
              <span class="action-item tsfont-setting" @click="gotoMatrix()">{{ $t('page.setting') }}</span>
            </div>
          </div>
        </TsFormItem>
        <TsFormItem
          v-if="!isWithoutUniqueIdentifier && formData.matrixUuid"
          :label="$t('term.framework.matrixattr')"
          :validateList="validateList"
          labelPosition="right"
          class="formItem"
        >
          <TsFormSelect
            ref="matrixAttr"
            v-model="formData.matrixAttr"
            :dataList="dataList"
            valueName="uniqueIdentifier"
            textName="name"
            transfer
            border="border"
            @on-change="changeMatrixAttr()"
          ></TsFormSelect>
        </TsFormItem>
        <TsFormItem v-if="isWithoutUniqueIdentifier && formData.matrixUuid" label="">
          <span class="text-error">{{ $t('page.teamtagteamwithoutuniqueidentifier') }}</span>
        </TsFormItem>
        <TsFormItem
          v-if="formData.matrixAttr"
          :label="$t('page.tag')"
          :validateList="validateList"
          labelPosition="right"
          class="formItem"
        >
          <TsFormSelect
            ref="matrixAttrValues"
            v-model="formData.matrixAttrValues"
            v-bind="matrixAttrValueConfig"
            transfer
            border="border"
          ></TsFormSelect>
        </TsFormItem>
      </div>
    </TsContain>
    
    <template v-slot:footer>
      <div class="drawer-footer ">
        <Button style="margin-left: 8px" @click="onClose()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="onOk()">{{ $t('page.save') }}</Button>
      </div>
    </template>
  </TsDialog>

</template>

<script>
export default {
  name: '',
  provide() {
    return { $parent: this };
  },
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
  
  },
  data() {
    return {
      dataList: [], //选中矩阵属性
      dataSourceJson: null, //选中矩阵数据
      isWithoutUniqueIdentifier: false, //矩阵的属性是否缺少唯一属性
      validateList: ['required'],
      matrixConfig: {
        dynamicUrl: '/api/rest/matrix/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        firstLi: true,
        firstText: this.$t('page.datasource'),
        transfer: true
      },
      matrixAttrValueConfig: {
        dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
        rootName: 'dataList',
        transfer: true
      },
      formData: {
        matrixUuid: null,
        matrixAttr: null,
        matrixAttrValues: []
      },
      formConfig: {
        matrixUuid: {
          type: 'slot',
          label: '矩阵'
        }
      }
    };
  },
  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {

  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    changeMatrix(isClearData) {
      //改变矩阵数据
      if (isClearData) {
        this.clearData();
      }
      if (this.formData.matrixUuid) {
        this.$api.autoexec.action.getMatrixAttributeByUuid({ matrixUuid: this.formData.matrixUuid }).then(res => {
          //获取矩阵的属性
          if (res.Status == 'OK') {
            this.dataList = res.Return.tbodyList || [];
            if (this.dataList.some(o => this.$utils.isEmpty(o.uniqueIdentifier))) {
              this.$set(this, 'isWithoutUniqueIdentifier', true);
            } else {
              this.$set(this, 'isWithoutUniqueIdentifier', false);
            }
          }
        });
      }
    },
    changeMatrixAttr() {
      this.formData.matrixAttrValues = [];
      this.$set(this.matrixAttrValueConfig, 'params', {matrixUuid: this.formData.matrixUuid, valueFieldUniqueIdentifier: this.formData.matrixAttr, textFieldUniqueIdentifier: this.formData.matrixAttr});
    },
    clearData() {
      this.dataSourceJson = null;
      this.dataList = [];
      this.formData.matrixAttr = null;
      this.formData.matrixAttrValues = [];
    },
    onClose() {
      this.$emit('close');
    },
    gotoMatrix() {
      this.$utils.matrixDataSourceRedirect(this.formData.matrixUuid, this.dataSourceJson);
    },
    onOk() {
      if (this.$ref.matrixUuid && !this.$ref.matrixUuid.valid()) {
        return;
      }
      if (this.$ref.matrixAttr && !this.$ref.matrixAttr.valid()) {
        return;
      }
      if (this.$ref.matrixAttrValues && !this.$ref.matrixAttrValues.valid()) {
        return;
      }
      this.$emit('save', this.formData);
    }
  },

  filter: {},

  computed: {
  },

  watch: {}
};
</script>
<style lang="less" scoped>
.formItem{
  .form-li{
    width:75%;
    display:inline-block;
  }
  .view{
    display:inline-block;
  }
}
</style>

