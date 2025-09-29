<template>
  <div class="team-treeview">
    <draggable
      v-bind="dragOptions"
      tag="div"
      class="dataSource-ul"
      :list="childrenList"
      :move="checkMove"
      handle=".tsfont-drag"
      group="tree"
      :empty-insert-threshold="56"
      @start="moveStart"
      @end="moveEnd"
    >
      <div
        v-for="cd in childrenList"
        :id="cd.id"
        :key="cd.id"
        :parentId="cd.parentId"
      >
        <span class="sub-line"></span>
        <div class="card-item bg-op block-container grid">
          <div class="overflow">
            <span class="tsfont-drag" style="cursor: move"></span>
            <span
              v-if="cd.childCount > 0"
              class="cursor ml-xs"
              :class="cd._isHidden ? 'tsfont-drop-right' : 'tsfont-drop-down'"
              @click="isOpen(cd)"
            ></span>
            <span :class="cd.type === 1 ? 'tsfont-bind' : 'tsfont-folder-o'"></span>
            <span :title="cd.name">
              {{ cd.name }}
            </span>
          </div>
          <div>{{ cd.openTypeText }}</div>
          <div>{{ cd.type === 1 ? '链接' : '目录' }}</div>
          <div>
            <Badge :count="cd.childCount" type="primary"></Badge>
          </div>
          <div>
            <ul class="action-group">
              <li v-if="cd.type === 0" class="action-item tsfont-plus" @click.stop="addMenu(cd.id)">{{ $t('page.menu') }}</li>
              <li class="action-item tsfont-edit" @click.stop="editMenu(cd.id)">{{ $t('page.edit') }}</li>
              <li v-if="cd.childCount === 0" class="action-item tsfont-trash-o" @click.stop="delMenu(cd.id)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </div>
        <MenuTreeview
          v-if="!cd._isHidden && cd.children"
          :parentId="cd.id"
          :children="cd.children"
          class="item-sub"
          @refresh="refresh"
          @update="update"
        ></MenuTreeview>
      </div>
    </draggable>
    <MenuEdit
      v-if="isEdit"
      :id="currentMenuId"
      :parentId="currentParentId"
      @close="closeEdit"
    ></MenuEdit>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
export default {
  name: 'MenuTreeview',
  components: {
    draggable,
    MenuTreeview: () => import('./menu-treeview'),
    MenuEdit: () => import('./menu-edit.vue')
  },
  props: {
    parentId: { type: Number },
    children: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentParentId: null,
      childrenList: [],
      currentMenuId: null,
      isEdit: false,
      newParentId: null,
      currentId: null,
      currentNode: null
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
    editMenu(id) {
      this.currentMenuId = id;
      this.isEdit = true;
    },
    addMenu(id) {
      this.currentParentId = id;
      this.isEdit = true;
    },
    closeEdit(needRefresh) {
      this.isEdit = false;
      this.currentMenuId = null;
      if (needRefresh) {
        this.refresh();
      }
    },
    refresh() {
      this.$emit('refresh');
    },
    delMenu(id) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.menu') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.extramenu.deleteMenuTreeNode(id).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.refresh();
            }
          });
        }
      });
    },
    checkMove(evt, originalEvent) {
      const source = evt.draggedContext.element;
      const target = evt.relatedContext.element;
      if (source.type === 1 && target && source.parentId !== target.parentId && target.parentId !== 0) {
        //链接调整归属
        this.newParentId = target.parentId;
      } else if (source.type === 0 && target && source.parentId !== target.parentId) {
        //目录调整归属
        this.newParentId = target.parentId;
      } else if (source.type === 1 && target && source.parentId !== target.parentId && target.childCount == 0) {
        // 链接节点拖到目录下面（目录下为空的节点）
        this.newParentId = target.id;
      } else if (source.type === 1 && target && target.type === 0 && source.parentId == target.parentId) {
        // 链接节点拖到目录下面（目录下已存在节点）
        this.newParentId = target.id;
      } else if (source.type === 1 && target && source.parentId != target.parentId) {
        // 链接拖到空白处，最顶层
        this.newParentId = 0;
      }
      return true;
    },
    moveStart(e) {
      this.currentId = e.item.attributes.id.value;
      this.currentNode = this.childrenList.find(d => d.id == this.currentId);
    },
    update() {
      this.$emit('update', this.childrenList, this.parentId);
    },
    moveEnd(evt) {
      if (this.currentNode && this.newParentId !== null) {
        this.$set(this.currentNode, 'parentId', this.newParentId);
        this.newParentId = null;
      }
      this.update();
      this.currentNode = null;
    },
    isOpen(cd) {
      this.$set(cd, '_isHidden', !cd._isHidden);
    }
  },
  filter: {},
  computed: {
    dragOptions() {
      return {
        animation: 150,
        scroll: true,
        disabled: false,
        ghostClass: 'ghost'
      };
    }
  },
  watch: {
    children: {
      handler(newVal) {
        this.childrenList = newVal || [];
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style lang="less" scoped>
.team-treeview {
  .item-sub {
    margin-left: 50px;
  }

  .text-title {
    display: inline-block;
    padding: 0 16px;
  }
  .dataSource-ul {
    min-height: 1px;
  }
}
.grid {
  display: grid;
  grid-template-columns: auto 120px 120px 120px 180px;
}
</style>
