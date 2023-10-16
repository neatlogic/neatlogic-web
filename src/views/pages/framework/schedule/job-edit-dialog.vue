<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      :okBtnDisable="isSaving"
      @on-close="closeDialog"
      @on-ok="save"
    >
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

              <template v-slot:name="{ row }">
                <span class="trigger-name">
                  {{ row.description }}
                </span>
                <span v-if="row.required" class="require-label"></span>
                <Tooltip
                  placement="bottom"
                  max-width="300"
                  theme="light"
                  transfer
                >
                  <i class="tsfont-info-o cursor-pointer text-href"></i>
                  <div slot="content">
                    <p>{{ row.help }}</p>
                  </div>
                </Tooltip>
              </template>

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
        title: (this.jobUuid && this.isCopy) ? this.$t('page.copy') : ((this.jobUuid && !this.isCopy) ? this.$t('page.edit') : this.$t('page.add')),
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      propList: [],
      theadList: [
        {
          title: this.$t('page.attrname'),
          key: 'name'
        },
        {
          title: this.$t('page.attrvalue'),
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
          label: this.$t('page.primarykey')
        },
        name: {
          type: 'text',
          value: '',
          defaultValue: '', //默认值
          maxlength: 20,
          label: this.$t('page.name'),
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
          label: this.$t('term.autoexec.jobmodule'),
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
          label: this.$t('page.status'),
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            {
              value: 1,
              text: this.$t('page.enable')
            },
            {
              value: 0,
              text: this.$t('page.disable')
            }
          ]
        },
        needAudit: {
          type: 'radio',
          value: 1,
          defaultValue: 1, //默认值
          label: this.$t('page.keeprecords'),
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            {
              value: 1,
              text: this.$t('page.yes')
            },
            {
              value: 0,
              text: this.$t('page.no')
            }
          ]
        },
        cron: {
          type: 'quartz',
          value: '',
          defaultValue: '', //默认值
          label: this.$t('page.plantime'),
          showType: 'edit',
          config: {direction: 'down'}
        },
        beginTime: {
          type: 'datetime',
          value: '',
          defaultValue: '', //默认值
          transfer: true,
          width: '100%',
          label: this.$t('term.autoexec.planstarttime')
        },
        endTime: {
          type: 'datetime',
          value: '',
          defaultValue: '', //默认值
          transfer: true,
          width: '100%',
          label: this.$t('term.autoexec.planendtime')
        },
        propList: {
          type: 'slot',
          label: this.$t('page.attribute')
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
    async changeJobClass(value) {
      if (value) {
        let params = {
          className: value
        };
        this.propList = [];
        await this.$api.framework.schedule.classGet(params).then(res => {
          if (res.Status == 'OK') {
            this.propList = res.Return.propList;
            // res.Return.inputList.forEach(item => {
            //   this.propList.push(this.$utils.deepClone(item));
            // });
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
          if (item.value) {
            data.propList.push(item);
          }
        });
        this.isSaving = true;
        this.$api.framework.schedule.save(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
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
    // MergeData: function(rsPropList) {
    //   console.log(rsPropList, 'rsPropList');
    //   console.log(this.propList, 'this.propList');
    //   let mergePropList = [];
    //   let propList = this.propList;
    //   propList.forEach(function(defineProp) {
    //     rsPropList.forEach(function(rsProp) {
    //       if (defineProp.name === rsProp.name) {
    //         defineProp['value'] = rsProp.value;
    //         defineProp['id'] = rsProp.id;
    //         mergePropList.push(defineProp);
    //       }
    //     });
    //   });
    //   this.propList = mergePropList;
    //   console.log(this.propList, 'this.propList2');
    // },
    getJobByUuid: function() {
      if (this.jobUuid) {
        let params = {
          uuid: this.jobUuid
        };
        this.$api.framework.schedule
          .get(params)
          .then(async res => {
            if (res.Status == 'OK') {
              // let rsPropList = res.Return.propList || [];
              // console.log('a');
              // await this.changeJobClass(res.Return.handler);
              // console.log('b');
              // this.MergeData(rsPropList);
              // console.log('c');
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
    }//,
    // addProp: function() {
    //   //添加属性
    //   let objProp = {
    //     name: '',
    //     value: ''
    //   };
    //   this.propList.push(objProp);
    // },
    // deleteProp: function(index) {
    //   this.propList.splice(index, 1);
    // }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
