<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <Alert show-icon>
            <div>{{ $t('message.framework.defultscenetip') }}</div>
          </Alert>
          <div>
            <div class="pb-sm">
              <span class="tsfont-plus text-action" @click="addScene()">{{ $t('page.scene') }}</span>
              <span class="pl-nm">
                <span class="text-tip pr-xs">{{ $t('page.defaultscenario') }}</span>
                <span class="text-href" @click="selectDefaultscene()">{{ getSceneName(defaultsceneUuid) }}</span>
              </span>
            </div>
            <TsTable
              :theadList="theadList"
              :tbodyList="tbodyList"
              @operation="operation"
            >
              <template v-slot:referenceCount="{row}">
                <ReferenceSelect
                  :uuid="row.uuid"
                  calleeType="formscene"
                  :isTable="true"
                  :referenceCount="row.referenceCount"
                ></ReferenceSelect>
              </template> 
              <template v-slot:action="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li class="tsfont-copy" @click="copyScene(row)">{{ $t('page.copy') }}</li>
                    <li
                      v-if="row.uuid !== formConfig.uuid && !row.isDefaultValue"
                      class="tsfont-trash-o"
                      :class="{ 'disable': row.referenceCount }"
                      :title="row.referenceCount? $t('message.framework.notdelscenetip') : ''"
                      @click="deleteScene(row)"
                    >{{ $t('page.delete') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </div>
        </div>
      </template>
    </TsDialog>
    <TsDialog
      :title="$t('page.defaultscenario')"
      type="modal"
      :isShow.sync="isSelectDefaultsceneDialog"
      @on-ok="saveDefaultscene"
      @on-close="closeDefaultsceneDialog"
    >
      <template v-slot>
        <div>
          <TsFormItem :label="$t('page.defaultscenario')" required>
            <TsFormSelect
              v-model="selectSceneUuid"
              :dataList="tbodyList"
              textName="name"
              valueName="uuid"
              :validateList="validateList"
              transfer
            ></TsFormSelect>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    uuid: String,
    currentVersionUuid: String,
    sceneUuid: String,
    data: Object,
    formConfig: Object
  },
  data() {
    return {
      loadingShow: true,
      dialogConfig: {
        title: this.$t('term.process.formscene'),
        type: 'slider',
        isShow: true,
        width: 'large',
        hasFooter: false,
        maskClose: true
      },
      theadList: [
        { title: this.$t('page.scenarioname'), key: 'name', type: 'linktext', textValue: 'edit'},
        { title: this.$t('term.process.associatedsteps'), key: 'referenceCount'},
        { title: this.$t('page.fcu'), key: 'lcu', type: 'user' },
        { title: this.$t('page.fcd'), key: 'lcd', type: 'time' },
        {key: 'action'}
      ],
      tbodyList: [],
      defaultsceneUuid: null,
      isSelectDefaultsceneDialog: false,
      validateList: ['required'],
      selectSceneUuid: null
    };
  },
  beforeCreate() {},
  created() {
    this.initData();
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
    initData() {
      let defaultValue = [];
      if (!this.$utils.isEmpty(this.formConfig) && this.formConfig.name) {
        this.tbodyList.push({
          name: this.$t('page.mainscene'),
          uuid: this.formConfig.uuid,
          lcu: this.formConfig.lcu,
          lcd: this.formConfig.lcd
        });
        this.defaultsceneUuid = this.formConfig.uuid;
      }
      if (this.formConfig && this.formConfig.sceneList && this.formConfig.sceneList.length > 0) {
        this.formConfig.sceneList.sort((a, b) => { return b.lcd - a.lcd; }); 
        this.tbodyList.push(...this.formConfig.sceneList);
        let findDefaultValue = this.formConfig.sceneList.find(s => s.isDefaultValue);
        if (findDefaultValue) {
          this.defaultsceneUuid = findDefaultValue.uuid;
        }
      }
      if (this.tbodyList.length > 0) {
        defaultValue = this.$utils.mapArray(this.tbodyList, 'uuid');
        this.getReferenceCount(defaultValue);
      } else {
        this.loadingShow = false;
      }
    },
    closeDialog() {
      this.$emit('close');
    },
    addScene() {
      this.$router.replace({
        path: '/form-scene-edit',
        query: {
          uuid: this.uuid,
          currentVersionUuid: this.currentVersionUuid,
          type: 'add'
        }
      });
    },
    copyScene(row) {
      this.closeDialog();
      this.$router.replace({
        path: '/form-scene-edit',
        query: {
          uuid: this.uuid,
          currentVersionUuid: this.currentVersionUuid,
          sceneUuid: row.uuid,
          type: 'copy'
        }
      });
    },
    deleteScene(row) {
      if (row.referenceCount) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        'on-ok': vnode => {
          vnode.isShow = false;
          let findIndex = this.tbodyList.findIndex(item => item.uuid === row.uuid);
          if (findIndex > -1) {
            this.$api.framework.form.deleteScene({
              versionUuid: this.currentVersionUuid,
              sceneUuid: row.uuid
            }).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.$emit('deleteScene', row.uuid);
              }
            });
            this.$delete(this.tbodyList, findIndex);
          }
        }
      });
    },
    operation(row, type) {
      if (type === 'edit') {
        if (this.sceneUuid === row.uuid) {
          this.$emit('close');
        } else {
          if (this.formConfig.uuid === row.uuid) {
            this.$router.replace({
              path: '/form-edit',
              query: {
                uuid: this.uuid,
                currentVersionUuid: this.currentVersionUuid
              }
            });
          } else {
            this.$router.replace({
              path: '/form-scene-edit',
              query: {
                uuid: this.uuid,
                currentVersionUuid: this.currentVersionUuid,
                sceneUuid: row.uuid,
                type: 'edit'
              }
            });
          }
        }
      }
    },
    getFormData() {
      let data = {
        uuid: this.uuid,
        currentVersionUuid: this.currentVersionUuid,
        name: this.data.name,
        isActive: this.data.isActive,
        formConfig: this.$utils.deepClone(this.formConfig)
      };
      return data;
    },
    getReferenceCount(defaultValue) {
      this.$api.framework.form.getReferenceCount({
        calleeType: 'formscene',
        defaultValue: defaultValue
      }).then(res => {
        if (res.Status == 'OK') {
          let referenceCountConfig = res.Return || {};
          this.tbodyList.forEach(item => {
            if (referenceCountConfig[item.uuid]) {
              this.$set(item, 'referenceCount', referenceCountConfig[item.uuid]);
            } else {
              this.$set(item, 'referenceCount', 0);
            }
          });
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    selectDefaultscene() {
      this.selectSceneUuid = this.$utils.deepClone(this.defaultsceneUuid);
      this.isSelectDefaultsceneDialog = true;
      //  = this.tbodyList.find(item => item.isDefaultValue).uuid;
      //  if
    },
    saveDefaultscene() {
      this.defaultsceneUuid = this.selectSceneUuid;
      this.tbodyList.forEach(item => {
        if (item.uuid === this.defaultsceneUuid) {
          this.$set(item, 'isDefaultValue', true);
        } else {
          this.$set(item, 'isDefaultValue', false);
        }
      });
      this.isSelectDefaultsceneDialog = false;
    },
    closeDefaultsceneDialog() {
      this.isSelectDefaultsceneDialog = false;
    }
  },
  filter: {},
  computed: {
    getSceneName() {
      return (uuid) => {
        let name = '';
        if (this.tbodyList && this.tbodyList.length > 0) {
          let findItem = this.tbodyList.find(item => item.uuid === uuid);
          if (findItem) {
            name = findItem.name;
          }
        }
        return name;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
