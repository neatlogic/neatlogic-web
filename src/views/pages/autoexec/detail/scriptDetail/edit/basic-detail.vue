
<template>
  <div v-if="config" class="basic-detail">
    <div class="information-box">
      <div class="information bg-op padding radius-lg">
        <div class="information-title h4">
          {{ $t('page.basicinfo') }}
          <span v-if="hasAuth" class="tsfont-edit text-action" @click="edit"></span>
        </div>
        <div class="form-list">
          <div v-for="(item,index) in settingList" :key="index" class="readonly-list">
            <div class="readonly-label text-tip" :class="{'require-label':item.isRequire}">{{ item.label }}</div>
            <div class="readonly-text overflow" :title="item.text">{{ item.text }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="config.referenceCount > 0" class="action-list bg-op padding radius-lg">
      <div class="action-title h4">{{ $t('term.autoexec.relatecombinationtool') }}</div>
      <ReferenceList
        :id="config.id"
        :calleeType="config.type"
      ></ReferenceList>
    </div>
    <BasicEditDialog
      v-if="isEdit"
      :id="id"
      :config="settingConfig"
      :settingList="settingList"
      :operationType="operationType"
      @close="closeBasic"
    ></BasicEditDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    BasicEditDialog: () => import('./basic-edit-dialog'),
    ReferenceList: () => import('@/resources/components/ReferenceSelect/ReferenceList.vue')
  },
  filters: {
  },
  props: {
    config: {type: Object, default: () => {}},
    operationType: { //工具类型
      type: String,
      default: 'script'
    }
  },
  data() {
    return {
      id: null,
      isEdit: false,
      settingConfig: {
        name: '',
        typeId: '',
        catalogId: null, // 工具目录
        execMode: '',
        riskId: '',
        isLib: 0,
        defaultProfileId: null,
        customTemplateId: null,
        description: ''
      },
      settingList: [
        {
          name: 'name',
          text: '',
          label: this.$t('page.name'),
          isRequired: true
        },
        {
          name: 'typeName',
          text: '',
          label: this.$t('term.autoexec.toolclassification'),
          isRequired: true
        },
        {
          name: 'catalogName',
          text: '-',
          label: this.$t('term.autoexec.directorytool'),
          isRequired: true
        },
        {
          name: 'isLibName',
          text: '-',
          label: this.$t('term.autoexec.islibraryfile'),
          isRequired: true
        }
      ],
      isNotLibSettingList: [
        {
          name: 'execModeText',
          text: '',
          label: this.$t('page.executionmode'),
          isRequired: true
        },
        {
          name: 'riskName',
          text: '',
          label: this.$t('term.autoexec.risklevel'),
          isRequired: true
        },
        {
          name: 'customTemplateName',
          text: '-',
          label: this.$t('page.customtemplate'),
          isRequired: false
        },
        {
          name: 'defaultProfileName',
          text: '-',
          label: this.$t('term.autoexec.presetparameterset'),
          isRequired: false
        },
        {
          name: 'description',
          text: '-',
          label: this.$t('page.description'),
          isRequired: false
        }],
      isLibSettingList: [
        {
          name: 'defaultProfileName',
          text: '-',
          label: this.$t('term.autoexec.presetparameterset'),
          isRequired: false
        },
        {
          name: 'description',
          text: '-',
          label: this.$t('page.description'),
          isRequired: false
        }]
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
    initData() {
      if (this.config) {
        //isLib（是否库文件）标识为1时，标识该脚本是库文件，不需要显示执行方式、风险等级、自定义模板
        let testIndex = this.settingList.findIndex(item => item.name == 'defaultProfileName');
        if (testIndex == -1) {
          if (this.config.isLib == 1) {
            this.settingList = this.settingList.concat(this.isLibSettingList);
          } else {
            this.settingList = this.settingList.concat(this.isNotLibSettingList);
          }
        }
        this.id = this.config.id;
        Object.keys(this.config).forEach(key => {
          let i = this.config[key];
          if (this.settingConfig.hasOwnProperty(key)) {
            this.settingConfig[key] = i;
            if (key == 'catalogId') {
              // 处理工具目录回显问题
              this.settingConfig[key] = this.$toolCatalogUtils.handleCatalogIdAlltoZero(this.settingConfig);
            }
          }
        });
        this.settingList.forEach(item => {
          if (this.config[item.name]) {
            item.text = this.config[item.name] || '-';
          }
        });
      }
    },
    edit() {
      this.isEdit = true;
    },
    save() {
      this.$emit('updetaScriptName', data.name);
      this.isEdit = false;
    },
    togoAction(item) {
      window.open(HOME + '/autoexec.html#/action-detail?id=' + item.id + '&versionStatus=passed', '_blank');
    },
    closeBasic(list, settingConfig) {
      if (list && list.length) {
        this.settingList = list;
        let findItem = list.forEach(item => item.name == 'name');
        if (findItem) {
          this.$emit('updetaScriptName', findItem.text);
        }
        this.settingConfig = settingConfig;
        this.$emit('updateIsLib', this.settingConfig.isLib);
      }
      this.isEdit = false;
    }
  },
  computed: {
    hasAuth() { //脚本基本信息的保存权限
      return this.$store.getters.userAuthList.includes('AUTOEXEC_SCRIPT_MODIFY');
    }
  },
  watch: {
    config: {
      handler(val) {
        this.initData();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.basic-detail{
  .information-box{
    padding-bottom: @space-normal;
  }
  .information{
    height: 520px;
    overflow-y: auto;
    .readonly-list {
      &:not(:last-child){
        margin-bottom: 16px;
      }
    }
    .readonly-text{
      width: 100%;
      padding-top: 6px;
    }
  }
  .information-title,
  .action-title {
    padding-bottom: 12px;
  }
  .action-list{
    min-height: 100px;
    height: calc(100vh - @top-height - @actionbar-height - @space-normal - @space-normal - 2px - 520px);
    overflow-y: auto;
  }
  .action-name{
    width: 100%;
    padding-bottom: 16px;
  }
  .action-icon{
    position: absolute;
    top: -30px;
    right: 0;
  }
}
</style>
