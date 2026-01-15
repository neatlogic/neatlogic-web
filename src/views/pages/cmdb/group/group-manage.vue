<template>
  <div class="group-manage">
    <TsContain border="border">
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addGroup()">{{ $t('term.cmdb.group') }}</span>
      </template>
      <template slot="topRight">
        <InputSearcher v-model="searchParam.keyword" @change="searchGroup(1)"></InputSearcher>
      </template>
      <div slot="content" ref="maintable">
        <div class="flow-main">
          <TsTable
            v-bind="groupData"
            :theadList="theadList"
            @changeCurrent="searchGroup"
            @changePageSize="
              pageSize => {
                searchParam.pageSize = pageSize;
                searchGroup(1);
              }
            "
          >
            <template v-slot:ciEntityCount="{ row }">
              <Badge v-if="row.ciEntityCount" :count="row.ciEntityCount" type="primary"></Badge>
              <span v-else></span>
            </template>
            <template v-slot:isActive="{ row }">
              <span v-if="row.isActive === 1" class="text-success">{{ $t('page.yes') }}</span>
              <span v-else class="text-grey">{{ $t('page.no') }}</span>
            </template>
            <template v-slot:auth="{ row }">
              <div v-if="row.groupAuthList && row.groupAuthList.length > 0">
                <UserSelect
                  :multiple="true"
                  :transfer="true"
                  :readonly="true"
                  :value="row.groupAuthList.map(d=>d.authType +'#'+d.authUuid)"
                  :groupList="[ 'user', 'role', 'team']"
                ></UserSelect>
              </div>
              <div v-else class="text-grey">-</div>
            </template>
            <template v-slot:ciList="{ row }">
              <div v-if="row.ciGroupList && row.ciGroupList.length > 0">
                <Tag v-for="(ci, index) in row.ciGroupList" :key="index">
                  <span :class="ci.ciIcon"></span>
                  <span>{{ ci.ciLabel }}</span>
                  <span>·{{ ci.ciName }}</span>
                </Tag>
              </div>
              <div v-else class="text-grey">-</div>
            </template>
            <template v-slot:status="{ row }">
              <div v-if="row.status === 'doing'" class="pl-md pr-md"><Progress
                :percent="99"
                :stroke-width="10"
                status="active"
                :hide-info="true"
              /></div>
              <span v-else-if="row.status === 'done' && row.error"><Tooltip
                trigger="hover"
                :content="row.error"
                :transfer="true"
                max-width="450"
                theme="light"
              >
                <i class="tsfont-danger-s text-error"></i>
              </Tooltip></span>
              <span v-else class="text-success">{{ $t('page.completed') }}</span>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li v-if="row.status === 'done'" class="tsfont-play-o" @click="execGroup(row.id)">{{ $t('page.apply') }}</li>
                  <li class="tsfont-copy" @click="copyGroup(row.id)">{{ $t('page.copy') }}</li>
                  <li class="tsfont-edit" @click="editGroup(row.id)">{{ $t('page.edit') }}</li>
                  <li class="tsfont-trash-o" @click="delGroup(row)">{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
          <!--<TsCard
            v-if="groupData.cardList"
            v-bind="groupData"
            :boxShadow="false"
            :padding="false"
            :fixBtn="true"
            :sm="12"
            :lg="8"
            :xl="6"
            :xxl="4"
            @action="action"
            @updatePage="searchGroup"
          >
            <template slot-scope="{ row }">
              <div class="overvivew-main">
                <div class="title">
                  <div class="title-right">
                    <div class="overflow top-title width90" :title="row.name">
                      {{ row.name }}
                    </div>
                    <Tooltip
                      v-if="row.description"
                      max-width="350"
                      style="width:100%"
                      :content="row.description"
                      :transfer="true"
                      theme="light"
                    >
                      <div class="overflow text-grey fz10">
                        {{ row.description }}
                      </div>
                    </Tooltip>
                    <div class="text-grey top-typename">
                      <Badge :type="row.type == 'readonly' ? 'normal' : 'warning'" :text="row.typeName"></Badge>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template slot="control" slot-scope="{ row }">
              <div @click="execGroup(row.id)">
                <div v-if="row.status == 'doing'" class="pl-md pr-md"><Progress
                  :percent="99"
                  :stroke-width="10"
                  status="active"
                  :hide-info="true"
                /></div>
                <span v-if="row.status == 'done' && row.error"> <Tooltip
                  trigger="hover"
                  :content="row.error"
                  :transfer="true"
                  max-width="450"
                  theme="light"
                >
                  <i class="tsfont-danger-s text-error"></i>
                </Tooltip></span>
                <span v-if="row.status == 'done'" class="tsfont-play-o">{{ $t('page.apply') }}</span>
                <span v-if="row.status == 'done' && row.ciEntityCount > 0" class="ml-xs text-info fz10">{{ row.ciEntityCount > 1000 ? '999+' : row.ciEntityCount }}</span>
              </div>
              <div class="tsfont-edit" @click="editGroup(row.id)">
                <span>{{ $t('page.edit') }}</span>
              </div>
              <div class="tsfont-trash-o" @click="delGroup(row)">
                <span>{{ $t('page.delete') }}</span>
              </div>
            </template>
          </TsCard>-->
        </div>
      </div>
    </TsContain>
    <GroupEdit
      v-if="isGroupEditShow"
      :id="groupId"
      :isCopy="isCopy"
      @close="close"
    ></GroupEdit>
    <GroupExec v-if="isGroupExecShow" :id="groupId" @close="closeExec"></GroupExec>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    GroupEdit: () => import('./group-edit.vue'),
    GroupExec: () => import('./group-exec.vue'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue'),
    //TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {},
  data() {
    return {
      isCopy: false,
      theadList: [
        {
          key: 'name',
          title: '名称'
        },
        //{ key: 'isActive', title: '是否激活' },
        { key: 'typeName', title: '类型' },
        { key: 'ciList', title: '关联模型' },
        { key: 'auth', title: '授权' },
        { key: 'ciEntityCount', title: '配置项数量' },
        { key: 'status', title: '状态' },
        { key: 'description', title: '说明' },
        { key: 'action' }
      ],
      searchParam: {},
      isGroupEditShow: false,
      isGroupExecShow: false,
      timer: null, //定时器
      groupId: null,
      groupData: {},
      doingIdList: [] //刷新状态id列表
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchGroup(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.clearTimer();
  },
  destroyed() {},
  methods: {
    searchGroup(currentPage) {
      this.clearTimer();
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.cmdb.group.searchGroup(this.searchParam).then(res => {
        this.groupData = res.Return;
        //检查是否有进行中采集，如果有启动定时刷新
        this.doingIdList = [];
        if (this.groupData.tbodyList) {
          this.groupData.tbodyList.forEach(element => {
            if (element.status === 'doing') {
              this.doingIdList.push(element.id);
            }
          });
        }
        if (this.doingIdList.length > 0) {
          this.checkGroupStatusInterval();
        }
      });
    },
    action(row, value) {
      if (value == 'edit') {
        this.editGroup(row.id);
      } else if (value == 'del') {
        this.delGroup(row);
      } else if (value == 'referenceCount') {
        this.execGroup(row.id);
      }
    },
    addGroup() {
      this.isGroupEditShow = true;
      this.groupId = null;
      this.isCopy = false;
    },
    close(needRefresh) {
      this.isGroupEditShow = false;
      this.groupId = null;
      if (needRefresh) {
        this.searchGroup();
      }
    },
    closeExec(needRefresh) {
      if (needRefresh) {
        this.doingIdList.push(this.groupId);
        this.checkGroupStatusInterval();
      }
      this.isGroupExecShow = false;
      this.groupId = null;
    },
    editGroup(id) {
      this.groupId = id;
      this.isGroupEditShow = true;
      this.isCopy = false;
    },
    copyGroup(id) {
      this.groupId = id;
      this.isGroupEditShow = true;
      this.isCopy = true;
    },
    execGroup(id) {
      this.groupId = id;
      this.isGroupExecShow = true;
    },
    delGroup(group) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: group.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.group.deleteGroup(group.id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.searchGroup();
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    checkGroupStatusInterval() {
      this.clearTimer();
      if (this.doingIdList && this.doingIdList.length > 0) {
        this.$api.cmdb.group.searchGroup({ idList: this.doingIdList }).then(res => {
          this.doingIdList = [];
          if (res.Return && res.Return.length > 0) {
            res.Return.forEach(element => {
              const oldElement = this.groupData.tbodyList.find(a => a.id == element.id);
              if (element.status == 'doing') {
                this.doingIdList.push(element.id);
              }
              if (oldElement) {
                this.$set(oldElement, 'status', element.status);
                this.$set(oldElement, 'error', element.error);
                this.$set(oldElement, 'statusText', element.statusText);
                this.$set(oldElement, 'ciEntityCount', element.ciEntityCount);
              }
            });
          }
          if (this.doingIdList.length > 0) {
            this.timer = setTimeout(() => {
              this.checkGroupStatusInterval();
            }, 3000);
          }
        });
      }
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.width90 {
  max-width: calc(100% - 30px);
}
.group-manage {
  .tscard-container {
    .tscard-body {
      .overvivew-main {
        position: relative;
        width: 100%;
        // min-height: 56px;
        cursor: pointer;
        // line-height: 24px;
        // padding: 4px 16px;
        .top-typename {
          position: absolute;
          right: 10px;
          top: 0px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
