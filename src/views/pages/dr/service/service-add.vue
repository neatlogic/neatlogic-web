<template>
  <div>
    <TsContain>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <Button type="primary" ghost>{{ $t('page.cancel') }}</Button>
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
              <Step title="预案"></Step>
              <Step title="服务依赖"></Step>
            </Steps>
          </div>
          <!-- 基本信息 -->
          <div v-if="current === 0">
            <TsForm ref="settings" :itemList="formConfig">
              <template v-slot:file>
                <div v-for="(item,index) in fileList" :key="index" class="file pb-sm">
                  <TsFormInput v-model="item.filePath"></TsFormInput>
                  <span class="tsfont-trash-s del-icon text-tip-active"></span>
                </div>
                <Button type="primary" ghost @click="addFile()">
                  <span class="tsfont-plus">{{ $t('page.path') }}</span>
                </Button>
              </template>
            </TsForm>
          </div>
          <!-- 数据中心 -->
          <div v-if="current > 0 && current < datacenterList.length + 1">
            <DatacenterEdit></DatacenterEdit>
          </div>
          <!-- 预案 -->
          <div v-if="current === (datacenterList.length + 1)">
            <Scene></Scene>
          </div>
          <!-- 服务依赖 -->
          <div v-if="current === (datacenterList.length + 2)">
            <Service :firstBtn="true"></Service>
          </div>
        </div>
        <div class="flex-center pt-nm footer-btn">
          <div class="action-group">
            <div class="action-item">
              <Button type="primary" ghost>{{ $t('page.cancel') }}</Button>
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
    DatacenterEdit: resolve => require(['./detail/datacenter-edit.vue'], resolve)
  },
  props: {},
  data() {
    return {
      current: 0,
      datacenterList: [],
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
        type: {
          type: 'select',
          label: '应用类型', // 名称
          validateList: ['required']
        },
        jg: {
          type: 'select',
          label: '恢复机构', // 名称
          validateList: ['required']
        },
        RTO: {
          type: 'text',
          label: 'RTO（分钟）',
          validateList: ['number']
        },
        RPO: {
          type: 'text',
          label: 'RPO（分钟）',
          validateList: ['number']
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
      fileList: [
        {
          filePath: 'sss'
        }
      ],
      isShowSteps: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    console.log(this.$utils.isSame({a: [1, 2]}, {a: [2, 1]}));
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    next(current) {
      // if (this.$refs.settings && !this.$refs.settings.valid()) {
      //   return;
      // }
      this.current = current;
    },
    save() {},
    changeDataCenter(value, selectedItem) {
      this.isShowSteps = true;
      this.datacenterList = selectedItem;
      this.$nextTick(() => {
        this.isShowSteps = false;
      });
    },
    addFile() {
      this.fileList.push({
        filePath: 'ss'
      });
    },
    validDatacenter(el) {
      // 验证协议和账号唯一
      let isValid = true;
      if (el && el.currentValue.length < 2) {
        isValid = false;
      }
      return isValid;
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
