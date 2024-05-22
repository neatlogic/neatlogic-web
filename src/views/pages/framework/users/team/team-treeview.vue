<template>
  <div class="team-treeview findUuid" uuid="0">
    <draggable
      v-bind="dragOptions"
      tag="div"
      class="dataSource-ul"
      :list="childrenList"
      :group="{ name: 'item-sub' }"
      :move="checkMove"
      handle=".tsfont-bar"
      :forceFallback="false"
      @start="moveStart"
      @end="moveEnd"
      @add="addDrag"
    >
      <div
        v-for="(cd, index) in childrenList"
        v-show="show"
        :key="cd.uuid"
        :uuid="cd.uuid"
        :parentUuid="cd.parentUuid"
        :index="index"
        class="findUuid"
      >
        <span class="sub-line"></span>
        <div class="card-item bg-op block-container">
          <div class="title-block">
            <i class="tsfont-bar move"></i>
            <span v-if="cd.name.length > 28" class="text-title overflow" :title="cd.name">
              {{ cd.name.substr(0, 28) }}...
            </span>

            <span v-else class="text-title overflow" :title="cd.name">
              {{ cd.name }}
            </span>
            <i
              v-if="showOpen(cd)"
              class="text-action"
              :class="cd.isShow ? 'tsfont-up' : 'tsfont-down'"
              @click="isOpen(cd)"
            ></i>
          </div>
          <div class="cuont-block">
            {{ cd.userCount }}
          </div>
          <div class="btn-list">
            <ul class="action-group">
              <li class="action-item tsfont-edit" @click="editTeam(false, 'teamTabs', cd, true)">{{ $t('page.edit') }}</li>
              <li class="action-item tsfont-plus" @click="editTeam(false, 'userTabs', cd)">{{ $t('page.user') }}</li>
              <li class="action-item tsfont-plus" @click="editTeam(true, 'teamTabs', cd, false)">{{ $t('term.framework.subgroup') }}</li>
              <li class="action-item tsfont-trash-o" @click="delTeam(cd.uuid, cd.name, cd)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </div>

        <template v-if="search">
          <TeamTreeview
            v-if="cd.children"
            :search="true"
            :children="cd.children"
            class="item-sub"
            :show="cd.isShow"
          ></TeamTreeview>
          <template v-if="cd.children && cd.children.length > 0"></template>
          <template v-else>
            <Loading v-if="cd.childCount && cd.childCount > 0" :loadingShow="childrenLoading[cd.uuid]"></Loading>
          </template>
        </template>
        <template v-else>
          <TeamTreeview
            v-if="cd.children"
            :search="false"
            :children="cd.children"
            class="item-sub"
            :show="cd.isShow"
          ></TeamTreeview>
          <template v-if="cd.children && cd.children.length > 0"></template>
          <template v-else>
            <Loading v-if="cd.childCount && cd.childCount > 0" :loadingShow="childrenLoading[cd.uuid]"></Loading>
          </template>
        </template>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
var ADDPARENTUUID = '';
export default {
  name: 'TeamTreeview',
  components: {
    draggable,
    TeamTreeview: () => import('./team-treeview')
  },
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
      childrenList: [],
      isShow: true,
      childrenLoading: [],
      parentUuid: '',
      moveObject: null,
      moveParentUuid: ''
    };
  },
  beforeCreate() {},
  created() {
    if (!this.search) {
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
    editTeam(isAdd, key, item, isEdit) {
      //编辑、新建用户组
      let uuid = null;
      if (item) {
        uuid = item.uuid || null;
      }
      let obj = {
        uuid: uuid,
        isAdd: isAdd || null,
        key: key || null,
        isEdit: isEdit || null
      };
      this.$router.push({
        path: `/team-addview`,
        query: obj
      });
    },
    delTeam(id, name, cd) {
      //删除分组
      let _this = this;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.team
            .delTeamByUuid({
              uuid: id
            })
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                let index = _this.childrenList.indexOf(cd);
                _this.childrenList.splice(index, 1);
                vnode.isShow = false;
                _this.$emit('updateTeam');
              }
            });
        }
      });
    },
    //获取子集分组
    getChildrenTeamList(cd) {
      let uuid = cd.uuid;
      let load = {};
      this.childrenLoading[uuid] = true;
      let data = {
        needPage: false,
        parentUuid: uuid
      };
      setTimeout(() => {
        this.$api.framework.team
          .getTeamTreeList(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$set(cd, 'children', res.Return.tbodyList);
              cd.children.forEach(t => {
                if (!t.children) {
                  t.children = [];
                }
              });
              this.childrenLoading[uuid] = false;
            }
          })
          .catch(error => {
            this.$Notice.error({
              title: error.data.Message
            });
          });
      }, 200);
    },
    addDrag(e) {
      let obj = new Object();
      let evtPath = this.$utils.getComposedPath(e);
      let FIND_KEY = evtPath.some(d => d._prevClass === 'findUuid');
      if (FIND_KEY) {
        obj = evtPath.find(d => d._prevClass === 'findUuid');
      } else {
        obj = evtPath.find(d => d._prevClass === 'team-treeview findUuid');
      }
      ADDPARENTUUID = obj.attributes.getNamedItem('uuid').value;
      this.parentUuid = ADDPARENTUUID;
    },
    checkMove(evt, originalEvent) {
      evt.relatedContext.list.forEach(item => {
        this.parentUuid = item.parentUuid;
      });
    },
    moveStart(evt) {
      let uuid = evt.item.attributes.uuid.value;
      this.moveObject = this.childrenList.find(d => d.uuid == uuid);
      let parentUuid = evt.item.attributes.parentUuid.value;
      ADDPARENTUUID = '';
      this.moveParentUuid = parentUuid;
    },
    moveEnd(evt) {
      this.parentUuid = ADDPARENTUUID || this.moveParentUuid;
      let _this = this;
      if ((this.parentUuid == '' || this.parentUuid == this.moveParentUuid) && evt.newIndex == evt.oldIndex) {
        //如果index不变且父级id不变
        return;
      }
      let data = {
        uuid: this.moveObject.uuid,
        parentUuid: ADDPARENTUUID == '' ? this.parentUuid : ADDPARENTUUID,
        sort: evt.newIndex
      };
      this.$api.framework.team.moveTeamList(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          let cd = this.childrenList.find(d => d.uuid === ADDPARENTUUID);
          if (cd && !cd.isShow) {
            this.isOpen(cd);
          }
          //改变当前移动节点的父级id
          this.$set(this.moveObject, 'parentUuid', ADDPARENTUUID);
        }
      });
    },
    isOpen(cd) {
      this.$set(cd, 'isShow', !cd.isShow);
      if (!cd.isRequest) {
        this.$set(cd, 'isRequest', true);
        this.getChildrenTeamList(cd);
      }
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
        this.childrenList = newVal;
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
</style>
