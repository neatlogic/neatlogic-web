<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
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
                <span v-if="row.isKey" class="text-success">是</span>
                <span v-else class="text-grey">否</span>
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
                    <li class="tsfont-refresh" @click="resetCurrentValue(row)">重置当前值</li>
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
                  <span class="text-href">配置范例</span>
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
                loadingText="语法分析中..."
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
        <Button type="primary" :disabled="!!errorMsg" @click="save()">确定</Button>
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
        title: !this.id ? '创建数据源' : '编辑数据源',
        width: 'medium'
      },
      reportDataSourceData: {},
      fieldHeadList: [
        { key: 'name', title: '唯一标识' },
        { key: 'label', title: '名称' },
        { key: 'isKey', title: '主键？' },
        { key: 'typeText', title: '类型' }
      ],
      paramHeadList: [
        { key: 'name', title: '唯一标识' },
        { key: 'label', title: '名称' },
        { key: 'defaultValue', title: '默认值' },
        { key: 'currentValue', title: '当前值' },
        { key: 'action', title: '' }
      ],
      formConfig: [
        {
          type: 'text',
          name: 'name',
          label: '唯一标识',
          validateList: ['required', 'key-special'],
          onChange: name => {
            this.reportDataSourceData.name = name;
          }
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
          type: 'radio',
          name: 'dbType',
          label: '数据库类型',
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
          label: '有效时间',
          onChange: expireTime => {
            this.reportDataSourceData.expireTime = expireTime;
          },
          desc: '不设或<=0代表永远有效，有效天数到达后数据会自动删除。注意：重新设置有效天数对已经存在的数据无效。'
        },
        {
          type: 'slot',
          name: 'cronExpression',
          label: '定时执行'
        },
        /* {
          type: 'slot',
          name: 'xml',
          label: '配置文件'
        },*/
        {
          type: 'slot',
          name: 'content',
          label: '配置内容'
        },
        {
          type: 'slot',
          name: 'fields',
          isHidden: true,
          label: '字段'
        },
        {
          type: 'slot',
          name: 'params',
          isHidden: true,
          label: '参数'
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
        title: '重置确认',
        content: '确认重置参数：' + row.name + '的当前值?',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.datawarehouse.updateDatasourceParamCurrentValue(row.id).then(res => {
            this.$Message.success('重置成功');
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
            title: '提示',
            desc: '请输入配置内容'
          });
          return;
        }
        if (this.id) {
          this.reportDataSourceData.id = this.id;
        }
        this.$api.framework.datawarehouse.saveDataSource(this.reportDataSourceData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
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
