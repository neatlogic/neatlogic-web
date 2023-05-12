<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="formData" :item-list="formConfig">
          <template v-slot:path>
            <div class="grid">
              <div>
                <Dropdown
                  v-if="!isLoading && filtedPathList && filtedPathList.length > 0"
                  :transfer="true"
                  trigger="click"
                  placement="bottom-start"
                >
                  <span class="text-href">
                    {{ $t('term.cmdb.relpathcount', { count: filtedPathList.length > 99 ? '99+' : filtedPathList.length }) }}
                    <Icon type="ios-arrow-down"></Icon>
                  </span>
                  <DropdownMenu slot="list">
                    <DropdownItem
                      v-for="(path, index) in filtedPathList"
                      :key="index"
                      :selected="activePath && activePath.hash === path.hash"
                      style="max-width:800px;white-space:normal;height:auto"
                      @click.native="selectPath(path)"
                    >
                      <span v-for="(p, pindex) in path.ciRelList" :key="pindex">
                        <span>{{ p.ciLabel }}({{ p.ciName }})</span>
                        <span v-if="pindex < path.ciRelList.length - 1 && p.direction == 'from'" class="text-grey fz10 tsfont-minus"></span>
                        <span v-else-if="pindex < path.ciRelList.length - 1 && p.direction == 'to'" class="text-grey fz10 tsfont-arrow-left"></span>
                        <span v-if="pindex < path.ciRelList.length - 1" class="text-grey fz10">
                          {{ p.relLabel }}
                        </span>
                        <span v-if="pindex < path.ciRelList.length - 1 && p.direction == 'from'" class="text-grey fz10 tsfont-arrow-right"></span>
                        <span v-else-if="pindex < path.ciRelList.length - 1 && p.direction == 'to'" class="text-grey fz10 tsfont-minus"></span>
                      </span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <div v-else-if="!isLoading" class="text-grey">
                  <span>{{ $t('term.cmdb.relpathcount', { count: 0 }) }}</span>
                </div>
                <div v-else-if="isLoading" class="text-grey">
                  <span class="text-loading bg-primary"></span>
                  <span>{{ $t('term.cmdb.relpathcounting') }}</span>
                </div>
              </div>
              <div>
                <!-- <TsFormInput
                  v-model="keyword"
                  :width="300"
                  placeholder="多个关键字用空格分隔"
                  :clearable="true"
                ></TsFormInput>-->
                <TsFormSelect
                  :dataList="ciList"
                  transfer
                  multiple
                  border="border"
                  :placeholder="$t('term.cmdb.relpathci')"
                  @on-change="changeCiFilter"
                ></TsFormSelect>
              </div>
            </div>
          </template>
          <template v-slot:activePath>
            <div>
              <div v-if="activePath && activePath.ciRelList && activePath.ciRelList.length > 0">
                <div class="mb-xs text-grey">
                  <span>{{ $t('page.help') }}{{ $t('page.colon') }}{{ $t('message.cmdb.editrelpath') }}</span>
                </div>
                <div>
                  <span v-for="(p, pindex) in activePath.ciRelList" :key="pindex">
                    <span class="cursor">
                      <Tag :color="getTagColor(p.ciId)" @click.native="toggleCi(p.ciId)">{{ p.ciLabel }}({{ p.ciName }})</Tag>
                    </span>
                    <span v-if="pindex < activePath.ciRelList.length - 1 && p.direction == 'from'" class="text-grey fz10 tsfont-minus"></span>
                    <span v-else-if="pindex < activePath.ciRelList.length - 1 && p.direction == 'to'" class="text-grey fz10 tsfont-arrow-left"></span>
                    <span v-if="pindex < activePath.ciRelList.length - 1" class="text-grey fz10">
                      {{ p.relLabel }}
                    </span>
                    <span v-if="pindex < activePath.ciRelList.length - 1 && p.direction == 'from'" class="text-grey fz10 tsfont-arrow-right"></span>
                    <span v-else-if="pindex < activePath.ciRelList.length - 1 && p.direction == 'to'" class="text-grey fz10 tsfont-minus"></span>
                  </span>
                </div>
              </div>
              <div>
                <CiCustomviewEdit :id="viewId" ref="viewEditor" :path="activeCiRelList"></CiCustomviewEdit>
              </div>
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
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    //TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    CiCustomviewEdit: resolve => require(['./ci-customview-edit.vue'], resolve)
  },
  props: {
    ciId: { type: Number },
    viewId: { type: Number }
  },
  data() {
    return {
      keyword: '',
      isLoading: false,
      formData: {
        ciId: this.ciId,
        isActive: 1,
        type: 'scene'
        //direction: 'from'
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
          value: this.viewName,
          validateList: ['required']
        },
        /*direction: {
          label: '当前模型',
          type: 'radio',
          labelWidth: 100,
          validateList: ['required'],
          dataList: [
            { value: 'from', text: '起点模型' },
            { value: 'to', text: '终点模型' }
          ],
          isHidden: !!this.viewId,
          onChange: val => {
            this.$set(this.searchParam, 'direction', val);
            this.getAllPath();
          }
        },*/
        path: {
          label: this.$t('term.cmdb.relpathlist'),
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
        //direction: 'from'
      },
      theadList: [
        {
          key: 'selection'
        },
        { key: 'name', title: this.$t('page.name') },
        { key: 'type', title: this.$t('page.type') },
        { key: 'ciId', title: this.$t('term.cmdb.belongci') }
      ],
      ciList: [],
      pathList: [],
      activePath: null,
      activeCiRelList: [],
      activeCiList: [],
      ciMap: {} //模型属性关系缓存
    };
  },
  beforeCreate() {},
  created() {
    if (!this.viewId) {
      this.getAllCi();
      this.getAllPath();
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
    getCustomViewById() {
      if (this.viewId) {
        this.$api.cmdb.customview.getCustomViewById(this.viewId).then(res => {
          this.formData = res.Return;
        });
      }
    },
    selectPath(path) {
      if (path && (!this.activePath || this.activePath.hash !== path.hash)) {
        this.activePath = path;
        this.activeCiRelList = this.$utils.deepClone(path.ciRelList);
        this.formData.pathHash = path.hash;
        this.$forceUpdate();
      }
    },
    getAllCi() {
      this.$api.cmdb.ci.getCiList().then(res => {
        this.ciList = res.Return;
      });
    },
    getAllPath() {
      //重置已选数据
      this.activePath = null;
      this.activeCiRelList = [];
      this.formData.pathHash = '';
      this.isLoading = true;
      this.$api.cmdb.ci
        .getAllCiRelList(this.searchParam)
        .then(res => {
          this.pathList = res.Return;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    getTagColor(ciId) {
      if (this.activeCiRelList.find(d => d.ciId === ciId)) {
        return 'primary';
      }
      return 'default';
    },
    changeCiFilter(val) {
      this.searchParam.ciIdList = val;
      this.getAllPath();
    },
    changePath(val) {
      const path = this.pathList.find(d => d.hash === val);
      if (path) {
        this.activeCiRelList = this.$utils.deepClone(path.ciRelList);
      }
    },
    toggleCi(ciId) {
      if (this.activePath) {
        const ciIndex = this.activeCiRelList.findIndex(d => d.ciId === ciId);
        if (ciIndex > -1) {
          this.activeCiRelList.splice(ciIndex + 1, this.activeCiRelList.length - ciIndex - 1);
        } else {
          this.activeCiRelList = [];
          const path = this.pathList.find(d => d.hash === this.activePath.hash);
          if (path) {
            const newCiIndex = path.ciRelList.findIndex(d => d.ciId === ciId);
            if (newCiIndex > -1) {
              for (let i = 0; i <= newCiIndex; i++) {
                this.activeCiRelList.push(path.ciRelList[i]);
              }
            }
          }
        }
      }
    },
    async getCiById(ciId) {
      if (!this.ciMap[ciId]) {
        let ci = {};
        await this.$api.cmdb.ci.getCiById(ciId).then(res => {
          ci = res.Return;
        });
        ci.constList = [
          {
            name: 'id',
            label: 'id'
          },
          {
            name: 'uuid',
            label: 'uuid'
          },
          {
            name: 'ciName',
            label: this.$t('page.model')
          }
        ];
        await this.$api.cmdb.ci.getAttrByCiId(ciId).then(res => {
          ci.attrList = res.Return;
        });
        await this.$api.cmdb.ci.getRelByCiId(ciId).then(res => {
          ci.relList = res.Return;
        });
        this.ciMap[ciId] = ci;
      }
    },

    getCiAttrRelList() {
      if (this.activeCiRelList && this.activeCiRelList.length > 0) {
        this.activeCiList = [];
        this.activeCiRelList.forEach(async ciRel => {
          await this.getCiById(ciRel.ciId);
          this.activeCiList.push(this.ciMap[ciRel.ciId]);
        });
      }
    },
    deleteView() {
      if (this.viewId) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          type: 'modal',
          content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.cmdb.customview')}),
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
    filtedPathList() {
      let filtedPathList = [];
      if (this.pathList && this.pathList.length > 0) {
        if (this.keyword && this.keyword.trim()) {
          for (let i = 0; i < this.pathList.length; i++) {
            const path = this.pathList[i];
            const keywords = this.keyword.split(/[\s]+/);
            let isMatch = true;
            for (let k = 0; k < keywords.length; k++) {
              if (!path.ciRelList.find(d => d.ciName.toLowerCase().includes(keywords[k].toLowerCase()) || d.ciLabel.toLowerCase().includes(keywords[k].toLowerCase()))) {
                isMatch = false;
                break;
              }
            }

            if (isMatch) {
              if (filtedPathList.length < 100) {
                filtedPathList.push(path);
              } else {
                break;
              }
            }
          }
        } else {
          if (this.pathList && this.pathList.length > 100) {
            filtedPathList = this.pathList.slice(0, 100);
          } else if (this.pathList) {
            filtedPathList = this.pathList.filter(d => true);
          }
        }
      }
      return filtedPathList;
    },
    ciAttrRelList() {
      const attrRelList = [];
      if (this.activeCiList && this.activeCiList.length > 0) {
        this.activeCiList.forEach(ci => {
          if (ci.constList) {
            ci.constList.forEach(con => {
              attrRelList.push({
                id: con.id,
                name: con.name,
                label: con.label,
                type: 'const',
                ciId: ci.id,
                ciName: ci.name,
                ciLabel: ci.label
              });
            });
          }
          if (ci.attrList) {
            ci.attrList.forEach(attr => {
              attrRelList.push({
                id: attr.id,
                name: attr.name,
                label: attr.label,
                type: 'attr',
                ciId: ci.id,
                ciName: ci.name,
                ciLabel: ci.label
              });
            });
          }
          if (ci.relList) {
            ci.relList.forEach(rel => {
              attrRelList.push({
                id: rel.id,
                name: rel.direction == 'from' ? rel.toName : rel.fromName,
                label: rel.direction == 'from' ? rel.toLabel : rel.fromLabel,
                type: 'rel' + rel.direction,
                ciId: ci.id,
                ciName: ci.name,
                ciLabel: ci.label
              });
            });
          }
        });
      }
      return attrRelList;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  width: 100%;
  grid-template-columns: 140px auto;
}
</style>
