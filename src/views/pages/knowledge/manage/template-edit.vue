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
          <div class="action-item last text-action" :class="{disable:disabledBtn.saveTemplate}" @click="saveTemplate">
            <span class="tsfont-save"></span>
            <span :style="{'padding-left': '2px'}">{{ $t('page.save') }}</span>
          </div>
          <div class="action-item last text-action" :class="{'text-grey text-disabled': $route.query.operation!=='edit'}" @click="deleteTemplate">
            <span class="tsfont-trash-s"></span>
            <span :style="{'padding-left': '2px'}">{{ $t('page.delete') }}</span>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div class="content">
          <p class="nav-menu">
            <span class="text-title" :style="{'margin-right': '10px'}">{{ $t('term.knowledge.navigationdirectory') }}</span>
            <span class="text-action" @click="addNode(rootNode, rootNode.children.length, 1)">
              <span class="tsfont-plus"></span>
              <span>{{ $t('term.knowledge.primaryclassification') }}</span>
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
              <div class="btn-list">
                <ul class="action-group">
                  <li class="action-item text-action" @click="addNode(parentNode, index + 1, level)"><span class="tsfont-plus">{{ $t('term.knowledge.samedirectory') }}</span></li>
                  <li class="action-item text-action" :class="{'disabled text-grey' : level >= treeDepth}" @click="addNode(node, node.children.length, level + 1)"><span class="tsfont-plus">{{ $t('page.lowerdirectory') }}</span></li>
                  <li class="action-item text-action" @click="removeNode(parentNode, index)"><span class="tsfont-trash-s">{{ $t('page.delete') }}</span></li>
                </ul>
              </div>
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
    this.content = content || $t('page.catalogue');
    this.config = config || {};
    this.children = children || [];
  }
}
export default {
  name: 'TemplateEdit',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve),
    TsTree: resolve => require(['components/TsTree/TsTree.vue'], resolve)
  },
  data() {
    this.keyConfig = {name: 'content', id: 'uuid'};
    return {
      disabledBtn: {saveTemplate: false},
      rootNode: {
        handler: 'h0',
        children: []
      },
      treeDepth: 2,
      isLoading: false,
      nameValidateList: ['required', 'name-special', {
        name: 'searchUrl', 
        url: 'api/rest/knowledge/template/save',
        key: 'name',
        params: () => ({id: this.rootNode.uuid})
      }]
    };
  },
  created() {
    this.init();
  },
  beforeRouteLeave(from, to, next, url) {
    let isSame = this.$utils.isSame(this.initialTemplate, this.rootNode);
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
  },
  methods: {
    async init() {
      if (this.$route.query.operation === 'add') {
        document.title = this.$t('dialog.title.addtarget', {target: this.$t('page.template')});
        this.rootNode = new Node({
          handler: 'h0', 
          content: this.$route.query.name, 
          children: [new Node()]
        });
        this.initialTemplate = this.$utils.deepClone(this.rootNode);
      } else {
        this.isLoading = true;
        const params = { id: this.$route.query.id };
        const res = await this.$api.knowledge.template.get(params);
        if (res.Status === 'OK') {
          this.isLoading = false;
          let {id, name, content: list} = res.Return.template;
          const children = this.list2forest(JSON.parse(list));
          if (this.$route.query.operation === 'edit') {
            document.title = this.$t('dialog.title.edittarget', {target: this.$t('page.template')});
            this.rootNode = new Node({
              handler: 'h0', 
              uuid: id,
              content: name, 
              children
            });
          } else if (this.$route.query.operation === 'copy') {
            document.title = this.$t('dialog.title.copytarget', {target: this.$t('page.template')});
            this.rootNode = new Node({
              handler: 'h0', 
              uuid: null,
              content: name + '_copy', 
              children
            });
          }
          let _this = this;
          setTimeout(() => {
            this.initialTemplate = _this.$utils.deepClone(_this.rootNode);
          }, 0);
        }
      }
    },
    addNode(parentNode, index, level) {
      if (level > this.treeDepth) return;
      const newNode = new Node({
        handler: 'h' + level
      });
      parentNode.children.splice(index, 0, newNode);
      this.$set(parentNode, 'expand', true);
      this.$nextTick(() => {
        this.$refs['input' + newNode.uuid].$el.querySelector('input').focus();
      });
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
    async saveTemplate(stay = true) {
      const list = this.forest2list(this.rootNode.children);
      if (this.rootNode.content === '') {
        this.$Notice.warning({title: this.$t('form.validate.required', {target: this.$t('page.templatename')})});
        this.$refs['input' + this.rootNode.uuid].$el.querySelector('input').focus();
        return false;
      }
      if (this.rootNode.children.length === 0) {
        this.$Notice.warning({title: this.$t('form.validate.required', {target: this.$t('term.knowledge.navigationdirectory')})});
        return false;
      }
      const params = {
        id: (this.$route.query.operation === 'edit') ? this.$route.query.id : null,
        name: this.rootNode.content,
        content: list
      };
      if (this.disabledBtn.saveTemplate) {
        return;
      }
      this.disabledBtn.saveTemplate = true;
      const res = await this.$api.knowledge.template.save(params).finally(res => {
        this.disabledBtn.saveTemplate = false;
      });
      if (res.Status === 'OK') {
        this.$Message.success(this.$t('message.savesuccess'));
        this.initialTemplate = this.$utils.deepClone(this.rootNode);
        stay && this.$router.push({ name: 'template-edit', query: {id: res.Return.id, operation: 'edit'} });
      }
    },
    async deleteTemplate() {
      if (this.$route.query.operation !== 'edit') return;
      const {uuid, content} = this.rootNode;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: content}),
        btnType: 'error',
        'on-ok': async vnode => {
          const params = { id: uuid };
          const res = await this.$api.knowledge.template.delete(params);
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.$router.push({name: 'template-manage'});
          }
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
  }
};
</script>

<style lang="less" scoped>
.template-edit {
  // /deep/.block-container{
  //   box-shadow: 0px 0px 0px 0px;
  // }
  // /deep/.block-container:hover{
  //   box-shadow:  @default-shadow!important;
  // }
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
