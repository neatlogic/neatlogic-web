<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
          <template v-if="reportDataSourceData.conditionList && reportDataSourceData.conditionList.length > 0" v-slot:condition>
            <TsRow
              v-for="(condition, index) in reportDataSourceData.conditionList"
              :key="index"
              class="mb-md"
              :gutter="0"
            >
              <Col :span="6" class="overflow">
                <span v-if="condition.isRequired" class="text-error">*</span>
                <span class="text-grey">{{ condition.label }}</span>
                <span class="text-grey">({{ condition.name }})</span>
              </Col>
              <Col :span="18">
                <TsFormInput
                  ref="conditionHandler"
                  v-model="condition.value"
                  :validateList="condition.isRequired ? ['required'] : ''"
                  :type="condition.type"
                ></TsFormInput>
              </Col>
            </TsRow>
          </template>
          <template v-slot:expireTime>
            <div style="display:grid; grid-template-columns: 50% 50%;grid-gap: 10px;">
              <div>
                <TsFormInput v-model="reportDataSourceData.expireCount" type="number" :min="1"></TsFormInput>
              </div>
              <div>
                <TsFormSelect
                  v-model="reportDataSourceData.expireUnit"
                  :dataList="[
                    { value: 'minute', text: $t('page.minute') },
                    { value: 'hour', text: $t('page.hour') },
                    { value: 'day', text: $t('page.day') }
                  ]"
                ></TsFormSelect>
              </div>
            </div>
          </template>
          <template v-slot:cronExpression>
            <div>
              <div>
                <TsFormSwitch
                  :value="reportDataSourceData.cronExpression ? true : false"
                  :true-value="true"
                  :false-value="false"
                  @on-change="toggleCronExpression"
                ></TsFormSwitch>
              </div>
              <TsQuartz
                v-if="reportDataSourceData.cronExpression"
                class="inline"
                :value="reportDataSourceData.cronExpression"
                :transfer="true"
                @change="
                  value => {
                    changeCron(value);
                  }
                "
              ></TsQuartz>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" ghost @click="runReportDataSource()">{{ $t('term.framework.syncnow') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    const _this = this;
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        title: this.$t('dialog.title.edittarget', {taret: this.$t('term.process.policy')}),
        width: 'medium'
      },
      reportDataSourceData: {},
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.uniquekey'),
          readonly: true,
          maxlength: 50
        },
        {
          type: 'text',
          name: 'label',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [{ name: 'required' }],
          onChange: label => {
            this.reportDataSourceData.label = label;
          }
        },
        {
          type: 'radio',
          name: 'isActive',
          label: this.$t('page.enable'),
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ],
          validateList: [{ name: 'required' }],
          onChange: isActive => {
            this.reportDataSourceData.isActive = isActive;
          }
        },
        {
          type: 'radio',
          name: 'mode',
          label: this.$t('term.framework.syncmode'),
          dataList: [
            { value: 'append', text: this.$t('term.framework.appendmode') },
            { value: 'replace', text: this.$t('term.framework.replacemode') }
          ],
          validateList: [{ name: 'required' }],
          onChange: mode => {
            this.reportDataSourceData.mode = mode;
          },
          desc: this.$t('message.framework.syncmodedesc')
        },
        {
          type: 'slot',
          name: 'expireTime',
          label: this.$t('page.effectivetime'),
          onChange: expireTime => {
            this.reportDataSourceData.expireTime = expireTime;
          },
          desc: this.$t('message.framework.effectivetimedesc')
        },
        {
          type: 'slot',
          name: 'condition',
          label: this.$t('page.condition')
        },
        {
          type: 'slot',
          name: 'cronExpression',
          label: this.$t('term.framework.cronexpression')
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.explain'),
          maxlength: 500,
          onChange: val => {
            this.reportDataSourceData.description = val;
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getDatasourceById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    runReportDataSource() {
      this.$createDialog({
        title: this.$t('page.tip'),
        content: this.$t('term.framework.dataasyncconfirm'),
        'on-ok': vnode => {
          this.$api.framework.datawarehouse.execDataSource(this.id).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.close(true);
            }
          });
        }
      });
    },
    toggleCronExpression(val) {
      if (!val) {
        this.$set(this.reportDataSourceData, 'cronExpression', '');
      } else {
        this.$set(this.reportDataSourceData, 'cronExpression', '0 * * * * ? *');
      }
    },
    changeCron(value) {
      this.reportDataSourceData.cronExpression = value;
    },
    setFile: function(fileList) {
      this.reportDataSourceData.fileId = null;
      fileList.forEach(file => {
        this.reportDataSourceData.fileId = file.id;
      });
    },
    getDatasourceById() {
      if (this.id) {
        this.$api.framework.datawarehouse.getDatasourceById(this.id).then(res => {
          this.reportDataSourceData = res.Return;
          this.formConfig.forEach(element => {
            this.$set(element, 'value', this.reportDataSourceData[element.name]);
            if (element.name == 'condition') {
              if (this.reportDataSourceData.conditionList && this.reportDataSourceData.conditionList.length > 0) {
                element.isHidden = false;
              } else {
                element.isHidden = true;
              }
            }
          });
        });
      } else {
        this.reportDataSourceData = {};
        this.formConfig.forEach(element => {
          this.$set(element, 'value', this.reportDataSourceData[element.name]);
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      let isValid = true;
      if (!form.valid()) {
        isValid = false;
      }
      if (this.$refs['conditionHandler'] && this.$refs['conditionHandler'].length > 0) {
        for (let i = 0; i < this.$refs['conditionHandler'].length; i++) {
          if (!this.$refs['conditionHandler'][i].valid()) {
            isValid = false;
          }
        }
      }
      if (isValid) {
        this.$api.framework.datawarehouse.saveDataSourcePolicy(this.reportDataSourceData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
