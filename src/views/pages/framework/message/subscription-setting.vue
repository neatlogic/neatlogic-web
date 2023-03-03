<template>
  <div class="subscription-setting">
    <TsContain>
      <template v-slot:topRight>
        <div>
          <TsFormSelect
            url="/api/rest/module/list"
            border="border"
            placeholder="模块选择"
            @on-change="moduleId => getHandlerList(moduleId)"
          />
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <TsTable :theadList="theadList" :tbodyList="handlerList">
          <template v-slot:popUp="{ row }">
            {{ row.popUp | popUpText }}
          </template>
          <template v-slot:isActive="{ row }">
            <TsFormSwitch :key="row.handler" :value="row.isActive" @on-change="isActive => updateActiveStatus(row)" />
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit icon" @click="showDialog(row)">编辑</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>

    <!-- 编辑对话框 -->
    <TsDialog :isShow.sync="isDialogShow" title="编辑" @on-ok="updatePopup">
      <TsForm ref="form" :itemList="formConfig" />
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: 'SubscriptionSetting',
  filters: {
    popUpText(value) {
      const mapValueToText = {
        close: '关闭',
        shortshow: '临时',
        longshow: '持续'
      };
      return mapValueToText[value] || value;
    }
  },
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  data() {
    return {
      isLoading: false,
      isDialogShow: false,
      theadList: [
        { title: '模块名', key: 'moduleName' },
        { title: '消息类型', key: 'name' },
        { title: '描述', key: 'description' },
        { title: '弹框提醒', key: 'popUp' },
        { title: '订阅状态', key: 'isActive' },
        { title: '', key: 'action' }
      ],
      handlerList: [],
      moduleId: null,
      formConfig: {
        popUp: {
          type: 'radio',
          label: '弹框提醒',
          value: '',
          dataList: [
            { value: 'close', text: '关闭' },
            { value: 'shortshow', text: '临时' },
            { value: 'longshow', text: '持续' }
          ],
          validateList: ['required']
        }
      },
      rowData: {}
    };
  },

  created() {
    this.getHandlerList();
  },

  methods: {
    async getHandlerList(moduleId) {
      this.isLoading = true;
      const res = await this.$api.framework.message.getHandlerList({ moduleId });
      this.handlerList = res.Return;
      this.isLoading = false;
    },
    async updateActiveStatus(row) {
      row.isActive = row.isActive === 0 ? 1 : 0;
      try {
        const res = await this.$api.framework.message.updateActiveStatus(row);
        row.isActive = res.Return;
        this.$Message.success(this.$t('message.content.savesuccess'));
      } catch {
        row.isActive = row.isActive === 0 ? 1 : 0;
      }
    },
    showDialog(row) {
      this.isDialogShow = true;
      this.rowData = row;
      this.formConfig.popUp.value = row.popUp;
    },
    async updatePopup() {
      this.isDialogShow = false;
      const params = {
        ...this.rowData,
        ...this.$refs.form.getFormValue()
      };
      const res = await this.$api.framework.message.updatePopup(params);
      this.$Message.success(this.$t('message.content.savesuccess'));
      this.rowData.popUp = res.Return;
    }
  }
};
</script>
