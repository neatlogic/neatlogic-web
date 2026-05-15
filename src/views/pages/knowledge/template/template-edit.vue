<template>
  <div class="template-edit">
    <TsContain border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <TsFormInput
          :ref="'input'+rootNode.uuid"
          v-model="rootNode.content"
          :maxlength="50"
          :validateList="nameValidateList"
        ></TsFormInput>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item" :class="{disable:disabledBtn.saveTemplate}">
            <span class="tsfont-save" @click="saveTemplate">{{ $t('page.save') }}</span>
          </div>
          <div class="action-item last" :class="{'text-grey text-disabled': !isEdit}">
            <span class="tsfont-trash-s" @click="deleteTemplate">{{ $t('page.delete') }}</span>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div class="content">
          <p class="nav-menu">
            <span class="text-title mr-sm">{{ $t('term.knowledge.navigationdirectory') }}</span>
            <span class="text-action tsfont-plus" @click="addNode(rootNode, rootNode.children.length, 1)">
              {{ $t('term.knowledge.primaryclassification') }}
            </span>
          </p>
          <TsTree
            ref="tree"
            :nodeList="rootNode.children"
            :keyConfig="keyConfig"
            :treeDepth="treeDepth"
            @on-node-add="changeNodeType"
          >
            <template v-slot:default="{node}">
              <TsFormInput
                :ref="'input'+node.uuid"
                v-model="node.content"
                class="name"
                :maxlength="50"
                :validateList="['required', 'name-special']"
              ></TsFormInput>
            </template>
            <template v-slot:right="{node, index, parentNode, level}">
              <ul class="action-group">
                <li class="action-item" @click="addNode(parentNode, index + 1, level)">
                  <span class="tsfont-plus">{{ $t('term.knowledge.samedirectory') }}</span>
                </li>
                <li class="action-item" :class="{'disabled text-grey' : level >= treeDepth}" @click="addNode(node, node.children.length, level + 1)">
                  <span class="tsfont-plus">{{ $t('page.lowerdirectory') }}</span>
                </li>
                <li class="action-item" @click="removeNode(parentNode, index)">
                  <span class="tsfont-trash-s">{{ $t('page.delete') }}</span>
                </li>
              </ul>
            </template>
          </TsTree>
        </div>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
      </template>
    </TsContain>
  </div>
</template>

<script>
import utils from 'assets/js/util.js';
import {$t} from '@/resources/init.js';
class Node {
  constructor({handler, uuid, content, config, children} = {}) {
    this.handler = handler || 'h1';
    this.uuid = uuid || utils.setUuid();
    this.content = content == null ? $t('page.catalogue') : content;
    this.config = config || {};
    this.children = children || [];
  }
}
export default {
  name: 'TemplateEdit',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    TsTree: () => import('components/TsTree/TsTree.vue')
  },
  data() {
    this.keyConfig = {name: 'content', id: 'uuid'};
    return {
      disabledBtn: {saveTemplate: false},
      rootNode: {
        handler: 'h0',
        children: []
      },
      initialTemplate: null,
      treeDepth: 2,
      isLoading: false,
      nameValidateList: [
        'required',
        'name-special', {
          name: 'searchUrl',
          url: 'api/rest/knowledge/template/save',
          key: 'name',
          params: () => ({id: this.isEdit ? this.templateId : null})
        }]
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      if (this.isAdd) {
        this.initAddTemplate();
        return;
      }
      this.getTemplate();
    },
    initAddTemplate() {
      document.title = this.$t('dialog.title.addtarget', {target: this.$t('page.template')});
      this.rootNode = new Node({
        handler: 'h0',
        content: this.$route.query.name || '',
        children: [new Node()]
      });
      this.setInitialTemplate();
    },
    initEditTemplate({id, name, children}) {
      document.title = this.$t('dialog.title.edittarget', {target: this.$t('page.template')});
      this.rootNode = new Node({
        handler: 'h0',
        uuid: id,
        content: name,
        children
      });
    },
    initCopyTemplate({name, children}) {
      document.title = this.$t('dialog.title.copytarget', {target: this.$t('page.template')});
      this.rootNode = new Node({
        handler: 'h0',
        uuid: null,
        content: name + '_copy',
        children
      });
    },
    getTemplate() {
      this.isLoading = true;
      const params = { id: this.templateId };
      this.$api.knowledge.template.getTemplate(params).then((res) => {
        if (res.Status === 'OK') {
          let {id, name, content: list} = res.Return.template;
          const children = this.list2forest(JSON.parse(list));
          if (this.isEdit) {
            this.initEditTemplate({id, name, children});
          } else if (this.isCopy) {
            this.initCopyTemplate({name, children});
          }
          this.setInitialTemplate();
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    setInitialTemplate() {
      this.initialTemplate = this.getCompareTemplate(this.rootNode);
    },
    getCompareTemplate(node) {
      const {handler, uuid, content, config, children = []} = node;
      return {
        handler,
        uuid,
        content,
        config,
        children: children.map(child => this.getCompareTemplate(child))
      };
    },
    addNode(parentNode, index, level) {
      if (level > this.treeDepth) return;
      const newNode = new Node({
        handler: 'h' + level
      });
      parentNode.children.splice(index, 0, newNode);
      this.$set(parentNode, 'expand', true);
    },
    removeNode(parentNode, index) {
      parentNode.children.splice(index, 1);
    },
    changeNodeType(node, parentNode, e) {
      if (parentNode.handler === 'h0') {
        node.handler = 'h1';
      } else if (parentNode.handler === 'h1') {
        node.handler = 'h2';
      }
    },
    saveTemplate(stay = true) {
      const list = this.forest2list(this.rootNode.children);
      if (this.rootNode.content === '') {
        this.$Notice.warning({title: this.$t('form.validate.required', {target: this.$t('page.templatename')})});
        return false;
      }
      if (this.rootNode.children.length === 0) {
        this.$Notice.warning({title: this.$t('form.validate.required', {target: this.$t('term.knowledge.navigationdirectory')})});
        return false;
      }
      const params = {
        id: this.isEdit ? this.templateId : null,
        name: this.rootNode.content,
        content: list
      };
      if (this.disabledBtn.saveTemplate) {
        return;
      }
      this.disabledBtn.saveTemplate = true;
      this.$api.knowledge.template.saveTemplate(params).then((res) => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.setInitialTemplate();
          stay && this.$router.push({ name: 'template-edit', query: {id: res.Return.id} });
        }
      }).finally(() => {
        this.disabledBtn.saveTemplate = false;
      });
    },
    deleteTemplate() {
      if (!this.isEdit) return;
      const {content} = this.rootNode;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', {target: content}),
        btnType: 'error',
        'on-ok': vnode => {
          const params = { id: this.templateId };
          this.$api.knowledge.template.deleteTemplate(params).then((res) => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.$router.push({name: 'template-manage'});
            }
          });
        }
      });
    },
    list2forest(list) {
      return list.reduce((forest, item) => {
        const node = new Node(item);
        if (node.handler === 'h1') {
          forest.push(node);
          return forest;
        } else if (node.handler === 'h2') {
          forest[forest.length - 1].children.push(node);
          return forest;
        }
      }, []);
    },
    forest2list(forest) {
      const list = this.$refs.tree.flattenTree(forest, node => {
        const {handler, uuid, content, config} = node;
        return {handler, uuid, content, config};
      });
      return list;
    }
  },
  computed: {
    templateId() {
      return this.$route.query.id;
    },
    isCopy() {
      return this.$route.query.operation === 'copy';
    },
    isEdit() {
      return !!this.templateId && !this.isCopy;
    },
    isAdd() {
      return !this.templateId;
    }
  },
  beforeRouteLeave(from, to, next, url) {
    let isSame = this.$utils.isSame(this.initialTemplate, this.getCompareTemplate(this.rootNode));
    if (isSame) {
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(this, {
        save: {
          fn: async(vnode) => {
            return await _this.saveTemplate(false);
          }
        }
      }, to, from, next, url);
    }
  }
};
</script>

<style lang="less" scoped>
.template-edit {
  .dividing {
    display: inline-block;
    margin: 0 20px;
    height: 20px;
    width: 0;
    border-right: 1px solid;
	}
  .content {
    .nav-menu {
      padding: 10px 0;
    }
    .btn-list {
      .action-item {
        padding: 10px;
        &.disabled {
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
