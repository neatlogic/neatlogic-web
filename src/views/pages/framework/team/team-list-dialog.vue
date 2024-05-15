<template>
  <TsDialog
    type="modal"
    :isShow="true"
    :title="$t('dialog.title.addtarget',{target: $t('page.group')})"
    width="70%"
    @on-close="onOk(false)"
  >
    <TsContain>
      <template slot="topRight">
        <TsFormSelect
          ref="topRight"
          v-model.trim="keyword"
          v-bind="selectTreeSetting"
          @enter-search="searchkeyWord"
        >
          <template v-slot:option="{item}">
            <div class="flex-start team-manage-wrap"> 
              <div class="pr-md">{{ item.name }}</div>  
              <div :title="item.upwardNamePath" class="overflow fz10 text-grey upward-name-path">{{ item.upwardNamePath }}</div>
            </div>
          </template>
        </TsFormSelect>
      </template>
      <div slot="content" class="dividing-color">
        <div class="team-manage pl-lg ">
          <div slot="content" class="dividing-color">
            <div class="card-wrapper">
              <div v-if="tableData.tbodyList && tableData.tbodyList.length > 0">
                <div class="card-top text-grey">
                  <span class="name"></span>
                  <span v-if="isNeedChildren" class="num">{{ $t('term.framework.inheritselected') }}</span>
                  <span v-if="isNeedChildren" class="selectNode">{{ $t('term.framework.selectsubnode') }}</span>
                </div>
                <GroupTreeView
                  ref="GroupTreeView"
                  :children="tableData.tbodyList"
                  :isNeedChildren="isNeedChildren"
                ></GroupTreeView>
                <Page
                  class="page-container pt-xs"
                  :total="tableData.rowNum"
                  :page-size="tableData.pageSize"
                  transfer
                  show-total
                  show-sizer
                  @on-change="getTeamList(arguments, 'currentPage',true)"
                  @on-page-size-change="getTeamList(arguments,'pageSize',true)"
                />
              </div>
              <div v-else>
                <no-data></no-data>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TsContain>
    
    <template v-slot:footer>
      <div class="drawer-footer ">
        <span v-if="teamCount.number> 0" style="float:left;padding-top:10px"> {{ $t('message.framework.teamcounttarget',{target: teamCount.number}) }} </span>
        <Button style="margin-left: 8px" @click="onOk(false)">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="onOk(true)">{{ $t('page.save') }}</Button>
      </div>
    </template>
  </TsDialog>

</template>

<script>
import GroupTreeView from '@/views/pages/framework/users/common/select-user/group-treeview.vue';
export default {
  name: '',
  provide() {
    return { $parent: this };
  },
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    GroupTreeView
  },
  props: {
    selectNum: Number,
    value: Array,
    type: String
  },
  data() {
    return {
      keyword: null,
      isNeedChildren: true,
      teamCount: {
        number: this.selectNum
      },
      teamList: [],
      tableData: {
        theadList: [],
        tbodyList: [],
        pageSize: 10,
        currentPage: 1
      },
      selectTreeSetting: {
        name: 'uuid',
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.group')}),
        search: true,
        multiple: false,
        width: '100%',
        dynamicUrl: '/api/rest/team/list/forselect',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        transfer: true,
        clear: true,
        border: 'border',
        onChange: (value) => {
          if (value) {
            this.selectUuid = value;
            this.showTreeList('uuid', value);
          } else {
            this.getTeamList();
          }
        },
        enterSearch: true
      }
    };
  },
  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    this.teamList = this.$utils.deepClone(this.value) || [];
    this.getTeamList();
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    searchkeyWord(value) {
      if (value) {
        this.showTreeList('keyword', value);
      } else {
        this.getTeamList();
      }
    },
    showTreeList(name, value) {
      let params = {};
      params[name] = value;
      this.search = true;
      this.loadingShow = true;
      this.$api.framework.team
        .searchShowTree(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.tableData.tbodyList = res.Return.children || [];
            this.tableData.tbodyList.forEach(item => {
              let teamTmp = this.teamList.find(obj => obj.uuid === item.uuid);
              if (teamTmp) {
                item.checked = 1;
                item.checkedChildren = teamTmp.checkedChildren;
              }
              item._fullPath = item.name;
              this.setItem(item);
            });
          }
        }).finally(() => {
          this.loadingShow = false;
        });
    },
    onOk(type) {
      this.$emit('on-ok', type);
    },
    getTeamList(arg, type, isSearch) {
      if (type == 'pageSize') {
        this.tableData.pageSize = arg[0];
        this.tableData.currentPage = 1;
      } else if (type == 'currentPage') {
        this.tableData.currentPage = arg[0];
      } else {
        this.tableData.currentPage = 1;
      }
      let params = { 
        isActive: 1,
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };
      this.$api.framework.group.getGroupTree(params).then(res => {
        if (res.Status == 'OK') {
          res.Return.tbodyList.forEach(item => {
            let teamTmp = this.teamList.find(obj => obj.uuid === item.uuid);
            if (teamTmp) {
              item.checked = 1;
              item.checkedChildren = teamTmp.checkedChildren;
            }
            item._fullPath = item.name;
            this.setItem(item);
          });
          Object.assign(this.tableData, res.Return);
        }
      });
    },
    changeCheckbox(node, value, type) { //checkbox 和 switch变化需要跟新最终的teamList 给保存的数据
      let findIndex = null;
      let findItem = this.teamList.find((item, index) => {
        if (item.uuid == node.uuid) {
          findIndex = index;
          return true;
        }
      });
      let operation = null;
      // checked:之前没选中，现在选中了
      // unchecked:之前选中了，现在没选中
      // checkedChildren:之前没有启用穿透选中子节点，现在启用
      // uncheckedChildren:之前启用穿透选中子节点，现在不启用
      if (findItem && findItem.operation == 'checked' && type == 'checkbox') { //代表原先没有选中，现在取消了选中则不需要记录数据
        //直接删除对应的数据即可
        this.teamCount.number--;
      } else if (findItem && type == 'switch' && findItem.operation == 'checked') {
        operation = 'checked';
      } else {
        if (type == 'checkbox' && value) {
          operation = 'checked';
          this.teamCount.number++;
        } else if (type == 'checkbox' && !value) {
          this.teamCount.number--;
        } else if (type == 'switch') {
          operation = value ? 'checkedChildren' : 'uncheckedChildren';
        }
      }
      findItem && this.teamList.splice(findIndex, 1);
      this.setPath(node, false);
      if (operation) { //当operation存在时才加入数据
        this.teamList.push({
          'uuid': node.uuid,
          'operation': operation,
          'checkedChildren': node.checkedChildren
        });
      }
    },
    changeOpen(node) {
      node._open = !node._open;
      if (!node._open) {
        node._isChildren = false;
      }
      if (node._open && !node._isChildren) {
        this.getChildrenTeamList(node);
      } else {
        node.children = [];
      }
    },
    //获取子集分组
    getChildrenTeamList(node) {
      // 判断展开当前行是否在已选择列表中(左右都选中)
      let data = {
        needPage: false,
        parentUuid: node.uuid,
        isActive: 1
      };
      this.$api.framework.group.getGroupTree(data).then(res => {
        let tbodyList = res.Return.tbodyList;
        tbodyList.forEach(item => {
          item._fullPath = (node._fullPath ? node._fullPath + '/' : '') + item.name;
          item._parent = node;
          let teamTmp = this.teamList.find(obj => obj.uuid === item.uuid);
          if (teamTmp) {
            item.checked = 1;
            item.checkedChildren = teamTmp.checkedChildren;
          }
          this.setItem(item);
          this.setPath(item, true);
        });
        node.children = tbodyList;
        node._isChildren = true;//已经调用接口回去了子节点
      });
    },
    setItem(node) {
      node.checked = node.checked || 0;
      node.checkedChildren = node.checkedChildren || 0;
      node.oldChecked = node.checked;
      node.oldCheckedChildren = node.checkedChildren;
      node.children = node.children || [];
      let findItem = this.teamList.find(team => team.uuid == node.uuid);
      if (findItem) {
        if (findItem.operation == 'checked') {
          node.checked = 1;
          node.checkedChildren = findItem.checkedChildren;
        } else if (findItem.operation == 'unchecked') {
          node.checked = 0;
          node.checkedChildren = 0;
        } else if (findItem.operation == 'checkedChildren') {
          node.checked = 1;
          node.checkedChildren = 1;
        } else if (findItem.operation == 'uncheckedChildren') {
          node.checked = 1;
          node.checkedChildren = 0;
        }
      }
    },
    setPath(node, isSelf) { //isSelf：只跟新自己的继承路径
      let findParent = this.getfirstLevel(node);
      this.$set(node, '_parentFullPath', findParent ? findParent._fullPath : null);
 
      if (!isSelf) { //子集需要跟新继承路径
        node.children && node.children.forEach(item => this.getLastLevel(item));
      } 
    },
    getLastLevel(node) { //给下层设置继承路径
      let findParent = this.getfirstLevel(node);
      this.$set(node, '_parentFullPath', findParent ? findParent._fullPath : null);

      if (node.children && node.children.length) {
        node.children && node.children.forEach(item => this.getLastLevel(item));
      }
    },
    getfirstLevel(node) { //寻找继承的上级路径
      if (node._parent && node._parent.checkedChildren) {
        return node._parent;
      } else if (node._parent) {
        return this.getfirstLevel(node._parent);
      } else {
        return null;
      }
    },
    getValue() { //获取需要保存的值
      return this.teamList;
    }
  },

  filter: {},

  computed: {
  },

  watch: {}
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/framework/manage.less';
.team-manage {
  .page {
    text-align: right;
  }
  .btn-list {
    &.title {
      padding-left: @space-md;
    }
  }
  .dividing-color {
    .card-wrapper {
      .card-top {
        position: relative;
        .name {
          padding-right: 300px;
        }
        .num {
          position: absolute;
          right: 100px;
          width: 300px;
          text-align: left;
        }
        .selectNode {
          position: absolute;
          right: 0;
          top: 0;
          width: 100px;
        }
      }
    }
  }
}
.tsslider-content {
  width: 100% !important;
}
.page-container{
  text-align: right;
}
</style>
