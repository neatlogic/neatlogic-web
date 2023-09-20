<template>
  <div>
    <TsDialog v-if="relData" v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
          <template v-slot:content>
            <div>
              <TsRow class="form-item">
                <Col span="12">
                  <TsRow>
                    <Col span="8" class="text-grey form-title">{{ $t('page.relationtype') }}</Col>
                    <Col span="16" class="form-control">
                      <TsFormSelect
                        ref="typeId"
                        v-model="relData.typeId"
                        :validateList="[{ name: 'required', message: $t('form.placeholder.pleaseselect', { target: $t('page.relationtype') }) }]"
                        border="border"
                        :transfer="true"
                        :dataList="relTypeList"
                        textName="name"
                        valueName="id"
                      ></TsFormSelect>
                    </Col>
                  </TsRow>
                </Col>
                <Col span="12">
                  <div style="text-align:right;line-height:35px">
                    {{ $t('page.autocollect') }}
                    <i-switch v-model="relData.inputType" :true-value="'at'" :false-value="'mt'"></i-switch>
                    <Poptip
                      word-wrap
                      width="200"
                      placement="left"
                      trigger="hover"
                    >
                      <div slot="content">
                        {{ $t('form.help.activeautocollect') }}
                      </div>
                      <i class="tsfont-info-o"></i>
                    </Poptip>
                  </div>
                </Col>
              </TsRow>

              <TsRow class="form-item">
                <Col span="4"></Col>
                <Col span="20">
                  <div class="wrapper bg-block radius-md">
                    <div class="item-left">
                      <div :class="relData.fromCiId == ciData.id ? 'text-primary' : ''">
                        {{ $t('term.cmdb.upside') }}
                      </div>
                      <div class="reledit-icon border-color bg-block" :class="relData.fromCiId == ciData.id ? 'border-primary text-primary' : ''" @click="changeFromCi()">
                        <i v-if="relData.fromCiIcon" :class="relData.fromCiIcon" :style="!relData.id && !relData.fromDisabled ? 'cursor:pointer' : ''"></i>
                        <i v-if="!relData.fromCiIcon" class="tsfont-plus" style="cursor:pointer"></i>
                      </div>
                      <div class="overflow" :class="relData.fromCiId == ciData.id ? 'text-primary' : ''">
                        {{ relData.fromCiLabel || '...' }}
                      </div>
                    </div>
                    <div
                      v-if="!relData.id"
                      class="reledit-switch border-color bg-block"
                      :title="$t('page.positiontransfer')"
                      @click="switchRel"
                    >
                      <i class="tsfont-change"></i>
                    </div>
                    <div class="reledit-line border-color"></div>
                    <div class="item-right">
                      <div :class="relData.toCiId == ciData.id ? 'text-primary' : ''">
                        {{ $t('term.cmdb.downside') }}
                      </div>
                      <div class="reledit-icon border-color bg-block" :class="relData.toCiId == ciData.id ? 'border-primary text-primary' : ''" @click="changeToCi()">
                        <i v-if="relData.toCiIcon" :class="relData.toCiIcon" :style="!relData.id && !relData.toDisabled ? 'cursor:pointer' : ''"></i>
                        <i v-if="!relData.toCiIcon" class="tsfont-plus" style="cursor:pointer"></i>
                      </div>
                      <div class="overflow" :class="relData.toCiId == ciData.id ? 'text-primary' : ''">
                        {{ relData.toCiLabel || '...' }}
                      </div>
                    </div>
                  </div>
                </Col>
              </TsRow>

              <TsRow class="form-item">
                <Col span="4" class="text-grey form-title">{{ $t('page.uniquekey') }}</Col>
                <Col span="10" class="form-control">
                  <TsFormInput
                    ref="fromName"
                    v-model="relData.fromName"
                    :placeholder="$t('term.cmdb.upsideuniquekey')"
                    border="border"
                    :validateList="[
                      { name: 'required', message: ' ' },
                      { name: 'unique_ident', message: $t('form.placeholder.inputenchar') }
                    ]"
                  ></TsFormInput>
                </Col>
                <Col span="10" class="form-control">
                  <TsFormInput
                    ref="toName"
                    v-model="relData.toName"
                    :placeholder="$t('term.cmdb.downsideuniquekey')"
                    border="border"
                    :validateList="[
                      { name: 'required', message: ' ' },
                      { name: 'unique_ident', message: $t('form.placeholder.inputenchar') }
                    ]"
                  ></TsFormInput>
                </Col>
              </TsRow>

              <TsRow class="form-item">
                <Col span="4" class="text-grey form-title">{{ $t('page.name') }}</Col>
                <Col span="10" class="form-control">
                  <TsFormInput
                    ref="fromLabel"
                    v-model="relData.fromLabel"
                    :placeholder="$t('term.cmdb.upsidename')"
                    border="border"
                    :validateList="[{ name: 'required', message: ' ' }]"
                  ></TsFormInput>
                </Col>
                <Col span="10" class="form-control">
                  <TsFormInput
                    ref="toLabel"
                    v-model="relData.toLabel"
                    :placeholder="$t('term.cmdb.downsidename')"
                    border="border"
                    :validateList="[{ name: 'required', message: ' ' }]"
                  ></TsFormInput>
                </Col>
              </TsRow>
              <TsRow class="form-item">
                <Col span="4" class="text-grey form-title">{{ $t('page.require') }}</Col>
                <Col span="10" class="form-control">
                  <TsFormSwitch v-model="relData.fromIsRequired" :true-value="1" :false-value="0"></TsFormSwitch>
                </Col>
                <Col span="10" class="form-control">
                  <TsFormSwitch v-model="relData.toIsRequired" :true-value="1" :false-value="0"></TsFormSwitch>
                </Col>
              </TsRow>
              <TsRow class="form-item">
                <Col span="4" class="text-grey form-title">{{ $t('term.cmdb.invokecount') }}</Col>
                <Col span="10" class="form-control">
                  <TsFormSelect
                    ref="fromRule"
                    v-model="relData.fromRule"
                    :validateList="[{ name: 'required', message: ' ' }]"
                    :transfer="true"
                    :dataList="ruleList"
                  ></TsFormSelect>
                </Col>
                <Col span="10" class="form-control">
                  <TsFormSelect
                    ref="toRule"
                    v-model="relData.toRule"
                    :validateList="[{ name: 'required', message: ' ' }]"
                    :transfer="true"
                    :dataList="ruleList"
                  ></TsFormSelect>
                </Col>
              </TsRow>

              <TsRow class="form-item">
                <Col span="4" class="text-grey form-title">{{ $t('page.isunique') }}</Col>
                <Col span="10" class="form-control">
                  <TsFormSelect
                    ref="fromIsUnique"
                    v-model="relData.fromIsUnique"
                    :validateList="[{ name: 'required', message: ' ' }]"
                    :dataList="isUniqueDataList"
                  ></TsFormSelect>
                  <div class="text-grey">{{ $t('form.help.upsideunique') }}</div>
                </Col>
                <Col span="10" class="form-control">
                  <TsFormSelect
                    ref="toIsUnique"
                    v-model="relData.toIsUnique"
                    :validateList="[{ name: 'required', message: ' ' }]"
                    :dataList="isUniqueDataList"
                  ></TsFormSelect>
                  <div class="text-grey">{{ $t('form.help.downsideunique') }}</div>
                </Col>
              </TsRow>

              <TsRow class="form-item">
                <Col span="4" class="text-grey form-title">{{ $t('page.group') }}</Col>
                <Col span="10" class="form-control">
                  <div v-if="relData.fromCiId" class="text-grey">
                    <Dropdown :transfer="true" @on-click="selectFromGroup">
                      <a href="javascript:void(0)">
                        <span v-if="relData.fromGroupName">{{ relData.fromGroupName }}</span>
                        <span v-else>{{ $t('page.nogroup') }}</span>
                        <Icon type="ios-arrow-down"></Icon>
                      </a>
                      <DropdownMenu slot="list">
                        <DropdownItem name="">{{ $t('page.nogroup') }}</DropdownItem>
                        <DropdownItem
                          v-for="(group, index) in fromGroupList"
                          :key="index"
                          :selected="relData.fromGroupId == group.id ? true : false"
                          :name="group.id + ':' + group.name"
                        >{{ group.name }}</DropdownItem>
                        <DropdownItem name="new" divided>{{ $t('dialog.title.addtarget',{target:$t('page.group')}) }}</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </Col>
                <Col span="10" class="form-control">
                  <div v-if="relData.toCiId" class="text-grey">
                    <Dropdown :transfer="true" @on-click="selectToGroup">
                      <a href="javascript:void(0)">
                        <span v-if="relData.toGroupName">{{ relData.toGroupName }}</span>
                        <span v-else>{{ $t('page.nogroup') }}</span>
                        <Icon type="ios-arrow-down"></Icon>
                      </a>
                      <DropdownMenu slot="list">
                        <DropdownItem name="">{{ $t('page.nogroup') }}</DropdownItem>
                        <DropdownItem
                          v-for="(group, index) in toGroupList"
                          :key="index"
                          :selected="relData.toGroupId == group.id ? true : false"
                          :name="group.id + ':' + group.name"
                        >{{ group.name }}</DropdownItem>
                        <DropdownItem divided name="new">{{ $t('dialog.title.addtarget',{target:$t('page.group')}) }}</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </Col>
              </TsRow>

              <TsRow class="form-item">
                <Col span="4" class="text-grey form-title">{{ $t('page.cascadedelete') }}</Col>
                <Col span="10" class="form-control">
                  <TsFormSwitch v-model="relData.fromIsCascadeDelete" :true-value="1" :false-value="0"></TsFormSwitch>
                  <div class="text-grey">{{ $t('form.help.deleteupside') }}</div>
                </Col>
                <Col span="10" class="form-control">
                  <TsFormSwitch v-model="relData.toIsCascadeDelete" :true-value="1" :false-value="0"></TsFormSwitch>
                  <div class="text-grey">{{ $t('form.help.deletedownside') }}</div>
                </Col>
              </TsRow>

              <TsRow v-if="relativeRelList && relativeRelList.length > 0" class="form-item">
                <Col span="4" class="text-grey form-title">{{ $t('term.cmdb.cascaderelation') }}</Col>
                <Col span="20" class="form-control">
                  <TsFormSelect
                    :value="relativeRelIdList"
                    :multiple="true"
                    :dataList="relativeRelList"
                    valueName="relativeRelId"
                    textName="relativeRelLabel"
                    @on-change="selectRelativeRel"
                  ></TsFormSelect>
                  <div class="text-grey fz10">{{ $t('form.help.cascaderrelation') }}</div>
                </Col>
              </TsRow>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
    <RelGroupEdit :ciId="relGroupCiId" :isShow="isRelGroupShow" @close="closeRelGroupDialog"></RelGroupEdit>
    <CiSelect :isShow="isCiSelectShow" :ciId="relCiId" @close="closeCiSelectDialog"></CiSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    RelGroupEdit: resolve => require(['./relgroup-edit.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    CiSelect: resolve => require(['./ci-select.vue'], resolve)
  },
  props: {
    id: {
      type: Number
    },
    ciData: {
      type: Object
    }
  },
  data() {
    const _this = this;
    return {
      isUniqueDataList: [
        { value: 1, text: this.$t('page.yes') },
        { value: 0, text: this.$t('page.no') }
      ],
      isRelGroupShow: false,
      isCiSelectShow: false,
      relTypeList: [],
      relData: {},
      relGroupCiId: null, //添加关系时选择的模型id
      relCiId: null, //选择关系时选择的模型id
      ruleList: [],
      fromGroupList: [],
      toGroupList: [],
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('page.relation') }) : this.$t('dialog.title.addtarget', { target: this.$t('page.relation') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium',
        zindex: 999
      },
      formConfig: {
        content: {
          type: 'slot',
          hideLabel: true
        }
      },
      relativeRelList: [] //级联关系
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getRelRuleList();
    this.getRelTypeList();
    this.getDataById();
    this.getRelGroupByFromCiId();
    this.getRelGroupByToCiId();
    this.getRelativeRelList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getRelativeRelList() {
      if (this.fromCiId && this.toCiId) {
        this.$api.cmdb.ci
          .getRelativeRelList({
            fromCiId: this.fromCiId,
            toCiId: this.toCiId,
            relId: this.relData.id,
            ciId: this.ciData.id
          })
          .then(res => {
            this.relativeRelList = res.Return;
          });
      }
    },
    getRelRuleList: function() {
      this.$api.cmdb.ci.getRelRuleTypeList().then(res => {
        this.ruleList = res.Return;
      });
    },
    getRelTypeList() {
      this.$api.cmdb.ci.getRelTypeList().then(res => {
        this.relTypeList = res.Return;
      });
    },
    switchRel: function() {
      const tmp = JSON.parse(JSON.stringify(this.relData));
      this.$set(this.relData, 'fromCiId', tmp.toCiId);
      this.$set(this.relData, 'fromCiIcon', tmp.toCiIcon);
      this.$set(this.relData, 'fromCiLabel', tmp.toCiLabel);
      this.$set(this.relData, 'fromName', tmp.toName);
      this.$set(this.relData, 'fromLabel', tmp.toLabel);
      this.$set(this.relData, 'fromRule', tmp.toRule);
      this.$set(this.relData, 'fromGroupId', tmp.toGroupId);
      this.$set(this.relData, 'fromGroupName', tmp.toGroupName);
      this.$set(this.relData, 'fromDisabled', tmp.toDisabled);
      this.$set(this.relData, 'fromIsUnique', tmp.toIsUnique);
      this.$set(this.relData, 'fromIsRequired', tmp.toIsRequired);
      this.$set(this.relData, 'fromIsCascadeDelete', tmp.toIsCascadeDelete);
      this.$set(this.relData, 'toCiId', tmp.fromCiId);
      this.$set(this.relData, 'toCiIcon', tmp.fromCiIcon);
      this.$set(this.relData, 'toCiLabel', tmp.fromCiLabel);
      this.$set(this.relData, 'toName', tmp.fromName);
      this.$set(this.relData, 'toLabel', tmp.fromLabel);
      this.$set(this.relData, 'toRule', tmp.fromRule);
      this.$set(this.relData, 'toGroupId', tmp.fromGroupId);
      this.$set(this.relData, 'toGroupName', tmp.fromGroupName);
      this.$set(this.relData, 'toDisabled', tmp.fromDisabled);
      this.$set(this.relData, 'toIsUnique', tmp.fromIsUnique);
      this.$set(this.relData, 'toIsRequired', tmp.fromIsRequired);
      this.$set(this.relData, 'toIsCascadeDelete', tmp.fromIsCascadeDelete);
    },
    selectToGroup: function(name) {
      if (name != 'new') {
        if (name.indexOf(':') > 0) {
          const n = name.split(':');
          this.$set(this.relData, 'toGroupId', n[0]);
          this.$set(this.relData, 'toGroupName', n[1]);
        } else {
          this.$set(this.relData, 'toGroupId', null);
          this.$set(this.relData, 'toGroupName', null);
        }
      } else {
        if (this.relData.toCiId) {
          this.relGroupCiId = this.relData.toCiId;
          this.isRelGroupShow = true;
        }
      }
    },
    selectFromGroup: function(name) {
      if (name != 'new') {
        if (name.indexOf(':') > 0) {
          const n = name.split(':');
          this.$set(this.relData, 'fromGroupId', n[0]);
          this.$set(this.relData, 'fromGroupName', n[1]);
        } else {
          this.$set(this.relData, 'fromGroupId', null);
          this.$set(this.relData, 'fromGroupName', null);
        }
      } else {
        if (this.relData.fromCiId) {
          this.relGroupCiId = this.relData.fromCiId;
          this.isRelGroupShow = true;
        }
      }
    },
    selectRelativeRel(relId, option, item) {
      this.$set(this.relData, 'relativeRelList', item);
    },
    getRelGroupByFromCiId: function() {
      if (this.relData.fromCiId) {
        this.$api.cmdb.ci.getRelGroupByCiId(this.relData.fromCiId).then(res => {
          this.fromGroupList = res.Return;
        });
      }
    },
    getRelGroupByToCiId: function() {
      if (this.relData.toCiId) {
        this.$api.cmdb.ci.getRelGroupByCiId(this.relData.toCiId).then(res => {
          this.toGroupList = res.Return;
        });
      }
    },
    save: function() {
      if (!this.relData.toCiId) {
        this.$Message.info(this.$t('form.placeholder.pleaseselect', {target: this.$t('term.cmdb.targetci')}));
        return;
      }
      if (!this.relData.typeId) {
        this.$Message.info(this.$t('form.placeholder.pleaseselect', {target: this.$t('term.cmdb.relationtype')}));
        return;
      }

      let componentList = new Array();
      componentList.push(this.$refs['typeId']);
      componentList.push(this.$refs['fromName']);
      componentList.push(this.$refs['fromLabel']);
      componentList.push(this.$refs['fromRule']);
      componentList.push(this.$refs['fromIsUnique']);
      componentList.push(this.$refs['toName']);
      componentList.push(this.$refs['toLabel']);
      componentList.push(this.$refs['toRule']);
      componentList.push(this.$refs['toIsUnique']);

      let isValid = true;
      componentList.forEach(element => {
        if (element) {
          if (!element.valid()) {
            isValid = false;
          }
        }
      });
      if (isValid) {
        this.$set(this.relData, 'ciId', this.ciData.id);
        this.$api.cmdb.ci.saveRel(this.relData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    getDataById: function() {
      if (this.id) {
        this.$api.cmdb.ci.getRelById(this.id).then(res => {
          this.relData = res.Return;
        });
      } else {
        this.$set(this.relData, 'fromCiId', this.ciData.id);
        // this.$set(this.relData, 'typeId', this.ciData.typeId);
        this.$set(this.relData, 'fromCiIcon', this.ciData.icon);
        this.$set(this.relData, 'fromCiLabel', this.ciData.label);
        this.$set(this.relData, 'fromName', this.ciData.name);
        this.$set(this.relData, 'fromLabel', this.ciData.label);
        this.$set(this.relData, 'fromDisabled', true); //默认来源端不允许修改
        this.$set(this.relData, 'fromIsUnique', 0);
        this.$set(this.relData, 'fromIsRequired', 0);
        this.$set(this.relData, 'fromRule', 'O');
        this.$set(this.relData, 'fromIsCascadeDelete', 0);
        this.$set(this.relData, 'toDisabled', false); //默认目标端允许修改
        this.$set(this.relData, 'toIsUnique', 0);
        this.$set(this.relData, 'toIsRequired', 0);
        this.$set(this.relData, 'toRule', 'O');
        this.$set(this.relData, 'toIsCascadeDelete', 0);
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    },
    closeRelGroupDialog: function(needRefresh) {
      this.isRelGroupShow = false;
      if (needRefresh) {
        this.getRelGroupByToCiId();
        this.getRelGroupByFromCiId();
      }
    },
    changeToCi: function() {
      if (!this.relData.id && !this.relData.toDisabled) {
        this.isCiSelectShow = true;
        this.relCiId = this.relData.toCiId;
      }
    },
    changeFromCi: function() {
      if (!this.relData.id && !this.relData.fromDisabled) {
        this.isCiSelectShow = true;
        this.relCiId = this.relData.fromCiId;
      }
    },
    closeCiSelectDialog: function(targetCi) {
      this.isCiSelectShow = false;
      if (targetCi) {
        if (this.relData.fromDisabled) {
          this.$set(this.relData, 'toCiId', targetCi.id);
          this.$set(this.relData, 'toCiIcon', targetCi.icon);
          this.$set(this.relData, 'toCiLabel', targetCi.label);
          this.$set(this.relData, 'toName', targetCi.name);
          this.$set(this.relData, 'toLabel', targetCi.label);
        } else {
          this.$set(this.relData, 'fromCiId', targetCi.id);
          this.$set(this.relData, 'fromCiIcon', targetCi.icon);
          this.$set(this.relData, 'fromCiLabel', targetCi.label);
          this.$set(this.relData, 'fromName', targetCi.name);
          this.$set(this.relData, 'fromLabel', targetCi.label);
        }
      }
    }
  },
  filter: {},
  computed: {
    relativeRelIdList() {
      const relativeRelIdList = [];
      if (this.relData.relativeRelList && this.relData.relativeRelList) {
        this.relData.relativeRelList.forEach(d => {
          relativeRelIdList.push(d.relativeRelId);
        });
      }
      return relativeRelIdList;
    },
    fromCiId: function() {
      return this.relData.fromCiId;
    },
    toCiId: function() {
      return this.relData.toCiId;
    }
  },
  watch: {
    fromCiId: {
      handler: function(val) {
        this.getRelGroupByFromCiId();
        this.getRelativeRelList();
      }
    },
    toCiId: {
      handler: function(val) {
        this.getRelGroupByToCiId();
        this.getRelativeRelList();
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.form-item {
  padding-bottom: 10px;
  .form-title {
    text-align: right;
    line-height: 40px;
  }
  .form-control {
    line-height: 36px;
  }
  .wrapper {
    display: flex;
    padding: 16px 96px;
    align-items: center;
    justify-content: space-between;
    .item-left {
      width: 70px;
      text-align: center;
      z-index: 2;
    }
    .item-right {
      width: 70px;
      z-index: 2;
      text-align: center;
    }
    .reledit-icon {
      // border-radius:60px;
      width: 70px;
      height: 70px;
      border: 1px solid;
      font-size: 35px;
      text-align: center;
      padding-top: 0px;
      border-width: 1px;
      border-radius: 2px;
      border-style: solid;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 4px;
      margin-top: 4px;
    }
    .reledit-line {
      top: 77px;
      left: 190px;
      right: 190px;
      height: 1px;
      border-top: 1px solid;
      z-index: 0;
      position: absolute;
    }
    .reledit-switch {
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 32px;
      border: 1px solid;
      z-index: 2;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
    }
  }
}
</style>
