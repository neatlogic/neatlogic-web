<template>
  <div>
    <TsDialog v-bind="dialogConfig" :okBtnDisable="!!errorMsg" @on-close="close">
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
          <template v-slot:moduleId>
            <TsFormSelect
              :value="reportDataSourceData.moduleId"
              :dataList="moduleList"
              transfer
              border="border"
              @on-change="
                val => {
                  $set(reportDataSourceData, 'moduleId', val);
                }
              "
            ></TsFormSelect>
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
            <Tabs v-model="currentTab">
              <TabPane :label="$t('page.config')" name="content"></TabPane>
              <TabPane :label="$t('page.example')" name="example"></TabPane>
            </Tabs>
            <div v-if="currentTab === 'content'">
              <TsCodemirror v-model="reportDataSourceData.xml" codeMode="xml" @change="changeXml"></TsCodemirror>
              <Alert v-if="errorMsg" class="mt-sm" type="error">{{ errorMsg }}</Alert>
            </div>
            <div v-else-if="currentTab === 'example'">
              <TsCodemirror :value="example" :disabled="true" codeMode="xml"></TsCodemirror>
            </div>
          </template>
          <template v-slot:expireTime>
            <div style="display: grid; grid-template-columns: 50% 50%; grid-gap: 10px">
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
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button
          v-if="id"
          type="primary"
          ghost
          @click="save(1)"
        >{{ $t('term.framework.cleardataandconfirm') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue')
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      systemDsTypeList: ['mysql', 'mongodb', 'elasticsearch'],
      example: null,
      currentTab: 'content',
      errorMsg: '',
      isValiding: false,
      dataSourceData: {},
      showFileError: false,
      moduleList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        title: !this.id ? this.$t('dialog.title.addtarget', { target: this.$t('page.datasource') }) : this.$t('dialog.title.edittarget', { target: this.$t('page.datasource') }),
        width: 'large'
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
          type: 'slot',
          name: 'moduleId',
          label: this.$t('term.framework.belongmodule')
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
          type: 'select',
          name: 'dbType',
          label: this.$t('page.dbtype'),
          mode: 'group',
          search: true,
          dynamicUrl: 'api/rest/datawarehouse/datasource/dbtype/search',
          rootName: 'tbodyList',
          transfer: true,
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
  async created() {
    this.getModuleList();
    this.getDatasourceById();
    this.getExample();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getExample() {
      this.$api.framework.datawarehouse.getExample().then(res => {
        this.example = res;
      });
    },
    getModuleList() {
      this.$api.framework.module.searchModule().then(res => {
        if (res.Return) {
          res.Return.forEach(g => {
            this.moduleList.push({ value: g.group, text: g.groupName });
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
          if (!this.systemDsTypeList.includes(this.reportDataSourceData.dbType)) {
            if (this.reportDataSourceData.databaseId && this.reportDataSourceData.databaseId != null) {
              this.reportDataSourceData.dbType = this.reportDataSourceData.dbType + '-' + this.reportDataSourceData.databaseId;
            } else if (this.reportDataSourceData.integrationUuid && this.reportDataSourceData.integrationUuid != null) {
              this.reportDataSourceData.dbType = this.reportDataSourceData.dbType + '-' + this.reportDataSourceData.integrationUuid;
            }
          }
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
        this.reportDataSourceData = { dbType: 'mysql' };
        this.formConfig.forEach(element => {
          this.$set(element, 'value', this.reportDataSourceData[element.name]);
        });
      }
    },
    save(isClear) {
      const form = this.$refs['form'];
      if (form.valid()) {
        if (!this.reportDataSourceData.xml) {
          this.$Notice.info({
            title: this.$t('page.tip'),
            desc: this.$t('form.placeholder.pleaseinput', { target: this.$t('term.framework.xmlconfig') })
          });
          return;
        }
        if (this.id) {
          this.reportDataSourceData.id = this.id;
        }
        if (!this.systemDsTypeList.includes(this.reportDataSourceData.dbType)) {
          let index = this.reportDataSourceData.dbType.lastIndexOf('-');
          let type = this.reportDataSourceData.dbType.substring(0, index);
          let key = this.reportDataSourceData.dbType.substring(index + 1, this.reportDataSourceData.dbType.length);
          this.reportDataSourceData.dbType = type;
          if (type == 'jdbc') {
            this.reportDataSourceData.databaseId = key;
            this.reportDataSourceData.integrationUuid = null;
          } else if (type == 'integration') {
            this.reportDataSourceData.databaseId = null;
            this.reportDataSourceData.integrationUuid = key;
          }
        } else {
          this.reportDataSourceData.databaseId = null;
          this.reportDataSourceData.integrationUuid = null;
        }
        this.$api.framework.datawarehouse.saveDataSource({ ...this.reportDataSourceData, isClear: isClear ? 1 : 0 }).then(res => {
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
      }, 3000);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
