<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="formData" :item-list="formConfig">
          <template v-slot:path>
            <div>
              <Poptip
                trigger="hover"
                placement="bottom-start"
                width="800"
                :transfer="true"
              >
                <div>
                  <div v-if="ciRelList && ciRelList.length > 0" class="cursor" style="overflow: hidden; white-space: nowrap">
                    <div>
                      <span v-for="(p, pindex) in ciRelList" :key="pindex">
                        <span v-if="pindex === 0">
                          <Tag color="primary">{{ p.ciLabel }}({{ p.ciName }})</Tag>
                        </span>
                        <span v-if="p.direction === 'from'" class="text-grey fz10 tsfont-minus"></span>
                        <span v-else-if="p.direction === 'to'" class="text-grey fz10 tsfont-arrow-left"></span>
                        <span class="text-grey fz10">
                          {{ p.relLabel }}
                        </span>
                        <span v-if="p.direction === 'from'" class="text-grey fz10 tsfont-arrow-right"></span>
                        <span v-else-if="p.direction === 'to'" class="text-grey fz10 tsfont-minus"></span>
                        <span>
                          <Tag v-if="pindex === ciRelList.length - 1" color="primary">{{ p.targetCiLabel }}({{ p.targetCiName }})</Tag>
                          <Tag v-else color="primary">{{ p.targetCiLabel }}({{ p.targetCiName }})</Tag>
                        </span>
                      </span>
                    </div>
                  </div>
                  <a v-else>{{ $t('term.cmdb.selectrelpath') }}</a>
                </div>
                <div slot="content">
                  <CiRelTree :ciId="ciId" @select="selectNode"></CiRelTree>
                </div>
              </Poptip>
            </div>
          </template>
          <template v-slot:activePath>
            <div>
              <CiCustomviewEdit :id="viewId" ref="viewEditor" :path="ciRelList"></CiCustomviewEdit>
            </div>
          </template>
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button v-if="viewId" type="error" @click="deleteView()">{{ $t('page.delete') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    CiCustomviewEdit: resolve => require(['./ci-customview-edit.vue'], resolve),
    CiRelTree: resolve => require(['@/views/pages/cmdb/components/ci/ci-rel-list-tree.vue'], resolve)
  },
  props: {
    ciId: { type: Number },
    viewId: { type: Number }
  },
  data() {
    return {
      ciRelList: [],
      keyword: '',
      formData: {
        ciId: this.ciId,
        isActive: 1,
        type: 'scene'
      },
      dialogConfig: {
        title: this.$t('term.cmdb.customviewconfig'),
        type: 'slider',
        width: 'huge',
        isShow: true
      },
      formConfig: {
        name: {
          label: this.$t('page.name'),
          type: 'text',
          maxlength: 30,
          validateList: ['required']
        },
        path: {
          label: this.$t('term.diagram.relpath'),
          type: 'slot',
          isHidden: !!this.viewId
        },
        activePath: {
          label: ' ',
          type: 'slot'
        }
      },
      searchParam: {
        ciId: this.ciId
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.viewId) {
      this.getCustomViewById();
    }
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
    selectNode(nodes) {
      if (nodes.length > 0) {
        this.ciRelList = this.$utils.deepClone(nodes[0].path);
      } else {
        this.ciRelList = [];
      }
    },
    getCustomViewById() {
      if (this.viewId) {
        this.$api.cmdb.customview.getCustomViewById(this.viewId).then(res => {
          this.formData = res.Return;
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    deleteView() {
      if (this.viewId) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          type: 'modal',
          content: this.$t('dialog.content.deleteconfirm', { target: this.$t('term.cmdb.customview') }),
          width: 'small',
          'on-ok': vnode => {
            this.$api.cmdb.customview.deleteCustomView(this.viewId).then(res => {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.deletesuccess'));
              this.close(true);
            });
          }
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      const viewEditor = this.$refs['viewEditor'];
      if (form && viewEditor && form.valid()) {
        const viewData = viewEditor.getViewData();
        this.formData.config = viewData;
        this.formData.ciId = this.ciId;
        this.$api.cmdb.customview.saveCustomView(this.formData).then(res => {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        });
      }
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
