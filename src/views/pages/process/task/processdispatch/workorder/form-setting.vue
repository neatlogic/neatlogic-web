<template>
  <div>
    <FormPreview
      v-if="formConfig && formConfig.controllerList"
      ref="FormPreview"
      :content="formConfig"
      :stephidetrList="stephidetrList"
      :stepreadtrList="stepreadtrList"
      :formAttributeHideList="formAttributeHideList"
    ></FormPreview>
    <TsSheet
      v-else-if="formConfig && formConfig._type == 'new'"
      ref="formSheet"
      mode="read"
      :readonly="formConfig.readOnly || false"
      :value="formConfig"
      :data="formAttributeDataMap"
      @emit="formSheetEmitData"
    ></TsSheet>
  </div>
</template>
<script>
import dealFormMix from '@/views/pages/process/task/taskcommon/dealNewFormData.js';
export default {
  name: '',
  components: {
    FormPreview: resolve => require(['@/resources/components/FormMaker/formview/form-view.vue'], resolve),
    TsSheet: resolve => require(['@/resources/plugins/TsSheet/TsSheet.vue'], resolve)
  },
  mixins: [dealFormMix],
  props: {
    draftData: Object,
    priorityList: Array
  },
  data() {
    return {
      formConfig: null, //获取表单信息
      formAttributeDataMap: null,
      formAttributeHideList: [], //表单组件的权限（隐藏列表）
      stephidetrList: [], //当前步骤需要隐藏的行
      stepreadtrList: [] //当前步骤需要只读的行
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      if (this.formConfig && this.$refs.FormPreview && this.formAttributeDataMap) {
        this.$refs.FormPreview.updateFormval(this.formAttributeDataMap);
      }
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.draftData) {
        this.formConfig = this.draftData.formConfig; 
        this.formAttributeDataMap = this.draftData.formAttributeDataMap || null;
        if (this.formConfig) {
          if (this.draftData.formConfig._type == 'new') {
            this.formConfig = this.initNewFormConfig(this.draftData.startProcessTaskStep.formSceneUuid, this.formConfig);
          } else {
            this.getStepformauth(this.draftData);
          }
        }
      }
    },
    getStepformauth(channelconfig) {
      //拼接接口返回当前步骤uuid跟流程的表单授权跟表单的最终结果
      let _this = this;
      _this.stephidetrList = [];
      _this.stepreadtrList = [];
      this.formAttributeHideList = channelconfig.formAttributeHideList || [];
      let authorityList = channelconfig.formConfigAuthorityList || [];//流程图表单授权
      //流程图end
      try {
        let stepuuid = channelconfig.startProcessTaskStep.processStepUuid || null;
        let currentFormlist = this.getCurrentFormauth(stepuuid, authorityList) || [];
        let formComlist = this.formConfig && this.formConfig.controllerList ? this.formConfig.controllerList : [];
        //20201111_zqp_需求修改为流程表单默认只读，编辑配置为可编辑（与原逻辑相反）
        //【流程编辑-表单授权修改】 https://www.tapd.cn/54247054/prong/stories/view/1154247054001003628
        if (formComlist.length > 0) {
          formComlist.forEach(form => {
            form['isReadonly'] = true;
          });
        }
        if (currentFormlist.length > 0 && formComlist.length > 0) {
          currentFormlist.forEach(current => {
            if (current.type == 'component') {
              formComlist.forEach(form => {
                //判断组件数据是数组还是老的字符串
                //20201111_zqp_需求修改为流程表单默认只读，编辑配置为可编辑（与原逻辑相反）
                //【流程编辑-表单授权修改】 https://www.tapd.cn/54247054/prong/stories/view/1154247054001003628
                let isMatch = current.attributeUuidList && (current.attributeUuidList.indexOf(form.uuid) > -1 || current.attributeUuidList.indexOf('all') > -1);
                if (isMatch) {
                  if (current.action == 'hide') {
                    form['isHide'] = true;
                  }
                  // if (current.action == 'read') {
                  //   form['isReadonly'] = true;
                  // }

                  if (current.action == 'edit') {
                    form['isReadonly'] = false;
                  }
                }
              });
            } else {
              if (current.action == 'edit') {
                try {
                  let tableList = this.formConfig.sheetsConfig.tableList;
                  if (current.attributeUuidList && current.attributeUuidList.length > 0) {
                    let showUuidList = [];
                    tableList.forEach((t, tindex) => {
                      let myT = tindex + 1;
                      let isExist = current.attributeUuidList.filter(a => { return a == myT; });
                      if (isExist && isExist.length) {
                        if (t && t.length > 0) {
                          t.forEach(titem => {
                            if (titem && typeof titem == 'object' && titem.component) {
                              showUuidList.push(titem.component.uuid);
                            }
                          });
                        }
                      }
                    });
                    if (showUuidList.length > 0) {
                      formComlist.forEach(form => {
                        if (showUuidList.indexOf(form.uuid) > -1) {
                          form['isReadonly'] = false;
                        }
                      });
                    }
                  }
                } catch (error) {
                  console.info(error);
                }
              }

              if (current.action == 'hide') {
                _this.stephidetrList = _this.$utils.concatArr(_this.stephidetrList, current.attributeUuidList);
                _this.stephidetrList = _this.stephidetrList.map(item => parseInt(item));//把string类型转成number
              }
              // if (current.action == 'read') {
              //   _this.stepreadtrList = _this.$utils.concatArr(_this.stepreadtrList, current.attributeUuidList);
              // }
            }
          });
        }
      } catch (error) {
        //
      }
    },
    getCurrentFormauth(uuid, authorityList) {
      //把流程里表单授权提出当前步骤的
      let authList = [];
      if (uuid && authorityList && authorityList.length > 0) {
        let allList = authorityList;
        if (allList.length > 0) {
          authList = allList
            .filter(al => {
              return al.processStepUuidList && al.processStepUuidList.length > 0 && al.processStepUuidList.indexOf(uuid) > -1;
            })
            .map(a => {
              return {
                action: a.action,
                attributeUuidList: a.attributeUuidList || [],
                type: a.type
              };
            });
        }
      }
      return authList;
    },
    formSheetEmitData(data) {
      let messageConfig = {
        content: '',
        duration: 8,
        top: 50
      };
      if (!this.$utils.isEmpty(data)) {
        //表单联动优先级
        if (!this.$utils.isEmpty(this.priorityList) && !this.$utils.isEmpty(data.changePriority)) {
          let list = [];
          this.priorityList.forEach(item => {
            if (typeof data.changePriority === 'string') {
              if (data.changePriority.includes(item.name)) {
                list.push(item);
              }
            } if (Array.isArray(data.changePriority)) {
              if (data.changePriority.join('/').includes(item.name)) {
                list.push(item);
              }
            }
          });
          if (list.length === 1) {
            this.$emit('setPriorityByForm', list);
          } else if (list.length > 1) {
            messageConfig.content = this.$t('term.process.formpriorityrule');
            this.$Message.error(messageConfig);
          } else if (list.length == 0) { //优先级不存在时提示
            messageConfig.content = this.$t('term.process.formpriorityrule');
            this.$Message.error(messageConfig);
          }
        }
      }
    },
    getFormData() {
      let formData = {
        formAttributeDataList: [],
        hidecomponentList: [],
        readcomponentList: []
      };
      if (this.$refs.FormPreview) {
        formData.formAttributeDataList = this.$refs.FormPreview.getFormvalNovalid();
        formData.hidecomponentList = this.$refs.FormPreview.getHidecomponent();
        formData.readcomponentList = this.$refs.FormPreview.getReadcomponent();
      } else if (this.$refs.formSheet) {
        formData.formAttributeDataList = this.$refs.formSheet.getFormData();
        formData.hidecomponentList = this.$refs.formSheet.getHiddenComponents();
        formData.readcomponentList = this.$refs.formSheet.getReadComponents();
      }
      return formData;
    },
    async valid() {
      let isValid = true;
      if (this.$refs.FormPreview) {
        isValid = await this.$refs.FormPreview.getFormval({ channelUuid: this.channelUuid });
        //工作日期的校验需要参数
      } else if (this.$refs.formSheet) {
        isValid = await this.formValid(this.draftData);
      }
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
