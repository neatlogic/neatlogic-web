<template>
  <div>
    <TsContain>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <Button>{{ $t('page.cancel') }}</Button>
          </div>
          <div v-if="current > 0" class="action-item">
            <Button type="primary" ghost @click="next((current -= 1), true)">{{ $t('page.previousstep') }}</Button>
          </div>
          <div v-if="current === datacenterList.length + 2" class="action-item">
            <Button type="primary" @click="save()">{{ $t('page.save') }}</Button>
          </div>
          <div v-if="current < datacenterList.length + 2" class="action-item">
            <Button type="primary" ghost @click="next(current + 1)">{{ $t('page.thenextstep') }}</Button>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div class="service-add">
          <div v-if="!isShowSteps" class="pb-nm">
            <Steps :current="current">
              <Step :title="$t('page.basicinfo')"></Step>
              <template v-if="!$utils.isEmpty(datacenterList)">
                <Step
                  v-for="(item, index) in datacenterList"
                  :key="index"
                  :title="item.name"
                ></Step>
              </template>
              <Step title="场景"></Step>
              <Step title="服务依赖"></Step>
            </Steps>
          </div>
          <!-- 基本信息 -->
          <template v-if="!loadingShow">
            <div v-if="current === 0">
              <TsForm ref="settings" :itemList="formConfig">
                <template v-slot:file>
                  <div v-for="(item,index) in filePathList" :key="index" class="file pb-sm">
                    <TsFormInput v-model="item.filePath"></TsFormInput>
                    <span class="tsfont-trash-s del-icon text-tip-active" @click="delFilepath(index)"></span>
                  </div>
                  <Button type="primary" ghost @click="addFile()">
                    <span class="tsfont-plus">{{ $t('page.path') }}</span>
                  </Button>
                </template>
              </TsForm>
            </div>
            <!-- 数据中心 -->
            <div v-if="current > 0 && current < datacenterList.length + 1">
              <DatacenterEdit :applicationType="applicationType"></DatacenterEdit>
            </div>
            <!-- 预案 -->
            <div v-if="current === (datacenterList.length + 1)">
              <Scene :prePlanList="prePlanList" @update="updateScene"></Scene>
            </div>
            <!-- 服务依赖 -->
            <div v-if="current === (datacenterList.length + 2)">
              <Service :firstBtn="true" @update="updateService"></Service>
            </div>
          </template>
        </div>
        <div class="flex-center pt-nm footer-btn">
          <div class="action-group">
            <div class="action-item">
              <Button @click="cancel()">{{ $t('page.cancel') }}</Button>
            </div>
            <div v-if="current > 0" class="action-item">
              <Button type="primary" ghost @click="next((current -= 1), true)">{{ $t('page.previousstep') }}</Button>
            </div>
            <div v-if="current === datacenterList.length + 2" class="action-item">
              <Button type="primary" @click="save()">{{ $t('page.save') }}</Button>
            </div>
            <div v-if="current < datacenterList.length + 2" class="action-item">
              <Button type="primary" ghost @click="next(current + 1)">{{ $t('page.thenextstep') }}</Button>
            </div>
          </div>
        </div>
        <!-- 校验 -->
        <ServiceValid v-model="validVisible" :validList="validList" @on-click="jumpToItem"></ServiceValid>
      </template>
    </TsContain>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    Scene: resolve => require(['./detail/scene.vue'], resolve),
    Service: resolve => require(['./detail/service.vue'], resolve),
    DatacenterEdit: resolve => require(['./detail/datacenter-edit.vue'], resolve),
    ServiceValid: resolve => require(['./detail/service-valid-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: false,
      current: 0,
      baseSettings: {},
      datacenterList: [],
      prePlanList: [],
      applicationDependencyList: [],
      formConfig: {
        name: {
          type: 'text',
          maxlength: 50,
          label: '服务名称', // 名称
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: '',
              key: 'name'
            }
          ]
        },
        applicationType: {
          type: 'select',
          label: '应用类型',
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'DrAppType' },
          validateList: ['required'],
          onChange: (val) => {
            this.changeApplicationType(val);
          }
        },
        organizationId: {
          type: 'tree',
          label: '恢复机构',
          url: '/api/rest/dr/organization/tree',
          textName: 'name',
          valueName: 'id',
          search: true,
          transfer: true,
          validateList: ['required']
        },
        recoveryTimeObjective: {
          type: 'number',
          label: 'RTO（' + this.$t('page.minute') + '）'
        },
        recoveryPointObjective: {
          type: 'number',
          label: 'RPO（' + this.$t('page.minute') + '）'
        },
        file: {
          type: 'slot',
          label: '配置文件路径'
        },
        dataCenter: {
          type: 'checkbox',
          label: '关联数据中心',
          url: '/api/rest/dr/datacenter/list',
          valueName: 'id',
          textName: 'name',
          multiple: true,
          validateList: ['required', {
            name: 'custom',
            trigger: 'change',
            message: '至少选择两个',
            validator: (rule, val, el) => {
              return this.validDatacenter(el);
            }
          }],
          onChange: this.changeDataCenter
        }
      },
      filePathList: [],
      isShowSteps: false,
      validList: [],
      validVisible: false,
      basicservicesTypeIdList: [], //基础服务选的配置
      networkTypeIdList: [] ///网络选的配置
    };
  },
  beforeCreate() {},
  created() {
    this.getCiList();
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
    async changeApplicationType(val) {
      this.applicationType = val;
    },
    getCiList() {
      this.$api.dr.ci.getCiList().then(res => {
        if (res && res.Status == 'OK') {
          let basicservicesConfig = res.Return.find(item => item.name === 'basicservices');
          let networkConfig = res.Return.find(item => item.name === 'network');
          this.basicservicesTypeIdList = basicservicesConfig.ciIdList;
          this.networkTypeIdList = networkConfig.ciIdList;
        }
      });
    },
    next(current) {
      if (this.$refs.settings) {
        if (!this.$refs.settings.valid()) {
          return;
        } else {
          this.baseSettings = this.$refs.settings.getFormValue() || {};
        }
      }
      this.loadingShow = true;
      this.current = current;
      if (current > 0) {
        //
      }
      this.$nextTick(() => {
        this.loadingShow = false;
      });
    },
    updateScene(list) {
      this.prePlanList = list;
    },
    updateService(list) {
      this.applicationDependencyList = list;
    },
    getValid() {
      let validList = [];
      return validList;
    },
    getData() {
      let data = {
        name: this.baseSettings.name || '',
        applicationType: this.baseSettings.applicationType || '',
        organizationId: this.baseSettings.organizationId || '',
        recoveryTimeObjective: this.baseSettings.recoveryTimeObjective || null,
        recoveryPointObjective: this.baseSettings.recoveryPointObjective || null,
        configFilePathList: this.$utils.mapArray(this.filePathList, 'filePath'),
        datacenterList: this.datacenterList,
        prePlanList: [],
        applicationDependencyList: []
      };
      return data;
    },
    save() {
      this.validList = this.getValid();
      if (!this.$utils.isEmpty(this.validList)) {
        this.validVisible = true;
        return;
      }
      let data = this.getData();
      console.log(data);
    },
    changeDataCenter(value, selectedItem) {
      //改变关联数据中心需要更新步骤的数据
      this.isShowSteps = true;
      this.datacenterList = selectedItem;
      this.$nextTick(() => {
        this.isShowSteps = false;
      });
    },
    addFile() {
      this.filePathList.push({
        filePath: ''
      });
    },
    delFilepath(index) {
      this.filePathList.splice(index, 1);
    },
    validDatacenter(el) {
      //关联数据中心校验：至少选择两项
      let isValid = true;
      if (el && el.currentValue.length < 2) {
        isValid = false;
      }
      return isValid;
    },
    cancel() {
      this.$createDialog({
        title: this.$t('dialog.title.cancelconfirm'),
        content: this.$t('dialog.content.cancelconfirm'),
        'on-ok': vnode => {
          vnode.isShow = false;
          this.$router.push({
            path: './service-manage'
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    jumpToItem() {

    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.service-add {
  width: 80%;
  margin: 0 auto;
}
.file {
  position: relative;
  .del-icon {
    position: absolute;
    right: -20px;
    top: 0;
  }
}
.footer-btn {
  width: 100%;
}
</style>
