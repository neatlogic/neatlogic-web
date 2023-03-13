<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
      <template v-slot>
        <TsForm
          ref="mainForm"
          :itemList="formSetting"
          type="type"
          labelPosition="right"
        >
          <template slot="propList">
            <!-- <div class="mb-nm">
              <Button type="primary" ghost @click="addProp">
                <span class="tsfont-plus"></span>
              </Button>
            </div>-->
            <TsTable
              ref="proptable"
              :fixedHeader="false"
              :theadList="theadList"
              :tbodyList="propList"
            >
              <template v-slot:value="{ row }">
                <TsFormInput
                  v-if="row.dataType && (row.dataType.toLowerCase() == 'int' || row.dataType.toLowerCase() == 'integer' ||row.dataType.toLowerCase() == 'long' || row.dataType.toLowerCase() == 'double')"
                  v-model="row.value"
                  type="number"
                  border="border"
                  maxlength="50"
                ></TsFormInput>
                <TsFormInput
                  v-else
                  v-model="row.value"
                  border="border"
                  maxlength="50"
                ></TsFormInput>
              </template>
              <!-- <template v-slot:action="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li
                      class="tsfont-trash-o"
                      @click="deleteProp(row)"
                    >{{ $t('page.delete') }}</li>
                  </ul>
                </div>
              </template>-->
            </TsTable>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="closeDialog">取消</Button>
        <Button type="primary" :loading="isSaving" @click="save">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    jobUuid: {type: String},
    isCopy: {type: Boolean, default: false}
  },
  data() {
    return {
      isSaving: false,
      dialogConfig: {
        type: 'modal',
        title: (this.jobUuid && this.isCopy) ? '复制定时作业' : ((this.jobUuid && !this.isCopy) ? '编辑定时作业' : '添加定时作业'),
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      propList: [],
      theadList: [
        {
          title: '属性名',
          key: 'name'
        },
        {
          title: '属性类型',
          key: 'dataType'
        },
        {
          title: '属性值',
          key: 'value'
        }
      ],
      formSetting: {
        uuid: {
          type: 'text',
          value: null,
          defaultValue: null, //默认值
          maxlength: 20,
          isHidden: true,
          label: '主键'
        },
        name: {
          type: 'text',
          value: '',
          defaultValue: '', //默认值
          maxlength: 20,
          label: '名称',
          validateList: ['required', {
            name: 'searchUrl', 
            url: 'api/rest/job/save',
            params: () => ({uuid: this.jobUuid})
          }]
        },
        handler: {
          type: 'select',
          value: '',
          defaultValue: '', //默认值
          maxlength: 20,
          label: '作业模块',
          validateList: ['required'],
          url: '/api/rest/job/class/search', //通过url获取数据
          valueName: 'className', //option渲染值
          textName: 'name', //text渲染值
          rootName: 'tbodyList',
          onChange: (val) => {
            this.changeJobClass(val);
          }
        },
        isActive: {
          type: 'radio',
          value: 1,
          defaultValue: 1, //默认值
          label: '状态',
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            {
              value: 1,
              text: '启用'
            },
            {
              value: 0,
              text: '禁用'
            }
          ]
        },
        needAudit: {
          type: 'radio',
          value: 1,
          defaultValue: 1, //默认值
          label: '保存记录',
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            {
              value: 1,
              text: '是'
            },
            {
              value: 0,
              text: '否'
            }
          ]
        },
        cron: {
          type: 'quartz',
          value: '',
          defaultValue: '', //默认值
          label: '时间计划',
          showType: 'edit',
          config: {direction: 'down'}
        },
        beginTime: {
          type: 'datetime',
          value: '',
          defaultValue: '', //默认值
          transfer: true,
          width: '100%',
          label: '计划开始时间'
        },
        endTime: {
          type: 'datetime',
          value: '',
          defaultValue: '', //默认值
          transfer: true,
          width: '100%',
          label: '计划结束时间'
        },
        propList: {
          type: 'slot',
          label: '属性'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getJobByUuid();
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
    changeJobClass(value) {
      if (value) {
        let params = {
          className: value
        };
        this.propList = [];
        this.$api.framework.schedule.classGet(params).then(res => {
          if (res.Status == 'OK') {
            res.Return.inputList.forEach(item => {
              this.propList.push(this.$utils.deepClone(item));
            });
          }
        });
      }
    },
    save() {
      var form = this.$refs.mainForm;
      if (form.valid()) {
        let data = form.getFormValue();
        data.propList = [];
        this.propList && this.propList.forEach((item) => {
          if (item.name != '' && item.value != '') {
            data.propList.push(item);
          }
        });
        this.isSaving = true;
        this.$api.framework.schedule
          .save(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.content.savesuccess'));
              this.closeDialog(true);
            }
          })
          .finally(() => {
            this.isSaving = false;
          });
      }
    },
    closeDialog(needRefresh) {
      this.$emit('close', needRefresh);
    },
    getJobByUuid: function() {
      if (this.jobUuid) {
        let params = {
          uuid: this.jobUuid
        };
        this.$api.framework.schedule
          .get(params)
          .then(res => {
            if (res.Status == 'OK') {
              this.propList = res.Return.propList || [];
              for (let key in this.formSetting) {
                this.formSetting[key].value = res.Return[key];
              }
              this.formSetting['handler'].disabled = true;
              if (this.isCopy) {
                this.formSetting['uuid'].value = '';
                this.formSetting['name'].value = res.Return['name'] + '_copy';
              }
            }
          });
      }
    },
    addProp: function() {
      //添加属性
      let objProp = {
        name: '',
        value: ''
      };
      this.propList.push(objProp);
    },
    deleteProp: function(index) {
      this.propList.splice(index, 1);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
