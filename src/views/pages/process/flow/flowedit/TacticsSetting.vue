<template>
  <div class="TacticsSetting">
    <div class="sla_add border-color" @click="slaDiashow()">
      <i class="tsfont-plus">{{ $t('term.process.policy') }}</i>
    </div>
    <div
      v-for="(item, index) in slaList"
      :key="index"
      class="sla_content"
      @mouseenter="slamouseenter(item)"
      @mouseleave="slamouseleave"
    >
      <div class="top">
        <div class="title text-default">
          <div class="overflow" :title="item.name">{{ item.name }}</div>
        </div>
        <div class="operation">
          <i class="tsfont-setting text-tip-active" :title="$t('page.setting')" @click="slaDiashow(item.uuid, item)"></i>
          <i class="tsfont-close text-tip-active" title="$t('page.delete')" @click="slaDelete(item.uuid, item.name)"></i>
        </div>
      </div>
      <div class="content radius-sm bg-grey-hover">
        <div class="step border-color overflow">
          <span class="title text-grey" :class="$utils.isEmpty(item.processStepUuidList)?'text-error':''">{{ $t('term.process.associatedsteps') }}</span>
          <span v-for="(citem, cindex) in item.processStepUuidList" :key="cindex" class="name text-default">{{ getNodeName(citem) }}</span>
        </div>

        <div class="step border-color overflow">
          <span class="title text-grey">{{ $t('page.computationrules') }}</span>
          <span :title="getCalculateHandlerName(item.calculateHandler)">{{ getCalculateHandlerName(item.calculateHandler) }}</span>
        </div>

        <div v-for="(citem, cindex) in item.calculatePolicyList" :key="cindex" class="condition_wrapper">
          <div v-show="citem.conditionGroupList && citem.conditionGroupList.length > 0" class="condition border-color" :content-data="$t('term.framework.or')">
            <!-- <div class="con_left">
                <div v-if="citem.ruleList.length == '1'" class="left_text">如果</div>
                <div v-else class="left_text" v-html="citem.connectType == 'and' ? '并且' : '或者'"></div>
              </div> -->
            <div class="con_cli text-grey">
              <div v-for="(ditem, dindex) in citem.conditionGroupList" :key="dindex" class="group-list">
                <p v-for="(ccitem, ccindex) in ditem.conditionList" :key="ccindex" class="condition-list">
                  <span v-if="getConditiontValue(ccitem) != ''" style="display:flex;">
                    <span class="three" style="flex: none;">{{ conditionShow(ccitem) || '' }}</span>
                    <span style="padding:0 4px;flex: none;">{{ expressionShow(ccitem) || '' }}</span>
                    <span
                      :is="handlerType(ccitem.name)"
                      :value="ccitem.valueList"
                      :config="getselectConfig(ccitem.name)"
                      :readonly="true"
                      style="display: inline-block;"
                    ></span>
                  </span>
                  <TsRow v-show="ditem.conditionList.length-1 > ccindex">
                    <Col span="4">
                    </Col>
                    <Col span="18">
                      <div v-if="ditem.conditionRelList[ccindex]" class="condition-joinType text-primary">
                        {{ getConditionJoinType(ditem.conditionRelList,ccitem,ccindex) }}
                      </div>
                    </Col>
                  </TsRow>
                </p>
                <div>
                  <TsRow v-show="citem.conditionGroupList.length-1 >dindex">
                    <Col span="1">
                    </Col>
                    <Col span="20">
                      <div v-if="citem.conditionGroupRelList[dindex]" class="condition-joinType text-primary">
                        {{ getConditionJoinType(citem.conditionGroupRelList,ditem,dindex) }}
                      </div>
                    </Col>
                  </TsRow>
                </div>
              </div>
            </div>
          </div>
          <div v-if="(citem.enablePriority && citem.priorityList.length > 0) || !citem.enablePriority" class="time">
            <div v-if="citem.enablePriority">
              <div v-for="(ccitem, ccindex) in citem.priorityList" :key="ccindex" class="time_block border-color">
                <span class="title text-grey overflow" :title="getPriorityValue(ccitem.priorityUuid)">{{ getPriorityValue(ccitem.priorityUuid) }}</span>
                <span class="text-default">{{ ccitem.time }}</span>
                <span class="text-default">{{ timeArray[ccitem.unit] }}</span>
              </div>
            </div>
            <div v-else>
              <div class="time_block text-default">
                <span class="title text-grey">{{ $t('page.effectivenesstime') }}</span>
                <span>{{ citem.time }}</span>
                <span>{{ timeArray[citem.unit] }}</span>
              </div>
            </div>
          </div>
        </div>
       
      </div>
      <div v-show="item.notifyPolicyList && item.notifyPolicyList.length > 0">
        <div class="bg-grey-hover radius-sm">
          <div v-for="(citem, cindex) in item.notifyPolicyList" :key="cindex" class="notice border-color">
            <div class="condition border-color">
              <span v-html="citem.expression == 'after' ? $t('page.aftertimeout') : $t('page.beforetimeout')"></span>
              <span>{{ citem.time }}</span>
              <span>{{ timeArray[citem.unit] }}</span>
              <span class="line">—</span>
              <span class="policyName" :title="getPolicyName(citem.notifyPolicyConfig.policyId)">{{ getPolicyName(citem.notifyPolicyConfig.policyId) }}</span>
              <!-- <span v-for="(ccitem, ccindex) in citem.pluginList" :key="ccindex">{{ showhandler[ccitem] }}</span> -->
            </div>
            <!-- <div class="object border-color text-default">
              <span class="title text-grey">通知对象</span>
              <span class="item">
                <UserSelect v-model="citem.receiverList" :multiple="true" width="100%" :readonly="true" :groupList="['processUserType', 'user', 'team']" class="usertxt-ul"></UserSelect>
              </span>
            </div> -->
          </div>
        </div>
      </div>
      <div v-show="item.transferPolicyList && item.transferPolicyList.length > 0">
        <div class="bg-grey-hover radius-sm">
          <div v-for="(citem, cindex) in item.transferPolicyList" :key="cindex" class="notice">
            <div class="condition border-color">
              <span v-html="citem.expression == 'after' ? $t('page.aftertimeout') : $t('page.beforetimeout')"></span>
              <span>{{ citem.time }}</span>
              <span>{{ timeArray[citem.unit] }}</span>
              <span class="line">—</span>
              <span>{{ $t('page.transfer') }}</span>
            </div>
            <div class="object border-color">
              <span class="title text-grey">{{ $t('term.process.transferuser') }}</span>
              <span class="item">
                <UserSelect
                  v-model="citem.transferTo"
                  :multiple="false"
                  width="100%"
                  :readonly="true"
                  :groupList="['processUserType', 'user', 'team']"
                  class="usertxt-ul"
                ></UserSelect>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TsDialog
      :isShow.sync="slaDialog.show"
      type="modal"
      :className="slaDialog.className"
      height="510px"
      width="760px"
    >
      <template v-slot:header>
        <p>{{ slaDialog.title }}</p>
      </template>
      <template>
        <TsForm
          ref="slaForm"
          :itemList="slaDialog.formData"
          :labelPosition="slaDialog.labelPosition"
          border="bottom"
          :labelWidth="slaDialog.labelWidth"
          model="formRight"
        >
          <template v-slot:slot-label>
            <span>{{ $t('term.process.effectivenesstimesetting') }}</span>
            <div class="addTactics text-href tsfont-plus" @click="tacticsAdd()">{{ $t('page.effectivenesstime') }}</div>
          </template>
          <template v-slot:slot>
            <div class="tactics">
              <div v-show="slaData.calculatePolicyList && slaData.calculatePolicyList.length > 0" class="slatime_wrapper">
                <vuedraggable v-model="slaData.calculatePolicyList" :options="{ chosenClass: 'choose', animation: '150', handle: '.move' }">
                  <transition-group>
                    <div
                      v-for="(item, index) in slaData.calculatePolicyList"
                      :key="item.uuid"
                      class="slaTime"
                      :content-data="$t('term.framework.or')"
                    >
                      <span
                        v-show="slaData.calculatePolicyList && slaData.calculatePolicyList.length > 1"
                        class="tsfont-close-s btn-removerule text-tip"
                        @click="slaDel(index)"
                      ></span>
                      <div class="block_top">
                        <div class="operation text-grey">
                          <div class="opera_item move">
                            <i class="tsfont-bar"></i>
                          </div>
                          <div class="opera_item">
                            <div class="number">{{ index + 1 }}</div>
                          </div>
                          <div
                            class="opera_item toggle"
                            :class="!item.isshow ? 'hide' : ''"
                            :title="item.isshow ? $t('page.clickandputaway') : $t('page.clicktoexpand')"
                            @click="operaToggle(item, index)"
                          >
                            <Icon type="ios-arrow-down" />
                          </div>
                        </div>
                        <div class="input-border">
                          <!-- <Select v-show="item.ruleList && item.ruleList.length > 1" v-model="item.connectType">
                            <Option key="and" value="and">全部满足</Option>
                            <Option key="or" value="or">任意满足</Option>
                          </Select> -->
                          <div v-show="item.conditionGroupList && item.conditionGroupList.length > 0" class="add text-href" @click="addGroup(item)">
                            <i class="tsfont-plus">{{ $t('page.combinedcondition') }}</i>
                          </div>
                        </div>
                        <div class="top_item priority">
                          <Checkbox
                            v-model="item.enablePriority"
                            :true-value="1"
                            :false-value="0"
                            @on-change="priorityChange(item)"
                          >{{ $t('term.process.relpriority') }}</Checkbox>
                        </div>
                      </div>
                      <div v-show="item.isshow" class="block_condition rule-condition">
                        <div v-for="(groupItem,groupIndex) in item.conditionGroupList" :key="groupIndex" class="group_condition">
                          <span v-show="item.conditionGroupList.length > 1 && groupIndex > 0 || item.conditionGroupList.length === 1" class="tsfont-close-s btn-removerule text-tip" @click="conditionGroupDel(item,groupIndex)"></span>
                          <div class="bg-op radius-sm con_wrapper">
                            <div v-for="(citem, cindex) in groupItem.conditionList" :key="cindex">
                              <TsRow>
                                <Col span="4">
                                  <div class="con_item">
                                    <TsFormSelect
                                      v-model="citem.name"
                                      :dataList="formAllData"
                                      valueName="name"
                                      textName="label"
                                      search
                                      transfer
                                      @on-change="formItemChange(citem)"
                                    ></TsFormSelect>
                                  </div>
                                </Col>
                                <Col :span="citem.isShowConditionValue && citem.isShowConditionValue ? '4':'17'">
                                  <div class="con_item">
                                    <TsFormSelect
                                      v-model="citem.expression"
                                      :dataList="getselectConfig(citem.name).expressionList"
                                      valueName="expression"
                                      textName="expressionName"
                                      transfer
                                      @on-change="changeExpression(citem)"
                                    ></TsFormSelect>
                                  <!-- <Select v-model="citem.expression">
                                    <Option v-for="(ccitem, ccindex) in expressionList[citem.name]" :key="ccindex" :value="ccitem.expression">{{ ccitem.expressionName }}</Option>
                                  </Select> -->
                                  </div>
                                </Col>
                                <Col v-if="citem.isShowConditionValue && citem.isShowConditionValue == 1" span="13">
                                  <div class="con_item">
                                    <div v-if="isRequestSuccess && citem.name">
                                      <div
                                        :is="handlerType(citem.name)"
                                        :value="citem.valueList"
                                        :config="getselectConfig(citem.name)"
                                        @change="(val)=>{
                                          $set(citem,'valueList', val);
                                        }"
                                      ></div>
                                    </div>
                                    <div v-else>
                                      <TsFormSelect
                                        width="100%"
                                        transfer
                                      ></TsFormSelect>
                                    </div>
                                  </div>
                                </Col>
                                <Col span="3">
                                  <div class="add text-tip" @click="conAdd(groupItem)">
                                    <i class="tsfont-plus"></i>
                                  </div>
                                  <div v-show="groupItem.conditionList.length > 1" class="delete text-tip" @click="conDelete(groupItem, cindex)">
                                    <i class="tsfont-minus"></i>
                                  </div>
                                </Col>
                              </TsRow>
                              <div v-if="groupItem.conditionList.length-1 >cindex" class="conditionJoinType  text-href">
                                <TsRow>
                                  <Col span="8">
                                  </Col>
                                  <Col span="12">
                                    <div class="condition-joinType text-href">
                                      <TsFormSelect
                                        v-model="groupItem.conditionRelList[cindex].joinType"
                                        :dataList="relList"
                                        :clearable="false"
                                        border="none"
                                        size="small"
                                      ></TsFormSelect>
                                    </div>
                                  </Col>
                                </TsRow>

                              </div>
                            </div>
                          </div>

                          <div v-if="item.conditionGroupList.length-1 >groupIndex" class="groupJoinType text-href">
                            <TsRow>
                              <Col span="1">
                              </Col>
                              <Col span="20">
                                <div class="condition-joinType text-href">
                                  <TsFormSelect
                                    v-model="item.conditionGroupRelList[groupIndex].joinType"
                                    :dataList="relList"
                                    :clearable="false"
                                    border="nobdbg"
                                    size="small"
                                  ></TsFormSelect>
                                </div>
                              </Col>
                            </TsRow>

                          </div>
                        </div>
                        <div v-if="item.conditionGroupList && item.conditionGroupList.length < 1" class="con_add border-color text-icon" @click="conAddNew(item)">
                          <i class="tsfont-plus">{{ $t('page.condition') }}</i>
                        </div>
                      </div>
                      <div v-show="item.isshow" class="block_time">
                        <div v-if="item.enablePriority">
                          <div v-for="(citem, cindex) in item.priorityList" :key="cindex" class="time_wrapper bg-op radius-sm">
                            <TsRow>
                              <Col span="7">
                                <div class="time_item">
                                  <TsFormSelect
                                    ref="numberInput"
                                    v-model="citem.priorityUuid"
                                    :dataList="slaDialog.time.selectLeft"
                                    textName="name"
                                    valueName="uuid"
                                    width="100%"
                                    :validateList="validateSetting.required"
                                    transfer
                                  ></TsFormSelect>
                                </div>
                              </Col>
                              <Col span="7">
                                <div class="time_item">
                                  <TsFormInput
                                    ref="numberInput"
                                    v-model="citem.time"
                                    :placeholder="$t('form.placeholder.pleaseinput', {target:$t('term.process.duration')})"
                                    type="number"
                                    :validateList="validateSetting.number"
                                    width="100%"
                                  />
                                </div>
                              </Col>
                              <Col span="7">
                                <div class="time_item">
                                  <Select v-model="citem.unit">
                                    <Option v-for="ccitem in slaDialog.time.selectRight" :key="ccitem.value" :value="ccitem.value">{{ ccitem.label }}</Option>
                                  </Select>
                                </div>
                              </Col>
                              <Col span="3">
                                <div class="add text-tip" @click="timeAdd(index)">
                                  <i class="tsfont-plus"></i>
                                </div>
                                <div v-if="item.priorityList && item.priorityList.length > 1" class="delete text-tip" @click="timeDelete(index, cindex)">
                                  <i class="tsfont-minus"></i>
                                </div>
                              </Col>
                            </TsRow>
                          </div>
                          <div v-if="item.priorityList && item.priorityList.length < 1" class="time_add border-color" @click="timeAdd(index)">
                            <i class="tsfont-plus">{{ $t('term.process.priorityaging') }}</i>
                          </div>
                        </div>
                        <div v-else class="time_wrapper bg-op radius-sm">
                          <TsRow>
                            <Col span="2">
                              <span>{{ $t('page.effectivenesstime') }}</span>
                            </Col>
                            <Col span="11">
                              <div class="time_item">
                                <TsFormInput
                                  ref="numberInput"
                                  v-model="item.time"
                                  :placeholder="$t('form.placeholder.pleaseinput', {target:$t('term.process.duration')})"
                                  type="number"
                                  :validateList="validateSetting.number"
                                  width="100%"
                                ></TsFormInput>
                              </div>
                            </Col>
                            <Col span="11">
                              <div class="time_item">
                                <Select v-model="item.unit" transfer>
                                  <Option v-for="ccitem in slaDialog.time.selectRight" :key="ccitem.value" :value="ccitem.value">{{ ccitem.label }}</Option>
                                </Select>
                              </div>
                            </Col>
                          </TsRow>
                        </div>
                      </div>
                    </div>
                  </transition-group>
                </vuedraggable>
              </div>
            </div>
          </template>
          <template v-slot:notice-label>
            <span>{{ $t('page.notificationstrategy') }}</span>
            <div class="addTactics text-href tsfont-plus" @click="noticeAdd()">{{ $t('term.process.policy') }}</div>
          </template>
          <template v-slot:notice>
            <div class="tactics">
              <div v-show="slaData.notifyPolicyList && slaData.notifyPolicyList.length > 0" class="notice_wrapper bg-op radius-sm">
                <div v-for="(item, index) in slaData.notifyPolicyList" :key="index" class="notice">
                  <span class="tsfont-close-s btn-removerule text-tip" @click="noticeDel(index)"></span>
                  <div class="block_condition">
                    <div class="label require-label">{{ $t('page.triggercondition') }}</div>
                    <div class="content">
                      <div class="item">
                        <!-- <Select v-model="item.expression">
                          <Option value="after">超时后</Option>
                          <Option value="before">超时前</Option>
                        </Select>-->
                        <TsFormSelect
                          ref="numberInput"
                          v-model="item.expression"
                          :dataList="triggerCondition"
                          textName="name"
                          valueName="value"
                          width="100%"
                          :validateList="validateSetting.required"
                          transfer
                        ></TsFormSelect>
                      </div>
                      <div class="item">
                        <TsFormInput
                          ref="numberInput"
                          v-model="item.time"
                          :placeholder="$t('form.placeholder.pleaseinput', {target:$t('term.process.duration')})"
                          type="number"
                          :validateList="validateSetting.number"
                          width="100%"
                        />
                      </div>
                      <div class="item">
                        <Select v-model="item.unit" transfer>
                          <Option v-for="ccitem in slaDialog.time.selectRight" :key="ccitem.value" :value="ccitem.value">{{ ccitem.label }}</Option>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div class="block_action">
                    <div class="label require-label">{{ $t('page.notificationstrategy') }}</div>
                    <div class="content">
                      <div class="item">
                        <noticeSetting
                          ref="noticeSetting"
                          :formUuid="formUuid"
                          :hasPadding="false"
                          :config="item.notifyPolicyConfig"
                          layoutType="flexBetween"
                          border="bottom"
                          handler="neatlogic.module.process.notify.handler.SlaNotifyPolicyHandler"
                        ></noticeSetting>
                      </div>
                    </div>
                  </div>
                  <div class="block_mode">
                    <div class="label require-label">{{ $t('page.executionmode') }}</div>
                    <div class="content">
                      <div class="item">
                        <Select v-model="item.executeType" transfer @on-change="executeChange(item)">
                          <Option value="once">{{ $t('term.process.singleexecution') }}</Option>
                          <Option value="loop">{{ $t('term.process.periodicexecution') }}</Option>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div v-if="item.executeType == 'loop'" class="block_interval">
                    <div class="label require-label">{{ $t('page.interval') }}</div>
                    <div class="content">
                      <div class="item">
                        <TsFormInput
                          ref="numberInput"
                          v-model="item.intervalTime"
                          type="number"
                          :placeholder="$t('page.timeinterval')"
                          :validateList="validateSetting.number"
                          width="100%"
                        />
                      </div>
                      <div class="item">
                        <Select v-model="item.intervalUnit" transfer>
                          <Option value="minute">{{ $t('page.minute') }}</Option>
                          <Option value="hour">{{ $t('page.hour') }}</Option>
                          <Option value="day">{{ $t('page.day') }}</Option>
                        </Select>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </template>
          <template v-slot:overtime-label>
            <span>{{ $t('term.process.handoverstrategy') }}</span>
            <div class="addTactics text-href tsfont-plus" @click="overtimeAdd()">{{ $t('term.process.policy') }}</div>
          </template>
          <template v-slot:overtime>
            <div class="tactics">
              <div v-show="slaData.transferPolicyList && slaData.transferPolicyList.length > 0" class="notice_wrapper bg-op radius-sm">
                <div v-for="(item, index) in slaData.transferPolicyList" :key="index" class="notice">
                  <span class="tsfont-close-s btn-removerule text-tip" @click="transferDel(index)"></span>
                  <div class="block_condition">
                    <div class="label require-label">{{ $t('page.triggercondition') }}</div>
                    <div class="content">
                      <div class="item">
                        <!-- <Select v-model="item.expression">
                          <Option value="after">超时后</Option>
                          <Option value="before">超时前</Option>
                        </Select>-->
                        <TsFormSelect
                          ref="numberInput"
                          v-model="item.expression"
                          :dataList="triggerCondition"
                          textName="name"
                          valueName="value"
                          width="100%"
                          :validateList="validateSetting.required"
                          transfer
                        ></TsFormSelect>
                      </div>
                      <div class="item">
                        <TsFormInput
                          ref="numberInput"
                          v-model="item.time"
                          :placeholder="$t('form.placeholder.pleaseinput', {target:$t('term.process.duration')})"
                          type="number"
                          :validateList="validateSetting.required"
                        />
                      </div>
                      <div class="item">
                        <Select v-model="item.unit">
                          <Option v-for="ccitem in slaDialog.time.selectRight" :key="ccitem.value" :value="ccitem.value">{{ ccitem.label }}</Option>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div class="block_object">
                    <div class="label require-label">{{ $t('page.object') }}</div>
                    <div class="content">
                      <div class="item">
                        <UserSelect
                          ref="numberInput"
                          v-model="item.transferTo"
                          :multiple="false"
                          :groupList="['user', 'team', 'role']"
                          width="100%"
                          :validateList="validateSetting.required"
                        ></UserSelect>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button type="default" style="margin-right:10px" @click="slaDialog.show = false">{{ $t('page.close') }}</Button>
        <Button type="primary" @click="submit()">{{ $t('page.save') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>

<script>
import TsForm from '@/resources/plugins/TsForm/TsForm.vue';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
import vuedraggable from 'vuedraggable';
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';
import noticeSetting from './components/nodesetting/notice-setting.vue';
import formItems from '@/resources/components/FormItems';

export default {
  name: 'TacticsSetting',

  components: {
    TsForm,
    vuedraggable,
    TsFormInput,
    UserSelect,
    TsFormSelect,
    noticeSetting,
    ...formItems
  },
  props: {
    slaListPorps: {
      type: Array,
      default: () => {
        return [];
      }
    },
    canvasNodeList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    formConfig: {
      type: Object,
      default: () => {
        return [];
      }
    },
    startNodeuuid: String,
    permissionTypeList: Array
  },
  data() {
    let _this = this;
    return {
      calculateHandlerList: [], // 计算规则列表
      nodeList: [],
      validateSetting: {
        number: [
          { name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.process.duration')})},
          { name: 'integer_p', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.positiveinteger')})}
        ],
        required: [{ name: 'required', message: this.$t('message.completerequired', {target: ''})}]
      },
      timeArray: {
        day: this.$t('page.day'),
        hour: this.$t('page.hour'),
        minute: this.$t('page.minute')
      },
      slaDialog: {
        title: this.$t('dialog.title.addtarget', {target: this.$t('term.process.policy') }),
        show: false,
        className: 'slaDialog',
        labelPosition: 'top',
        labelWidth: 300,
        formData: [
          {
            type: 'text',
            name: 'name',
            value: '',
            border: 'border',
            placeholder: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.process.slatip')}),
            maxlength: 30,
            label: this.$t('term.process.slatip'),
            width: '80%',
            validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.positiveinteger')}) }, { name: 'name-special' }]
          },
          {
            type: 'select',
            name: 'calculateHandler',
            value: '',
            label: this.$t('page.computationrules'),
            border: 'border',
            width: '80%',
            tooltip: '',
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.process.sla.core.SlaCalculateHandlerFactory' },
            validateList: ['required'],
            onChange: function(val) {
              _this.isMultipleStep(val);
              _this.isClearStepValue();
            }
          },
          {
            type: 'select',
            name: 'step',
            label: this.$t('term.process.associatedsteps'),
            multiple: true,
            border: 'border',
            valueName: 'uuid',
            textName: 'name',
            width: '80%',
            value: '',
            dataList: [],
            validateList: [{ name: 'required', message: this.$t('form.validate.required', {target: this.$t('term.process.associatedsteps')}) }]
          },
          {
            type: 'slot',
            name: 'slot',
            label: this.$t('term.process.effectivenesstimesetting'),
            validateList: [{ name: 'required' }]
          },
          {
            type: 'slot',
            name: 'notice',
            label: this.$t('page.notificationstrategy')
          },
          {
            type: 'slot',
            name: 'overtime',
            label: this.$t('term.process.timeoutpolicy')
          }
        ],
        condition: {},
        time: {
          //时效
          selectLeft: [],
          value: '',
          selectRight: [
            {
              value: 'day',
              label: this.$t('page.day')
            },
            {
              value: 'hour',
              label: this.$t('page.hour')
            },
            {
              value: 'minute',
              label: this.$t('page.minute')
            }
          ]
        }
      },
      slaList: [],
      slaData: {
        name: '',
        calculateHandler: '', 
        calculatePolicyList: [],
        notifyPolicyList: [],
        transferPolicyList: []
      },
      handlerList: [],
      showhandler: [],
      noticeList: [],
      validateList: ['number', 'required'],
      triggerCondition: [
        {
          value: 'after',
          name: this.$t('page.aftertimeout')
        },
        {
          value: 'before',
          name: this.$t('page.beforetimeout')
        }
      ],
      formAllData: [], //表单列表
      formDataList: [], //表单数据
      commonDataList: [], //common数据
      formSelectList: [], //表单值选择数组
      expressionList: [], //条件选择数组
      formText: {}, //表单控件显示数组
      formUuid: '',
      urlIsShow: false, //
      notifyList: [], //策略列表
      relList: [
        {
          text: this.$t('page.and'),
          value: 'and'
        },
        {
          text: this.$t('page.or'),
          value: 'or'
        }
      ],
      isRequestSuccess: false,
      formItems: formItems
    };
  },

  created() {
    this.getPriority();
  },

  beforeMount() {},
  mounted() {
    this.getNotifyList();
    this.getCalculateHandlerList(); // 计算规则列表
  },

  methods: {
    isClearStepValue() {
      // 清空关键步骤值
      let slaFormArr = this.slaDialog.formData;
      for (let j = 0; j < slaFormArr.length; j++) {
        if (slaFormArr[j].name == 'step') {
          slaFormArr[j]['value'] = '';
        }
      }
    },
    isMultipleStep(id) {
      // 步骤是否是多选
      let isTrue = true;
      let description = ''; // 计算规则描述字段
      let calculateHandlerList = [];
      if (!this.$utils.isEmpty(this.calculateHandlerList)) {
        calculateHandlerList = this.calculateHandlerList.filter((val) => {
          return val.value == id;
        });
      }
      if (!this.$utils.isEmpty(calculateHandlerList)) {
        // 计算规则列表
        if (calculateHandlerList[0].hasOwnProperty('multiple')) {
          isTrue = calculateHandlerList[0]['multiple'];
          description = calculateHandlerList[0]['description'];
        } else {
          isTrue = true;
          description = '';
        }
      }
      let slaFormArr = this.slaDialog.formData;
      for (let j = 0; j < slaFormArr.length; j++) {
        // 设置关键步骤是否是多选
        if (slaFormArr[j].name == 'step') {
          slaFormArr[j]['multiple'] = isTrue;
          break;
        }
      }
      for (let j = 0; j < slaFormArr.length; j++) {
        // 设置计算规则 tooltip 值
        if (slaFormArr[j].name == 'calculateHandler') {
          slaFormArr[j]['tooltip'] = description;
          break;
        }
      }
    },
    getCalculateHandlerList() {
      // 获取计算规则列表
      this.$https.post('/api/rest/universal/enum/get', {enumClass: 'neatlogic.framework.process.sla.core.SlaCalculateHandlerFactory'}).then((res) => {
        if (res.Status == 'OK') {
          this.calculateHandlerList = res.Return;
        }
      });
    },
    getCalculateHandlerName(id) {
      // 获取计算规则名称
      let calculateName = '';
      let arr = this.calculateHandlerList;
      if (!this.$utils.isEmpty(arr)) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].value == id) {
            calculateName = arr[i].text;
            break;
          }
        }
      }
      return calculateName;
    },
    slaDiashow: function(id, item) {
      const stepList = this.canvasNodeList.filter((item) => item.type == 'process'); // 关联步骤不实时显示问题
      this.slaDialog.formData.forEach(item => {
        if (item.name == 'step') {
          item.dataList = stepList;
        } 
      });
      this.slaDialog.show = !this.slaDialog.show;
      let uuid = id;
      if (item !== undefined) {
        item.calculatePolicyList.forEach(item => {
          this.$set(item, 'isshow', true);
        });
        this.slaData = JSON.parse(JSON.stringify(item));
      }
      if (uuid && uuid != undefined) {
        let stepArray = this.slaData.processStepUuidList; //关键步骤数组处理
        if (uuid && uuid != undefined) {
          this.slaDialog.title = this.$t('dialog.title.edittarget', {target: this.$t('term.process.policy') });
          this.isMultipleStep(this.slaData.calculateHandler); // 设置关键步骤是否是多选
          let slaObj = {
            'name': this.slaData.name, // 时效标签
            'calculateHandler': this.slaData.calculateHandler, // 计算规则
            'step': stepArray // 关联步骤
          };
          this.slaDialog.formData.forEach(item => {
            if (slaObj[item.name]) {
              item.value = slaObj[item.name];
            }
          });
          this.slaData.calculatePolicyList.forEach(item => {
            item.conditionGroupList.forEach(citem => {
              for (var i = 0; i < citem.conditionList.length; i++) {
                let row = citem.conditionList[i];
                for (let key in row) {
                  if (key == 'key') {
                    let index = row[key].lastIndexOf('.');
                    row[key] = row[key].substring(index + 1, row[key].length);
                  }
                }
              }
            });
          });
        }
      } else {
        this.tacticsAdd();
      }
    },
    //添加初始条件
    conAddNew: function(item) {
      let uuid = this.$utils.setUuid();
      let conditionRelList = [];
      let conditionList = [
        {
          uuid: this.$utils.setUuid(),
          type: '',
          expression: '',
          valueList: '',
          isShowConditionValue: 1
        }
      ];
      let newObj = {
        conditionList: conditionList,
        conditionRelList: conditionRelList,
        uuid: uuid
      };
      item.conditionGroupList.push(newObj);
    },
    //添加组内条件
    conAdd(item) {
      let uuid = this.$utils.setUuid(); //获取条件uuid
      let conditionRelList = item.conditionRelList || [];
      let conditionList = item.conditionList;
      let endUuid = conditionList[conditionList.length - 1].uuid;
      let conditionRel = {
        from: endUuid,
        joinType: 'and',
        to: uuid
      };
      let condition = {
        uuid: uuid,
        type: '',
        expression: '',
        valueList: '',
        isShowConditionValue: 1
      };
      item.conditionList.push(condition);
      item.conditionRelList.push(conditionRel);
    },
    conDelete(item, index) {
      this.$delete(item.conditionList, index);
      this.$delete(item.conditionRelList, index - 1);
    },
    getConditionJoinType(relList, item, index) {
      //页面条件展示
      let joinText = '';
      let joinType = relList[index].joinType;
      if (joinType == 'or') {
        joinText = this.$t('page.or');
      } else {
        joinText = this.$t('page.and');
      }
      return joinText;
    },
    addGroup(item) {
      //条件节点规则：添加组合
      let conditionGroupRelList = item.conditionGroupRelList || [];
      let GroupList = item.conditionGroupList;
      let endRelUuid = GroupList[GroupList.length - 1].uuid;
      let groupUuid = this.$utils.setUuid(); //获取组的uuid
      let uuid = this.$utils.setUuid(); //获取条件uuid
      let groupRel = {
        from: endRelUuid,
        joinType: 'and',
        to: groupUuid
      };
      let group = {
        uuid: groupUuid,
        conditionList: [
          {
            uuid: uuid,
            type: '',
            expression: '',
            valueList: '',
            isShowConditionValue: 1
          }
        ],
        conditionRelList: []
      };
      item.conditionGroupRelList.push(groupRel);
      item.conditionGroupList.push(group);
    },
    conditionGroupDel(item, groupIndex) {
      this.$delete(item.conditionGroupList, groupIndex);
      this.$delete(item.conditionGroupRelList, groupIndex - 1);
    },
    //添加优先级时效
    timeAdd: function(index) {
      let newArr = {
        name: '',
        time: '',
        unit: 'minute'
      };
      this.slaData.calculatePolicyList[index].priorityList.push(newArr);
      if (this.slaData.calculatePolicyList[index].priorityList.length > '0') {
        this.slaData.calculatePolicyList[index].enablePriority = 1;
      }
    },
    timeDelete: function(index, cindex) {
      this.slaData.calculatePolicyList[index].priorityList.splice(cindex, 1);
      if (this.slaData.calculatePolicyList[index].priorityList.length == '0') {
        this.slaData.calculatePolicyList[index].enablePriority = 0;
      }
    },
    //添加时效
    tacticsAdd: function() {
      let newUuid = this.$utils.setUuid();
      let newArr = {
        conditionGroupList: [],
        conditionGroupRelList: [],
        enablePriority: 0,
        priorityList: [],
        isshow: true,
        uuid: newUuid,
        unit: 'minute'
      };
      this.slaData.calculatePolicyList.push(newArr);
      let stepList = this.canvasNodeList.filter((item) => item.type == 'process'); // 关联步骤不实时显示问题
      this.slaDialog.formData.forEach(item => {
        if (item.name == 'step') {
          item.dataList = stepList;
        } 
      });
      this.isMultipleStep(); // 关键步骤是否是多选
    },
    //添加通知策略
    noticeAdd: function() {
      let newUuid = this.$utils.setUuid();
      let newArr = {
        uuid: newUuid,
        unit: 'minute',
        executeType: 'once'
      };
      this.slaData.notifyPolicyList.push(newArr);
    },
    //添加超时策略
    overtimeAdd: function() {
      let newUuid = this.$utils.setUuid();
      let newArr = {
        uuid: newUuid,
        unit: 'minute'
      };
      this.slaData.transferPolicyList.push(newArr);
    },
    //修改执行方式
    executeChange: function(item) {
      if (item.executeType == 'once') {
        item.intervalTime = '';
        item.intervalUnit = '';
      } else if (item.executeType == 'loop') {
        item.intervalUnit = 'day';
      }
    },
    //时效展开收起
    operaToggle: function(item, index) {
      item.isshow = !item.isshow;
    },
    //优先级下拉选择改变时
    timeChange(citem) {
      this.slaDialog.time.selectLeft.forEach(item => {
        if (item.uuid == citem.uuid) {
          citem.name = item.name;
        }
      });
    },
    //是否关联优先级
    priorityChange(item) {
      if (item.enablePriority == '1') {
        let newArr = {
          name: '',
          time: '',
          unit: 'minute'
        };
        item.priorityList = [];
        item.priorityList.push(newArr);
      } else {
        item.time = '';
        item.unit = 'minute';
      }
    },
    //提交
    submit: function() {
      if (!this.$refs.slaForm.valid()) {
        return;
      }
      let keyArr = [];
      let arr = this.$refs.numberInput;
      for (let i = 0; i < arr.length; i++) {
        if (!arr[i].valid()) {
          keyArr.push('fasle');
        }
      }
      if (keyArr.length > 0) return;
      let data = this.$refs.slaForm.getFormValue();
      this.slaData.name = data.name;
      this.slaData.processStepUuidList = data.step instanceof Array ? data.step : [data.step];
      this.slaData.calculateHandler = data.calculateHandler; // 计算规则
      if (this.$refs.noticeSetting && this.$refs.noticeSetting.length > 0) {
        this.slaData.notifyPolicyList.forEach((citem, cindex) => {
          const data = this.$refs.noticeSetting[cindex].getData();
          this.$set(citem, 'notifyPolicyConfig', data);
        });
      }
      let voildList = [];
      let noticeList = [];
      this.slaData.calculatePolicyList.forEach(citem => {
        citem.conditionGroupList.forEach(ccitem => {
          ccitem.conditionList.forEach(d => {
            if (d.expression == '') {
              voildList.push(false);
            }
            if (d.name == '') {
              voildList.push(false);
            }
            if (d.isShowConditionValue == 1) {
              if (Array.isArray(d.valueList)) {
                if (d.valueList.length == 0) {
                  voildList.push(false);
                } else if (d.valueList[0] == '') {
                  voildList.push(false);
                }
              } else if (d.valueList == '') {
                voildList.push(false);
              }
            }
          });
        });
      });
      this.slaData.notifyPolicyList.forEach(ditem => {
        if (!ditem.notifyPolicyConfig.policyId) {
          noticeList.push(false);
        }
      });
      this.$refs.noticeSetting &&
        this.$refs.noticeSetting.policyId &&
        this.$refs.noticeSetting.forEach(d => {
          if (!d.valid()) {
            noticeList.push(false);
          }
        });
      if (noticeList.length > 0) {
        this.$Message.error(this.$t('message.completerequired', {target: this.$t('page.notificationstrategy')}));
        return;
      }
      if (voildList.length > 0) {
        this.$Message.error(this.$t('message.completerequired', {target: this.$t('term.process.limitationconditions')}));
        return;
      }

      if (this.slaData.uuid !== undefined) {
        this.slaList.forEach((item, index) => {
          if (item.uuid == this.slaData.uuid) {
            item.name = this.slaData.name;
            item.calculateHandler = this.slaData.calculateHandler; // 计算规则
            item.calculatePolicyList = this.slaData.calculatePolicyList;
            item.processStepUuidList = this.slaData.processStepUuidList;
            item.notifyPolicyList = this.slaData.notifyPolicyList;
            item.transferPolicyList = this.slaData.transferPolicyList;
          }
        });
      } else {
        let addUuid = this.$utils.setUuid();
        this.slaData.uuid = addUuid;
        //this.slaData.processStepUuidList = this.slaData.processStepUuidList;
        this.slaList.push(this.slaData);
      }
      // this.$Notice.success({
      //   title: this.$t('message.savesuccess'),
      //   duration: 1.5
      // });
      this.slaDialog.show = false;
    },
    //鼠标移进
    slamouseenter: function(item) {
      this.$emit('slaIn', item);
    },
    //鼠标移出
    slamouseleave: function() {
      this.$emit('slaOut');
    },
    //删除
    slaDelete: function(uuid, name) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          this.slaList.forEach((item, index) => {
            if (item.uuid == uuid) {
              this.slaList.splice(index, 1);
              this.$Message.success(this.$t('message.deletesuccess'));
            }
          });
        }
      });
    },
    //策略删除
    slaDel: function(index) {
      this.$delete(this.slaData.calculatePolicyList, index);
    },
    noticeDel(index) {
      this.$delete(this.slaData.notifyPolicyList, index);
    },
    transferDel(index) {
      this.$delete(this.slaData.transferPolicyList, index);
    },
    //获取优先级列表
    getPriority() {
      let data = {
        needPage: false,
        isActive: 1
      };
      this.$api.process.priority.search(data).then(res => {
        if (res.Status == 'OK') {
          let priorityList = res.Return.tbodyList;
          this.slaDialog.time.selectLeft = priorityList;
        }
      });
    },
    //获取策略列表
    getNotifyList() {
      const data = {
        handler: 'neatlogic.module.process.notify.handler.SlaNotifyPolicyHandler',
        needPage: false
      };
      this.$api.framework.tactics.searchNotifyList(data).then(res => {
        if (res.Status == 'OK') {
          this.notifyList = res.Return.tbodyList;
        }
      });
    },
    //获取关联表单组件
    getFormItem(data) {
      let _this = this;
      this.$api.process.process
        .conditionList(data)
        .then(res => {
          if (res.Status == 'OK') {
            let plugin = res.Return;
            _this.formDataList = plugin.filter(d => d.type == 'form');
            _this.commonDataList = plugin.filter(d => d.type == 'common');
            // this.getSelectList();
            plugin.forEach(item => {
              if (item.type == 'common') {
                item.handler = 'form' + item.controller;
              }
            });
            _this.formAllData = plugin;
            _this.isRequestSuccess = true;
          }
        })
        .catch(error => {
          console.log(error);
          // this.$Message.error('获取表单数据失败');
        });
    },
    //获取表单组件对应数据
    formItemChange(val) {
      let name = '';
      if (val.name) {
        val.expression = '';
        val.valueList = '';
        name = val.name;
      } else {
        name = val;
      }
      let newList = this.formDataList.find(d => d.name == name);
      let commonList = this.commonDataList.find(d => d.name == name);
      //如果已保存的值该控件在表单管理中删除或者切换表单删除旧表单的值
      if (newList == undefined && commonList == undefined) {
        this.slaList.forEach(item => {
          item.calculatePolicyList.forEach(citem => {
            citem.conditionGroupList.forEach(d => {
              d.conditionList.forEach((ccitem, ccindex) => {
                if (ccitem.name == val) {
                  d.conditionList.splice(ccindex, 1);
                }
              });
            });
          });
        });
      }
      //添加type
      if (val.name && commonList != undefined && commonList.type != null) {
        val.type = commonList.type;
      }
      if (val.name && newList != undefined && newList.type != null) {
        val.type = newList.type;
      }
      //添加type
      if (newList != undefined) {
        let expressionList = newList.expressionList;
        this.$set(this.expressionList, name, expressionList);
      }
      if (commonList != undefined) {
        let expressionList = commonList.expressionList;
        this.$set(this.expressionList, name, expressionList);
      }
      if (newList && newList.config.dataList && newList.config.dataList.length > 0) {
        let List = newList.config.dataList;
        this.$set(this.formSelectList, name, List);
      }
      if (commonList && commonList.config && commonList.config.dataList && commonList.config.dataList.length > 0) {
        let List = commonList.config.dataList;
        this.$set(this.formSelectList, name, List);
      }
      if (commonList && commonList.config && commonList.config.url) {
        let List = commonList.config;
        this.$set(this.formSelectList, name, List);
      }
    },
    //获取表单右边选择列表
    getSelectList() {
      if (this.slaList !== '') {
        this.slaList.forEach(item => {
          if (item.calculatePolicyList && item.calculatePolicyList.length > 0) {
            item.calculatePolicyList.forEach(citem => {
              if (citem.conditionGroupList && citem.conditionGroupList.length > 0) {
                citem.conditionGroupList.forEach(ccitem => {
                  if (ccitem.conditionList && ccitem.conditionList.length > 0) {
                    ccitem.conditionList.forEach(d => {
                      let name = d.name;
                      this.formItemChange(name);
                    });
                  }
                });
              }
            });
          }
        });
      }
    },
    //获取右侧类型
    getFormType(val) {
      let newList = this.formDataList.find(d => d.name == val);
      let commonList = this.commonDataList.find(d => d.name == val);
      let type = '';
      if (newList != undefined) {
        type = newList.controller;
      }
      if (commonList != undefined) {
        type = commonList.controller;
      }
      return type;
    },
    getisMultiple(val) {
      let newList = this.formDataList.find(d => d.name == val);
      let commonList = this.commonDataList.find(d => d.name == val);
      let isMultiple = new Boolean();
      if (newList != undefined) {
        isMultiple = newList.isMultiple;
        if (typeof isMultiple == 'string') {
          isMultiple = JSON.parse(isMultiple);
        }
      }
      if (commonList != undefined) {
        isMultiple = commonList.isMultiple;
        if (typeof isMultiple == 'string') {
          isMultiple = JSON.parse(isMultiple);
        }
      }
      return isMultiple;
    },
    conditionShow(val) {
      let value = val.name;
      let type = val.type;
      let text = '';
      this.formAllData.forEach(item => {
        if (item.name == value) {
          text = item.label;
        }
      });
      return text;
    },
    expressionShow(val) {
      let value = val.name;
      let type = val.type;
      let expression = val.expression;
      let expressionText = '';
      let expressionList = [];
      this.formAllData.forEach(item => {
        if (item.name == value) {
          expressionList = item.expressionList;
        }
      });
      expressionList.forEach(item => {
        if (item.expression == expression) {
          expressionText = item.expressionName;
        }
      });
      return expressionText;
    },
    getConditiontValue(obj) {
      let valueList = obj.valueList;
      let key = obj.name;
      let type = obj.type;
      let newValue = null;
      let controller = '';
      this.formAllData.forEach(item => {
        if (item.name == key) {
          controller = item.controller;
        }
      });
      return controller;
    },
    changeExpression(item) {
      if (item.expression) {
        let expressionList = this.getselectConfig(item.name).expressionList;
        let obj = expressionList.find(e => e.expression == item.expression);
        if (obj) {
          this.$set(item, 'isShowConditionValue', obj.isShowConditionValue);
          if (obj.isShowConditionValue == 0) {
            this.$set(item, 'valueList', '');
          }
        }
      }
    },
    valid() {
      let isValid = true;
      if (!this.$utils.isEmpty(this.slaList)) {
        const nodeUuidList = this.canvasNodeList.map(item => item.uuid);
        this.slaList.forEach(item => {
          // 验证关联步骤
          if (!this.$utils.isEmpty(item.processStepUuidList)) {
            let processStepUuidList = this.$utils.intersectionArr(nodeUuidList, item.processStepUuidList);
            this.$set(item, 'processStepUuidList', processStepUuidList);
          }
          if (item.processStepUuidList.length == 0) {
            isValid = false;
          }
        });
      }
      return isValid;
    }
  },
  computed: {
    getPriorityValue() {
      return uuid => {
        let obj = this.slaDialog.time.selectLeft.find(d => d.uuid == uuid);
        let text = '';
        if (obj != undefined) {
          text = obj.name;
        }
        return text;
      };
    },
    getPolicyName() {
      return function(val) {
        const obj = this.notifyList.find(d => d.id === val);
        if (obj) {
          return obj.name;
        } else {
          return '';
        }
      };
    },
    getFormat(config) {
      if (config) {
        let styleType = config.styleType || '-';
        return config.showType.replace(/\-/g, styleType);
      } else {
        return 'yyyy-MM-dd HH:mm:ss';
      }
    },
    handlerType() {
      return function(name) {
        let type = 'formtext';
        let selectConfig = this.formAllData.find(d => d.name == name);
        if (selectConfig && this.formItems[selectConfig.handler]) {
          type = selectConfig.handler;
        }
        return type;
      };
    },
    getselectConfig() {
      return function(name) {
        let config = {};
        let selectConfig = this.formAllData.find(d => d.name == name);
        if (selectConfig) {
          if (selectConfig.config) {
            this.$set(selectConfig.config, 'sperateText', '、');
          }
          config = selectConfig;
        }
        return config;
      };
    },
    getNodeName() {
      return (uuid) => { //节点名称
        let name = '';
        let findNode = this.canvasNodeList.find(d => d.uuid == uuid);
        if (findNode) {
          name = findNode.name;
        }
        return name;
      };
    }
  },

  watch: {
    'slaDialog.show': function() {
      if (this.slaDialog.show === false) {
        this.slaDialog.title = this.$t('dialog.title.addtarget', {target: this.$t('term.process.policy') });
        this.$refs.slaForm.clearForm();
        this.slaData = {
          name: '',
          calculatePolicyList: [],
          notifyPolicyList: [],
          transferPolicyList: []
        };
      }
    },
    // 'slaData.calculatePolicyList': {
    //   name: function(newVal) {
    //     newVal.forEach(item => {
    //       if (item.connectType == '' && item.ruleList && item.ruleList.length > 1) {
    //         item.connectType = 'and';
    //       } else if (item.ruleList.length < 2) {
    //         item.connectType = '';
    //       }
    //     });
    //   },
    //   deep: true //深度监听
    // },
    canvasNodeList: {
      handler: function(newVal) {
        this.nodeList = newVal.filter(d => d.type == 'process');
        var newObj = this.slaDialog.formData.find(d => d.name === 'step');
        newObj.dataList = this.nodeList.map(item => {
          return {
            name: item.name,
            uuid: item.uuid
          };
        });
      },
      deep: true
    },
    formConfig: function() {
      if (this.formConfig && this.formConfig.uuid) {
        this.formUuid = this.formConfig.uuid;
        let data = {
          formUuid: this.formUuid
        };
        this.getFormItem(data);
      } else {
        let data = {};
        this.getFormItem(data);
      }
    },
    slaListPorps: function() {
      this.slaList = this.slaListPorps;
    }
  }
};
</script>
<style lang="less">
@import '~@/resources/assets/css/variable.less';
.theme(@primary-color,@bg-grey-hover,@dividing-color) {
  .TacticsSetting {
    width: 100%;
    height: calc(100vh - 150px);
    padding: @space-md;
    overflow: auto;
    -ms-overflow-style: none;
    overflow: -moz-scrollbars-none;
    &::-webkit-scrollbar {
      width: 0 !important;
    }
    .sla_add {
      width: 100%;
      text-align: center;
      height: 32px;
      line-height: 32px;
      border: 1px dashed;
      cursor: pointer;
      border-radius: 4px;
      > i {
        &:before {
          padding-right: 10px;
        }
      }
    }
    .sla_content {
      margin-top: 16px;
      overflow: hidden;
      position: relative;
      &:hover {
        .top {
          .title {
            font-weight: 550;
          }
        }
      }
      .top {
        width: 100%;
        height: 32px;
        display: flex;
        align-items: center;
        .title {
          flex: 1;
          overflow: hidden;
        }
        .operation {
          margin-left: auto;
          > i {
            margin-left: 10px;
            cursor: pointer;
          }
        }
      }
      .content {
        .step {
          height: 40px;
          line-height: 40px;
          border-bottom: 1px solid;
          padding: 0 10px;
          > .title {
            width: 52px;
            padding-right: 12px;
          }
          > .name {
            padding-right: 5px;
          }
        }
        .condition_wrapper {
          position: relative;
          &:not(:last-child) {
            margin-bottom: 28px;
            &::before {
              position: absolute;
              width: 24px;
              height: 12px;
              line-height: 12px;
              border-radius: 2px;
              color: @primary-color;
              bottom: -20px;
              left: 12px;
              font-size: 12px;
              text-align: center;
              z-index: 2;
              content: attr(content-data);
              background: @bg-grey-hover;
            }
            &::after {
              position: absolute;
              width: 1px;
              height: 28px;
              bottom: -28px;
              left: 24px;
              text-align: center;
              content: '';
              background: @primary-color;
            }
          }
          .condition {
            position: relative;
            min-height: 30px;
            padding: 0 10px;
            .con_left {
              width: 64px;
              height: 100%;
              position: absolute;
              display: flex;
              align-items: center;
              justify-content: center;
              .left_text {
                width: 24px;
                height: 24px;
                line-height: 24px;
                text-align: center;
                border-radius: 2px;
                color: @primary-color;
                font-size: 12px;
              }
            }
            .con_cli {
              padding: 8px 0;
              overflow: hidden;
              .group-list {
                position: relative;

                .condition-list {
                  position: relative;

                  .condition-text {
                    width: 100%;
                    border-bottom: 1px solid;
                    display: inline-block;
                  }
                }
              }
              > p {
                > span {
                  padding: 4px 0;
                  display: block;
                  width: 100%;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  .three {
                    padding-right: 4px;
                    display: inline;
                    > .cli {
                      padding-right: 4px;
                    }
                  }
                }
                // &:first-child {
                //   > span {
                //     border: none;
                //   }
                // }
                .usertxt-ul {
                  display: inline-block;
                  position: relative;
                  top: -1px;
                }
              }
              .divider {
                margin: 0;
              }
            }
          }
          .time {
            padding: 0 10px;
            .time_block {
              height: 32px;
              line-height: 32px;
              &:not(:last-child) {
                border-bottom: 1px solid;
              }
              > .title {
                width: 64px;
                display: inline-block;
                padding-right: 12px;
              }
            }
          }
        }
      }
      .notice {
        &:not(:last-child) {
          .condition {
            border-bottom: 1px solid;
          }
        }
        &:first-child {
          margin-top: 8px;
        }
        .condition {
          height: 40px;
          line-height: 40px;
          padding: 0 10px;
          &:not(:last-child) {
            border-bottom: 1px solid;
          }
          > span {
            display: inline-block;
          }
          .line {
            margin: 0 5px;
          }
          .policyName {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 60%;
          }
        }
        .object {
          line-height: 40px;
          padding: 0 10px;
          .title {
            width: 70px;
            display: inline-block;
            padding-right: 12px;
          }
          .item {
            display: inline-block;
            margin-right: 8px;
            position: relative;
            &:not(:last-child) {
              &::before {
                position: absolute;
                bottom: 0;
                right: -14px;
                text-align: center;
                z-index: 2;
                content: '、';
              }
            }
          }
        }
      }
    }
  }
  .slaDialog {
    .ivu-form-label-top .ivu-form-item-label {
      padding-bottom: 8px;
    }
    .addTactics {
      text-align: center;
      cursor: pointer;
      display: inline-block;
      padding-left: 12px;
      > i {
        &:before {
          padding-right: 4px;
        }
      }
    }
    .tactics {
      width: 100%;
      position: relative;
      text-align: center;
      .slatime_wrapper {
        margin-bottom: 10px;
        .slaTime {
          position: relative;
          .btn-removerule {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 14px;
            height: 14px;
            line-height: 14px;
            text-align: center;
            cursor: pointer;
            display: none;
            opacity: 1;
          }
          &:hover {
            .btn-removerule {
              display: block;
              // &:hover {
              //   // opacity: 1;
              // }
            }
          }
          &:not(:last-child) {
            margin-bottom: 28px;
            &::before {
              position: absolute;
              width: 24px;
              height: 15px;
              line-height: 16px;
              border-radius: 2px;
              background: @primary-color;
              color: @white;
              bottom: -22px;
              left: 12px;
              font-size: 9px;
              text-align: center;
              z-index: 2;
              content: attr(content-data);
            }
            &::after {
              position: absolute;
              width: 1px;
              height: 28px;
              background: var(--dividing-color, @dividing-color);
              bottom: -28px;
              left: 24px;
              text-align: center;
              content: '';
            }
          }
          .block_top {
            display: flex;
            .operation {
              width: 95px;
              display: flex;
              align-items: center;
              .opera_item {
                text-align: center;
                width: 20px;
                .number {
                  width: 20px;
                  height: 20px;
                  line-height: 20px;
                  display: block;
                  font-size: 16px;
                  font-weight: 500;
                }
              }
              .toggle {
                cursor: pointer;
                .transition(200ms);
                margin-left: 14px;
              }
              .hide {
                .transform(rotate(180deg));
              }
              .move {
                cursor: move;
              }
            }
            .top_item {
              flex: 1;
              text-align: left;
            }
            .priority {
              text-align: right;
            }
          }
          .block_condition {
            padding: 16px 0;
            .group_condition {
              position: relative;
              .btn-removerule {
                position: absolute;
                top: -4px;
                right: -4px;
                width: 14px;
                height: 14px;
                line-height: 14px;
                text-align: center;
                cursor: pointer;
                display: none;
                opacity: 1;
                z-index: 9;
              }
              &:hover {
                .btn-removerule {
                  display: block;
                }
              }
              &:not(:last-child) {
                position: relative;
              }
              .condition-joinType {
                position: relative;
                width: 60px;
                height: 28px;
                line-height: 28px;
                &:before,
                &:after {
                  content: '';
                  position: absolute;
                  left: 14px;
                  width: 0px;
                  height: 6px;
                  border-left: 1px solid;
                  z-index: 9;
                }
                &:before {
                  top: 0;
                }
                &:after {
                  bottom: 0;
                }
              }
              .con_wrapper {
                padding: @space-md;
                position: relative;
                .con_item {
                  display: inline-block;
                  text-align: left;
                  width: 100%;
                }
                .add {
                  width: 20px;
                  height: 34px;
                  cursor: pointer;
                  display: inline-block;
                }
                .delete {
                  width: 20px;
                  height: 34px;
                  cursor: pointer;
                  display: inline-block;
                  padding-left: 10px;
                }
              }
            }
            .con_add {
              width: 100%;
              // height: 24px;
              // line-height: 24px;
              border: 1px dashed;
              cursor: pointer;
              border-radius: 4px;
              > i {
                &:before {
                  padding-right: 10px;
                }
              }
            }
          }
          .block_time {
            .time_wrapper {
              margin-bottom: 16px;
              padding: @space-md;
              > span {
                padding-right: 16px;
              }
              .time_item {
                width: 100%;
                text-align: left;
                margin-right: 24px;
              }
              .delete {
                width: 20px;
                height: 34px;
                display: inline-block;
                cursor: pointer;
                padding-left: 10px;
              }
              .add {
                width: 20px;
                height: 34px;
                display: inline-block;
                cursor: pointer;
              }
            }
            .time_add {
              width: 100%;
              height: 24px;
              line-height: 24px;
              border: 1px dashed;
              color: @icon-color;
              cursor: pointer;
              > i {
                &:before {
                  padding-right: 10px;
                }
              }
            }
          }
        }
      }
      .notice_wrapper {
        margin-bottom: 10px;
        text-align: left;
        .notice {
          padding: 16px;
          position: relative;
          .notify-icon {
            cursor: pointer;
            padding-left: 10px;
          }
          .label {
          }
          .btn-removerule {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 14px;
            height: 14px;
            line-height: 14px;
            text-align: center;
            cursor: pointer;
            display: none;
            // opacity: 0.6;
          }
          &:hover {
            .btn-removerule {
              display: block;
              // &:hover {
              //   opacity: 1;
              // }
            }
          }
          &:not(:first-child) {
            margin-top: 16px;
          }
          > div {
            display: flex;
            margin-bottom: 10px;
            &:nth-last-child(1) {
              margin-bottom: 0;
            }
            .label {
              width: 75px;
              text-align: right;
            }
            .content {
              margin-left: 10px;
              display: flex;
              width: 100%;
              .item {
                flex: 1;
                padding: 0 10px;
              }
            }
          }
        }
      }
    }
  }
}

html {
  .theme(@default-primary-color,@default-bg-grey-hover,@default-dividing);

  &.theme-dark {
    .theme(@dark-primary-color,@dark-bg-grey-hover,@dark-dividing);
  }
}
</style>
