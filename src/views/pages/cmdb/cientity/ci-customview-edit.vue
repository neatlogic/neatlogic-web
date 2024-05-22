<template>
  <div ref="container" class="topo-container" :style="{ height: !id ? 'calc(100vh - 208px)' : 'calc(100vh - 170px)' }">
    <!--:style="{ 'overflow-y': 'auto', 'height': !id ? 'calc(100vh - 330px)' : 'calc(100vh - 210px' }"-->
    <div style="overflow-y: auto">
      <div class="mb-md">
        <TsFormInput border="bottom" :search="true" @on-change="searchCi"></TsFormInput>
      </div>
      <div>
        <div v-for="(ciType, index) in filterCiTypeList" :key="index">
          <div v-if="ciType.ciList && ciType.ciList.length > 0">
            <div class="mb-xs">
              <span class="text-grey">{{ ciType.name }}</span>
            </div>
            <ul v-if="ciType.ciList && ciType.ciList.length > 0" class="tscard-ul ivu-row">
              <draggable :sort="false">
                <transition-group>
                  <li
                    v-for="row in ciType.ciList"
                    :key="row.id"
                    draggable="true"
                    class="mb-xs tscard-li ivu-col ivu-col-span-24 ivu-col-span-sm-24 ivu-col-span-lg-24 ivu-col-span-xl-24 ivu-col-span-xxl-24"
                    @dragstart="drag($event, row)"
                  >
                    <div class="bg-op radius-md padding-xs">
                      <div style="cursor: move; display: grid; grid-template-columns: 35px auto; line-height: 1.6">
                        <div style="text-align: center">
                          <i :class="row.icon" class="text-primary" style="font-size: 20px"></i>
                        </div>
                        <div class="overflow">
                          <div :title="row.label">{{ row.label }}</div>
                          <div class="text-grey fz10" :title="row.name">{{ row.name }}</div>
                        </div>
                      </div>
                    </div>
                  </li>
                </transition-group>
              </draggable>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div ref="topoContainer" style="position: relative" :style="{ height: !id ? 'calc(100vh - 208px)' : 'calc(100vh - 170px)' }">
      <div
        ref="topo"
        style="height: 100%"
        @dragover.prevent
        @drop="drop"
      ></div>
      <div v-if="hasAttr" class="setting-container">
        <span class="tsfont-circulation-o text-href" @click="openDisplaySetting">{{ $t('page.displaysetting') }}</span>
      </div>
      <div v-if="currentLink || currentCi.uuid" class="padding-md shadow bg-op radius-md prop-container">
        <div v-if="currentLink">
          <TsFormItem v-if="currentLink" :label="$t('page.linktype')" labelPosition="top">
            <RadioGroup v-model="currentLink.type" vertical @on-change="changeLinkType">
              <Radio label="Join">{{ $t('term.cmdb.fulljoin') }}</Radio>
              <Radio label="Leftjoin">{{ $t('term.cmdb.leftjoin') }}</Radio>
              <Radio label="Rightjoin">{{ $t('term.cmdb.rightjoin') }}</Radio>
            </RadioGroup>
          </TsFormItem>
        </div>
        <div v-if="currentCi.uuid">
          <TsFormItem
            v-if="!currentCi.isStart"
            labelPosition="left"
            contentAlign="right"
            :label="$t('page.ishidden')"
          >
            <TsFormSwitch
              v-model="currentCi.isHidden"
              :true-value="1"
              :false-value="0"
              @on-change="changeCiIsShow"
            ></TsFormSwitch>
          </TsFormItem>
          <TsFormItem v-if="(currentCi.ciAttrList && currentCi.ciAttrList.length > 0) || (currentCi.ciRelList && currentCi.ciRelList.length > 0)" labelPosition="top" :label="$t('term.cmdb.attributelist')">
            <div class="tstable-container">
              <table v-if="(currentCi.constList && currentCi.constList.length > 0) || (currentCi.ciAttrList && currentCi.ciAttrList.length > 0) || (currentCi.ciRelList && currentCi.ciRelList.length > 0)" class="tstable-body">
                <colgroup>
                  <col />
                  <col />
                  <col width="80%" />
                </colgroup>
                <tbody>
                  <tr v-for="(constattr, cindex) in currentCi.constList" :key="'constattr_' + cindex">
                    <td style="vertical-align: top"><Checkbox v-model="constattr.isChecked" @on-change="checkConst(constattr)"></Checkbox></td>
                    <td style="vertical-align: top"><i :title="$t('term.cmdb.innerproperty')" class="tsfont-type"></i></td>
                    <td>
                      <div>{{ constattr.label }}</div>
                      <div class="text-grey">{{ constattr.name }}</div>
                    </td>
                  </tr>
                  <tr v-for="(attr, aindex) in currentCi.ciAttrList" :key="'attr_' + aindex">
                    <td style="vertical-align: top"><Checkbox v-model="attr.isChecked" @on-change="checkAttr(attr)"></Checkbox></td>
                    <td style="vertical-align: top"><i :title="$t('page.attribute')" class="tsfont-blocklist"></i></td>
                    <td>
                      <div>{{ attr.label }}</div>
                      <div class="text-grey">{{ attr.name }}</div>
                    </td>
                  </tr>
                  <tr v-for="(rel, rindex) in currentCi.ciRelList" :key="'rel_' + rindex">
                    <td style="vertical-align: top"><Checkbox v-model="rel.isChecked" disabled></Checkbox></td>
                    <td style="vertical-align: top"><i :title="rel.direction == 'from' ? $t('term.cmdb.downside') : $t('term.cmdb.upside')" :class="rel.direction == 'from' ? 'tsfont-arrow-down' : 'tsfont-arrow-up'"></i></td>
                    <td v-if="rel.direction == 'from'">
                      <div>{{ rel.toLabel }}</div>
                      <div class="text-grey">{{ rel.toName }}</div>
                    </td>
                    <td v-else>
                      <div>{{ rel.fromLabel }}</div>
                      <div class="text-grey">{{ rel.fromName }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TsFormItem>
        </div>
      </div>
    </div>
    <DisplaySetting v-if="isDisplaySettingShow" :viewData="getViewData()" @close="closeDisplaySetting"></DisplaySetting>
  </div>
</template>
<script>
import '@/views/pages/cmdb/customview/vieweditor/index.js';
import draggable from 'vuedraggable';

export default {
  name: '',
  components: {
    draggable,
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    //TsFormSelect:()=>import('@/resources/plugins/TsForm/TsFormSelect'),
    DisplaySetting: () => import('@/views/pages/cmdb/customview/viewdisplay-edit.vue')
  },
  props: {
    id: { type: Number },
    /*direction: {
      type: String,
      validator(value) {
        const allow = ['from', 'to'];
        return allow.includes(value);
      }
    },*/
    path: { type: Array }
  },
  data() {
    const _this = this;
    return {
      isResizing: false,
      keyword: '',
      hasAttr: false,
      pathData: null, //转换prop中的path数据
      isDisplaySettingShow: false,
      ciTypeList: [], //左边模型类型列表
      currentLink: null, //选中线段
      constList: [
        {
          name: 'id',
          label: 'id'
        },
        {
          name: 'uuid',
          label: 'uuid'
        },
        {
          name: 'ciName',
          label: this.$t('page.model')
        }
      ],
      currentCi: {
        constList: [],
        ciAttrList: [],
        ciRelList: [],
        isHidden: 0,
        isStart: 0,
        uuid: '',
        alias: ''
      },
      viewData: { name: '', description: '', icon: 'tsfont-ci-o', isActive: 1 },
      topoData: { nodes: [], links: [], groups: [] }
    };
  },
  beforeCreate() {},
  created() {
    this.searchCiTypeCi();
  },
  beforeMount() {},
  mounted() {
    this.initTopo();
    window.addEventListener('resize', () => {
      this.isResizing = true;
      this.$nextTick(() => {
        if (this.$refs.topoContainer) {
          const height = this.$refs.topoContainer.offsetHeight;
          const width = this.$refs.topoContainer.offsetWidth;
          if (this.topo) {
            this.topo.setHeight(height);
            this.topo.setWidth(width);
          }
        }
        this.isResizing = false;
      });
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    drag(event, data) {
      event.dataTransfer.setData('ci', JSON.stringify(data));
    },
    drop(event) {
      let ci = event.dataTransfer.getData('ci');
      if (ci) {
        ci = JSON.parse(ci);
        this.drawCi(ci, event.offsetX, event.offsetY);
      }
    },
    searchCiTypeCi() {
      this.$api.cmdb.ci.searchCiTypeCi(this.searchParam).then(res => {
        this.ciTypeList = res.Return;
        this.ciTypeList.forEach(t => {
          t.cardList = t.ciList;
        });
      });
    },
    changeCiIsShow(val) {
      if (this.currentCi && this.currentCi.uuid) {
        const node = this.topo.getNodeByUuid(this.currentCi.uuid);
        let conf = node.getConfig();
        conf['isHidden'] = val;
        node.setConfig(conf);
      }
    },
    openDisplaySetting() {
      this.isDisplaySettingShow = true;
    },
    searchCi(val) {
      if (val) {
        this.keyword = val.trim();
      } else {
        this.keyword = val;
      }
    },
    initTopo() {
      if (!this.topo) {
        setTimeout(() => {
          const width = this.$refs.topoContainer.offsetWidth;
          const height = this.$refs.topoContainer.offsetHeight;
          this.topo = new Topo(this.$refs.topo, {
            'canvas.width': width,
            'canvas.height': height,
            'canvas.class': 'viewTopo',
            'group.deleteable': false,
            'node.deleteable': node => {
              const uuid = node.config.uuid;
              if (uuid && (uuid.toString().startsWith('g_') || uuid.toString().startsWith('ci_'))) {
                return false;
              }
              return true;
            },
            'link.deleteable': false,
            'link.type': 'Join', //默认连线类型是Join
            'anchor.size': 4,
            'node.selectedFn': node => {
              this.currentCi.uuid = node.getUuid();
              this.currentCi.isHidden = node.getConfig()['isHidden'] || 0;
              this.currentCi.alias = node.getConfig()['alias'];
              this.currentCi.isStart = node.getConfig()['isStart'] || 0;
              this.currentCi.constList = this.$utils.deepClone(this.constList);
              const constNodeList = node.group.nodes.filter(n => n.getType() === 'ConstAttr');
              this.currentCi.constList.forEach(constattr => {
                //设置对应分组的uuid
                constattr.groupUuid = node.group.getUuid();
                const attrnode = constNodeList.find(n => n.getConfig()['constName'] == constattr.name);
                if (attrnode) {
                  constattr.uuid = attrnode.getUuid();
                  constattr.isChecked = true;
                }
              });
              const attrNodeList = node.group.nodes.filter(n => n.getType() === 'Attr');
              this.$api.cmdb.ci.getAttrByCiId(node.getConfig()['ciId']).then(res => {
                this.currentCi.ciAttrList = res.Return;
                this.currentCi.ciAttrList.forEach(attr => {
                  //设置对应分组的uuid
                  attr.groupUuid = node.group.getUuid();
                  const attrnode = attrNodeList.find(n => n.getConfig()['attrId'] == attr.id);
                  if (attrnode) {
                    attr.uuid = attrnode.getUuid();
                    attr.isChecked = true;
                  }
                });
              });
              const relNodeList = node.group.nodes.filter(n => n.getType() === 'Rel');
              this.$api.cmdb.ci.getRelByCiId(node.getConfig()['ciId']).then(res => {
                this.currentCi.ciRelList = res.Return;
                this.currentCi.ciRelList.forEach(rel => {
                  //设置对应分组的uuid
                  rel.groupUuid = node.group.getUuid();
                  const relnode = relNodeList.find(n => n.getConfig()['relId'] == rel.id);
                  if (relnode) {
                    rel.uuid = relnode.getUuid();
                    rel.isChecked = true;
                  }
                });
              });
            },
            'node.removeFn': node => {
              if (node.getUuid() == this.currentCi.uuid) {
                this.currentCi.ciAttrList = null;
                this.currentCi.ciRelList = null;
                this.currentCi.uuid = null;
              }
              this.resetCiIndex();
            },
            'node.unselectFn': node => {
              this.currentCi.ciAttrList = null;
              this.currentCi.ciRelList = null;
              this.currentCi.uuid = null;
              this.$forceUpdate();
            },
            'node.clickFn': node => {},
            'link.selectedFn': link => {
              this.currentLink = {};
              Object.assign(this.currentLink, { uuid: link.getUuid(), name: link.getName(), type: link.getType() });
            },
            'link.unselectFn': link => {
              this.currentLink = null;
            },
            'link.removeFn': (link, param) => {
              if (!param) {
                const targetNode = link.canvas.getNodeByUuid(link.getTarget());
                if (targetNode && targetNode.getType() === 'Ci') {
                  targetNode.destory();
                }
              }
            }
          });
          this.topo.draw();
          if (this.id) {
            this.$api.cmdb.customview.getCustomViewById(this.id).then(res => {
              Object.assign(this.viewData, res.Return);
              //this.viewName = res.Return.name;
              //this.icon = res.Return.icon || ;
              //this.description = res.Return.description;
              //this.isActive = res.Return.isActive;
              this.topoData = res.Return.config;
              this.topo.fromJson(this.topoData);
              this.checkHasAttr();
            });
          } else {
            this.topo.fromJson(this.topoData);
          }
        }, 100);
      }
    },
    changeCiAlias(val) {
      if (this.currentCi && this.currentCi.uuid) {
        const node = this.topo.getNodeByUuid(this.currentCi.uuid);
        let conf = node.getConfig();
        if (val != '') {
          conf['alias'] = val;
        } else {
          conf['alias'] = conf['ciLabel'];
        }
        node.setConfig(conf);
        node.setIcon(conf['index'] + '.' + conf['alias']);
      }
    },
    closeDisplaySetting(attrList) {
      this.isDisplaySettingShow = false;
      if (attrList) {
        attrList.forEach(attr => {
          const attrNode = this.topo.getNodeByUuid(attr.uuid);
          const conf = attrNode.getConfig();
          //config: { attrId: attr.id, attrLabel: attr.label, alias: attr.label, isHidden: 0, ciUuid: ciNode.getUuid(), sort: 0 }
          conf.alias = attr.alias;
          conf.sort = attr.sort;
          conf.isHidden = attr.isHidden;
          conf.condition = attr.condition;
          attrNode.setConfig(conf);
        });
      }
    },
    changeLinkName(val) {
      if (this.topo && this.currentLink) {
        const link = this.topo.getLinkByUuid(this.currentLink.uuid);
        link.setName(val);
      }
    },
    changeLinkType(linkType) {
      if (this.topo && this.currentLink) {
        const link = this.topo.getLinkByUuid(this.currentLink.uuid);
        const fromnode = this.topo.getNodeByUuid(link.getSource());
        const tonode = this.topo.getNodeByUuid(link.getTarget());
        const name = link.getName();
        link.destory(true); //加上true代表不删除关联对象
        const newlink = fromnode.connect(link.getSAnchor(), tonode, link.getTAnchor(), fromnode, linkType, name);
        this.currentLink = null;
        if (newlink) {
          newlink.select();
        }
      }
    },
    getViewData() {
      if (this.topo) {
        return this.topo.toJson();
      }
      return null;
    },
    checkAttr(attr) {
      if (attr.isChecked) {
        this.drawAttr(attr);
      } else {
        this.removeAttr(attr);
      }
      this.checkHasAttr();
    },
    checkConst(constattr) {
      if (constattr.isChecked) {
        this.drawConst(constattr);
      } else {
        this.removeConst(constattr);
      }
      this.checkHasAttr();
    },
    checkHasAttr() {
      this.hasAttr = false;
      if (this.topo) {
        const d = this.topo.toJson();
        if (d && d.nodes && d.nodes.find(d => d.type === 'Attr' || d.type === 'ConstAttr')) {
          this.hasAttr = true;
        }
      }
    },
    drawRelEnd(ciRel) {
      const group = this.topo.getGroupByUuid('g_' + ciRel.ciId);
      if (group) {
        let node = this.topo.getNodeByUuid(ciRel.relId);
        if (!node) {
          node = this.topo.addNode({
            uuid: ciRel.relId,
            icon: ciRel.relLabel,
            deleteable: false,
            shape: 'rect',
            x: 0,
            y: 0,
            type: 'rel',
            config: {
              relId: ciRel.relId,
              direction: ciRel.direction,
              fromCiId: ciRel.ciId,
              toCiId: ciRel.targetCiId
            }
          });
          node.draw();
          //先绘制节点，再加入分组
          group.addNode(node);
        }
        const offset = 50; //偏移起点
        const ciNode = this.drawCiRelEnd(ciRel, group.getOriginalX() + group.getWidth() + offset, group.getOriginalY());
        node.connect({ dir: 'R' }, ciNode, { dir: 'L' }, node);
        return node;
      }
    },
    drawRel(ciRel) {
      const group = this.topo.getGroupByUuid('g_' + ciRel.ciId);
      if (group) {
        let node = this.topo.getNodeByUuid(ciRel.relId);
        if (!node) {
          node = this.topo.addNode({
            uuid: ciRel.relId,
            icon: ciRel.relLabel,
            deleteable: false,
            shape: 'rect',
            x: 0,
            y: 0,
            type: 'rel',
            config: {
              relId: ciRel.relId,
              direction: ciRel.direction,
              fromCiId: ciRel.direction == 'from' ? ciRel.ciId : ciRel.next.ciId,
              toCiId: ciRel.direction == 'from' ? ciRel.next.ciId : ciRel.ciId
            }
          });
          node.draw();
          //先绘制节点，再加入分组
          group.addNode(node);
        }
        const offset = 50; //偏移起点
        const ciNode = this.drawCiRel(ciRel.next, group.getOriginalX() + group.getWidth() + offset, group.getOriginalY());
        node.connect({ dir: 'R' }, ciNode, { dir: 'L' }, node);
        return node;
      }
    },
    drawCiRelEnd(ciRel, x, y) {
      let group = this.topo.getGroupByUuid('g_' + ciRel.targetCiId);
      let hasGroup = true;
      let hasNode = true;
      if (!group) {
        hasGroup = false;
        group = this.topo.addGroup({
          uuid: 'g_' + ciRel.targetCiId,
          type: 'group',
          x: x,
          y: y
        });
      }
      let node = this.topo.getNodeByUuid('ci_' + ciRel.targetCiId);
      if (!node) {
        hasNode = false;
        const index = this.getMaxCiIndex() + 1;
        node = this.topo.addNode({
          icon: index + '.' + ciRel.targetCiLabel,
          uuid: 'ci_' + ciRel.targetCiId,
          shape: 'rect',
          x: x,
          y: y,
          type: 'ci',
          config: { ciId: ciRel.targetCiId, ciName: ciRel.targetCiName, ciLabel: ciRel.targetCiLabel, alias: ciRel.targetCiLabel, index: index }
        });
        group.addNode(node);
      }
      if (!hasNode) {
        //先绘制节点
        node.draw();
      }
      if (!hasGroup) {
        group.draw();
      }
      if (ciRel.next) {
        this.drawRel(ciRel);
      } else {
        //
      }
      return node;
    },
    removeRel(rel) {
      const node = this.topo.getNodeByUuid(rel.uuid);
      if (node) {
        node.destory();
      }
    },
    drawConst(constattr) {
      if (constattr.groupUuid) {
        const group = this.topo.getGroupByUuid(constattr.groupUuid);
        if (group) {
          let ciNode = group.getNodeByType('Ci');
          if (ciNode && ciNode.length > 0) {
            ciNode = ciNode[0];
          }
          const node = this.topo.addNode({
            icon: constattr.label,
            shape: 'rect',
            connectable: false,
            x: 0,
            y: 0,
            type: 'constattr',
            config: { constName: constattr.name, attrLabel: constattr.label, alias: constattr.label, isHidden: 0, ciUuid: ciNode.getUuid(), sort: 0 }
          });
          node.draw();
          //先绘制节点，在加入分组
          group.addNode(node);
          constattr.uuid = node.getUuid();
          return node;
        }
      }
    },
    removeConst(constattr) {
      const node = this.topo.getNodeByUuid(constattr.uuid);
      if (node) {
        node.destory();
      }
    },
    removeAttr(attr) {
      const node = this.topo.getNodeByUuid(attr.uuid);
      if (node) {
        node.destory();
      }
    },
    drawAttr(attr) {
      if (attr.groupUuid) {
        const group = this.topo.getGroupByUuid(attr.groupUuid);
        if (group) {
          let ciNode = group.getNodeByType('Ci');
          if (ciNode && ciNode.length > 0) {
            ciNode = ciNode[0];
          }
          const node = this.topo.addNode({
            icon: attr.label,
            shape: 'rect',
            //connectable: false,
            x: 0,
            y: 0,
            type: 'attr',
            config: { attrId: attr.id, attrLabel: attr.label, alias: attr.label, isHidden: 0, ciUuid: ciNode.getUuid(), sort: 0 }
          });
          node.draw();
          //先绘制节点，在加入分组
          group.addNode(node);
          attr.uuid = node.getUuid();
          return node;
        }
      }
    },
    drawCi(ci, x, y) {
      const group = this.topo.addGroup({
        type: 'group',
        deleteable: true,
        x: x,
        y: y
      });
      const index = this.getMaxCiIndex() + 1;
      const node = this.topo.addNode({
        icon: index + '.' + ci.label,
        shape: 'rect',
        deleteable: true,
        x: x,
        y: y,
        type: 'ci',
        config: { ciId: ci.id, ciName: ci.name, ciLabel: ci.label, alias: ci.label, index: index }
      });
      group.addNode(node);
      //先绘制节点
      node.draw();
      group.draw();
      return node;
    },
    drawCiRel(ciRel, x, y, isStart) {
      let group = this.topo.getGroupByUuid('g_' + ciRel.ciId);
      let hasGroup = true;
      let hasNode = true;
      if (!group) {
        hasGroup = false;
        group = this.topo.addGroup({
          uuid: 'g_' + ciRel.ciId,
          type: 'group',
          x: x,
          y: y
        });
      }
      let node = this.topo.getNodeByUuid('ci_' + ciRel.ciId);
      if (!node) {
        hasNode = false;
        const index = this.getMaxCiIndex() + 1;
        node = this.topo.addNode({
          icon: index + '.' + ciRel.ciLabel,
          uuid: 'ci_' + ciRel.ciId,
          shape: 'rect',
          x: x,
          y: y,
          type: 'ci',
          config: { ciId: ciRel.ciId, ciName: ciRel.ciName, ciLabel: ciRel.ciLabel, alias: ciRel.ciLabel, index: index }
        });
        if (isStart) {
          let conf = node.getConfig();
          conf['isStart'] = 1;
          node.setConfig(conf);
          node.setIconweight('bold');
        }
        group.addNode(node);
      }
      if (!hasNode) {
        //先绘制节点
        node.draw();
      }
      if (!hasGroup) {
        group.draw();
      }
      if (ciRel.next) {
        this.drawRel(ciRel);
      } else {
        this.drawRelEnd(ciRel);
      }
      return node;
    },
    getMaxCiIndex() {
      let index = 0;
      if (this.topo) {
        const nodeList = this.topo.getNodeByType('Ci');
        index = nodeList.length;
      }
      return index;
    },
    resetCiIndex() {
      const nodeList = this.topo.getNodeByType('Ci');
      const tmpList = new Array();
      nodeList.forEach(node => {
        tmpList.push({ uuid: node.getUuid(), index: node.getConfig()['index'] });
      });
      tmpList.sort((a, b) => {
        return a.index - b.index;
      });
      for (let i = 0; i < tmpList.length; i++) {
        const tmp = tmpList[i];
        const node = this.topo.getNodeByUuid(tmp.uuid);
        const conf = node.getConfig();
        conf['index'] = i + 1;
        node.setConfig(conf);
        node.setIcon(conf['index'] + '.' + conf['alias']);
      }
    }
  },
  filter: {},
  computed: {
    filterCiTypeList() {
      if (!this.keyword) {
        return this.ciTypeList;
      } else {
        const filterCiTypeList = JSON.parse(JSON.stringify(this.ciTypeList));
        filterCiTypeList.forEach(type => {
          if (type.ciList && type.ciList.length > 0) {
            type.ciList = type.ciList.filter(ci => ci.label.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1 || ci.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1);
          }
        });
        return filterCiTypeList;
      }
    }
  },
  watch: {
    path: {
      handler: function(val) {
        if (val && val.length > 0) {
          let path = this.$utils.deepClone(val);
          if (path && path.length > 0) {
            this.pathData = path[0];
            let p = this.pathData;
            for (let i = 1; i < path.length; i++) {
              p.next = path[i];
              p = p.next;
            }
          }
          if (this.topo.groups && this.topo.groups.length > 0) {
            this.topo.groups.forEach(group => {
              if (!val.find(d => d.ciId == group.getUuid().replace('g_', ''))) {
                group.destory();
              }
            });
          }
          //this.topo.clear();
          this.drawCiRel(this.pathData, 100, 50, true);
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/views/pages/cmdb/customview/vieweditor/topo.less';
.tstable-body {
  th,
  td {
    padding: 4px;
  }
}
.topo-container {
  display: grid;
  width: 100%;
  grid-template-columns: 150px auto;
}
.setting-container {
  position: absolute;
  top: 0px;
  right: 10px;
}
.prop-container {
  opacity: 0.8;
  position: absolute;
  right: 10px;
  top: 30px;
  width: 200px;
  height: calc(100% - 30px);
  overflow: auto;
  -webkit-user-select: none;
  user-select: none;
}
</style>
