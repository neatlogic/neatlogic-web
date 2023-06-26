<template>
  <div class="event-type-dialog">

    <!-- 添加对话框 -->
    <TsDialog
      v-if="params.operation === 'add'"
      :isShow="isShow"
      :title="(params.path.length===0) ? $t('dialog.title.addtarget', {target: $t('term.knowledge.primaryclassification')}) : $t('dialog.title.addtarget',{'target': $t('page.classify')})"
      :okText="$t('page.save')"
      className="dialog"
      @on-ok="confirmAdd(params)"
      @on-close="close"
    >
      <div v-if="params.path.length !==0" class="path">
        {{ params.path.map(item => item.node.name).join(' / ') + ' /' }}
      </div>
      <Tsform ref="addForm" :itemList="[formConfig.name,formConfig.auth]"></Tsform>
    </TsDialog>

    <!-- 重命名对话框 -->
    <TsDialog
      v-else-if="params.operation === 'rename'"
      :isShow="isShow"
      :title="$t('page.rename')"
      :okText="$t('page.save')"
      className="dialog"
      @on-ok="confirmRename(params)"
      @on-close="close"
    >
      <div v-if="params.path.length > 1" class="path">
        {{ params.path.map(item => item.node.name).join(' / ') + ' /' }}
      </div>
      <Tsform ref="renameForm" :itemList="[formConfig.name]"></Tsform>
    </TsDialog>

    <!-- 授权对话框 -->
    <TsDialog
      v-else-if="params.operation === 'authorize'"
      :isShow="isShow"
      :title="$t('page.auth')"
      :okText="$t('page.save')"
      className="auth-dialog"
      @on-ok="confirmAuth(params)"
      @on-close="close"
    >
      <Tsform :itemList="[formConfig.name]"></Tsform>
      <TsformItem
        labelFor="auth"
        :label="$t('page.object')"
        :validateList="['required', 'name-special']"
        style="marginTop:24px"
      >
        <UserSelect v-bind="formConfig.childrenAuth"></UserSelect>
        <UserSelect ref="authForm" v-bind="formConfig.auth" :validateList="['required']"></UserSelect>
      </TsformItem>
    </TsDialog>

    <!-- 关联解决方案对话框 -->
    <TsDialog
      v-else-if="params.operation === 'linkSolution'"
      :isShow="isShow"
      :hasFooter="false"
      :title="$t('term.process.relsolution')"
      :okText="$t('page.save')"
      className="link-solution-dialog"
      @on-close="close"
    >
      <div class="solution">
        <div class="operation-button">
          <span class="add-solution border-color text-action" @click="toEventSolutionManage">+</span>
          <i class="tsfont-rotate-right text-action" :class="{'loading': isLoading}" @click="refreshSolutionList"></i>
        </div>
        <ol v-if="solutionList.length!==0" class="solution-list">
          <li
            v-for="(item, index) in solutionList"
            :key="item.id"
            class="solution-item text-action"
            @click="toEventSolutionEdit(item.id)"
          >
            <span class="order">{{ index + 1 }}.</span>
            <span class="name">{{ item.name }}</span>
          </li>
        </ol>
        <div v-else class="no-data">{{ $t('page.nodata') }}</div>
      </div>
    </TsDialog>

    <!-- 删除对话框 -->
    <TsDialog
      v-else-if="params.operation === 'delete'"
      :isShow="isShow"
      :title="$t('dialog.title.deleteconfirm')"
      btn-type="error"
      @on-ok="confirmDelete(params)"
      @on-close="close"
    >
      <div>{{ $t('dialog.content.deleteconfirm', {target:params.node.name}) }}</div>
    </TsDialog>

  </div>
</template>

<script>
export default {
  name: 'EventTypeDialog',
  components: {
    Tsform: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsformItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem.vue'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve)
  },
  props: {
    params: { type: Object }
  },
  data() {
    return {
      name: null,
      authorityList: [],
      solutionList: [],
      isLoading: false,
      isShow: true,
      formConfig: {
        name: {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          value: null,
          readonly: false,
          width: '100%',
          className: 'name-input',
          maxlength: 50,
          validateList: [
            'required', 
            'name-special',
            { 
              name: 'searchUrl',
              url: '/api/rest/eventtype/save',
              key: 'name',
              params: {}
            }],
          onChange: (value) => {
            this.name = value;
          }
        },
        auth: {
          name: 'auth',
          type: 'userselect',
          label: this.$t('page.object'),
          transfer: true,
          width: '100%',
          border: 'border',
          value: [],
          validateList: ['required'],
          groupList: ['user', 'role', 'team'],
          onChange: (list) => {
            this.authorityList = list;
          }
        },
        childrenAuth: {
          name: 'childrenAuth',
          type: 'userselect',
          label: this.$t('page.object'),
          width: '100%',
          isHidden: false,
          value: [],
          readonly: true,
          transfer: true,
          groupList: ['user', 'role', 'team']
        }
      }
    };
  },
  created() {
    if (['authorize', 'rename', 'delete'].includes(this.params.operation)) {
      this.formConfig.name.value = this.params.node.name;
      this.name = this.params.node.name;
    }
    if (this.params.operation === 'authorize') {
      this.formConfig.name.readonly = true;
      this.getAuth();
    }
    if (this.params.operation === 'linkSolution') {
      this.getSolutionList();
    }
    for (let key in this.formConfig) {
      if (key == 'name') {
        this.formConfig[key].validateList.forEach((item) => {
          if (item && item.name) {
            if (this.params.operation == 'rename') {
              item.params = {id: this.params.node.id, parentId: this.params.node.parentId}; // 重命名，改回初始值，不需要验证
            } else {
              item.params = {parentId: this.params.node.id}; // 验证名称是否重复
            }
          }
        });
      }
    }
  },
  methods: {
    confirmAdd({ node }) {
      if (!this.$refs.addForm.valid()) {
        return;
      }
      const params = {
        parentId: node.id,
        name: this.name,
        authorityList: this.authorityList
      };
      this.$api.process.eventType
        .save(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            const newNode = {
              ...params,
              id: res.Return.eventTypeId,
              childCount: 0,
              children: [],
              solutionCount: res.Return.solutionCount,
              expand: false
            };
            node.expand = true;
            node.children.push(newNode);
            if (node.childCount != undefined) {
              node.childCount++;
            } else {
              this.$emit('on-rownum-increase', node);
            }
          }
        }).finally(() => {
          this.close();
        });
    },
    confirmDelete({node, index, parentNode}) {
      const params = {id: node.id};
      this.$api.process.eventType
        .delete(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
            parentNode.children && parentNode.children.splice(index, 1);
            if (parentNode.childCount != undefined) {
              parentNode.childCount--;
            } else {
              this.$emit('on-rownum-decrease', index);
            }
          }
        }).finally(() => {
          this.close();
        });
    },
    confirmRename({node}) {
      if (!this.$refs.renameForm.valid()) {
        return;
      }
      const params = {
        id: node.id,
        name: this.name
      };
      const name = this.name;
      this.$api.process.eventType
        .save(params)
        .then(res => {
          if (res.Status === 'OK') {
            node.name = name;
            this.$Message.success(this.$t('message.executesuccess'));
          }
        }).finally(() => {
          this.close();
        });
    },
    confirmAuth({node}) {
      if (!this.$refs.authForm.valid()) {
        return;
      }
      const params = {
        id: node.id,
        authorityList: this.authorityList
      };
      this.$api.process.eventType
        .saveAuth(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        }).finally(() => {
          this.close();
        });
    },
    getAuth() {
      const params = {id: this.params.node.id};
      this.$api.process.eventType
        .getAuth(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.authorityList = res.Return.authList;
            this.formConfig.auth.value = res.Return.authList;
            this.formConfig.childrenAuth.value = res.Return.childrenAuthList;
            this.formConfig.childrenAuth.isHidden = !res.Return.childrenAuthList;
          }
        });
    },
    getSolutionList() {
      const params = {id: this.params.node.id};
      return this.$api.process.eventType
        .getSolutionList(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.solutionList = res.Return.solutionList;
            this.params.node.solutionCount = res.Return.rowNum;
          }
        });
    },
    refreshSolutionList() {
      this.isLoading = true;
      this.getSolutionList().then(() => {
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      });
    },
    close() {
      this.isShow = false;
      this.$emit('close');
    },
    toEventSolutionManage() {
      window.open(HOME + '/process.html#/event-solution-manage', '_blank');
    },
    toEventSolutionEdit(id) {
      window.open(HOME + '/process.html#/event-solution-edit' + '?operation=edit' + '&id=' + id, '_blank');
    }
  },
  watch: {}
};
</script>

<style lang="less" scoped>
.dialog {
  .path {
    margin: 10px 0 24px 83px;
  }
}

.solution {
  padding: 10px 30px 30px;
  .operation-button {
    margin-bottom: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    .add-solution {
      display: inline-block;
      width: 75%;
      height: 30px;
      line-height: 30px;
      text-align: center;
      border: 1px solid;
      font-size: 16px;
      cursor: pointer;
    }
    .tsfont-rotate-right {
      margin-left: 20px;
      display: inline-block;
      cursor: pointer;
      &::before {
        margin-right: 0;
      }
       &.loading {
        animation: ani-demo-spin 1s linear forwards;
      }
    }
  }
  .solution-list {
    margin-left: 50px;
    .solution-item {
      padding: 5px 0;
      .order {
        margin-right: 20px;
      }
    }
  }
  .no-data {
    text-align: center;
    margin-left: -36px;
  }
}
</style>
