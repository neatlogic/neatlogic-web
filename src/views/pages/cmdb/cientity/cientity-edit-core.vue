<template>
  <div>
    <TsContain
      border="border"
      :mode="mode"
      :hideHeader="true"
      :hasContentPadding="false"
      :rightWidth="220"
    >
      <template v-slot:content>
        <Loading
          v-if="isLoading"
          :text="$t('page.validating')"
          :loadingShow="isLoading"
          type="fix"
        ></Loading>
        <div v-if="ciEntityQueue && ciEntityQueue.length > 1" class="pt-xs pb-lg">
          <Breadcrumb separator="<span class='tsfont-arrow-right'></span>">
            <BreadcrumbItem v-for="(entity, index) in ciEntityQueue" :key="index">
              <span v-if="index == ciEntityQueue.length - 2" style="font-size: 15px">
                <a href="javascript:void(0)" class="text-info" @click="back()">
                  <span :class="entity.ciIcon"></span>
                  <span>{{ entity.ciLabel }}({{ entity.ciName }})</span>
                </a>
              </span>
              <span v-else-if="index == ciEntityQueue.length - 1" style="font-size: 15px">
                <span :class="entity.ciIcon"></span>
                <span>{{ entity.ciLabel }}({{ entity.ciName }})</span>
              </span>
              <span v-else class="text-grey" style="font-size: 15px">
                <span :class="entity.ciIcon"></span>
                <span>{{ entity.ciLabel }}({{ entity.ciName }})</span>
              </span>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
        <div :class="padding ? 'bg-block radius-lg pt-lg pr-lg pl-lg pb-xs mb-lg' : ''">
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
                  <div v-for="(e, index) in elementType.elementList" :key="index">
                    <div v-if="e.type === 'attr'">
                      <TsFormItem
                        v-if="e.element.canInput"
                        :label="e.element.label"
                        :labelPosition="labelPosition"
                        :required="!!e.element.isRequired || !!e.element.isCiUnique"
                      ><AttrInputer
                        ref="attrHandler"
                        :allowBatchAdd="allowBatchAdd"
                        :attrEntity="ciEntityData.attrEntityData['attr_' + e.element.id]"
                        :disabled="disabledFn('attr_' + e.element.id)"
                        :attrData="e.element"
                        :valueList="getValueList(ciEntityData.attrEntityData, e.element)"
                        @setData="setAttrData(e.element, arguments[0], arguments[1])"
                        @new="addNewAttrEntity(e.element)"
                        @edit="editNewAttrEntity($event)"
                        @delete="deleteAttrEntity('attr_' + e.element.id, $event)"
                        @select="selectAttrEntity('attr_' + e.element.id, $event)"
                      ></AttrInputer></TsFormItem>
                    </div>
                    <div v-else-if="e.type === 'global'">
                      <TsFormItem :label="e.element.label" :labelPosition="labelPosition">
                        <TsFormSelect
                          dynamicUrl="/api/rest/cmdb/globalattritem/search"
                          transfer
                          :params="{ attrId: e.element.id }"
                          valueName="id"
                          textName="value"
                          :multiple="e.element.isMultiple ? true : false"
                          border="border"
                          :value="getGlobalValueList(ciEntityData.globalAttrEntityData, e.element)"
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
                        <!--<TsFormRadio
                          v-if="!e.element.isMultiple"
                          :allowToggle="true"
                          :dataList="e.element.itemList"
                          valueName="id"
                          textName="value"
                          :value="getGlobalValueList(ciEntityData.globalAttrEntityData, e.element).length > 0 ? getGlobalValueList(ciEntityData.globalAttrEntityData, e.element)[0] : null"
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
                        <TsFormCheckbox v-if="!!e.element.isMultiple" :dataList="e.element.itemList" valueName="id" textName="value" :value="getGlobalValueList(ciEntityData.globalAttrEntityData, e.element)" @change="(val, opt) => setGlobalAttrData(e.element, opt)"></TsFormCheckbox>
                        -->
                      </TsFormItem>
                    </div>
                    <div v-else-if="e.type == 'rel'">
                      <TsFormItem :label="e.element.direction === 'from' ? e.element.toLabel : e.element.fromLabel" :labelPosition="labelPosition" :required="!!((e.element.direction == 'from' && e.element.toIsRequired) || (e.element.direction == 'to' && e.element.fromIsRequired))">
                        <div v-if="isRelShow(e.element, ciEntityData) && !(ciEntityData.relEntityData && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id] && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id]['valueList'] && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id]['valueList'].length > 0 && ((e.element.direction == 'to' && e.element.fromRule == 'O') || (e.element.direction == 'from' && e.element.toRule == 'O')))">
                          <a href="javascript:void(0)" :disabled="disabledFn('rel' + e.element.direction + '_' + e.element.id)" @click.stop="addRelEntity(e.element)">
                            <i class="tsfont-check"></i>
                            {{ $t('page.choose') }}
                          </a>
                          <a
                            v-if="allowBatchAdd && ((e.element.direction == 'from' && e.element.toAllowInsert) || (e.element.direction == 'to' && e.element.fromAllowInsert))"
                            href="javascript:void(0)"
                            :disabled="disabledFn('rel' + e.element.direction + '_' + e.element.id)"
                            @click.stop="addNewRelEntity(e.element)"
                          >
                            <i class="tsfont-plus"></i>
                            {{ $t('page.append') }}
                          </a>
                          <Poptip
                            v-model="isRelPopShow[e.element.id + '_' + e.element.direction]"
                            placement="right"
                            trigger="hover"
                            :transfer="true"
                          >
                            <a></a>
                            <div slot="content">
                              <div v-if="relCiList" :style="'overflow:auto;max-height:300px;width:' + Math.min(550, relCiList.length * 90) + 'px'">
                                <div
                                  v-for="relci in relCiList"
                                  :key="relci.id"
                                  style="text-align: center; margin-right: 10px; float: left; cursor: pointer; width: 80px"
                                  @click="newCiEntity(e.element, relci.id)"
                                >
                                  <div>
                                    <a href="javascript:void(0)"><i style="font-size: 20px" :class="relci.icon"></i></a>
                                  </div>
                                  <div class="overflow" :title="relci.label">
                                    <a href="javascript:void(0)">{{ relci.label }}</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Poptip>
                        </div>
                        <div v-if="ciEntityData.relEntityData && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id] && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id]['valueList']">
                          <Tag
                            v-for="(relentity, reindex) in ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id]['valueList']"
                            :key="reindex"
                            :color="getTagType(relentity)"
                            type="dot"
                            size="large"
                            :closable="!disabledFn('rel' + e.element.direction + '_' + e.element.id) && (relentity.ciEntityId || relentity.type == 'new') ? true : false"
                            :style="getTagType(relentity) == 'success' ? 'cursor:pointer' : ''"
                            @click.native="
                              e => {
                                e.stopPropagation();
                                editNewRelEntity(relentity);
                              }
                            "
                            @on-close="delRelEntity('rel' + e.element.direction + '_' + e.element.id, relentity, ciEntityData || '')"
                          >
                            <span>{{ relentity.ciEntityName }}</span>
                            <!--<span v-if="relentity.ciEntityId">
                              <Poptip placement="top" transfer trigger="hover">
                                <span style="cursor:pointer" class="tsfont-time"></span>
                                <div slot="title">设置关系有效天数</div>
                                <div slot="content">
                                  <InputNumber
                                    :min="0"
                                    :max="100"
                                    :value="relentity.validDay || 0"
                                    @on-change="
                                      val => {
                                        return changeValidDay(relentity, val);
                                      }
                                    "
                                  ></InputNumber>
                                </div>
                              </Poptip>
                            </span>
                            <span v-if="relentity.validDay" class="fz10 text-grey">{{ relentity.validDay }}天有效</span>-->
                          </Tag>
                        </div>
                      </TsFormItem>
                    </div>
                  </div>
                </div>
              </Panel>
              <Panel name="description">
                {{ $t('term.cmdb.changememo') }}
                <div slot="content" class="pt-lg" style="margin: 0 auto">
                  <TsFormItem :label="$t('term.cmdb.changememo')" :labelPosition="labelPosition">
                    <TsFormInput
                      v-if="ciEntityData"
                      v-model="ciEntityData.description"
                      type="textarea"
                      maxlength="500"
                    ></TsFormInput>
                  </TsFormItem>
                </div>
              </Panel>
            </Collapse>
          </div>
        </div>
        <div style="text-align: right">
          <Button
            v-if="saveMode === 'save' && ((ciEntityQueue && ciEntityQueue.length > 1) || mode === 'dialog')"
            style="margin-right: 10px"
            type="default"
            @click="cancel()"
          >{{ $t('page.cancel') }}</Button>
          <Button v-if="ciEntityQueue && ciEntityQueue.length > 1" type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
          <Button
            v-if="!hideButton && saveMode === 'save' && ciEntityQueue && ciEntityQueue.length == 1 && ciEntityData.authData && (ciEntityData.authData.cientityinsert || ciEntityData.authData.cientityupdate)"
            style="margin-right: 10px"
            ghost
            type="primary"
            @click="save(false)"
          >{{ $t('page.savetransaction') }}</Button>
          <Button v-if="!hideButton && saveMode === 'save' && ciEntityQueue && ciEntityQueue.length == 1 && ciEntityData.authData && (ciEntityData.authData.cientityinsert || ciEntityData.authData.cientityupdate) && ciEntityData.authData.transactionmanage" type="primary" @click="save(true)">{{ $t('page.savecommittransaction') }}</Button>
          <Button v-if="!hideButton && saveMode === 'emit' && ciEntityQueue && ciEntityQueue.length == 1" style="margin-right: 10px" @click="cancel">{{ $t('page.cancel') }}</Button>
          <Button v-if="!hideButton && saveMode === 'emit' && ciEntityQueue && ciEntityQueue.length == 1" type="primary" @click="save(false)">{{ $t('page.confirm') }}</Button>
        </div>
      </template>
      <div v-if="ciEntityData && ciEntityData.id && saveMode == 'save'" slot="right" class="pl-nm">
        <HistoryList
          v-if="ciEntityData"
          :ciEntityId="ciEntityData.id"
          :ciId="ciEntityData.ciId"
          @refresh="refresh"
        ></HistoryList>
      </div>
    </TsContain>
    <CiEntityChoose
      v-if="isCiEntityChooseShow"
      :ciId="targetCiId"
      :isMultiple="isRelMultiple"
      :selectedData="currentRelEntityValue"
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
    HistoryList: () => import('./history-list.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    //TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    //TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox'),
    // TsTable:()=>import('@/resources/components/TsTable/TsTable.vue'),
    CiEntityChoose: () => import('./cientity-choose.vue')
  },
  props: {
    padding: { type: Boolean, default: true }, //是否有白色底色和间距
    labelPosition: { type: String, default: 'left' },
    mode: { type: String, default: 'window' },
    saveMode: { type: String, default: 'save' }, //有save和emit两种模式，save直接写入数据库，emit调用外部emit函数，如果是emit模式，保存按钮只会显示一个
    allowBatchAdd: { type: Boolean, default: true }, //是否允许批量创建新配置项
    hideButton: { type: Boolean, default: false }, //隐藏按钮
    ciEntityQueue: {
      type: Array,
      default: () => {
        return [];
      }
    } //配置项添加队列
  },
  data() {
    return {
      openPanel: ['global', 'unique', 'manual', 'description'],
      relCiList: [], //关系的所有下游模型列表
      isRelPopShow: {},
      activePanel: ['attr', 'rel'],
      isCiEntityChooseShow: false,
      isRelMultiple: true,
      targetCiId: null,
      currentRel: null,
      currentRelEntityValue: null,
      isLoading: false
      // ciEntityData: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    refresh() {
      window.location.reload();
    },
    changeValidDay(relentity, day) {
      this.$set(relentity, 'validDay', day);
      if (relentity.id) {
        this.$api.cmdb.cientity.updateRelEntityValidDay(relentity.id, day).then(res => {
          if (res.Status == 'OK') {
            this.$forceUpdate();
          }
        });
      } else {
        this.$forceUpdate();
      }
    },
    getGlobalValueList(data, attr) {
      const id = attr.id;
      if (!data['global_' + id]) {
        this.$set(data, 'global_' + id, { valueList: [] });
      } else if (!data['global_' + id]['valueList']) {
        this.$set(data['global_' + id], 'valueList', []);
      }
      return data['global_' + id]['valueList'].map(d => d.id);
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
    disabledFn(elementId) {
      if (this.ciEntityData.editableAttrRelIdList && this.ciEntityData.editableAttrRelIdList.length > 0 && !this.ciEntityData.editableAttrRelIdList.includes(elementId)) {
        return true;
      } else if (this.ciEntityData.disableAttrRelIdList && this.ciEntityData.disableAttrRelIdList.length > 0 && this.ciEntityData.disableAttrRelIdList.includes(elementId)) {
        return true;
      }
      return false;
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
            const cientity = { ciId: element.ciId, ciEntityId: element.id, ciEntityName: element.name };
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
    ciEntityDatafn(key, relentity, rowdata) {
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
    delRelEntity(key, relentity, rowdata) {
      this.ciEntityDatafn(key, relentity, rowdata);
    },
    back() {
      this.$emit('back');
    },
    cancel() {
      this.$emit('cancel');
    },
    editNewRelEntity(rel) {
      if (this.getTagType(rel) == 'success') {
        this.$emit('edit', rel.ciEntityUuid);
      }
    },
    addNewRelEntity(rel) {
      //disabled 当有值的时候是为可编辑，这个字段是从表单里面过来的
      this.relCiList = [];
      for (const k in this.isRelPopShow) {
        this.isRelPopShow[k] = false;
      }
      const ciId = rel.direction == 'from' ? rel.toCiId : rel.fromCiId;
      this.$api.cmdb.ci.getDownwardCiList(ciId).then(res => {
        this.relCiList = res.Return;
        if (this.relCiList.length > 1) {
          this.isRelPopShow[rel.id + '_' + rel.direction] = true;
        } else if (this.relCiList.length == 1) {
          this.isRelPopShow[rel.id + '_' + rel.direction] = false;
          this.newCiEntity(rel, this.relCiList[0].id);
        }
      });
    },
    newCiEntity(rel, ciId) {
      rel._ciId = ciId;
      this.isRelPopShow[rel.id + '_' + rel.direction] = false;
      this.$emit('new', 'rel', rel);
    },
    addNewAttrEntity(attr) {
      //添加新的引用属性
      this.$emit('new', 'attr', attr);
    },
    editNewAttrEntity(uuid) {
      //删除引用属性（只支持新添加的目标，已存在的目标不允许修改）
      this.$emit('edit', uuid);
    },
    //删除选中的属性
    deleteAttrEntity(key, attrentity) {
      //删除引用属性
      if (this.ciEntityData.attrEntityData[key]) {
        let valueList = this.ciEntityData.attrEntityData[key]['valueList'];
        if (valueList) {
          let j = -1;
          valueList.forEach((v, i) => {
            if (typeof v == 'string' || typeof v == 'number') {
              if (v == attrentity.uuid || v == attrentity.id) {
                j = i;
              }
            } else if (typeof v == 'object') {
              if (v.uuid == attrentity.uuid || v.id == attrentity.id) {
                j = i;
              }
            }
          });
          if (j > -1) {
            this.$delete(this.ciEntityData.attrEntityData[key]['valueList'], j);
          }
        }
        let actualValueList = this.ciEntityData.attrEntityData[key]['actualValueList'];
        if (actualValueList) {
          let j = -1;
          actualValueList.forEach((v, i) => {
            if (typeof v == 'string' || typeof v == 'number') {
              if (v == attrentity.uuid || v == attrentity.id) {
                j = i;
              }
            } else if (typeof v == 'object') {
              if (v.uuid == attrentity.uuid || v.id == attrentity.id) {
                j = i;
              }
            }
          });
          if (j > -1) {
            this.$delete(this.ciEntityData.attrEntityData[key]['actualValueList'], j);
          }
        }
        this.$emit('remove', attrentity);
      }
    },
    //选择引用属性
    selectAttrEntity(key, attrentity) {
      if (!this.ciEntityData.attrEntityData[key]) {
        const vo = {};
        vo[key] = { valueList: [], actualValueList: [] };
        Object.assign(this.ciEntityData.attrEntityData, vo);
      }
      if (!this.ciEntityData.attrEntityData[key]['valueList']) {
        this.$set(this.ciEntityData.attrEntityData[key], 'valueList', []);
      }
      if (!this.ciEntityData.attrEntityData[key]['actualValueList']) {
        this.$set(this.ciEntityData.attrEntityData[key], 'actualValueList', []);
      }
      let valueList = this.ciEntityData.attrEntityData[key]['valueList'];
      if (valueList.findIndex(v => (typeof v == 'object' && (v.uuid == attrentity.uuid || v.id == attrentity.id)) || (typeof v == 'number' && v == attrentity.id)) == -1) {
        this.ciEntityData.attrEntityData[key]['valueList'].push(attrentity);
        this.ciEntityData.attrEntityData[key]['actualValueList'].push(attrentity);
      }
    },
    //选择关系配置项
    addRelEntity(rel) {
      this.currentRel = rel;
      this.currentRelEntityValue = [];
      if (this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id] && this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id]['valueList']) {
        this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id]['valueList'].forEach(element => {
          this.currentRelEntityValue.push(element.ciEntityId);
        });
      }
      if (rel.direction == 'from') {
        //当前配置项在from位置
        this.targetCiId = rel.toCiId;
        if (rel.toRule == 'O') {
          this.isRelMultiple = false;
        } else if (rel.toRule == 'N') {
          this.isRelMultiple = true;
        }
        this.isCiEntityChooseShow = true;
      } else if (rel.direction == 'to') {
        //当前配置项在to位置
        this.targetCiId = rel.fromCiId;
        if (rel.fromRule == 'O') {
          this.isRelMultiple = false;
        } else if (rel.fromRule == 'N') {
          this.isRelMultiple = true;
        }
        this.isCiEntityChooseShow = true;
      }
    },
    save(needCommit) {
      const attrHandlers = this.$refs['attrHandler'];
      let isValid = true;
      if (attrHandlers) {
        attrHandlers.forEach(element => {
          if (element.valid) {
            if (!element.valid()) {
              isValid = false;
            }
          }
        });
      }

      if (isValid) {
        this.isLoading = true;
        this.$api.cmdb.cientity
          .validateCiEntity(this.ciEntityData)
          .then(res => {
            if (res.Status == 'OK') {
              if (res.Return.hasChange) {
                this.$emit('save', needCommit);
              } else {
                this.$Message.info('没有任何修改');
              }
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
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
    }
  },
  filter: {},
  computed: {
    elementTypeList() {
      const typeList = [];
      if (this.ciEntityData) {
        const uniqueList = this.ciEntityData['_uniqueAttrList'] || [];
        const elementList = this.ciEntityData['_elementList'];
        const globalObj = { type: 'global', label: this.$t('term.cmdb.globalattr'), elementList: [], isShow: true };
        globalObj.elementList = elementList.filter(d => d.type === 'global');
        if (globalObj.elementList.length > 0) {
          typeList.push(globalObj);
        }
        const uniqueObj = { type: 'unique', label: this.$t('term.cmdb.uniquerule'), elementList: [], isShow: true };
        uniqueObj.elementList = elementList.filter(d => d.type === 'attr' && uniqueList.includes(d.element.id));
        if (uniqueObj.elementList.length > 0) {
          typeList.push(uniqueObj);
        }
        const manualObj = { type: 'manual', label: this.$t('term.cmdb.manualinput'), elementList: [], isShow: false };
        manualObj.elementList = elementList.filter(d => !uniqueList.includes(d.element.id) && d.element.inputType === 'mt' && d.element.type !== 'expression');
        //console.log(JSON.stringify(manualObj.elementList, null, 2));
        if (manualObj.elementList.length > 0) {
          typeList.push(manualObj);
        }
        const autoObj = { type: 'auto', label: this.$t('page.autocollect'), elementList: [], isShow: true };
        autoObj.elementList = elementList.filter(d => !uniqueList.includes(d.element.id) && d.element.inputType === 'at' && d.element.type !== 'expression');
        if (autoObj.elementList.length > 0) {
          typeList.push(autoObj);
        }
      }
      return typeList;
    },
    /*uniqueElementList() {
      if (this.ciEntityData && this.ciEntityData['_uniqueAttrList'] && this.ciEntityData['_uniqueAttrList'].length > 0 && this.ciEntityData['_elementList'] && this.ciEntityData['_elementList'].length > 0) {
        return this.ciEntityData['_elementList'].filter(d => d.type === 'attr' && this.ciEntityData['_uniqueAttrList'].includes(d.element.id));
      }
      return [];
    },*/
    ciEntityData() {
      return this.ciEntityQueue[this.ciEntityQueue.length - 1];
    },
    fromCiEntityData() {
      //来自哪个配置项
      if (this.ciEntityQueue.length > 1) {
        return this.ciEntityQueue[this.ciEntityQueue.length - 2];
      }
      return null;
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
