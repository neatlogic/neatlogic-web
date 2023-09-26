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
                    transfer
                    style="flex: 1;"
                  ></TsFormSelect>
                  <div class="tsfont-arrow-right pl-sm pr-sm"></div>
                  <TsFormSelect
                    ref="item"
                    v-model="item.targetSceneId"
                    :dataList="currSceneList"
                    textName="sceneName"
                    valueName="sceneId"
                    :validateList="validateList"
                    transfer
                    style="flex: 1;"
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
      dataList: [] 
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
        if (item.id != this.serviceId) {
          list.push(item);
        }
      });
      return list;
    },
    changeServceSelect(val, item, selectList) {
      this.sceneList = [{
        sourceSceneId: null,
        targetSceneId: null
      }];
      if (val) {
        this.dataList = selectList.sceneList;
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
        config: {
          sceneList: this.sceneList
        }
      };
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
    }
  },
  filter: {},
  computed: {
    getList() {
      return (dataList) => {
        let selectList = this.$utils.mapArray(this.sceneList, 'targetSceneId');
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
  watch: {}
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
