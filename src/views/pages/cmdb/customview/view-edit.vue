<template>
  <div>
    <TsContain
      :siderWidth="200"
      :enableCollapse="true"
      :rightWidth="250"
      border="border"
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <TsFormInput
          ref="txtName"
          v-model="viewData.name"
          :width="350"
          border="border"
          :validateList="[{ name: 'required', message: '' }]"
          style="display: inline-block"
          :maxlength="50"
        ></TsFormInput>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span v-if="viewData.type === 'public'" class="action-item"><TsFormSwitch
            v-model="viewData.isActive"
            :true-value="1"
            :false-value="0"
            showStatus
          ></TsFormSwitch></span>
          <span class="action-item tsfont-formtextarea" @click="openCustomTempateDialog">{{ $t('page.customtemplate') }}</span>
          <span class="action-item tsfont-circulation-o" @click="openDisplaySetting">{{ $t('page.displaysetting') }}</span>
          <span class="action-item">
            <Button type="primary" @click="saveView()">{{ $t('page.save') }}</Button>
          </span>
          <span v-if="viewData.id" class="action-item">
            <Button type="error" @click="deleteView()">{{ $t('page.delete') }}</Button>
          </span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="padding">
          <div class="mb-md">
            <TsFormInput
              border="bottom"
              :search="true"
              :placeholder="$t('page.keyword')"
              @on-change="searchCi"
            ></TsFormInput>
          </div>
          <div style="height: calc(100vh - 176px); overflow-y: auto">
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
                        class="mb-md tscard-li ivu-col ivu-col-span-24 ivu-col-span-sm-24 ivu-col-span-lg-24 ivu-col-span-xl-24 ivu-col-span-xxl-24"
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
      </template>
      <template v-slot:content>
        <div ref="divTopo" class="bg-block radius-md" :style="{ height: height + 'px' }">
          <div
            ref="topo"
            style="height: 100%"
            @drop="drop"
            @dragover.prevent
          ></div>
        </div>
      </template>
      <template v-slot:right>
        <div class="margin-md">
          <div v-if="!currentCi.uuid && !currentLink">
            <TsFormItem :label="$t('page.icon')" labelPosition="top">
              <div class="logo bg-block border-color text-primary" @click="isIconDialogShow = true">
                <i class="logo-icon" :class="viewData.icon"></i>
              </div>
            </TsFormItem>
            <TsFormItem v-if="viewData.type === 'public'" :label="$t('page.auth')" labelPosition="top">
              <UserSelect
                v-model="viewData.authList"
                :multiple="true"
                :transfer="true"
                :groupList="['common', 'user', 'role', 'team']"
              ></UserSelect>
            </TsFormItem>
            <!--<TsFormItem label="标签" labelPosition="top">
              <ViewTag ref="tagList" v-model="viewData.tagList" style="display:inline-block"></ViewTag>
            </TsFormItem>-->
            <TsFormItem :label="$t('page.description')" labelPosition="top">
              <TsFormInput v-model="viewData.description" type="textarea"></TsFormInput>
            </TsFormItem>
          </div>
          <div v-if="currentLink">
            <TsFormItem :label="$t('page.linkname')" labelPosition="top">
              <TsFormInput :value="currentLink.name" maxlength="50" @change="changeLinkName"></TsFormInput>
            </TsFormItem>
            <TsFormItem :label="$t('page.linktype')" labelPosition="top">
              <RadioGroup
                v-model="currentLink.type"
                type="button"
                size="small"
                @on-change="changeLinkType"
              >
                <Radio label="Join">{{ $t('term.cmdb.fulljoin') }}</Radio>
                <Radio label="Leftjoin">{{ $t('term.cmdb.leftjoin') }}</Radio>
                <Radio label="Rightjoin">{{ $t('term.cmdb.rightjoin') }}</Radio>
              </RadioGroup>
            </TsFormItem>
          </div>
          <div v-if="currentCi.uuid">
            <TsFormItem :label="$t('term.cmdb.setstartmodel')" labelPosition="left" contentAlign="right">
              <TsFormSwitch
                v-model="currentCi.isStart"
                :true-value="1"
                :false-value="0"
                @on-change="changeStartCi"
              ></TsFormSwitch>
            </TsFormItem>
            <TsFormItem :label="$t('page.ishidden')" labelPosition="left" contentAlign="right">
              <TsFormSwitch
                v-model="currentCi.isHidden"
                :true-value="1"
                :false-value="0"
                @on-change="changeCiIsShow"
              ></TsFormSwitch>
            </TsFormItem>
            <TsFormItem :label="$t('page.alias')" labelPosition="top">
              <TsFormInput v-model="currentCi.alias" @change="changeCiAlias"></TsFormInput>
            </TsFormItem>
            <TsFormItem v-if="(currentCi.ciAttrList && currentCi.ciAttrList.length > 0) || (currentCi.ciRelList && currentCi.ciRelList.length > 0)" :label="$t('term.cmdb.attributelist')" labelPosition="top">
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
                      <td style="vertical-align: top">
                        <i
                          :title="$t('page.attribute')"
                          :class="{
                            'tsfont-blocklist': !attr.targetCiId,
                            'tsfont-arrow-right': !!attr.targetCiId
                          }"
                        ></i>
                      </td>
                      <td>
                        <div>
                          <span>{{ attr.label }}</span>
                          <span class="ml-xs" :class="{ 'tsfont-bind': attr.isSearchAble && attr.canSearch }"></span>
                        </div>
                        <div class="text-grey">{{ attr.name }}</div>
                      </td>
                    </tr>
                    <tr v-for="(rel, rindex) in currentCi.ciRelList" :key="'rel_' + rindex">
                      <td style="vertical-align: top"><Checkbox v-model="rel.isChecked" @on-change="checkRel(rel)"></Checkbox></td>
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
      </template>
    </TsContain>
    <DisplaySetting v-if="isDisplaySettingShow" :viewData="getViewData()" @close="closeDisplaySetting"></DisplaySetting>
    <IconDialog
      v-if="isIconDialogShow"
      :currentIcon="viewData.icon"
      @cancel="(isIconDialogShow = false), (icon = 'tsfont-ci-o')"
      @confirm="selectIcon"
    ></IconDialog>
    <EditCustomTemplate v-if="isCustomTemplateDialogShow" :id="id" @close="isCustomTemplateDialogShow = false"></EditCustomTemplate>
  </div>
</template>
<script>
import './vieweditor/index.js';
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue'),
    DisplaySetting: () => import('./viewdisplay-edit.vue'),
    //ViewTag:()=>import('./view-tag.vue'),
    IconDialog: () => import('../common/icon-dialog.vue'),
    EditCustomTemplate: () => import('./edit-customtemplate-dialog.vue'),
    draggable
  },
  props: {},
  data() {
    const _this = this;
    return {
      id: null,
      height: 200,
      isIconDialogShow: false,
      isCustomTemplateDialogShow: false,
      keyword: '',
      tagList: [],
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
        },
        {
          name: 'lcd',
          label: this.$t('page.updatetime')
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
      viewData: { name: '', description: '', icon: 'tsfont-ci-o', isActive: 1, tagList: [] },
      //viewName: null,
      //description: '',
      //icon: 'tsfont-ci-o',
      topoData: { nodes: [], links: [], groups: [] }
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.name == 'view-edit-public') {
      this.viewData.type = 'public';
    } else {
      this.viewData.type = 'private';
    }
    if (this.$route.params['id']) {
      this.id = parseInt(this.$route.params['id']);
    }
  },
  beforeMount() {},
  mounted() {
    this.searchCiTypeCi();
    this.initTopo();
    window.addEventListener('resize', () => {
      this.calcTopoHeight();
    });
    this.calcTopoHeight();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    calcTopoHeight() {
      this.$nextTick(() => {
        //减去底部的距离
        this.height = window.innerHeight - 18 - (this.$refs.divTopo ? this.$refs.divTopo.getBoundingClientRect().top : 0);
        if (this.$refs.topo) {
          const height = this.height - 5;
          const width = this.$refs.divTopo.offsetWidth;
          if (this.topo) {
            this.topo.setHeight(height);
            this.topo.setWidth(width);
          }
        }
      });
    },
    openCustomTempateDialog() {
      this.isCustomTemplateDialogShow = true;
    },
    openDisplaySetting() {
      const d = this.topo.toJson();
      if (d && d.nodes && d.nodes.find(d => (d.type === 'Attr' && !d.config.targetCiId) || d.type === 'ConstAttr')) {
        this.isDisplaySettingShow = true;
      } else {
        this.$Message.info('请添加模型并选择需要显示的属性');
      }
    },
    searchCi(val) {
      if (val) {
        this.keyword = val.trim();
      } else {
        this.keyword = val;
      }
    },
    selectIcon(icon) {
      this.$set(this.viewData, 'icon', icon);
      this.isIconDialogShow = false;
    },
    initTopo() {
      setTimeout(() => {
        const width = this.$refs.divTopo.offsetWidth;
        const height = this.height - 5;
        this.topo = new Topo(this.$refs.topo, {
          'canvas.width': width,
          'canvas.height': height,
          'canvas.class': 'viewTopo',
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

                const relnode = relNodeList.find(n => n.getConfig()['relId'] === rel.id && n.getConfig()['direction'] === rel.direction);
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
            this.tagList = res.Return.tagList;
            this.topo.fromJson(this.topoData);
          });
        } else {
          this.topo.fromJson(this.topoData);
        }
      }, 100);
    },
    changeCiIsShow(val) {
      if (this.currentCi && this.currentCi.uuid) {
        const node = this.topo.getNodeByUuid(this.currentCi.uuid);
        let conf = node.getConfig();
        conf['isHidden'] = val;
        node.setConfig(conf);
      }
    },
    changeStartCi(val) {
      if (this.currentCi && this.currentCi.uuid) {
        const node = this.topo.getNodeByUuid(this.currentCi.uuid);
        if (val) {
          //将原来的起始模型设为0
          const ciList = this.topo.getNodeByType('Ci');
          ciList.forEach(ci => {
            let conf = ci.getConfig();
            if (conf['isStart']) {
              conf['isStart'] = 0;
            }
            ci.setConfig(conf);
            ci.setIconweight(null);
          });
          node.setIconweight('bold');
        } else {
          node.setIconweight(null);
        }
        let conf = node.getConfig();
        conf['isStart'] = val;
        node.setConfig(conf);
        /*const links = node.getPrevLinks();
        if (links && links.length > 0) {
          links.forEach(link => {
            const fromnode = this.topo.getNodeByUuid(link.getSource());
            const tonode = this.topo.getNodeByUuid(link.getTarget());
            const name = link.getName();
            link.destory(true); //加上true代表不删除关联对象
            fromnode.connect(link.getTAnchor(), fromnode, link.getSAnchor(), tonode, linkType, name);
          });
        }*/
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
    closeDisplaySetting(attrList) {
      this.isDisplaySettingShow = false;
      if (attrList) {
        attrList.forEach(attr => {
          const attrNode = this.topo.getNodeByUuid(attr.uuid);
          const conf = attrNode.getConfig();
          //config: { attrId: attr.id, attrLabel: attr.label, alias: attr.label, isHidden: 0, ciUuid: ciNode.getUuid(), sort: 0 }
          conf.alias = attr.alias;
          conf.name = attr.name;
          conf.sort = attr.sort;
          conf.isHidden = attr.isHidden;
          conf.isPrimary = attr.isPrimary;
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
    saveView() {
      if (this.$refs['txtName'].valid()) {
        this.viewData.config = this.topo.toJson();
        //this.viewData.tagList = this.$refs['tagList'].getTagList();
        this.$api.cmdb.customview.saveCustomView(this.viewData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            if (!this.id) {
              this.$skipHistory();
              this.$router.push({ path: '/view-edit/' + this.viewData.type + '/' + res.Return });
            }
            // 刷新左侧菜单
            this.$store.commit('leftMenu/setCmdbCustomViewCount', 'add');
          } else {
            this.$Message.error('保存失败');
          }
        });
      } else {
        this.$Message.info(this.$t('form.placeholder.pleaseinput', { target: this.$t('term.cmdb.viewname') }));
      }
    },
    deleteView() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('term.cmdb.view') }),
        cancelText: this.$t('page.cancel'),
        btnType: 'error',
        okText: this.$t('page.confirm'),
        'on-ok': vnode => {
          this.$api.cmdb.customview.deleteCustomView(this.viewData.id).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$store.commit('leftMenu/setCmdbCustomViewCount', 'minus');
              if (this.viewData.type == 'private') {
                this.$router.push('/welcome');
              } else if (this.viewData.type == 'public') {
                this.$router.push('/customview-manage');
              }
            }
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
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
    },
    checkConst(constattr) {
      if (constattr.isChecked) {
        this.drawConst(constattr);
      } else {
        this.removeConst(constattr);
      }
    },
    checkRel(rel) {
      if (rel.isChecked) {
        this.drawRel(rel);
      } else {
        this.removeRel(rel);
      }
    },
    drawRel(rel) {
      if (rel.groupUuid) {
        const group = this.topo.getGroupByUuid(rel.groupUuid);
        if (group) {
          const node = this.topo.addNode({
            icon: rel.direction === 'from' ? rel.toLabel : rel.fromLabel,
            shape: 'rect',
            x: 0,
            y: 0,
            type: 'rel',
            config: { relId: rel.id, direction: rel.direction, fromCiId: rel.fromCiId, toCiId: rel.toCiId }
          });
          node.draw();
          //先绘制节点，再加入分组
          rel.uuid = node.getUuid();
          group.addNode(node);
          const offset = 50; //偏移起点
          if (rel.direction === 'from') {
            const ciNode = this.drawCi({ id: rel.toCiId, label: rel.toCiLabel }, group.getX() + group.getWidth() + offset, group.getY());
            node.connect({ dir: 'R' }, ciNode, { dir: 'L' }, node);
          } else {
            const ciNode = this.drawCi({ id: rel.fromCiId, label: rel.fromCiLabel }, group.getX() + group.getWidth() + offset, group.getY());
            node.connect({ dir: 'R' }, ciNode, { dir: 'L' }, node);
          }
          return node;
        }
      }
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
            x: 0,
            y: 0,
            type: 'constattr',
            config: {
              constName: constattr.name,
              attrLabel: constattr.label,
              alias: constattr.label,
              isHidden: 0,
              isPrimary: 0,
              ciUuid: ciNode.getUuid(),
              sort: 0
            }
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
            x: 0,
            y: 0,
            type: 'attr',
            config: {
              attrId: attr.id,
              attrLabel: attr.label,
              targetCiId: attr.targetCiId,
              canLink: attr.isSearchAble && attr.canSearch,
              alias: attr.label,
              isHidden: 0,
              isPrimary: 0,
              ciUuid: ciNode.getUuid(),
              sort: 0
            }
          });
          node.draw();
          //先绘制节点，在加入分组
          group.addNode(node);
          attr.uuid = node.getUuid();
          if (attr.targetCiId) {
            const offset = 50; //偏移起点
            const ciNode = this.drawCi({ id: attr.targetCiId, label: attr.targetCiLabel }, group.getX() + group.getWidth() + offset, group.getY());
            node.connect({ dir: 'R' }, ciNode, { dir: 'L' }, node);
          }
          return node;
        }
      }
    },
    drawCi(ci, x, y) {
      const group = this.topo.addGroup({
        //uuid: 'g_' + ci.id,
        type: 'group',
        x: x,
        y: y
      });
      const index = this.getMaxCiIndex() + 1;
      const node = this.topo.addNode({
        icon: index + '.' + ci.label,
        shape: 'rect',
        x: x,
        y: y,
        type: 'ci',
        config: { ciId: ci.id, ciName: ci.name, ciLabel: ci.label, alias: ci.label, index: index }
      });

      //先绘制节点
      node.draw();
      group.draw();
      group.addNode(node);
      return node;
    },
    searchCiTypeCi() {
      this.$api.cmdb.ci.searchCiTypeCi(this.searchParam).then(res => {
        this.ciTypeList = res.Return;
        this.ciTypeList.forEach(t => {
          t.cardList = t.ciList;
        });
      });
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
    },
    getCiList() {
      const returnList = [];
      if (this.topo) {
        const nodeList = this.topo.getNodeByType('Ci');
        nodeList.forEach(node => {
          const conf = node.getConfig();
          returnList.push({ value: node.getUuid(), text: conf.index + '.' + conf.alias });
        });
      }
      return returnList;
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
  watch: {}
};
</script>
<style lang="less" scoped>
@import './vieweditor/topo.less';
.logo {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: inline-block;
  position: relative;
  border: 1px solid;
  top: -5px;
  text-align: center;
  line-height: 40px;
  .logo-icon {
    font-size: 20px;
    // position: absolute;
    // top: 4px;
    // left: 10px;
  }
  &::after {
    left: 44px;
    width: 40px;
    position: absolute;
    top: 2px;
  }
}

.tstable-body {
  th,
  td {
    padding: 4px;
  }
}
</style>
