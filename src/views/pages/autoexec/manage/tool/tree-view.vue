<template>
  <div id="0" class="team-treeview findUuid">
    <draggable
      v-bind="dragOptions"
      tag="div"
      class="dataSource-ul"
      :list="childrenList"
      :group="{ name: 'item-sub' }"
      :move="checkMove"
      handle=".ts-bars"
      :forceFallback="false"
      @start="moveStart"
      @end="moveEnd"
      @add="addDrag"
    >
      <div
        v-for="(item, index) in childrenList"
        v-show="show"
        :id="item.id"
        :key="item.id"
        :parentId="item.parentId"
        :index="index"
        class="findUuid"
      >
        <span class="sub-line"></span>
        <div class="card-item bg-op block-container">
          <div class="title-block">
            <i class="ts-bars move"></i>
            <i class="dividing-line dividing-bg-color"></i>
            <i
              v-if="showOpen(item)"
              class="text-action"
              :class="item.isShow ? 'tsfont-down' : 'tsfont-right'"
              @click="isOpen(item)"
            ></i>
            <i
              v-if="!showOpen(item)"
              class="empty-location"
            ></i>
            <span v-if="item.name.length > 28" class="overflow" :title="item.name">
              {{ item.name.substr(0, 28) }}...
            </span>
            <span v-else class="overflow" :title="item.name">
              {{ item.name }}
            </span>
          </div>
          <div class="cuont-block">
            {{ item.userCount }}
          </div>
          <div class="btn-list">
            <ul class="action-group">
              <li class="action-item tsfont-edit" @click.stop="operation('edit', item)">{{ $t('page.rename') }}</li>
              <li class="action-item tsfont-plus" @click.stop="operation('add', item)">{{ $t('button.addtarget', {target: $t('term.autoexec.lowerdirectory')}) }}</li>
              <li class="action-item flex-start" @click.stop="operation('view', item)">
                <!-- 关联自定义工具  -->
                <ReferenceSelect
                  :id="item.id"
                  calleeType="autoexeccatalog"
                  numberClassName="text-href bg-op"
                  :title="$t('term.autoexec.associateacustomtool')"
                  :referenceCount="item.referenceCountForScript"
                  :isShowStatus="true"
                ></ReferenceSelect>              
              </li>
              <li
                class="action-item tsfont-trash-o"
                :title="item.referenceCountOfSelfAndChildren > 0 ? $t('term.autoexec.disassociatecandeletecatalog') : ''"
                :class="item.referenceCountOfSelfAndChildren > 0 ? 'disable' : ''"
                @click.stop="delRow(item, item.id)"
              >{{ $t('button.delete') }}</li>
            </ul>
          </div>
        </div>
        <template>
          <TreeView
            v-if="item.children"
            :search="false"
            :children="item.children"
            class="item-sub"
            :show="item.isShow"
            @click="operation"
          ></TreeView>
          <template v-if="item.children && item.children.length > 0"></template>
          <template v-else>
            <Loading v-if="item.childCount && item.childCount > 0" :loadingShow="childrenLoading[item.id]"></Loading>
          </template>
        </template>
      </div>
    </draggable>
    <!-- 添加目录工具 -->
    <ToolCatalogAdd
      v-if="isShowToolCatalogAdd"
      :value="formValue"
      @close="closeToolCatalogAdd"
    ></ToolCatalogAdd>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import TreeView from './tree-view';
import mixin from './mixin';
import ToolCatalogAdd from './tool-catalog-add'; // 目录工具(添加-编辑)
var ADDPARENTUUID = '';
export default {
  name: 'TreeView',
  components: {
    draggable,
    TreeView,
    ToolCatalogAdd,
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve)
  },
  mixins: [mixin],
  props: {
    children: {
      required: true,
      type: Array,
      default: () => []
    },
    search: {
      type: Boolean,
      default: false
    },
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      formValue: {}, // 工具目录form表单值
      isShowToolCatalogAdd: false,
      childrenList: [],
      isShow: true,
      childrenLoading: [],
      parentId: '',
      moveObject: null,
      moveParentUuid: '',
      addParentUuid: '',
      addFormTemp: {} // 新增临时变量
    };
  },
  beforeCreate() {},
  created() {
    if (this.search) {
      //
    } else {
      this.childrenList.forEach(item => {
        if (item.childCount > 0) {
          this.$set(item, 'isShow', false);
          this.$set(item, 'isRequest', false);
        }
      });
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
    closeToolCatalogAdd(needRefresh, formValue) {
      this.isShowToolCatalogAdd = false;
      if (needRefresh) {
        if (formValue && formValue.id) {
        // 编辑
          this.$set(this.formValue, 'name', formValue.name);
        } else {
        // 新增
          this.getChildrenTeamList(this.addFormTemp);
        }
      }
    },
    operation(type, item) {
      if (type == 'edit') {
        // 编辑
        this.formValue = item;
        this.isShowToolCatalogAdd = true;
      } else if (type == 'add') {
        // 添加下级目录
        let deepCloneRow = this.$utils.deepClone(item);
        this.addFormTemp = item;
        this.formValue = Object.assign(deepCloneRow, {name: '', parentId: deepCloneRow.id, id: null });
        this.isShowToolCatalogAdd = true;
      }
    },
    delRow(row, id) {
      //删除分组
      if (!id) {
        return false;
      }
      if (row && row.referenceCountOfSelfAndChildren) {
        // 大于0不可删除
        return false;
      }
      let _this = this;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('term.autoexec.bysubcatalogalldeletetips'),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.catalog.delCatalogById(id).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.content.deletesuccess'));
              let obj = _this.childrenList.find(el => el.id === id);
              let index = _this.childrenList.indexOf(obj);
              _this.childrenList.splice(index, 1);
              vnode.isShow = false;
              _this.dispatch('ListNestingTree', 'operation', {type: 'refresh', row: _this.childrenList});
            }
          });
        }
      });
    },
    //获取子集分组
    getChildrenTeamList(item) {
      let id = item.id;
      this.childrenLoading[id] = true;
      let data = {
        needPage: false,
        parentId: id
      };
      setTimeout(() => {
        this.$api.autoexec.catalog
          .getCatalogList(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$set(item, 'children', res.Return.tbodyList);
              item.children.forEach(t => {
                if (!t.children) {
                  t.children = [];
                }
              });
              this.childrenLoading[id] = false;
            }
          })
          .catch(err => {
            if (err && err.data && err.data.Message) {
              this.$Notice.error({
                title: err.data.Message
              });
            }
          });
      }, 200);
    },
    addDrag(evt) {
      let obj = new Object();
      let FIND_KEY = evt.path.some(d => d._prevClass === 'findUuid');
      if (FIND_KEY) {
        obj = evt.path.find(d => d._prevClass === 'findUuid');
      } else {
        obj = evt.path.find(d => d._prevClass === 'team-treeview findUuid');
      }
      ADDPARENTUUID = obj.attributes.getNamedItem('id').value;
      this.parentId = ADDPARENTUUID;
    },
    checkMove(evt, originalEvent) {
      evt.relatedContext.list.forEach(item => {
        this.parentId = item.parentId;
      });
    },
    moveStart(evt) {
      let id = evt.item.attributes.id.value;
      this.moveObject = this.childrenList.find(d => d.id == id);
      let parentId = evt.item.attributes.parentId.value;
      ADDPARENTUUID = '';
      this.moveParentUuid = parentId;
    },
    moveEnd(evt) {
      this.parentId = ADDPARENTUUID || this.moveParentUuid;
      if ((this.parentId == '' || this.parentId == this.moveParentUuid) && evt.newIndex == evt.oldIndex) {
        return;
      }
      let data = {
        id: this.moveObject.id,
        parentId: ADDPARENTUUID == '' ? this.parentId : ADDPARENTUUID,
        sort: evt.newIndex
      };
      this.$api.autoexec.catalog.moveCatalog(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.executesuccess'));
          let item = this.childrenList.find(d => d.id === ADDPARENTUUID);
          if (item && !item.isShow) {
            this.isOpen(item);
          }
          //改变当前移动节点的父级id
          this.$set(this.moveObject, 'parentId', ADDPARENTUUID);
        }
      });
    },
    isOpen(item) {
      this.$set(item, 'isShow', !item.isShow);
      if (!item.isRequest) {
        this.$set(item, 'isRequest', true);
        this.getChildrenTeamList(item);
      }
    },
    updataparent() {
      // code
    },
    setItem(item) {
      this.$set(item, 'isShow', this.search);
      this.$set(item, 'isRequest', !this.search);
      if (item.children && item.children.length > 0) {
        item.children.forEach(citem => {
          this.$set(citem, 'isShow', true);
          this.$set(citem, 'isRequest', true);
          this.setItem(citem);
        });
      } else {
        this.$set(item, 'isShow', false);
        this.$set(item, 'isRequest', false);
      }
    }
  },
  filter: {},
  computed: {
    dragOptions() {
      return {
        animation: 150,
        scroll: true,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      };
    },
    showOpen() {
      return function(item) {
        let KEY = false;
        let cKEY = false;
        if (item.childCount > 0) {
          KEY = true;
        }

        return KEY;
      };
    }
  },
  watch: {
    children: {
      handler(newVal) {
        this.childrenList = this.$utils.deepClone(newVal);
      },
      deep: true,
      immediate: true
    },
    childrenList(newVal) {
      if (this.search) {
        newVal.forEach(item => {
          if (item.childCount > 0) {
            this.setItem(item);
          }
        });
      }
      newVal.forEach(item => {
        if (item.children.length > 0) {
          item.childCount = item.children.length;
        }
      });
    },
    addParentUuid: {
      handler(newVal) {},
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
.team-treeview {
  .item-sub {
    margin-left: 50px;
  }
  .dataSource-ul {
    min-height: 1px;
  }
  .dividing-line {
      display: inline-block;
      width: 1px;
      height: 28px;
      margin: 0 8px;
    }
    .empty-location {
      display: inline-block;
      width: 20px;
    }
}
</style>
