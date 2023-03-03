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
            <div>自定义表单场景，可基于默认场景组件，修改表单布局，隐藏、禁用组件或修改组件数据源。表单场景可关联流程节点，实现同一流程，不同节点的处理页面展示不同的表单布局。工单的查看页面统一展示表单默认场景。</div>
          </Alert>
          <div>
            <div class="pb-sm">
              <span class="tsfont-plus text-action" @click="addScene()">场景</span>
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
                    <li class="tsfont-copy" @click="copyScene(row)">复制</li>
                    <li
                      v-if="row.uuid !== formConfig.uuid"
                      class="tsfont-trash-o"
                      :class="{ 'disable': row.referenceCount }"
                      :title="row.referenceCount? '当前表单场景已被引用，无法删除' : ''"
                      @click="deleteScene(row)"
                    >删除</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </div>
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
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve)
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
        title: '表单场景',
        type: 'slider',
        isShow: true,
        width: 'large',
        hasFooter: false,
        maskClose: true
      },
      theadList: [
        { title: '场景名称', key: 'name', type: 'linktext', textValue: 'edit'},
        { title: '关联步骤', key: 'referenceCount'},
        { title: '修改人', key: 'lcu', type: 'user' },
        { title: '修改时间', key: 'lcd', type: 'time' },
        {key: 'action'}
      ],
      tbodyList: []
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
          name: this.formConfig.name,
          uuid: this.formConfig.uuid,
          lcu: this.formConfig.lcu,
          lcd: this.formConfig.lcd
        });
      }
      if (this.formConfig && this.formConfig.sceneList && this.formConfig.sceneList.length > 0) {
        this.formConfig.sceneList.sort((a, b) => { return b.lcd - a.lcd; }); 
        this.tbodyList.push(...this.formConfig.sceneList);
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
        title: '警告',
        content: '确认删除表单场景[' + row.name + ']？',
        'on-ok': vnode => {
          vnode.isShow = false;
          let findIndex = this.tbodyList.findIndex(item => item.uuid === row.uuid);
          if (findIndex > -1) {
            this.$api.framework.form.deleteScene({
              versionUuid: this.currentVersionUuid,
              sceneUuid: row.uuid
            }).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.content.deletesuccess'));
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
            }
          });
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
