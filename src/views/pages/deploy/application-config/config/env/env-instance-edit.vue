<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :title="$t('dialog.title.addtarget', {target: $t('page.instance')})"
      :ok-text="$t('page.confirm')"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <loading :loadingShow="loadingShow" type="fix"></loading>
          <TsForm
            v-if="!loadingShow"
            ref="form"
            v-model="formValue"
            :item-list="formList"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import handleTimeMixin from '../app/components/handleTimeMixin.js';
import appEditAttrList from '../app/appEditAttrList.js';
export default {
  name: '', // 环境/实例列表
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  mixins: [handleTimeMixin, appEditAttrList],
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loadingShow: true,
      formValue: {},
      formList: [],
      exampleList: [
        {
          name: 'instance',
          type: 'radio',
          label: this.$t('page.instance'),
          dataList: [
            {
              text: this.$t('dialog.title.addtarget', {target: this.$t('page.instance')}),
              value: 1
            },
            {
              text: this.$t('term.deploy.selectexistexample'),
              value: 2
            }
          ],
          validateList: ['required'],
          transfer: true,
          onChange: (val) => {
            if (val && val == 1) {
              this.formList = this.exampleList.concat(this.addformList);
              this.formValue = {};
              this.formValue.instance = 1;
            } else {
              this.formList = this.exampleList.concat(this.existingFormList);
              this.formValue = {};
              this.formValue.instance = 2;
            }
          }
        }
      ],
      attrNameList: ['name', 'ip', 'port', 'maintenanceWindow'],
      addformList: [ // 添加实例
        {
          name: 'ciId',
          type: 'select',
          label: this.$t('term.deploy.configurationmodel'),
          validateList: ['required'],
          multiple: false,
          transfer: true,
          textName: 'label',
          valueName: 'id',
          dataList: []
        }
      ],
      existingFormList: [ // 现有实例
        {
          name: 'instanceIdList',
          label: this.$t('term.deploy.selectexample'),
          type: 'select',
          multiple: true,
          transfer: true,
          validateList: ['required'],
          params: {...this.params, isAutoConfig: 0},
          rootName: 'tbodyList',
          dynamicUrl: 'api/rest/deploy/app/config/instance/search',
          dealDataByUrl: (list) => this.dealDataByUrl(list)
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getAppInstanceCiAttrList();
    this.formList = this.exampleList.concat(this.addformList);
    this.$set(this.formValue, 'instance', 1);
    this.getCiList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getAppInstanceCiAttrList() {
      let params = {
        isAll: 0,
        attrNameList: this.attrNameList
      };
      // 获取应用实例模型属性列表
      //此接口查询的属性列表里的控件，现在from控件大部分都支持，有不支持，如 附件、表格、表达式、超链接
      await this.$api.deploy.applicationConfig.getAppInstanceCiAttrList(params).then((res) => {
        if (res.Status == 'OK') {
          this.addformList = this.addformList.concat(this.getAppCiAttrList(res.Return, this.attrNameList, 'APPIns'));
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    dealDataByUrl(nodeList) {
      let dataList = [];
      if (nodeList) {
        nodeList.forEach(item => {
          dataList.push({
            value: item.id,
            text: item.ip ? (item.port ? (item.name ? `${item.ip}:${item.port}[${item.name}]` : `${item.ip}:${item.port}`) : item.name ? `${item.ip}[${item.name}]` : item.ip) : ''
          });
        });
      }
      return dataList;
    },
    getCiList() {
      this.$api.common.updateCmdbMenu({ciNameList: ['AppIns'], isAbstract: 0}).then((res) => {
        if (res && res.Status == 'OK') {
          this.addformList.forEach((item) => {
            if (item.name == 'ciId') {
              item.dataList = res.Return ? res.Return[0]['ciList'] : [];
            }
          });
        }
      });
    },
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      let formValue = this.$utils.deepClone(this.formValue);
      if (formValue) {
        delete formValue.instance;
      }
      let params = {
        ...formValue,
        ...this.params
      };
      if (formValue && formValue.maintenanceWindow) {
        params.maintenanceWindow = this.setMaintenanceWindowValue(formValue.maintenanceWindow);
      }
      this.$api.deploy.applicationConfig.saveEnvInstance(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true);
        }
      });
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
