<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div class="bg-block radius-lg pt-lg pr-lg pl-lg pb-xs mb-lg">
          <div class="tsForm tsForm-border-border ivu-form-label-right">
            <Collapse v-model="openPanel" simple>
              <Panel v-for="elementType in elementTypeList" :key="elementType.type" :name="elementType.type">
                {{ elementType.label }}
                <div
                  v-if="elementType.elementList.length > 0"
                  slot="content"
                  style="margin: 0 auto"
                  class="pt-lg"
                >
                  <div v-for="(e, index) in elementType.elementList" :key="index" style="margin: 0 auto; width: 100%">
                    <div v-if="e.type === 'attr'">
                      <div
                        v-if="e.element.canInput"
                        class="ivu-form-item tsform-item ivu-form-label-right"
                        :class="e.element.isRequired ? 'ivu-form-item-required' : ''"
                        style="width: 100%"
                      >
                        <label class="ivu-form-item-label overflow" style="width: 200px">
                          <div>
                            {{ e.element.label }}
                            <Checkbox v-model="checkData['attr_' + e.element.id]" class="ml-md"></Checkbox>
                          </div>
                        </label>
                        <div class="ivu-form-item-content" style="margin-left: 200px !important">
                          <AttrInputer
                            ref="attrHandler"
                            :disabled="!checkData['attr_' + e.element.id] ? true : false"
                            :allowBatchAdd="allowBatchAdd"
                            :attrEntity="ciEntityData.attrEntityData['attr_' + e.element.id]"
                            :attrData="e.element"
                            :valueList="getValueList(ciEntityData.attrEntityData, e.element)"
                            @setData="setAttrData(e.element, arguments[0], arguments[1])"
                            @new="addNewAttrEntity(e.element)"
                            @edit="editNewAttrEntity($event)"
                            @delete="deleteAttrEntity('attr_' + e.element.id, $event)"
                            @select="selectAttrEntity('attr_' + e.element.id, $event)"
                          ></AttrInputer>
                        </div>
                      </div>
                    </div>
                    <div v-else-if="e.type === 'global'">
                      <div class="ivu-form-item tsform-item ivu-form-label-right" style="width: 100%">
                        <label class="ivu-form-item-label overflow" style="width: 200px">
                          <div>
                            {{ e.element.label }}
                            <Checkbox v-model="checkData['global_' + e.element.id]" class="ml-md"></Checkbox>
                          </div>
                        </label>
                        <div class="ivu-form-item-content" style="margin-left: 200px !important">
                          <!--<TsFormRadio
                        v-if="!e.element.isMultiple"
                        :disabled="!checkData['global_' + e.element.id] ? true : false"
                        :allowToggle="true"
                        :dataList="e.element.itemList"
                        valueName="id"
                        textName="value"
                        @change="
                          (val, opt) => {
                            if (opt) {
                              setGlobalAttrData(e.element, [opt]);
                            } else {
                              setGlobalAttrData(e.element, []);
                            }
                          }
                        "
                      ></TsFormRadio>
                      <TsFormCheckbox
                        v-if="!!e.element.isMultiple"
                        :disabled="!checkData['global_' + e.element.id] ? true : false"
                        :dataList="e.element.itemList"
                        valueName="id"
                        textName="value"
                        @change="(val, opt) => setGlobalAttrData(e.element, opt)"
                      ></TsFormCheckbox>-->
                          <TsFormSelect
                            dynamicUrl="/api/rest/cmdb/globalattritem/search"
                            transfer
                            :disabled="!checkData['global_' + e.element.id] ? true : false"
                            :params="{ attrId: e.element.id }"
                            valueName="id"
                            textName="value"
                            :multiple="e.element.isMultiple ? true : false"
                            border="border"
                            @change="
                              (val, opt, item) => {
                                if (opt) {
                                  setGlobalAttrData(e.element, e.element.isMultiple ? item : [item]);
                                } else {
                                  setGlobalAttrData(e.element, []);
                                }
                              }
                            "
                          ></TsFormSelect>
                        </div>
                      </div>
                    </div>
                    <div v-if="e.type === 'rel'">
                      <div class="ivu-form-item tsform-item ivu-form-label-right" :class="(e.element.direction == 'from' && e.element.toIsRequired) || (e.element.direction == 'to' && e.element.fromIsRequired) ? 'ivu-form-item-required' : ''" style="width: 100%">
                        <label class="ivu-form-item-label overflow" style="width: 200px">
                          <div v-if="e.element.direction == 'from'">
                            {{ e.element.toLabel }}
                            <Checkbox v-model="checkData['relfrom_' + e.element.id]" class="ml-md"></Checkbox>
                          </div>
                          <div v-else-if="e.element.direction == 'to'">
                            {{ e.element.fromLabel }}
                            <Checkbox v-model="checkData['relto_' + e.element.id]" class="ml-md"></Checkbox>
                          </div>
                        </label>
                        <div class="ivu-form-item-content" style="margin-left: 200px !important">
                          <div v-if="isRelShow(e.element)">
                            <span>
                              <a href="javascript:void(0)" :class="!checkData['rel' + e.element.direction + '_' + e.element.id] ? 'text-disabled' : ''" @click="addRelEntity(e.element)">
                                <i class="tsfont-check"></i>
                                {{ $t('page.choose') }}
                              </a>
                            </span>
                            <span>
                              <a v-if="allowBatchAdd && ((e.element.direction == 'from' && e.element.toAllowInsert) || (e.element.direction == 'to' && e.element.fromAllowInsert))" href="javascript:void(0)" @click="addNewRelEntity(e.element)">
                                <i class="tsfont-plus"></i>
                                {{ $t('page.add') }}
                              </a>
                            </span>
                            <Poptip v-model="isRelPopShow[e.element.id + '_' + e.element.direction]" placement="right">
                              <a></a>
                              <div slot="content">
                                <div v-if="relCiList" :style="'width:' + Math.min(450, relCiList.length * 90) + 'px'">
                                  <div
                                    v-for="relci in relCiList"
                                    :key="relci.id"
                                    style="text-align: center; margin-right: 10px; float: left; cursor: pointer; width: 80px"
                                    @click="newCiEntity(e.element, relci.id)"
                                  >
                                    <div>
                                      <a href="javascript:void(0)"><i style="font-size: 20px" :class="relci.icon"></i></a>
                                    </div>
                                    <div>
                                      <a href="javascript:void(0)">{{ relci.label }}</a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Poptip>
                          </div>
                          <div v-if="ciEntityData.relEntityData && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id] && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id]['valueList']">
                            <div>
                              <TsFormRadio
                                :value="ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id] ? ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id].action : 'insert'"
                                :dataList="[
                                  { value: 'insert', text: $t('page.append') },
                                  { value: 'replace', text: $t('page.replace') }
                                ]"
                                @change="val => changeRelAction(e.element, val)"
                              ></TsFormRadio>
                            </div>
                            <div>
                              <Tag
                                v-for="(relentity, reindex) in ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id]['valueList']"
                                :key="reindex"
                                :color="getTagType(relentity)"
                                type="dot"
                                size="large"
                                :closable="relentity.ciEntityId || relentity.type == 'new' ? true : false"
                                :style="getTagType(relentity) == 'success' ? 'cursor:pointer' : ''"
                                @click.native="editNewRelEntity(relentity)"
                                @on-close="delRelEntity('rel' + e.element.direction + '_' + e.element.id, relentity)"
                              >{{ relentity.ciEntityName }}</Tag>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
              <Panel name="description">
                {{ $t('term.cmdb.changememo') }}
                <div slot="content" class="pt-lg" style="margin: 0 auto">
                  <TsFormItem :label="$t('term.cmdb.changememo')">
                    <TsFormInput v-model="ciEntityData.description" type="textarea" maxlength="500"></TsFormInput>
                  </TsFormItem>
                </div>
              </Panel>
              <Panel v-if="ciEntityList && ciEntityList.length > 0" name="cientitylist">
                {{ $t('term.cmdb.affectcientity') }}
                <div slot="content" class="pt-lg pb-lg" style="margin: 0 auto">
                  <Tag
                    v-for="cientity in ciEntityList"
                    :key="cientity.id" 
                    closable
                    @on-close="removeCiEntity(cientity)"
                  >{{ cientity.name }}</Tag>
                </div>
              </Panel>
            </Collapse>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button class="ml-md" type="default" @click="close">{{ $t('page.cancel') }}</Button>
        <Button
          v-if="ciData.authData && (ciData.authData.cimanage || ciData.authData.cientityupdate)"
          class="ml-md"
          ghost
          type="primary"
          @click="save(false)"
        >{{ $t('page.savetransaction') }}</Button>
        <Button
          v-if="ciData.authData && (ciData.authData.cimanage || (ciData.authData.cientityupdate && ciData.authData.transactionmanage))"
          class="ml-md"
          type="primary"
          @click="save(true)"
        >{{ $t('page.savecommittransaction') }}</Button>
      </template>
    </TsDialog>
    <CiEntityChoose
      v-if="isCiEntityChooseShow"
      :ciId="targetCiId"
      @close="isCiEntityChooseShow = false"
      @confirm="getCheckCiEntity"
    ></CiEntityChoose>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    AttrInputer: () => import('./attr-inputer.vue'),
    CiEntityChoose: () => import('./cientity-choose.vue'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    mode: { type: String, default: 'window' },
    saveMode: { type: String, default: 'save' },
    ciId: { type: Number },
    ciEntityList: { type: Array }
  },
  data() {
    return {
      openPanel: ['global', 'unique', 'manual', 'description', 'cientitylist'],
      dialogConfig: {
        title: this.$t('page.batchedit'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      checkData: {},
      ciData: {},
      ciEntityData: {
        attrEntityData: {},
        relEntityData: {}
      },
      allowBatchAdd: false, //允许在编辑过程中添加引用配置项
      elementList: [],
      uniqueList: [],
      isCiEntityChooseShow: false,
      relCiList: [], //关系的所有下游模型列表
      isRelPopShow: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeRelAction(element, val) {
      if (this.ciEntityData.relEntityData['rel' + element.direction + '_' + element.id]) {
        this.$set(this.ciEntityData.relEntityData['rel' + element.direction + '_' + element.id], 'action', val);
      } else {
        this.ciEntityData.relEntityData['rel' + element.direction + '_' + element.id] = { action: val };
      }
    },
    save(needCommit) {
      const params = {
        ciId: this.ciId,
        ciEntityIdList: this.ciEntityList.map(c => c.id),
        attrEntityData: {},
        relEntityData: {},
        globalAttrEntityData: {},
        needCommit: needCommit,
        description: this.ciEntityData.description
      };
      for (let k in this.checkData) {
        if (this.checkData[k]) {
          if (this.ciEntityData.attrEntityData[k]) {
            params.attrEntityData[k] = this.ciEntityData.attrEntityData[k];
          } else if (this.ciEntityData.relEntityData[k]) {
            params.relEntityData[k] = this.ciEntityData.relEntityData[k];
            if (params.relEntityData[k].action && params.relEntityData[k].valueList && params.relEntityData[k].valueList.length > 0) {
              params.relEntityData[k].valueList.forEach(v => {
                v.action = params.relEntityData[k].action;
              });
            }
          } else if (this.ciEntityData.globalAttrEntityData[k]) {
            params.globalAttrEntityData[k] = this.ciEntityData.globalAttrEntityData[k];
          }
        }
      }
      let hasChange = false;
      for (let k in params.attrEntityData) {
        if (params.attrEntityData[k].valueList && params.attrEntityData[k].valueList.length > 0) {
          hasChange = true;
        }
      }
      for (let k in params.relEntityData) {
        if (params.relEntityData[k].valueList && params.relEntityData[k].valueList.length > 0) {
          hasChange = true;
        }
      }
      for (let k in params.globalAttrEntityData) {
        if (params.globalAttrEntityData[k].valueList && params.globalAttrEntityData[k].valueList.length > 0) {
          hasChange = true;
        }
      }
      if (hasChange) {
        this.$api.cmdb.cientity.batchUpdateCiEntity(params).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
            this.close(true);
          }
        });
      } else {
        this.$Message.info(this.$t('term.cmdb.nochange'));
      }
    },
    setGlobalAttrData(attr, opt) {
      if (!this.ciEntityData.globalAttrEntityData) {
        this.ciEntityData.globalAttrEntityData = {};
      }
      if (!this.ciEntityData.globalAttrEntityData['global_' + attr.id]) {
        this.ciEntityData.globalAttrEntityData['global_' + attr.id] = {};
      }
      this.$set(this.ciEntityData.globalAttrEntityData['global_' + attr.id], 'valueList', opt);
    },
    setAttrData(attr, value, actualValue) {
      if (!this.ciEntityData.attrEntityData) {
        this.ciEntityData.attrEntityData = {};
      }
      if (!this.ciEntityData.attrEntityData['attr_' + attr.id]) {
        this.ciEntityData.attrEntityData['attr_' + attr.id] = {};
      }
      this.$set(this.ciEntityData.attrEntityData['attr_' + attr.id], 'config', attr.config);
      this.$set(this.ciEntityData.attrEntityData['attr_' + attr.id], 'type', attr.type);
      this.$set(this.ciEntityData.attrEntityData['attr_' + attr.id], 'valueList', value);
      this.$set(this.ciEntityData.attrEntityData['attr_' + attr.id], 'actualValueList', actualValue);
    },
    addRelEntity(rel) {
      if (this.checkData['rel' + rel.direction + '_' + rel.id]) {
        this.currentRel = rel;
        if (rel.direction == 'from') {
          //当前配置项在from位置
          this.targetCiId = rel.toCiId;
        } else if (rel.direction == 'to') {
          //当前配置项在to位置
          this.targetCiId = rel.fromCiId;
        }
        this.isCiEntityChooseShow = true;
      }
    },
    getValueList(data, attr) {
      const id = attr.id;
      if (!data['attr_' + id]) {
        this.$set(data, 'attr_' + id, { type: attr.type, config: attr.config, valueList: [] });
      } else if (!data['attr_' + id]['valueList']) {
        this.$set(data['attr_' + id], 'valueList', []);
      }
      return data['attr_' + id]['valueList'];
    },
    isRelShow(rel) {
      if (this.ciEntityData['_disableRel'] && this.ciEntityData['_disableRel'] == 'rel' + rel.direction + '_' + rel.id) {
        return false;
      } else {
        const rule = rel.direction == 'from' ? rel.toRule : rel.fromRule;
        if (rule == 'O' && this.ciEntityData.relEntityData && this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id] && this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id]['valueList'].length > 0) {
          return false;
        }
      }
      return true;
    },
    async getCiUniqueByCiId(ciId) {
      let uniqueList = [];
      await this.$api.cmdb.ci.getCiUniqueByCiId(ciId).then(res => {
        uniqueList = res.Return;
      });
      return uniqueList;
    },
    async init() {
      await this.getCiById(this.ciId);
      this.elementList = await this.getElementByCiId(this.ciId);
      this.uniqueList = await this.getCiUniqueByCiId(this.ciId);
    },
    async getCiById(ciId) {
      await this.$api.cmdb.ci.getCiById(ciId, { needAction: true }).then(res => {
        this.ciData = res.Return;
      });
    },
    async getAttrByCiId(ciId) {
      if (ciId) {
        let attrList;
        await this.$api.cmdb.ci.getAttrByCiId(ciId, { needAlias: 1 }).then(res => {
          attrList = res.Return;
        });
        return attrList;
      }
    },
    async getRelByCiId(ciId) {
      if (ciId) {
        let relList;
        await this.$api.cmdb.ci.getRelByCiId(ciId, { needAction: true }).then(res => {
          relList = res.Return;
        });
        return relList;
      }
    },
    async getGlobalAttrByCiId(ciId) {
      let globalAttrList;
      await this.$api.cmdb.ci.getGlobalAttrByCiId(ciId, { isActive: 1, allowEdit: 1 }).then(res => {
        globalAttrList = res.Return;
      });
      return globalAttrList;
    },
    async getCiViewByCiId(ciId) {
      if (ciId) {
        let ciViewList;
        await this.$api.cmdb.ci.getCiViewByCiId(ciId).then(res => {
          ciViewList = res.Return;
        });
        return ciViewList;
      }
    },
    async getElementByCiId(ciId) {
      const attrList = await this.getAttrByCiId(ciId);
      const relList = await this.getRelByCiId(ciId);
      const globalAttrList = await this.getGlobalAttrByCiId(ciId);
      const ciViewList = await this.getCiViewByCiId(ciId);
      const elementList = [];
      ciViewList.forEach((e, index) => {
        if (e.type == 'attr') {
          const attr = attrList.find(a => a.id == e.itemId);
          if (attr) {
            elementList.push({ type: 'attr', element: attr });
          }
        } else if (e.type == 'relfrom') {
          const rel = relList.find(a => a.direction == 'from' && a.id == e.itemId);
          if (rel) {
            elementList.push({ type: 'rel', element: rel });
          }
        } else if (e.type == 'relto') {
          const rel = relList.find(a => a.direction == 'to' && a.id == e.itemId);
          if (rel) {
            elementList.push({ type: 'rel', element: rel });
          }
        } else if (e.type === 'global') {
          const globalattr = globalAttrList.find(a => a.id == e.itemId);
          if (globalattr) {
            elementList.push({ type: 'global', element: globalattr });
          }
        }
      });
      return elementList;
    },
    //删除选中的属性
    deleteAttrEntity(key, attrentity) {
      //删除引用属性
      if (this.ciEntityData.attrEntityData[key] && this.ciEntityData.attrEntityData[key]['valueList']) {
        let valueList = this.ciEntityData.attrEntityData[key]['valueList'];
        // const index = valueList.findIndex(v => v.uuid == attrentity.uuid || v.id == attrentity.id);
        // if (index > -1) {
        let j = 0;
        valueList.forEach((v, i) => {
          if (typeof v == 'string' || typeof v == 'number') {
            if (v == attrentity.uuid || v == attrentity.id) {
              j = i;
            }
          }

          if (typeof v == 'object') {
            if (v.uuid == attrentity.uuid || v.id == attrentity.id) {
              j = i;
            }
          }
        });
        this.$delete(this.ciEntityData.attrEntityData[key]['valueList'], j);
        // this.$delete(this.ciEntityData.attrEntityData[key]['valueList'], index);
        this.$emit('remove', attrentity);
        // }
      }
    },
    //选择属性
    selectAttrEntity(key, attrentity) {
      if (!this.ciEntityData.attrEntityData[key]) {
        const vo = {};
        vo[key] = { valueList: [] };
        Object.assign(this.ciEntityData.attrEntityData, vo);
      } else if (!this.ciEntityData.attrEntityData[key]['valueList']) {
        Object.assign(this.ciEntityData.attrEntityData[key], { valueList: [] });
      }
      let valueList = this.ciEntityData.attrEntityData[key]['valueList'];
      if (valueList.findIndex(v => (typeof v == 'object' && (v.uuid == attrentity.uuid || v.id == attrentity.id)) || (typeof v == 'number' && v == attrentity.id)) == -1) {
        this.ciEntityData.attrEntityData[key]['valueList'].push(attrentity);
      }
    },
    getCheckCiEntity(ciEntityList) {
      this.isCiEntityChooseShow = false;
      if (this.currentRel) {
        if (ciEntityList) {
          if (!this.ciEntityData.relEntityData) {
            this.$set(this.ciEntityData, 'relEntityData', {});
          }
          if (!this.ciEntityData.relEntityData['rel' + this.currentRel.direction + '_' + this.currentRel.id]) {
            this.$set(this.ciEntityData.relEntityData, 'rel' + this.currentRel.direction + '_' + this.currentRel.id, { valueList: [] });
          }
          ciEntityList.forEach(element => {
            const cientity = {
              ciId: element.ciId,
              ciEntityId: element.id,
              ciEntityName: element.name
            };
            let isExists = false;
            for (let i = 0; i < this.ciEntityData.relEntityData['rel' + this.currentRel.direction + '_' + this.currentRel.id]['valueList'].length; i++) {
              const oldelement = this.ciEntityData.relEntityData['rel' + this.currentRel.direction + '_' + this.currentRel.id]['valueList'][i];
              if (oldelement.ciEntityId == cientity.ciEntityId) {
                isExists = true;
                break;
              }
            }
            if (!isExists) {
              this.ciEntityData.relEntityData['rel' + this.currentRel.direction + '_' + this.currentRel.id]['valueList'].push(cientity);
            }
          });
        }
        this.currentRel = null;
      }
    },
    delRelEntity(key, relentity) {
      if (this.ciEntityData.relEntityData[key] && this.ciEntityData.relEntityData[key]['valueList']) {
        for (let i = this.ciEntityData.relEntityData[key]['valueList'].length - 1; i >= 0; i--) {
          if (this.ciEntityData.relEntityData[key]['valueList'][i] == relentity) {
            this.$delete(this.ciEntityData.relEntityData[key]['valueList'], i);
            this.$forceUpdate();
            this.$emit('remove', relentity); //删除新配置项数据，如果是引用已存在配置项，此操作什么都不做
            break;
          }
        }
      }
    },
    getTagType(relentity) {
      if (relentity.ciEntityId) {
        return 'primary';
      } else if (relentity.ciEntityUuid) {
        if (this.fromCiEntityData && relentity.ciEntityUuid == this.fromCiEntityData.uuid) {
          return 'warning';
        } else {
          return 'success';
        }
      }
    },
    removeCiEntity(cientity) {
      const index = this.ciEntityList.findIndex(c => c.id == cientity.id);
      if (index > -1) {
        this.ciEntityList.splice(index, 1);
      }
      if (this.ciEntityList.length == 0) {
        this.close();
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {
    elementTypeList() {
      const typeList = [];
      if (this.elementList) {
        const globalObj = { type: 'global', label: this.$t('term.cmdb.globalattr'), elementList: [], isShow: true };
        globalObj.elementList = this.elementList.filter(d => d.type === 'global');
        if (globalObj.elementList.length > 0) {
          typeList.push(globalObj);
        }
        const uniqueObj = { type: 'unique', label: this.$t('term.cmdb.uniquerule'), elementList: [], isShow: true };
        uniqueObj.elementList = this.elementList.filter(d => d.type === 'attr' && this.uniqueList.includes(d.element.id));
        if (uniqueObj.elementList.length > 0) {
          typeList.push(uniqueObj);
        }
        const manualObj = { type: 'manual', label: this.$t('term.cmdb.manualinput'), elementList: [], isShow: false };
        manualObj.elementList = this.elementList.filter(d => !this.uniqueList.includes(d.element.id) && d.element.inputType === 'mt' && d.element.type !== 'expression');
        //console.log(JSON.stringify(manualObj.elementList, null, 2));
        if (manualObj.elementList.length > 0) {
          typeList.push(manualObj);
        }
        const autoObj = { type: 'auto', label: this.$t('page.autocollect'), elementList: [], isShow: true };
        autoObj.elementList = this.elementList.filter(d => !this.uniqueList.includes(d.element.id) && d.element.inputType === 'at' && d.element.type !== 'expression');
        if (autoObj.elementList.length > 0) {
          typeList.push(autoObj);
        }
      }
      return typeList;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.ivu-form-item {
  margin-bottom: 24px !important;
}
.cientity-item {
  height: 50px;
  border: 1px solid @default-border;
}
/deep/.tstabs {
  .tstable-main {
    max-height: initial !important;
  }
}
/deep/.ivu-collapse {
  border-top: 0px;
  border-bottom: 0px;
}
/deep/.ivu-collapse-header {
  border-bottom: 0px;
}
/deep/.ivu-collapse-content-box {
  padding-bottom: 0px;
}
/deep/.ivu-collapse-content {
  padding: 0px;
}
</style>
