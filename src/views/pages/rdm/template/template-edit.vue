<template>
  <TsContain :enableCollapse="true">
    <template v-slot:navigation>
      <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
    </template>
    <template v-slot:topLeft>
      <TsFormInput
        v-model="templateData.name"
        border="border"
        :maxlength="50"
      ></TsFormInput>
    </template>
    <template v-slot:topRight>
      <div class="action-group">
        <div class="action-item tsfont-save" @click="saveTemplate()">{{ $t('page.save') }}</div>
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
          @end="dragEnd"
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
              <Button type="success" size="small" @click.stop="activeApp(item.name)">{{ $t('page.enable') }}</Button>
            </span>
          </li>
        </ul>
        <div class="text-title padding-xs">{{ $t('page.others') }}</div>
        <ul>
          <li class="text-default overflow radius-sm cursor padding-xs" :class="{ 'bg-selected': currentTab === 'others' }" @click="currentTab = 'others'">
            <span>{{ $t('page.othersetting') }}</span>
          </li>
        </ul>
      </div>
    </template>
    <template v-slot:content>
      <div v-if="currentTab === 'projectinfo'"></div>
      <div v-else-if="currentTab === 'TemplateStatus'"></div>
      <div v-else-if="currentTab.startsWith('app_') && currentAppType">
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
    //TemplateEdit: resolve => require(['@/views/pages/rdm/template/template-info-edit.vue'], resolve),
    AppEditor: resolve => require(['@/views/pages/rdm/template/template-app-editor.vue'], resolve)
    //TemplateStatus: resolve => require(['@/views/pages/rdm/template/template-status-edit.vue'], resolve)
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
      templateData: {},
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
    dragEnd() {
      this.$api.rdm.projecttemplate
        .updateAppSort({
          templateId: this.templateId,
          appList: this.selectedAppList
        })
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
          }
        });
    },
    unactiveApp(appType) {
      const index = this.templateData.appTypeList.find(d => d === appType);
      console.log(index);
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
      console.log(JSON.stringify(this.templateData, null, 2));
      this.$api.rdm.projecttemplate.saveProjectTemplate(this.templateData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
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
