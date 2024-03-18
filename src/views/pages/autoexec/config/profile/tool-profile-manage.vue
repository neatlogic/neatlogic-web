
<template>
  <div class="tool-profile-manage-box">
    <Loading :loadingShow="showLoading" type="fix"></Loading>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addProfile">{{ $t('term.autoexec.presetparameterset') }}</span>
      </template>
      <template v-slot:topRight>
        <TsRow>
          <Col :span="6"><TsFormSelect v-model="fromSystemId" v-bind="formSelectSetting" @change="getTableList(1)"></TsFormSelect></Col>
          <Col :span="18">
            <InputSearcher
              v-model="keyword"
              @change="getTableList(1)"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <template v-slot:content>
        <div slot="content">
          <TsTable
            v-if="!showLoading"
            v-bind="tableConfig"
            @operation="handleOperation"
            @changeCurrent="getTableList"
            @changePageSize="getTableList(1, ...arguments)"
          >
            <template slot="fromSystemName" slot-scope="{ row }">
              <span>{{ row.fromSystemId == -1 ? $t('page.global') : row.fromSystemName }}</span>
            </template>
            <template slot="name" slot-scope="{ row }">
              <span class="text-href overflow profile-name-text" :title="row.name" @click.stop="editProfile(row)">{{ row.name }}</span>
            </template>
            <template slot="description" slot-scope="{ row }">
              <span class="overflow profile-description-text" :title="row.description">{{ row.description }}</span>
            </template>
            <template slot="referredCount" slot-scope="{ row }">
              <ReferenceSelect
                :id="row.id"
                :isTable="true"
                calleeType="profile"
                :referenceCount="row.referredCount"
              ></ReferenceSelect>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-copy" @click="copyProfile(row.id)">{{ $t('page.copy') }}</li>
                  <li
                    class="icon tsfont-trash-o"
                    :title="row.referredCount > 0 ? $t('page.nodeletetarget', {name: 'profile', target: $t('term.autoexec.combinationtool')}) : ''"
                    :class="{ disable: row.referredCount > 0 }"
                    @click.stop="deleteProfile(row)"
                  >{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
    <ToolProfileEdit
      v-if="isShowToolProfileEdit"
      :type="operationType"
      :toolProfileId="toolProfileId"
      @close="closeDialog"
    ></ToolProfileEdit>
  </div>
</template>
<script>
export default {
  name: 'ToolProfileManage', // 工具Profile
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve),
    ToolProfileEdit: resolve => require(['./component/tool-profile-edit.vue'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      keyword: '',
      showLoading: true,
      profileId: null, // profileId
      fromSystemId: '', // 关联配置项ID
      defaultAutoexecOperationVoList: [], // 关联工具回显参数
      toolProfileId: null,
      operationType: '', // 操作类型，copy/edit/add
      isShowToolProfileEdit: false,
      formSelectSetting: {
        value: '',
        search: true,
        border: 'border',
        placeholder: this.$t('term.autoexec.owningsystem'),
        dynamicUrl: '/api/rest/resourcecenter/appsystem/list/forselect',
        rootName: 'tbodyList',
        dealDataByUrl: this.getSystemList
      },
      tableConfig: {
        theadList: [
          { title: this.$t('page.name'), key: 'name' },
          { title: this.$t('term.autoexec.owningsystem'), key: 'fromSystemName' },
          { title: this.$t('term.autoexec.associatedobject'), key: 'referredCount' },
          { title: this.$t('page.description'), key: 'description' },
          { title: this.$t('page.fcu'), key: 'lcu', type: 'user' },
          { title: this.$t('page.fcd'), key: 'lcd', type: 'time' },
          { key: 'action'}
        ],
        currentPage: 1,
        pageSize: 20,
        pageCount: 1
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getTableList();
    let query = this.$route.query;
    if (query && query.id) {
      // 从其他页面跳转过来编辑
      this.isShowToolProfileEdit = true;
      this.toolProfileId = parseInt(query.id);
    } else if (query && query.isAdd) {
      this.isShowToolProfileEdit = true;
      this.toolProfileId = null;
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
    getTableList(currentPage, pageSize) {
      let params = {
        keyword: this.keyword,
        fromSystemId: this.fromSystemId,
        currentPage: currentPage || this.tableConfig.currentPage,
        pageSize: pageSize || this.tableConfig.pageSize
      };
      this.tableConfig.pageSize = pageSize || this.tableConfig.pageSize;
      this.showLoading = true;
      this.$api.autoexec.profile
        .getProfileList(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.tableConfig = Object.assign(this.tableConfig, res.Return);
          }
        })
        .finally(() => {
          this.showLoading = false;
        });
    },
    getSystemList(nodeList) {
      let columlist = [];
      nodeList.forEach(n => {
        let text = n.abbrName;
        if (n.name) {
          text += '[' + n.name + ']';
        }
        columlist.push(
          { text: text, value: n.id, config: n }
        );
      });
      columlist.unshift({
        value: -1,
        text: this.$t('page.global')
      });
      return columlist;
    },
    addProfile() {
      this.isShowToolProfileEdit = true;
      this.toolProfileId = null;
    },
    editProfile(row) {
      if (row && !row.id) {
        return false;
      }
      this.isShowToolProfileEdit = true;
      this.toolProfileId = row.id;
    },
    handleOperation(row, type) {
      if (type && type == 'edit') {
        this.editProfile(row);
      }
    },
    deleteProfile(row) {
      if (row && row.referredCount > 0) {
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.autoexec.presetparameterset')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.profile
            .deleteProfile({ id: row.id })
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.getTableList();
              }
            })
            .finally(() => {
              vnode.isShow = false;
            });
        }
      });
    },
    closeDialog(needRefresh) {
      this.toolProfileId = null;
      this.operationType = '';
      this.isShowToolProfileEdit = false;
      if (needRefresh) {
        this.getTableList(1);
      }
    },
    copyProfile(profileId) {
      this.toolProfileId = profileId;
      this.operationType = 'copy';
      this.isShowToolProfileEdit = true;
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
.tool-profile-manage-box {
  .profile-name-text {
    display: inline-block;
    width: 150px;
  }
  .profile-description-text {
    display: inline-block;
    width: 200px;
  }
  .ci-entity-list-box {
    max-width: 400px;
    .ci-entity-list-icon-margin {
      display: inline-block;
      margin-right: 8px;
    }
  }
}
</style>
