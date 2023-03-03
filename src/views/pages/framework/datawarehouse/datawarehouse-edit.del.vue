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
                    { value: 'minute', text: '分钟' },
                    { value: 'hour', text: '小时' },
                    { value: 'day', text: '天' }
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
        <Button @click="close()">取消</Button>
        <Button type="primary" ghost @click="runReportDataSource()">立即同步</Button>
        <Button type="primary" @click="save()">确定</Button>
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
        title: '编辑策略',
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
          label: '唯一标识',
          readonly: true,
          maxlength: 50
        },
        {
          type: 'text',
          name: 'label',
          label: '名称',
          maxlength: 50,
          validateList: [{ name: 'required' }],
          onChange: label => {
            this.reportDataSourceData.label = label;
          }
        },
        {
          type: 'radio',
          name: 'isActive',
          label: '激活',
          dataList: [
            { value: 1, text: '是' },
            { value: 0, text: '否' }
          ],
          validateList: [{ name: 'required' }],
          onChange: isActive => {
            this.reportDataSourceData.isActive = isActive;
          }
        },
        {
          type: 'radio',
          name: 'mode',
          label: '同步模式',
          dataList: [
            { value: 'append', text: '追加模式' },
            { value: 'replace', text: '替换模式' }
          ],
          validateList: [{ name: 'required' }],
          onChange: mode => {
            this.reportDataSourceData.mode = mode;
          },
          desc: '追加模式：直接写入新数据，主键相同的数据会被替换；替换模式：先清空数据再写入新数据。'
        },
        {
          type: 'slot',
          name: 'expireTime',
          label: '有效时间',
          onChange: expireTime => {
            this.reportDataSourceData.expireTime = expireTime;
          },
          desc: '不设或<=0代表永远有效，有效天数到达后数据会自动删除。注意：重新设置有效天数对已经存在的数据无效。'
        },
        {
          type: 'slot',
          name: 'condition',
          label: '条件'
        },
        {
          type: 'slot',
          name: 'cronExpression',
          label: '定时执行'
        },
        {
          type: 'textarea',
          name: 'description',
          label: '说明',
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
        title: '提示',
        content: '确认执行数据同步吗？',
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
            this.$Message.success(this.$t('message.content.savesuccess'));
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
