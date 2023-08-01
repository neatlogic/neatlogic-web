<template>
  <div class="complex-search-wrap">
    <div v-if="readonly">
      <div ref="tagDiv" class="pl-sm tag-item">
        <span v-for="(v, index) in searchConditionList" :key="index">
          <span v-if="searchConditionList.length > 1">(</span>
          <span v-for="(item, vIndex) in v.conditionList" :key="vIndex">
            <span
              v-if="item.text"
              :key="item.uuid"
              class="tag-item-text border-color radius-sm overflow bg-op"
            >
              <span class="text-title">{{ item.label }}</span>
              <span class="ml-xs mr-xs">:</span>
              <template v-if="item.text && typeof item.text =='object' && item.text.length">
                <template v-for="(textV, textIndex) in item.text">
                  <span :key="textIndex+'_text'">{{ textV }}</span>
                  <span v-if="textIndex<item.text.length-1" :key="textIndex+'_sperate'" class="tag-item-sperate">|</span>
                </template>
              </template>
              <span v-else>{{ item.text }}</span>
            </span>
            <span v-if="index != (searchConditionList.length -1) && vIndex != v.conditionList.length - 1" class="text-href pr-sm">{{ item.childJoinType == 'or' ? $t('page.or') : (item.childJoinType == 'and' ? $t('page.and') : '') }}</span>
            <span v-else-if="vIndex != v.conditionList.length - 1" class="text-href pr-sm">{{ item.childJoinType == 'or' ? $t('page.or') : (item.childJoinType == 'and' ? $t('page.and') : '') }}</span>
          </span>
          <span v-if="searchConditionList.length > 1">)</span>
          <span v-if="index != (searchConditionList.length -1)" class="text-href pl-sm pr-sm">{{ v.joinType == 'or' ? $t('page.or') : (v.joinType == 'and' ? $t('page.and') : '') }}</span>
        </span>
      </div>
      <span v-if="isShowMoreBtn" class="tsfont-option-horizontal text-action pl-nm" @click="() => $emit('clickMoreBtn')">
        <!-- 更多省略号 -->
      </span>
    </div>
    <div v-else ref="searchContainer" class="text-right">
      <div class="radius-sm bg-op border-color searcher-inputer">
        <Dropdown
          trigger="custom"
          :visible="isVisible"
          placement="bottom-start"
          style="max-width: 91%;"
        >
          <div style="display: flex;">
            <span class="tsfont-search text-action pl-sm" @click="searchConditionBtn"></span>
            <div style="overflow: scroll;max-width: 100%;display: flex;">
              <div class="pl-sm" style="white-space: nowrap;">
                <span v-for="(v, index) in searchConditionList" :key="index">
                  <span v-if="searchConditionList.length > 1">(</span>
                  <span v-for="(item, vIndex) in v.conditionList" :key="vIndex">
                    <Tag
                      v-if="item.text"
                      :key="item.childUuid"
                      :closable="disabledUuidList.includes(item.childUuid) ? false : true"
                      style="margin-top: 0px;"
                      @on-close="deleteTagCondition(index, vIndex)"
                    >
                      <span class="text-title">{{ item.label }}</span>
                      <span class="ml-xs mr-xs">:</span>
                      <template v-if="item.text && typeof item.text =='object' && item.text.length">
                        <template v-for="(textV, textIndex) in item.text">
                          <span :key="textIndex+'_text'">{{ textV }}</span>
                          <span v-if="textIndex<item.text.length-1" :key="textIndex+'_sperate'" class="tag-item-sperate">|</span>
                        </template>
                      </template>
                      <span v-else>{{ item.text }}</span>
                    </Tag>
                    <span v-if="index != (searchConditionList.length -1) && vIndex != v.conditionList.length - 1" class="text-href pr-sm">{{ item.childJoinType == 'or' ? $t('page.or') : (item.childJoinType == 'and' ? $t('page.and') : '') }}</span>
                    <span v-else-if="vIndex != v.conditionList.length - 1" class="text-href pr-sm">{{ item.childJoinType == 'or' ? $t('page.or') : (item.childJoinType == 'and' ? $t('page.and') : '') }}</span>
                  </span>
                  <span v-if="searchConditionList.length > 1">)</span>
                  <span v-if="index != (searchConditionList.length -1)" class="text-href pl-sm pr-sm">{{ v.joinType == 'or' ? $t('page.or') : (v.joinType == 'and' ? $t('page.and') : '') }}</span>
                </span>
              </div>
              <div>
                <TsFormInput
                  v-if="canSearch"
                  v-model="keyword"
                  border="none"
                  :placeholder="$t('form.placeholder.pleaseinput', {target: $t('term.autoexec.targetip')})"
                  width="200px"
                  @on-enter="searchKeword"
                ></TsFormInput>
              </div>
            </div>
          </div>
          <DropdownMenu slot="list">
            <div v-if="isVisible">
              <div class="dropdown-box pl-nm pr-nm">
                <span class="tsfont-plus text-action mb-nm" @click="addGroupCondition">{{ $t('page.combinedcondition') }}</span>
                <div v-for="(v, tIndex) in conditionList" :key="v.uuid + tIndex">
                  <div v-if="!$utils.isEmpty(v.conditionList)" class="bg-grey padding radius-md">
                    <TsRow v-for="(item, index) in v.conditionList" :key="index">
                      <template v-for="(vv, vIndex) in item.conditionList">
                        <Col :key="vIndex" span="7">
                          <TsFormInput
                            v-if="vv.type == 'input' && !vv.isHidden"
                            ref="TsFormInput"
                            v-model="vv.value"
                            border="border"
                            v-bind="filterTypeFields(vv)"
                            :disabled="disabledUuidList.includes(item.uuid)"
                          ></TsFormInput>
                          <TsFormDatePicker
                            v-else-if="vv.type == 'datetimerange' && !vv.isHidden"
                            ref="TsFormDatePicker"
                            v-model="vv.value"
                            v-bind="vv"
                            :disabled="disabledUuidList.includes(item.uuid)"
                          ></TsFormDatePicker>
                          <TsFormTree
                            v-else-if="vv.type == 'tree' && !vv.isHidden"
                            ref="TsFormTree"
                            v-model="vv.value"
                            v-bind="filterTypeFields(vv)"
                            :disabled="disabledUuidList.includes(item.uuid)"
                            @change-label="(label) => changeLabel(vv, label)"
                          ></TsFormTree>
                          <TsFormSelect
                            v-else-if="!vv.isHidden"
                            ref="TsFormSelect"
                            v-model="vv.value"
                            border="border"
                            v-bind="filterTypeFields(vv)"
                            :disabled="disabledUuidList.includes(item.uuid)"
                            :validateList="[{name: 'required', message: ' '}]"
                            @change-label="(label) => changeLabel(vv, label)"
                            @on-change="(value, valueObj, selectedItem) => attributeChange(vv.name,item.conditionList, value, selectedItem)"
                          ></TsFormSelect>
                        </Col>
                      </template>
                      <Col span="3">
                        <div class="action-group">
                          <span class="action-item tsfont-plus" :title="$t('dialog.title.addtarget', {target: $t('page.combinedcondition')})" @click.stop="addChildCondition(tIndex)"></span>
                          <span
                            v-if="(tIndex == 0 && index == 0 ? false : true) && !disabledUuidList.includes(item.uuid)"
                            class="action-item tsfont-trash-s"
                            :title="$t('dialog.title.deletetarget', {target: $t('page.combinedcondition')})"
                            @click.stop="delCondition(tIndex, index)"
                          ></span>
                        </div>
                      </Col>
                      <div v-if="index != v.conditionList.length - 1" class="text-center">
                        <!-- 一个分组里的关系 -->
                        <Dropdown
                          :transfer="true"
                          @on-click=" val => switchJoinType(item, val)"
                        >
                          <a href="javascript:void(0)">
                            <span v-if="item.joinType == 'and'">{{ $t('page.and') }}</span>
                            <span v-else-if="item.joinType == 'or'">{{ $t('page.or') }}</span>
                            <Icon type="ios-arrow-down"></Icon>
                          </a>
                          <DropdownMenu slot="list">
                            <DropdownItem name="and" :disabled="(disabledUuidList.includes(item.uuid) && (v.conditionList[index + 1] && !disabledUuidList.includes(v.conditionList[index + 1]['uuid']))) ? false : disabledUuidList.includes(item.uuid)">{{ $t('page.and') }}</DropdownItem>
                            <DropdownItem name="or" :disabled="(disabledUuidList.includes(item.uuid) && (v.conditionList[index + 1] && !disabledUuidList.includes(v.conditionList[index + 1]['uuid']))) ? false : disabledUuidList.includes(item.uuid)">{{ $t('page.or') }}</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TsRow>
                  </div>
                  <div v-if="tIndex != conditionList.length - 1" class="text-center">
                    <!-- 分组与分组之间的关系 -->
                    <Dropdown
                      :transfer="true"
                      @on-click=" val => switchJoinType(v, val)"
                    >
                      <a href="javascript:void(0)">
                        <span v-if="v.joinType == 'and'">{{ $t('page.and') }}</span>
                        <span v-else-if="v.joinType == 'or'">{{ $t('page.or') }}</span>
                        <Icon type="ios-arrow-down"></Icon>
                      </a>
                      <DropdownMenu slot="list">
                        <!-- 禁用后有条件，取消禁用 -->
                        <DropdownItem name="and" :disabled="(disabledGroupUuidList.includes(v.uuid) && (conditionList[tIndex + 1] && !disabledGroupUuidList.includes(conditionList[tIndex + 1]['uuid']))) ? false : disabledGroupUuidList.includes(v.uuid)">{{ $t('page.and') }}</DropdownItem>
                        <DropdownItem name="or" :disabled="(disabledGroupUuidList.includes(v.uuid) && (conditionList[tIndex + 1] && !disabledGroupUuidList.includes(conditionList[tIndex + 1]['uuid']))) ? false : disabledGroupUuidList.includes(v.uuid)">{{ $t('page.or') }}</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </div>
              <TsRow class="bg-op">
                <Col span="4" class="mt-nm">
                  <span v-if="disabledUuidList.length == 0" class="tsfont-left pl-nm text-action" @click="switchMode">{{ $t('page.simplemode') }}</span>
                </Col>
                <Col span="20">
                  <div class="pt-nm pr-nm mb-sm text-right">
                    <div class="action-group">
                      <div class="action-item">
                        <Button @click="isVisible = false">{{ $t('page.cancel') }}</Button>
                      </div>
                      <div class="action-item">
                        <Button type="primary" @click="searchConditionBtn">{{ $t('page.search') }}</Button>
                      </div>
                    </div>
                  </div>
                </Col>
              </TsRow>
            </div>
          </DropdownMenu>
        </Dropdown>
      </div>
      <span v-if="isShowDeleteAllBtn && (disabledUuidList.length == 0)" class="btn-remove tsfont-close-o" @click="deleteAllCondition"></span>
      <span class="btn-filter tsfont-filter" @click="openDropdown"></span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
  },
  props: {
    value: {
      type: Object,
      default: function() {
        return {};
      }
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabledUuidList: {
      // 禁用uuid列表，搜索条件
      type: Array,
      default: function() {
        return [];
      }
    },
    disabledGroupUuidList: {
      // 禁用条件组uuid列表，搜索条件
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      keyword: '',
      isVisible: false,
      isShowMoreBtn: false,
      canSearch: true,
      searchConditionConfig: {},
      conditionList: [],
      searchConditionList: [], // 搜索条件列表
      dateExpressionList: [
        {
          expression: 'equal',
          expressionName: this.$t('term.expression.eq')
        },
        {
          expression: 'unequal',
          expressionName: this.$t('term.expression.ne')
        },
        {
          expression: 'is-null',
          expressionName: this.$t('term.expression.empty')
        },
        {
          expression: 'is-not-null',
          expressionName: this.$t('term.expression.notempty')
        }
      ],
      inputExpressionList: [ // 输入框类型，条件列表
        {
          expression: 'like',
          expressionName: this.$t('term.expression.like')
        },
        {
          expression: 'notlike',
          expressionName: this.$t('term.expression.notlike')
        },
        {
          expression: 'equal',
          expressionName: this.$t('term.expression.eq')
        },
        {
          expression: 'unequal',
          expressionName: this.$t('term.expression.ne')
        }
      ],
      selectExpressionList: [
        {
          expression: 'include',
          expressionName: this.$t('term.expression.like')
        },
        {
          expression: 'exclude',
          expressionName: this.$t('term.expression.notlike')
        },
        {
          expression: 'is-null',
          expressionName: this.$t('term.expression.empty')
        },
        {
          expression: 'is-not-null',
          expressionName: this.$t('term.expression.notempty')
        }],
      defaultConditionList: [
        {
          name: 'attributeKey',
          placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.attribute')}),
          label: this.$t('page.attribute'),
          multiple: false,
          textName: 'handlerName',
          valueName: 'handler',
          search: true,
          transfer: true,
          value: '',
          dataList: [
            {
              handler: 'typeIdList',
              conditionModel: 'select',
              handlerName: this.$t('term.cmdb.citype'),
              config: {
                search: true,
                transfer: true,
                multiple: true,
                textName: 'label',
                valueName: 'id',
                type: 'tree',
                url: '/api/rest/resourcecenter/resourcetype/tree',
                validateList: [{name: 'required', message: ''}]
              }
            },
            {
              handler: 'appSystemIdList',
              defaultExpression: 'include',
              conditionModel: 'select',
              handlerName: this.$t('page.apply'),
              config: {
                search: true,
                transfer: true,
                defaultValue: [],
                rootName: 'tbodyList',
                multiple: true,
                dealDataByUrl: 'getAppForselect',
                type: 'select',
                dynamicUrl: '/api/rest/resourcecenter/appsystem/list/forselect',
                validateList: [{name: 'required', message: ' '}]

              }
            },
            {
              handler: 'appModuleIdList',
              defaultExpression: 'include',
              conditionModel: 'select',
              handlerName: this.$t('page.module'),
              config: {
                search: true,
                transfer: true,
                defaultValue: [],
                rootName: 'tbodyList',
                multiple: true,
                dealDataByUrl: 'getAppForselect',
                type: 'select',
                dynamicUrl: '/api/rest/resourcecenter/appmodule/list',
                validateList: [{name: 'required', message: ' '}]
              }
            },
            {
              handler: 'envIdList',
              conditionModel: 'select',
              handlerName: this.$t('page.environment'),
              config: {
                search: true,
                textName: 'name',
                transfer: true,
                valueName: 'id',
                defaultValue: [],
                rootName: 'tbodyList',
                multiple: true,
                className: 'block-span',
                type: 'select',
                url: '/api/rest/resourcecenter/appenv/list/forselect',
                validateList: [{name: 'required', message: ' '}]

              }
            },
            {
              handler: 'protocolIdList',
              conditionModel: 'select',
              handlerName: this.$t('page.protocol'),
              config: {
                search: true,
                transfer: true,
                defaultValue: [],
                rootName: 'tbodyList',
                multiple: true,
                dealDataByUrl: 'getProtocolDataList',
                className: 'block-span',
                type: 'select',
                dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
                validateList: [{name: 'required', message: ' '}]
              }
            },
            {
              handler: 'tagIdList',
              conditionModel: 'select',
              handlerName: this.$t('page.tag'),
              config: {
                search: true,
                textName: 'name',
                transfer: true,
                valueName: 'id',
                defaultValue: [],
                rootName: 'tbodyList',
                multiple: true,
                type: 'select',
                dynamicUrl: '/api/rest/resourcecenter/tag/list/forselect',
                validateList: [{name: 'required', message: ''}]
              }
            },
            {
              handler: 'stateIdList',
              conditionModel: 'select',
              handlerName: this.$t('term.autoexec.assetstatus'),
              config: {
                search: true,
                textName: 'description',
                transfer: true,
                valueName: 'id',
                defaultValue: [],
                rootName: 'tbodyList',
                multiple: true,
                className: 'block-span',
                type: 'select',
                params: {
                  'needPage': false
                },
                url: '/api/rest/resourcecenter/state/list/forselect',
                validateList: [{name: 'required', message: ' '}]
              }
            },
            {
              handler: 'vendorIdList',
              conditionModel: 'select',
              handlerName: this.$t('page.manufacturer'),
              config: {
                search: true,
                textName: 'description',
                transfer: true,
                valueName: 'id',
                defaultValue: [],
                rootName: 'tbodyList',
                multiple: true,
                type: 'select',
                dynamicUrl: '/api/rest/resourcecenter/vendor/list/forselect',
                params: {
                  needPage: false
                },
                validateList: [{name: 'required', message: ' '}]
              }
            },
            {
              handler: 'inspectStatusList',
              conditionModel: 'select',
              handlerName: this.$t('term.autoexec.inspectstatus'),
              config: {
                search: true,
                transfer: true,
                defaultValue: [],
                multiple: true,
                className: 'block-span',
                type: 'select',
                params: {
                  'enumClass': 'neatlogic.framework.common.constvalue.InspectStatus'
                },
                url: '/api/rest/universal/enum/get',
                validateList: [{name: 'required', message: ' '}]
              }
            },
            {
              handler: 'port',
              conditionModel: 'input',
              handlerName: this.$t('page.port'),
              config: {
                type: 'input',
                validateList: [{name: 'required', message: ' '}],
                maxlength: 256
              }
            },
            {
              handler: 'ip',
              conditionModel: 'input',
              handlerName: this.$t('page.ip'),
              config: {
                type: 'input',
                validateList: [{name: 'required', message: ' '}],
                maxlength: 256
              }
            },
            {
              handler: 'name',
              conditionModel: 'input',
              handlerName: this.$t('page.name'),
              config: {
                type: 'input',
                validateList: [{name: 'required', message: ' '}],
                maxlength: 256
              }
            },
            {
              handler: 'description',
              conditionModel: 'input',
              handlerName: this.$t('page.description'),
              config: {
                type: 'input',
                validateList: [{name: 'required', message: ' '}],
                maxlength: 256
              }
            },
            {
              handler: 'networkArea',
              conditionModel: 'input',
              handlerName: this.$t('page.networkarea'),
              config: {
                type: 'input',
                validateList: [{name: 'required', message: ' '}],
                maxlength: 256
              }
            },
            {
              handler: 'maintenanceWindow',
              conditionModel: 'date',
              handlerName: this.$t('term.autoexec.maintenanceperiod'),
              config: {
                type: 'datetimerange',
                format: 'yyyy-MM-dd HH:mm',
                validateList: [{name: 'required', message: ' '}]
              }
            },
            {
              handler: 'ownerList',
              conditionModel: 'select',
              handlerName: this.$t('page.owner'),
              config: {
                search: true,
                transfer: true,
                multiple: true,
                type: 'select',
                dynamicUrl: '/api/rest/user/search/forselect',
                rootName: 'tbodyList',
                textName: 'userName',
                valueName: 'uuid',
                params: {
                  needPage: true
                },
                validateList: [{name: 'required', message: ' '}]
              }
            },
            {
              handler: 'bgList',
              conditionModel: 'select',
              handlerName: this.$t('term.autoexec.subordinatedepartment'),
              config: {
                search: true,
                transfer: true,
                multiple: true,
                type: 'select',
                dynamicUrl: '/api/rest/team/search',
                rootName: 'teamList',
                textName: 'name',
                valueName: 'uuid',
                params: {
                  needPage: true,
                  level: 'department'
                },
                validateList: [{name: 'required', message: ' '}]

              }
            }]
        }, {
          name: 'expression',
          placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.condition')}),
          multiple: false,
          textName: 'expressionName',
          valueName: 'expression',
          search: true,
          transfer: true,
          value: '',
          validateList: [{name: 'required', message: ' '}],
          dataList: [
            {
              expression: 'include',
              expressionName: this.$t('term.expression.like')
            },
            {
              expression: 'exclude',
              expressionName: this.$t('term.expression.notlike')
            },
            {
              expression: 'is-null',
              expressionName: this.$t('term.expression.empty')
            },
            {
              expression: 'is-not-null',
              expressionName: this.$t('term.expression.notempty')
            }]
        },
        {
          name: 'attributeValue',
          placeholder: this.$t('form.placeholder.pleaseselect', {target: ''}),
          transfer: true,
          multiple: true,
          value: '',
          validateList: [{name: 'required', message: ''}]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    window.addEventListener('resize', this.updateTag);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {
    window.addEventListener('resize', this.updateTag);
  },
  methods: {
    attributeChange(fieldName, conditionList, value, selectedItem, isReplace) {
      let dealDataByUrlObj = {
        getAppForselect: this.$utils.getAppForselect,
        getProtocolDataList: this.$utils.getProtocolDataList
      };
      if (fieldName == 'attributeKey') {
        if (value) {
          conditionList.forEach((v, index) => {
            if (v && v.name == 'attributeValue') {
              if (selectedItem && selectedItem.config && selectedItem.config.hasOwnProperty('dealDataByUrl')) {
                selectedItem.config['dealDataByUrl'] = dealDataByUrlObj[selectedItem.config.dealDataByUrl];
              }
              this.$set(conditionList, index, {
                name: 'attributeValue', 
                placeholder: (selectedItem.config && selectedItem.config.type) == 'input' ? this.$t('form.placeholder.pleaseinput', {target: ''}) : this.$t('form.placeholder.pleaseselect', {target: ''}), 
                transfer: true,
                multiple: true,
                ...selectedItem.config, 
                value: isReplace ? value : (selectedItem.config.type == 'input' ? '' : []),
                validateList: [{name: 'required', message: ''}]
              });
            }
          });
        } else {
          conditionList.forEach((v, index) => {
            if (v && v.name == 'attributeValue') {
              this.$set(conditionList, index, {
                name: 'attributeValue', 
                placeholder: this.$t('form.placeholder.pleaseselect', {target: ''}),
                multiple: true,
                transfer: true, 
                value: '',
                validateList: [{name: 'required', message: ''}]
              });
            }
          });
        }
        // 类型是输入框，条件需变化
        conditionList.forEach((v) => {
          if (v && v.name == 'expression') {
            this.$set(v, 'value', ''); // 属性改变，条件需要置空
            this.$set(v, 'dataList', this.getExpressionListByType((selectedItem && selectedItem.config && selectedItem.config.type) || ''));
          }
        });
      } else if (fieldName == 'expression') {
        // 条件为空或不为空时，需隐藏后面的属性值
        if (value == 'is-null' || value == 'is-not-null') {
          conditionList.forEach((v) => {
            if (v && v.name == 'attributeValue') {
              this.$set(v, 'isHidden', true);
              this.$set(v, 'value', ''); // 隐藏之后清空值
            }
          });
        } else {
          conditionList.forEach((v) => {
            if (v && v.name == 'attributeValue') {
              this.$set(v, 'isHidden', false);
            }
          });
        }
      }
    },
    getExpressionListByType(type) {
      // 根据类型获取条件列表
      let typeObj = {
        input: this.inputExpressionList,
        datetimerange: this.dateExpressionList,
        select: this.selectExpressionList
      };
      return typeObj[type] || this.selectExpressionList;
    },
    switchJoinType(item, val) {
      item.joinType = val;
    },
    changeLabel(vv, label) {
      this.$set(vv, 'labelName', label);
    },
    deleteTagCondition(parentIndex, childIndex) {
      // 删除条件
      if (this.searchConditionList[parentIndex] && this.searchConditionList[parentIndex]['conditionList']) {
        this.searchConditionList[parentIndex]['conditionList'].splice(childIndex, 1);
      }
      this.searchConditionList && this.searchConditionList.forEach((item, index) => {
        if (item && this.$utils.isEmpty(item.conditionList)) { // conditionList为空，把父级的关系也删除
          this.searchConditionList.splice(index, 1);
        }
      });
      this.delCondition(parentIndex, childIndex, true);
    },
    delCondition(tIndex, index, isEmitSearch = false) {
      this.conditionList[tIndex] && this.conditionList[tIndex]['conditionList'].splice(index, 1);
      this.conditionList && this.conditionList.forEach((item, index) => {
        if (item && this.$utils.isEmpty(item.conditionList)) {
          this.conditionList.splice(index, 1); // 解决删除最后一个条件时，并且和或者关系没有删除的问题
        }
      });
      if (isEmitSearch) {
        this.searchConditionBtn(); // 删除某个搜索条件后，触发搜索
      }
    },
    addGroupCondition() {
      // 添加分组条件
      this.conditionList.push(
        {
          uuid: this.$utils.setUuid(),
          joinType: 'or',
          conditionList: [
            {
              conditionList: this.$utils.deepClone(this.defaultConditionList),
              joinType: 'or', 
              uuid: this.$utils.setUuid()
            }
          ]});
    },
    addChildCondition(tIndex) {
      this.conditionList[tIndex].conditionList.push({conditionList: this.$utils.deepClone(this.defaultConditionList), joinType: 'or', uuid: this.$utils.setUuid()});
    },
    switchMode() {
      this.$emit('click');
    },
    searchConditionBtn() {
      // 搜索放大镜图标,点击搜索放大镜图标，把关键字拿出来
      let keyword = '';
      this.searchConditionList && !this.$utils.isEmpty(this.searchConditionList) && this.searchConditionList.forEach((item) => {
        item && item.conditionList && !this.$utils.isEmpty(item.conditionList) && item.conditionList.forEach((v) => {
          if (v.label == this.$t('page.keyword')) {
            keyword = v.text;
          }
        });
      });
      this.searchCondition(keyword);
    },
    searchKeword() {
      // 关键字搜索
      this.searchCondition(this.keyword);
    },
    filterTypeFields(vv) {
      // 过滤类型字段
      let item = this.$utils.deepClone(vv);
      if (item && item.hasOwnProperty('type')) {
        delete item.type;
      }
      return item;
    },
    openDropdown() {
      this.isVisible = !this.isVisible;
      if (this.searchConditionList && this.$utils.isEmpty(this.searchConditionList)) {
        // 设置默认初始值
        this.conditionList = [
          {
            uuid: this.$utils.setUuid(),
            joinType: 'or',
            conditionList: [{
              conditionList: this.$utils.deepClone(this.defaultConditionList),
              joinType: 'or',
              uuid: this.$utils.setUuid()
            }]
          }];
      }
    },
    isValid() {
      let isValid = true;
      let TsFormTree = this.$refs.TsFormTree;
      let TsFormSelect = this.$refs.TsFormSelect;
      let TsFormInput = this.$refs.TsFormInput;
      let TsFormDatePicker = this.$refs.TsFormDatePicker;
      if (TsFormSelect && TsFormSelect instanceof Array && !this.$utils.isEmpty(TsFormSelect)) {
        TsFormSelect.forEach((item) => {
          if (item && !item.valid()) {
            isValid = false;
          }
        });
      }
      if (TsFormTree && TsFormTree instanceof Array && !this.$utils.isEmpty(TsFormTree)) {
        TsFormTree.forEach((item) => {
          if (item && !item.valid()) {
            isValid = false;
          }
        });
      }
      if (TsFormInput && TsFormInput instanceof Array && !this.$utils.isEmpty(TsFormInput)) {
        TsFormInput.forEach((item) => {
          if (item && !item.valid()) {
            isValid = false;
          }
        });
      }
      if (TsFormDatePicker && TsFormDatePicker instanceof Array && !this.$utils.isEmpty(TsFormDatePicker)) {
        TsFormDatePicker.forEach((item) => {
          if (item && !item.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    },
    searchCondition(keyword) {
      // 搜索
      if (!this.isValid()) {
        return false;
      }
      this.searchConditionList = [];
      let uuidList = [];
      let conditionList = [];
      let searchConditionConfig = {
        keyword: keyword,
        conditionGroupList: [],
        conditionGroupRelList: []
      };
      this.conditionList && this.conditionList.forEach((v) => {
        if (v && v.conditionList && !this.$utils.isEmpty(v.conditionList)) {
          v.conditionList.forEach((item) => {
            if (item && item.conditionList && !this.$utils.isEmpty(item.conditionList)) {
              conditionList.push({ // 数组里面三个对象
                uuid: v.uuid,
                childUuid: item.uuid,
                label: item.conditionList[0].labelName,
                text: (item.conditionList[1].value == 'is-null' || item.conditionList[1].value == 'is-not-null') ? item.conditionList[1].labelName : (item.conditionList[2].labelName ? item.conditionList[2].labelName : item.conditionList[2].value),
                joinType: v.joinType,
                childJoinType: item.joinType,
                name: item.conditionList[0].name,
                attrName: item.conditionList[0].value, // 属性名称
                valueList: item.conditionList[2].value ? (typeof item.conditionList[2].value == 'string' ? [item.conditionList[2].value] : item.conditionList[2].value) : [],
                expression: item.conditionList[1].value // 条件
              });
            }
          });
        }
      });
      conditionList && !this.$utils.isEmpty(conditionList) && conditionList.forEach((item) => {
        if (uuidList && this.$utils.isEmpty(uuidList) && item.name && item.expression) {
          this.searchConditionList.push({conditionList: [item], uuid: item.uuid, childUuid: item.childUuid, joinType: item.joinType, childJoinType: item.childJoinType}); // 根据id相同，合并分组
          uuidList.push(item.uuid);
        } else if (uuidList.includes(item.uuid)) {
          this.searchConditionList.forEach((v) => {
            if (v && v.conditionList && !this.$utils.isEmpty(v.conditionList) && v.uuid == item.uuid) {
              v.conditionList.push(item);
            } else if (v && !v.hasOwnProperty('conditionList')) {
              this.$set(v, 'conditionList', [item]);
            }
          });
        } else if (!uuidList.includes(item.uuid) && item && item.name && item.expression) {
          this.searchConditionList.push({
            conditionList: [item],
            uuid: item.uuid,
            joinType: item.joinType,
            childUuid: item.childUuid,
            childJoinType: item.childJoinType
          });
        }
      });
      this.searchConditionList && this.searchConditionList.forEach((v, tIndex) => {
        if (v && v.uuid) {
          let conditionList = [];
          let conditionRelList = [];
          v.conditionList && v.conditionList.forEach((item, index) => {
            if (item && item.attrName && item.expression) { // 有属性名称和表达式有，才push进去
              conditionList.push({
                uuid: item.childUuid,
                name: item.attrName,
                valueList: item.valueList,
                expression: item.expression
              });
            }
            if (item && v.conditionList.length > 1 && !this.$utils.isEmpty(v.conditionList[index + 1])) {
              // 处理关系，是并且还是或者的关系
              conditionRelList.push({
                joinType: item.childJoinType,
                from: item.childUuid,
                to: v.conditionList[index + 1] && !this.$utils.isEmpty(v.conditionList[index + 1]) ? v.conditionList[index + 1]['childUuid'] : ''
              });
            }
          });
          if (conditionList && !this.$utils.isEmpty(conditionList)) {
            searchConditionConfig.conditionGroupList.push({
              uuid: v.uuid,
              conditionList: conditionList,
              conditionRelList: conditionRelList
            });
          }
         
          // 组与组之间的关系
          if (this.searchConditionList && this.searchConditionList.length > 1 && this.searchConditionList[tIndex] && this.searchConditionList[tIndex + 1]) {
            searchConditionConfig.conditionGroupRelList.push({
              joinType: v['joinType'],
              from: v.uuid,
              to: this.searchConditionList[tIndex + 1]['uuid']
            });
          }
        }
      });
      if (keyword) {
        this.searchConditionList[this.searchConditionList.length - 1]['joinType'] = 'and';// 关键字和其他组合条件是并且的关系
        this.searchConditionList.push({
          conditionList: [
            {
              label: this.$t('page.keyword'),
              text: keyword
            }
          ]
        });
      }
      this.$emit('search', searchConditionConfig);
      this.isVisible = false;
      this.keyword = '';
    },
    deleteAllCondition() {
      // 删除所有搜索条件
      this.searchConditionList = [];
      this.conditionList = [
        {
          uuid: this.$utils.setUuid(),
          joinType: 'or',
          conditionList: [{
            conditionList: this.$utils.deepClone(this.defaultConditionList),
            joinType: 'or',
            uuid: this.$utils.setUuid()
          }]
        }];
      this.$emit('search', {});
    },
    getConditionList() {
      this.conditionList = [];
      this.searchConditionList = [];
      this.$api.autoexec.action.getValueconverttextList(this.value).then(res => {
        if (res.Status == 'OK') {
          let conditionConfig = res.Return;
          conditionConfig && conditionConfig.conditionGroupList && conditionConfig.conditionGroupList.forEach((v) => {
            if (v && v.uuid) {
              // 处理搜索栏中条件回显
              let conditionList = [];
              let joinType = conditionConfig.conditionGroupRelList && conditionConfig.conditionGroupRelList.find((item) => item.from == v.uuid);
              v.conditionList && v.conditionList.forEach((uu) => {
                let childJoinType = v.conditionRelList && v.conditionRelList.find((item) => item.from == uu.uuid);
                conditionList.push({
                  label: uu.label,
                  text: (uu.expression == 'is-null' ? this.$t('term.expression.notempty') : (uu.expression == 'is-not-null' ? this.$t('term.expression.notempty') : '')) || (uu.text),
                  childJoinType: (childJoinType ? childJoinType.joinType : 'or') || 'or',
                  childUuid: uu.uuid 
                });
              });
              this.searchConditionList.push({
                conditionList: conditionList,
                uuid: v.uuid,
                joinType: (joinType ? joinType.joinType : 'or') || 'or'
              });
            }
            // 处理搜索面板form表单值回显
            if (v) {
              let joinType = conditionConfig.conditionGroupRelList.find(item => item.from == v.uuid); // 分组层的关系
              let conditionList = [];
              v.conditionList && v.conditionList.forEach((item) => {
                if (item) {
                  let childJoinType = v.conditionRelList.find((innerV) => innerV.from == item.uuid);
                  conditionList.push({
                    conditionList: this.$utils.deepClone(this.defaultConditionList),
                    joinType: (childJoinType ? childJoinType.joinType : 'or') || 'or',
                    uuid: item.uuid
                  });
                  let hasInput = this.inputExpressionList.find((inputItem) => inputItem.expression == item.expression); // 是否是输入框
                  conditionList[conditionList.length - 1] && conditionList[conditionList.length - 1]['conditionList'].forEach((vv) => {
                    if (vv) {
                      vv.value = vv.name == 'attributeKey' ? item.name : (vv.name == 'expression' ? item.expression : (vv.name == 'attributeValue' ? (hasInput ? item.valueList.join() : item.valueList) : ''));
                      vv.labelName = vv.name == 'attributeValue' ? item.text : item.label;
                      if (vv.name == 'attributeKey') {
                        this.attributeChange(vv.name, conditionList[conditionList.length - 1]['conditionList'], item.valueList, vv.dataList && vv.dataList.find((n) => n.handler == item.name), true);
                      } else if (vv.name == 'expression') {
                        if (item.expression == 'is-null' || item.expression == 'is-not-null') {
                          conditionList[conditionList.length - 1]['conditionList'].forEach((v) => {
                            if (v && v.name == 'attributeValue') {
                              this.$set(v, 'isHidden', true);
                            }
                          });
                        } else {
                          conditionList[conditionList.length - 1]['conditionList'].forEach((v) => {
                            if (v && v.name == 'attributeValue') {
                              this.$set(v, 'isHidden', false);
                            }
                          });
                        }
                      }
                    }
                  });
                }
              });
              this.conditionList.push({
                uuid: v.uuid,
                joinType: joinType ? joinType.joinType : 'or',
                conditionList: conditionList
              });
            }
          });
          if (this.value && this.value.hasOwnProperty('keyword') && this.value.keyword) {
            // 处理关键字回显
            this.searchConditionList[this.searchConditionList.length - 1]['joinType'] = 'and';// 关键字和其他组合条件是并且的关系
            this.searchConditionList.push({
              conditionList: [
                {
                  label: this.$t('page.keyword'),
                  text: this.value.keyword,
                  childUuid: 'keyword' // 用于从组合工具带过来的参数，做不可删除属性的判断
                }
              ]
            });
            this.canSearch = false; // 组合工具设置默认关键字参数，输入框不可搜索
          }
          this.$nextTick(() => {
            this.updateTag();
          });
        }
      });
    },
    updateTag() {
      // 更新标签的宽度
      let tagClientWidth = (this.$refs.tagDiv && this.$refs.tagDiv.clientWidth) || 0;
      let spanWidth = 0;
      let $el = this.$el.querySelector('.tag-item');
      let spanList = $el && Array.from($el.children) || [];
      spanList.forEach(el => {
        if (el && (el.nodeName == 'SPAN')) {
          spanWidth = spanWidth + el.offsetWidth + 16;
        }
      });
      this.isShowMoreBtn = spanWidth > tagClientWidth;
    }
  },
  filter: {},
  computed: {
    isShowDeleteAllBtn() {
      let hasDeleteTag = false;
      this.searchConditionList && this.searchConditionList.forEach((v) => {
        if (v && v.conditionList && !this.$utils.isEmpty(v.conditionList)) {
          hasDeleteTag = true;
        }
      });
      return hasDeleteTag;
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val && val.conditionGroupList && !this.$utils.isEmpty(val.conditionGroupList)) {
          // 搜索条件回显
          this.getConditionList();
        } else {
          // 默认初始值
          this.conditionList = [
            {
              uuid: this.$utils.setUuid(),
              joinType: 'or',
              conditionList: [{
                conditionList: this.$utils.deepClone(this.defaultConditionList),
                joinType: 'or',
                uuid: this.$utils.setUuid()
              }]
            }];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.complex-search-wrap {
  position: relative;
  .searcher-inputer {
    display: inline-block;
    width: 100%;
    height: 34px;
    line-height: 30px;
    border-width: 1px;
    border-style: solid;
    text-align: left;
  }
  .btn-remove {
    position: absolute;
    top: 0px;
    right: 30px;
    cursor: pointer;
  }
  .btn-filter {
    position: absolute;
    top: 2px;
    right: 10px;
    cursor: pointer;
  }
   .tag-item-sperate{
      text-align: center;
      opacity: .4;
      margin-left: 2px;
      margin-right: 2px;
    }
.dropdown-box {
  max-height: 450px;
  overflow-y:scroll;
  overflow-x: hidden;
  white-space: pre-wrap;
}
  .tag-item{
    display:inline-block;
    width: 96%;
    padding-left: 4px;
    line-height: 28px;
    white-space: nowrap;
    overflow: hidden;
    .tag-item-text{
      border: 1px dashed;
      padding: 0 16px;
      line-height: 30px;
      display: inline-block;
      white-space: nowrap;
      text-align: center;
      &:not(:last-of-type){
        margin-right: 10px;
      }
    }
  }
.ivu-dropdown {
  /deep/ .ivu-select-dropdown {
    width: 100%;
  }
 }
}

</style>
