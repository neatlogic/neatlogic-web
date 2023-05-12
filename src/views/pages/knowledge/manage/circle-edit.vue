<template>
  <div class="knowledge-circle-edit">
    <TsContain border="bottom">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <TsFormInput
          :ref="'input'+knowledgeCircle.id"
          v-model="knowledgeCircle.name"
          :maxlength="50"
          :validateList="nameValidateList"
        ></TsFormInput>
      </template>
      <template v-slot:topRight>
        <div class="action-group" :style="{'text-align': 'right'}">
          <div class="action-item tsfont-save" :class="{disable:disabledBtn.saveCircle}" @click="saveCircle">
            {{ $t('page.save') }}
          </div>
          <div class="action-item last tsfont-trash-s" :class="{'disable': $route.query.operation==='add' || documentCount}" @click="deleteCircle">
            {{ $t('page.delete') }}
          </div>
        </div>
      </template>
      <template v-slot:content>
        <Loading v-if="isLoading" loadingShow type="fix" />
        <div v-else class="content">
          <TsForm ref="form" :itemList="formConfig"></TsForm>
          <p>
            <span class="text-title" :style="{'margin-right': '10px'}">{{ $t('page.classify') }}</span>
            <span class="text-action tsfont-plus" @click="addNode(knowledgeCircle, knowledgeCircle.children.length, 1)">
              {{ $t('term.knowledge.primaryclassification') }}
            </span>
          </p>
          <TsTree
            ref="tree"
            class="tree"
            :nodeList="knowledgeCircle.children"
            :keyConfig="keyConfig"
          >
            <template v-slot:default="{node}">
              <TsFormInput
                :ref="'input'+node.uuid"
                v-model="node.name"
                class="name"
                :maxlength="50"
                border="bottom"
                :validateList="['required', 'name-special']"
              ></TsFormInput>
            </template>
            <template v-slot:right="{node, index, parentNode, level}">
              <div class="btn-list">
                <ul class="action-group">
                  <li class="action-item no-cursor"><span class="document-count">{{ $t('term.knowledge.docamount') }}{{ node.documentCount }}</span></li>
                  <li class="action-item text-action" @click="addNode(parentNode, index + 1, level)"><span class="tsfont-plus">{{ $t('term.knowledge.samedirectory') }}</span></li>
                  <li class="action-item text-action" @click="addNode(node, node.children.length, level + 1)"><span class="tsfont-plus">{{ $t('page.lowerdirectory') }}</span></li>
                  <li class="action-item text-action" :class="{'text-grey text-disabled': node.documentCount > 0}" @click="removeNode(node, parentNode, index)"><span class="tsfont-trash-s">{{ $t('page.delete') }}</span></li>
                </ul>
              </div>
            </template>
          </TsTree>
        </div>
      </template>
    </TsContain>
  </div>
</template>

<script>
import utils from 'assets/js/util.js';
export default {
  name: 'CircleEdit',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsTree: resolve => require(['components/TsTree/TsTree.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve)
  },
  data() {
    this.keyConfig = {id: 'uuid', parentId: 'parentUuid'};
    return {
      disabledBtn: {saveCircle: false, deleteCircle: false},
      isLoading: false,
      documentCount: 0, //这个知识圈关联的知识数量，用来屏蔽删除按钮
      knowledgeCircle: {
        name: this.$route.query.name,
        id: this.$route.query.id,
        approverList: [],
        memberList: [],
        children: []
      },
      nameValidateList: ['required', 'name-special', {
        name: 'searchUrl',
        url: 'api/rest/knowledge/circle/save',
        key: 'name',
        params: () => ({id: this.knowledgeCircle.id})
      }],
      formConfig: {
        approver: {
          label: this.$t('term.knowledge.approver'),
          labelPosition: 'top',
          tooltip: this.$t('term.knowledge.tooltip.approver'),
          type: 'userselect',
          groupList: ['user', 'team', 'role'],
          validateList: ['required'],
          value: [],
          onChange: value => {
            this.knowledgeCircle.approverList = value;
          }
        },
        member: {
          label: this.$t('term.knowledge.member'),
          labelPosition: 'top',
          tooltip: this.$t('term.knowledge.tooltip.member'),
          type: 'userselect',
          groupList: ['user', 'team', 'role'],
          value: [],
          onChange: value => {
            this.knowledgeCircle.memberList = value;
          }
        }
      }
    };
  },
  created() {
    this.init(this.$route.query.operation);
  },
  beforeRouteLeave(from, to, next, url) {
    let finalCircle = this.stringifyCircle();
    if (finalCircle === this.initialCircle) {
      url ? this.$utils.gotoHref(url) : next(true);
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(this, {
        save: {
          fn: async(vnode) => {
            return await _this.saveCircle(false);
          }
        }
      }, to, from, next, url);
    }
  },
  methods: {
    async init(operation) {
      if (operation === 'add') {
        document.title = this.$t('dialog.title.addtarget', {target: this.$t('term.knowledge.intellectualcircle')});
        this.knowledgeCircle.children.push({
          uuid: utils.setUuid(),
          parentUuid: 0,
          name: this.$t('page.classify'),
          children: []
        });
        this.initialCircle = this.stringifyCircle();
      } else if (operation === 'edit') {
        document.title = this.$t('dialog.title.edittarget', {target: this.$t('term.knowledge.intellectualcircle')});
        this.isLoading = true;
        const params = { id: this.knowledgeCircle.id };
        const promise = this.$api.knowledge.circle.get(params);
        const res = await promise;
        if (res.Status === 'OK') {
          this.isLoading = false;
          let {id, name, approverList, memberList, documentTypeList: children, documentCount} = res.Return.knowledgeCircle;
          this.formConfig.approver.value = approverList;
          this.formConfig.member.value = memberList;
          this.knowledgeCircle = {id, name, approverList, memberList, children};
          this.documentCount = documentCount;
          this.initialCircle = this.stringifyCircle();
        }
      }
    },
    async saveCircle(stay = true) { 
      if (this.knowledgeCircle.children.length === 0) {
        this.$Notice.warning({title: this.$t('form.validate.required', {target: this.$t('term.knowledge.knowtype')})});
        return false;
      }
      if (!this.$refs.form.valid()) {
        this.$Notice.warning({title: this.$t('form.validate.required', {target: this.$t('term.knowledge.approver')})});
        return false;
      }
      const nameArray = this.$refs.tree.flattenTree(this.knowledgeCircle.children, node => node.name);
      const nameSet = new Set(nameArray);
      if (nameArray.length !== nameSet.size) {
        this.$Notice.warning({title: this.$t('message.cannotrepeat', {target: this.$t('term.knowledge.knowtypename')})});
        return false;
      }
      const params = {
        id: this.knowledgeCircle.id,
        name: this.knowledgeCircle.name,
        knowledgeType: {children: this.knowledgeCircle.children},
        ...this.$refs.form.getFormValue()
      };
      if (this.disabledBtn.saveCircle) {
        return;
      }
      this.disabledBtn.saveCircle = true;

      const res = await this.$api.knowledge.circle.save(params).finally(res => {
        this.disabledBtn.saveCircle = false;
      });
      if (res.Status === 'OK') {
        this.$store.commit('leftMenu/isKnowledgeCircleUpdated', true);
        this.$Message.success(this.$t('message.savesuccess')); //保存成功
        this.operation = 'edit';
        this.knowledgeCircle.id = res.Return.id;
        if (this.$route.query.operation === 'add') {
          stay && this.$router.push({name: 'circle-edit', query: {operation: 'edit', id: res.Return.id}});
        } else if (this.$route.query.operation === 'edit') {
          this.init('edit');
        }
      }
    },
    async deleteCircle() { 
      if (this.$route.query.operation === 'add' || this.documentCount) return;
      const {id, name} = this.knowledgeCircle;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': async vnode => {
          if (vnode.okBtnDisable) {
            return;
          }
          vnode.okBtnDisable = true;
          const params = { id };
          const res = await this.$api.knowledge.circle.delete(params).finally(res => {
            vnode.okBtnDisable = false;
          });
          if (res.Status === 'OK') {
            this.$store.commit('leftMenu/isKnowledgeCircleUpdated', true);
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.$router.push({name: 'circle-manage'});
          }
        }
      });
    },
    addNode(parentNode, index) {
      const node = {
        uuid: utils.setUuid(),
        parentUuid: parentNode.uuid || 0,
        name: this.$t('page.classify')
      };
      parentNode.children.splice(index, 0, node);
      parentNode.expand = true;
      this.$nextTick(() => {
        this.$refs['input' + node.uuid].$el.querySelector('input').focus();
      });
    },
    removeNode(node, parentNode, index) {
      if (node.documentCount > 0) return;
      parentNode.children.splice(index, 1);
    },
    traverseTree(children, callback) {
      return children.map(node => {
        const newNode = callback(node);
        newNode.children = this.traverseTree(node.children, callback);
        return newNode;
      });
    },
    stringifyCircle() {
      const documentTypeList = this.traverseTree(this.knowledgeCircle.children, node => {
        const {name, uuid, parentUuid} = node;
        return {name, uuid, parentUuid};
      });
      return JSON.stringify({
        name: this.knowledgeCircle.name,
        documentTypeList: documentTypeList,
        approverList: this.knowledgeCircle.approverList,
        memberList: this.knowledgeCircle.memberList
      });
    }
  }
};
</script>

<style lang="less" scoped>
.knowledge-circle-edit {
  .dividing {
    display: inline-block;
    margin: 0 20px;
    height: 20px;
    width: 0;
    border-right: 1px solid;
  }
  .circle-name {
    display: inline-block;
  }
  .content {
    padding: 10px 16px 0;
    .tree {
			margin-top: 16px;
			.btn-list {
				.action-item {
					padding: 10px;
          &.no-cursor {
            color: unset;
            cursor: unset;
          }
					&.disabled {
						cursor: not-allowed;
          }
          .document-count {
            display: inline-block;
            width: 55px;
          }
				}
			}
		}
  }
}
</style>
