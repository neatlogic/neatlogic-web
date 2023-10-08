<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :title="type==='add'?$t('page.add'):$t('page.edit') +'依赖服务'"
      @on-ok="okDialog()"
      @on-close="closeDialog()"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="form"
            v-model="formData"
            :item-list="formConfig"
          >
            <template v-slot:sceneList>
              <div style="width: 90%">
                <div v-for="(item,index) in sceneList" :key="index" class="flex-center list pb-sm">
                  <TsFormSelect
                    ref="item"
                    v-model="item.sourceSceneId"
                    :dataList="getList(dataList)"
                    :validateList="validateList"
                    :firstSelect="false"
                    transfer
                    style="flex: 1;"
                    @on-change="(val,valueConfig)=>{onChangeScene('source',valueConfig, item)}"
                  ></TsFormSelect>
                  <div class="tsfont-arrow-right pl-sm pr-sm"></div>
                  <TsFormSelect
                    ref="item"
                    v-model="item.targetSceneId"
                    :dataList="currSceneList"
                    textName="sceneName"
                    valueName="sceneId"
                    :validateList="validateList"
                    :firstSelect="false"
                    transfer
                    style="flex: 1;"
                    @on-change="(val,valueConfig)=>{onChangeScene('target',valueConfig,item)}"
                  ></TsFormSelect>
                  <div v-if="index>0" class="tsfont-trash-o text-tip-active del-icon" @click="delitem(index)"></div>
                </div>
                <Button type="primary" ghost @click="add()"><span class="tsfont-plus">依赖</span></Button>
              </div>
              <div v-if="$utils.isEmpty(sceneList)" class="form-error-tip">{{ $t('form.validate.required', {target: ''}) }}</div>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    type: {
      type: String,
      default: 'add'
    },
    serviceId: {
      type: Number,
      default: null
    },
    currSceneList: { //当前服务场景列表
      type: Array,
      default: () => []
    },
    currService: {
      type: Object,
      default: () => {}
    },
    baseSettings: {
      type: Object,
      default: () => {}
    },
    serviceList: { //服务列表
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formConfig: {
        dependencyServiceId: {
          type: 'select',
          dynamicUrl: 'api/rest/dr/service/list/forselect',
          dealDataByUrl: this.dealDataByUrl,
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          label: '依赖服务',
          validateList: ['required'],
          width: '90%',
          firstSelect: false,
          onChange: this.changeServceSelect
        },
        sceneList: {
          type: 'slot',
          label: '场景依赖',
          validateList: ['required'],
          width: '90%'
        }
      },
      validateList: ['required'],
      formData: {},
      sceneList: [ //依赖服务场景列表
        {
          sourceSceneId: null,
          targetSceneId: null
        }
      ],
      dataList: [],
      dependencyServiceConfig: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    dealDataByUrl(nodeList) {
      let list = [];
      nodeList.forEach(item => {
        let findItem = this.serviceList.find(d => d.dependencyServiceId === item.id);
        if (findItem && this.currService.dependencyServiceId != item.id) {
          this.$set(item, '_disabled', true);
        }
        if (item.id != this.serviceId) {
          list.push(item);
        }
      });
      if (list.length === 1) {
        this.dataList = list[0].sceneList;
      }
      return list;
    },
    changeServceSelect(val, item, selectList) {
      this.dependencyServiceConfig = {};
      this.sceneList = [{
        sourceSceneId: null,
        targetSceneId: null
      }];
      if (val) {
        this.dataList = selectList.sceneList;
        this.$set(this.dependencyServiceConfig, 'dependencyServiceName', item.text);
      }
    },
    okDialog() {
      let isValid = this.$refs.form.valid();
      if (!isValid) {
        return;
      }
      let formData = this.$refs.form.getFormValue();
      let data = {
        serviceId: this.serviceId,
        dependencyServiceId: formData.dependencyServiceId,
        dependencyServiceName: this.dependencyServiceConfig.dependencyServiceName,
        config: {
          sceneList: this.sceneList
        }
      };
      if (!this.$utils.isEmpty(this.baseSettings)) {
        this.$set(data, 'serviceName', this.baseSettings.name);
      }
      this.closeDialog(true, data);
    },
    closeDialog(isUpdate = false, data) {
      this.$emit('close', isUpdate, data);
    },
    add() {
      this.sceneList.push({
        sourceSceneId: null,
        targetSceneId: null
      });
    },
    delitem(index) {
      this.sceneList.splice(index, 1);
    },
    onChangeScene(type, valueConfig, item) {
      if (!this.$utils.isEmpty(valueConfig)) {
        if (type === 'source') {
          this.$set(item, 'sourceSceneName', valueConfig.text);
        } else {
          this.$set(item, 'targetSceneName', valueConfig.text);
        }
      }
    }
  },
  filter: {},
  computed: {
    getList() {
      return (dataList) => {
        let selectList = this.$utils.mapArray(this.sceneList, 'sourceSceneId');
        let list = [];
        if (!this.$utils.isEmpty(dataList)) {
          list.push({
            text: this.$t('page.default'),
            value: -1,
            _disabled: !!selectList.includes(-1)
          });
          dataList.forEach(item => {
            list.push({
              text: item.sceneName,
              value: item.sceneId,
              _disabled: !!selectList.includes(item.id)
            });
          });
        }
        return list;
      };
    }
  },
  watch: {
    currService: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          let data = this.$utils.deepClone(val);
          this.formData = data;
          this.sceneList = data.config.sceneList || [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
.list {
  position: relative;
  .del-icon {
    position: absolute;
    right: -20px;
  }
}
</style>
