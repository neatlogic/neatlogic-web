<template>
  <TsContain>
    <template v-slot:navigation>
      <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
    </template>
    <template v-slot:topLeft>
      <TsFormInput v-model="templateData.name" border="border" :maxlength="50"></TsFormInput>
    </template>
    <template v-slot:topRight>
      <div class="action-group">
        <div class="action-item"><TsFormSwitch
          v-model="templateData.isActive"
          :trueValue="1"
          :falseValue="0"
          :showStatus="true"
          :trueText="$t('page.isactived')"
          :falseText="$t('page.ban')"
        ></TsFormSwitch></div>
        <div class="action-item">
          <Button type="primary" @click="saveTemplate()">{{ $t('page.save') }}</Button>
        </div>
      </div>
    </template>
    <template v-slot:sider>
      <div style="height: calc(100vh - 205px)" class="pr-md">
        <div class="text-title padding-xs">
          <div>{{ $t('term.rdm.appsets') }}</div>
          <div class="fz10">{{ $t('term.rdm.dragapp') }}</div>
        </div>
        <draggable
          v-if="templateData && templateData.appTypeList && templateData.appTypeList.length > 0"
          tag="ul"
          :list="templateData.appTypeList"
          handle=".tsfont-drag"
          ghost-class="li-active"
        >
          <li
            v-for="item in templateData.appTypeList"
            :key="item.id"
            class="text-default overflow radius-sm padding-xs"
            style="position: relative"
            :title="item.appTypeName"
            :class="{ 'bg-selected': currentTab === 'app_' + item.appType }"
            @click="
              currentTab = 'app_' + item.appType;
              currentAppType = null;
              $nextTick(() => {
                currentAppType = item;
              });
            "
          >
            <span class="tsfont-drag" style="cursor: move"></span>
            <span class="cursor overflow" style="margin-right: 50px">{{ item.appTypeName }}</span>
            <span style="position: absolute; right: 0px">
              <Button size="small" @click.stop="unactiveApp(item.appType)">{{ $t('page.disable') }}</Button>
            </span>
          </li>
        </draggable>
        <ul>
          <li
            v-for="(item, index) in unSelectedAppList"
            :key="index"
            style="position: relative"
            class="text-default overflow radius-sm padding-xs"
          >
            <span class="tsfont-fullscreen text-grey overflow" style="margin-right: 50px">{{ item.label }}</span>
            <span style="position: absolute; right: 0px">
              <Button type="success" size="small" @click.stop="activeApp(item)">{{ $t('page.enable') }}</Button>
            </span>
          </li>
        </ul>
      </div>
    </template>
    <template v-slot:content>
      <div v-if="currentTab.startsWith('app_') && currentAppType">
        <AppEditor :appType="currentAppType"></AppEditor>
      </div>
    </template>
  </TsContain>
</template>

<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    AppEditor: resolve => require(['@/views/pages/rdm/template/template-app-editor.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  data() {
    return {
      templateId: null,
      dialogConfig: {
        type: 'slider',
        maskClose: true,
        isShow: true,
        width: 'huge',
        hasFooter: false
      },
      templateData: { appTypeList: [] },
      selectedAppList: [],
      appTypeList: [],
      currentAppType: null,
      currentTab: 'projectinfo'
    };
  },
  beforeCreate() {},
  created() {
    this.templateId = Math.floor(this.$route.params['templateId']);
    this.getProjectTemplateById();
    this.getAllAppTypeList();
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
    activeApp(appType) {
      this.templateData.appTypeList.push({
        appType: appType.name,
        appTypeName: appType.label,
        config: {
          statusList: [],
          statusRelList: [],
          attrList: []
        }
      });
    },
    unactiveApp(appType) {
      const index = this.templateData.appTypeList.findIndex(d => d.appType === appType);
      if (index >= 0) {
        this.templateData.appTypeList.splice(index, 1);
      }
    },
    getAllAppTypeList() {
      this.$api.rdm.app.getAllAppTypeList().then(res => {
        this.appTypeList = res.Return;
      });
    },
    getProjectTemplateById() {
      if (this.templateId) {
        this.$api.rdm.projecttemplate.getProjectTemplateById(this.templateId).then(res => {
          this.templateData = res.Return;
        });
      }
    },
    saveTemplate() {
      if (!this.templateData.appTypeList || this.templateData.appTypeList.length == 0) {
        this.$Message.info(this.$t('term.rdm.pleaseactiveapp'));
        return;
      }
      this.$api.rdm.projecttemplate.saveProjectTemplate(this.templateData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$router.push({path: '/template-edit/' + res.Return});
        }
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    unSelectedAppList() {
      if (this.templateData && this.templateData.appTypeList) {
        return this.appTypeList.filter(d => {
          return !this.templateData.appTypeList.find(dd => d.name == dd.appType);
        });
      } else {
        return this.appTypeList;
      }
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.titlelistBox {
  margin-bottom: 14px;
}
.treeTitle {
  padding-left: 16px;
  font-size: 12px;
  margin-bottom: 4px;
}
.treeList {
  font-size: 13px;
  font-weight: 400;
  min-width: 130px;
  height: 32px;
  line-height: 32px;
  cursor: pointer;
  span {
    padding-left: 10px;
  }
}
// .bg-block {
//   border-radius: 6px;
// }
.tsbg-block {
  border-radius: 6px;
}
</style>
