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
                  <Tree
                    :data="relList"
                    :empty-text="$t('term.cmdb.startci')"
                    :render="renderName"
                    :load-data="loadData"
                    :multiple="false"
                    @on-select-change="selectNode"
                  ></Tree>
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
    CiCustomviewEdit: resolve => require(['./ci-customview-edit.vue'], resolve)
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
      },
      relList: []
    };
  },
  beforeCreate() {},
  created() {
    if (!this.viewId) {
      this.getRelByCiId();
    } else {
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
    renderName(h, { data }) {
      if (data.direction === 'from') {
        return h(
          'div',
          {
            on: {
              click: () => {}
            }
          },
          [
            h('span', {
              class: {
                'text-grey': true,
                fz10: true,
                'tsfont-minus': true
              }
            }),
            h(
              'span',
              {
                class: {
                  'text-grey': true,
                  fz10: true
                }
              },
              data.toLabel
            ),
            h('span', {
              class: {
                'text-grey': true,
                fz10: true,
                'tsfont-arrow-right': true
              }
            }),
            h('span', data.toCiLabel + '(' + data.toCiName + ')')
          ]
        );
      } else {
        return h(
          'div',
          {
            on: {
              click: () => {}
            }
          },
          [
            h('span', {
              class: {
                'text-grey': true,
                fz10: true,
                'tsfont-arrow-left': true
              }
            }),
            h(
              'span',
              {
                class: {
                  'text-grey': true,
                  fz10: true
                }
              },
              data.fromLabel
            ),
            h('span', {
              class: {
                'text-grey': true,
                fz10: true,
                'tsfont-minus': true
              }
            }),
            h('span', data.fromCiLabel + '(' + data.fromCiName + ')')
          ]
        );
      }
    },
    loadData(item, callback) {
      if (item) {
        let ciId, excludeCiId;
        if (item.direction === 'from') {
          ciId = item.toCiId;
          excludeCiId = item.fromCiId;
        } else {
          ciId = item.fromCiId;
          excludeCiId = item.toCiId;
        }
        const excludeCiIdList = item.excludeCiIdList || [];
        excludeCiIdList.push(excludeCiId);
        this.$api.cmdb.ci.getRelByCiId(ciId).then(res => {
          //排除掉来源关系，避免产生回环
          const relList = res.Return.filter(d => d.id !== item.id && ((d.direction === 'from' && !excludeCiIdList.includes(d.toCiId)) || (d.direction === 'to' && !excludeCiIdList.includes(item.fromCiId))));
          if (relList.length === 0) {
            this.$delete(item, 'children');
            this.$delete(item, 'loading');
          } else {
            relList.forEach(rel => {
              const path = this.$utils.deepClone(item.path || []);
              rel.children = [];
              rel.loading = false;
              rel.selected = false;
              rel.excludeCiIdList = excludeCiIdList;

              let relData = {
                relId: rel.id,
                direction: rel.direction
              };
              if (rel.direction === 'from') {
                ciId = rel.toCiId;
                excludeCiId = rel.fromCiId;

                relData.relName = rel.toName;
                relData.relLabel = rel.toLabel;
                relData.ciName = rel.fromCiName;
                relData.ciLabel = rel.fromCiLabel;
                relData.ciId = rel.fromCiId;
                relData.targetCiId = rel.toCiId;
                relData.targetCiName = rel.toCiName;
                relData.targetCiLabel = rel.toCiLabel;
              } else {
                ciId = rel.fromCiId;
                excludeCiId = rel.toCiId;

                relData.relName = rel.fromName;
                relData.relLabel = rel.fromLabel;
                relData.ciName = rel.toCiName;
                relData.ciLabel = rel.toCiLabel;
                relData.ciId = rel.toCiId;
                relData.targetCiId = rel.fromCiId;
                relData.targetCiName = rel.fromCiName;
                relData.targetCiLabel = rel.fromCiLabel;
              }
              path.push(relData);
              rel.path = path;
            });
            callback(relList);
          }
        });
      }
    },
    getRelByCiId() {
      this.$api.cmdb.ci.getRelByCiId(this.ciId).then(res => {
        const relList = res.Return;
        relList.forEach(rel => {
          rel.children = [];
          rel.loading = false;
          rel.selected = false;

          let relData = {
            relId: rel.id,
            direction: rel.direction
          };
          if (rel.direction === 'from') {
            relData.relName = rel.toName;
            relData.relLabel = rel.toLabel;
            relData.ciName = rel.fromCiName;
            relData.ciLabel = rel.fromCiLabel;
            relData.ciId = rel.fromCiId;
            relData.targetCiId = rel.toCiId;
            relData.targetCiName = rel.toCiName;
            relData.targetCiLabel = rel.toCiLabel;
          } else {
            relData.relName = rel.fromName;
            relData.relLabel = rel.fromLabel;
            relData.ciName = rel.toCiName;
            relData.ciLabel = rel.toCiLabel;
            relData.ciId = rel.toCiId;
            relData.targetCiId = rel.fromCiId;
            relData.targetCiName = rel.fromCiName;
            relData.targetCiLabel = rel.fromCiLabel;
          }
          rel.path = [relData];
        });
        this.relList = relList;
      });
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
