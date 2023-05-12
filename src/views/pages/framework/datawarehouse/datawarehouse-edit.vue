<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      :okBtnDisable="!!errorMsg"
      @on-close="close"
      @on-ok="save"
    >
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
          <template v-slot:fields>
            <TsTable
              v-if="reportDataSourceData.fieldList && reportDataSourceData.fieldList.length > 0"
              :fixedHeader="false"
              :theadList="fieldHeadList"
              :tbodyList="reportDataSourceData.fieldList"
            >
              <template v-slot:isKey="{ row }">
                <span v-if="row.isKey" class="text-success">{{ $t('page.yes') }}</span>
                <span v-else class="text-grey">{{ $t('page.no') }}</span>
              </template>
            </TsTable>
          </template>
          <template v-slot:params>
            <TsTable
              v-if="reportDataSourceData.paramList && reportDataSourceData.paramList.length > 0"
              :fixedHeader="false"
              :theadList="paramHeadList"
              :tbodyList="reportDataSourceData.paramList"
            >
              <template v-slot:action="{ row }">
                <div v-if="typeof row.currentValue != 'undefined' && row.currentValue != null && $utils.isUserHasAuth('DATA_WAREHOUSE_MODIFY')" class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li class="tsfont-refresh" @click="resetCurrentValue(row)">{{ $t('page.reset') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </template>
          <template v-slot:content>
            <div>
              <div>
                <Poptip
                  trigger="hover"
                  placement="right"
                  width="750"
                  :transfer="true"
                >
                  <span class="text-href">{{ $t('term.framework.configexample') }}</span>
                  <div slot="content" class="api">
                    <pre>
&lt;datasource name="testreport" label="测试报表"&gt;
  &lt;!--fields用于定义返回的字段列表--&gt;
  &lt;fields&gt;
  &lt;!--id代表唯一字段，支持多个id字段进行组合。普通字段用field定义，type是数据类型，目前只支持number、text、time、date、datetime五种，number类型系统最多只会保留4位小数。
  如果需要聚合计算，可以使用aggregate属性，目前支持sum和count两种算法。配置了aggregate属性的field字段会根据id字段进行计数或累加计算。--&gt;
    &lt;id column="id" label="id" type="number"/&gt;
    &lt;field column="user_id" label="用户id" type="text"/&gt;
    &lt;field column="user_name" label="用户名" type="text"/&gt;
    &lt;field column="phone" label="电话" type="number"/&gt;
  &lt;/fields&gt;
  &lt;!--params用于定义需要保存最大值的字段，例如每次执行完保留最大的id值，下次执行可以用这个id值作为过滤条件实现增量同步--&gt;
  &lt;params&gt;
  &lt;!--column是返回字段，返回字段的类型必须是数字型（如果需要保存时间可以先把时间转换成时间戳）。
      在where条件中可以通过#{column值}使用，--&gt;
    &lt;param column="id" type="max" label="最大id" default="0"/&gt;
  &lt;/params&gt;
  &lt;!--select元素支持多个，但每个select语句返回的字段需要和fields中定义的一致。--&gt;
  &lt;!--mongodb 仅支持aggregation pipeline,具体api 参考官方文档:https://www.mongodb.com/docs/manual/reference/operator/aggregation/ --&gt;
  &lt;!--如: {aggregate: "INSPECT_REPORTS",pipeline: [{ '$match': { '_report_time': { $lte: ISODate("2022-11-05T00:00:00.0Z") }, '_inspect_result.status': { '$in': ['CRITICAL', 'WARN', 'FATAL'] } } }, { '$sort': {'_report_time': -1 } }, {$project: { resourceId: "$RESOURCE_ID",status: "$_inspect_result.status" }}}--&gt;
  &lt;select&gt;
    select user_id,user_name,phone from `user` where id &gt; #{id}
  &lt;/select&gt;
&lt;/datasource&gt;
                    </pre>
                  </div>
                </Poptip>
              </div>
              <TsCodemirror
                v-model="reportDataSourceData.xml"
                :isLoading="isValiding"
                codeMode="xml"
                :loadingText="$t('term.framework.parsing')"
                @change="changeXml"
              ></TsCodemirror>
              <Alert v-if="errorMsg" class="mt-sm" type="error">{{ errorMsg }}</Alert>
            </div>
          </template>
          <template v-slot:expireTime>
            <div style="display:grid; grid-template-columns: 50% 50%;grid-gap: 10px;">
              <div>
                <TsFormInput v-model="reportDataSourceData.expireCount" type="number" :min="1"></TsFormInput>
              </div>
              <div>
                <TsFormSelect
                  v-model="reportDataSourceData.expireUnit"
                  :width="120"
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
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror.vue'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    const _this = this;
    return {
      errorMsg: '',
      isValiding: false,
      dataSourceData: {},
      showFileError: false,
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        title: !this.id ? this.$t('page.created') : this.$t('page.edit'),
        width: 'medium'
      },
      reportDataSourceData: {},
      fieldHeadList: [
        { key: 'name', title: this.$t('page.uniquekey') },
        { key: 'label', title: this.$t('page.name') },
        { key: 'isKey', title: this.$t('page.primarykey') + '？' },
        { key: 'typeText', title: this.$t('page.type') }
      ],
      paramHeadList: [
        { key: 'name', title: this.$t('page.uniquekey') },
        { key: 'label', title: this.$t('page.name') },
        { key: 'defaultValue', title: this.$t('page.defaultvalue') },
        { key: 'currentValue', title: this.$t('page.currentvalue') },
        { key: 'action', title: '' }
      ],
      formConfig: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.uniquekey'),
          validateList: ['required', 'key-special'],
          onChange: name => {
            this.reportDataSourceData.name = name;
          }
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
          type: 'radio',
          name: 'dbType',
          label: this.$t('page.dbtype'),
          dataList: [
            { value: 'mysql', text: 'mysql' },
            { value: 'mongodb', text: 'mongodb' }
          ],
          validateList: [{ name: 'required' }],
          onChange: dbType => {
            this.reportDataSourceData.dbType = dbType;
          }
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
          name: 'cronExpression',
          label: this.$t('term.framework.cronexpression')
        },
        /* {
          type: 'slot',
          name: 'xml',
          label: '配置文件'
        },*/
        {
          type: 'slot',
          name: 'content',
          label: this.$t('term.framework.xmlconfig')
        },
        {
          type: 'slot',
          name: 'fields',
          isHidden: true,
          label: this.$t('page.field')
        },
        {
          type: 'slot',
          name: 'params',
          isHidden: true,
          label: this.$t('page.param')
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
    resetCurrentValue(row) {
      this.$createDialog({
        title: this.$t('dialog.title.resetconfirm'),
        content: this.$t('dialog.content.resetcurrentvalueconfirm'),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.datawarehouse.updateDatasourceParamCurrentValue(row.id).then(res => {
            this.$Message.success(this.$t('message.executesuccess'));
            vnode.isShow = false;
            this.$set(row, 'currentValue', '');
          });
        }
      });
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
            if (element.name == 'fields') {
              if (!this.reportDataSourceData.fieldList || this.reportDataSourceData.fieldList.length == 0) {
                this.$set(element, 'isHidden', true);
              } else {
                this.$set(element, 'isHidden', false);
              }
            } else if (element.name == 'params') {
              if (!this.reportDataSourceData.paramList || this.reportDataSourceData.paramList.length == 0) {
                this.$set(element, 'isHidden', true);
              } else {
                this.$set(element, 'isHidden', false);
              }
            }
          });
        });
      } else {
        this.reportDataSourceData = {dbType: 'mysql'};
        this.formConfig.forEach(element => {
          this.$set(element, 'value', this.reportDataSourceData[element.name]);
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        if (!this.reportDataSourceData.xml) {
          this.$Notice.info({
            title: this.$t('page.tip'),
            desc: this.$t('form.placeholder.pleaseinput', {'target': this.$t('term.framework.xmlconfig')})
          });
          return;
        }
        if (this.id) {
          this.reportDataSourceData.id = this.id;
        }
        this.$api.framework.datawarehouse.saveDataSource(this.reportDataSourceData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    },
    changeXml(xml) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      this.timmer = setTimeout(() => {
        this.isValiding = true;
        this.errorMsg = '';
        this.$api.framework.datawarehouse
          .validXml(xml)
          .then(res => {
            if (!res.Return.error) {
              const datasourceData = res.Return;
              this.reportDataSourceData.fieldList = datasourceData.fieldList;
              if (this.reportDataSourceData.paramList && this.reportDataSourceData.paramList.length > 0) {
                if (datasourceData.paramList && datasourceData.paramList.length > 0) {
                  datasourceData.paramList.forEach(element => {
                    if (!this.reportDataSourceData.paramList.find(d => d.name === element.name)) {
                      this.reportDataSourceData.paramList.push(element);
                    }
                  });
                  for (let i = this.reportDataSourceData.paramList.length - 1; i--; i >= 0) {
                    if (!datasourceData.paramList.find(d => d.name === this.reportDataSourceData.paramList[i].name)) {
                      this.reportDataSourceData.paramList.splice(i, 1);
                    }
                  }
                } else {
                  this.reportDataSourceData.paramList = [];
                }
              } else {
                this.reportDataSourceData.paramList = datasourceData.paramList;
              }
            
              this.formConfig.forEach(element => {
                if (element.name == 'fields') {
                  if (!datasourceData.fieldList || datasourceData.fieldList.length == 0) {
                    this.$set(element, 'isHidden', true);
                  } else {
                    this.$set(element, 'isHidden', false);
                  }
                } else if (element.name == 'params') {
                  if (!datasourceData.paramList || datasourceData.paramList.length == 0) {
                    this.$set(element, 'isHidden', true);
                  } else {
                    this.$set(element, 'isHidden', false);
                  }
                }
              });
            } else {
              this.errorMsg = res.Return.error;
              this.formConfig.forEach(element => {
                if (element.name === 'fields' || element.name === 'params') {
                  this.$set(element, 'isHidden', true);
                }
              });
            }
          })
          .finally(() => {
            this.isValiding = false;
          });
      }, 1000);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
