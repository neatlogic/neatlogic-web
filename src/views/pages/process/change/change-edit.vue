<template>
  <div class="changeEdit">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div :style="{ 'padding-right': rightWidth + 'px' }">
      <TsContain border="border">
        <template v-slot:navigation>
          <span class="tsfont-left text-action" @click="$back('/change-overview')">{{ $getFromPage(navType) }}</span>
        </template>
        <template v-slot:topLeft>
          <TsFormInput
            ref="changeName"
            v-model="changeBasicData.name"
            :placeholder="$t('form.placeholder.pleaseinput', {target:$t('page.templatename')})"
            :class="{ 'tsForm-formItem-error': !nameValid }"
            maxlength="50"
            :validateList="nameValidateList"
          ></TsFormInput>
        </template>
        <template v-slot:topRight>
          <div class="action-group" style="text-align:right">
            <span class="action-item">
              <TsFormSwitch
                v-model="changeBasicData.isActive"
                :true-value="1"
                :false-value="0"
                :showStatus="true"
              ></TsFormSwitch>
            </span>
            <span class="action-item">
              <Button type="primary" @click="saveChange">{{ $t('page.save') }}</Button>
            </span>
            <span v-if="changeTemplateId" class="action-item">
              <Button type="error" @click="delChange">{{ $t('page.delete') }}</Button>
            </span>
          </div>
        </template>
        <div slot="content" class="main-content">
          <div class="basic-info">
            <div class="title text-title">{{ $t('page.basicinfo') }}</div>
            <div class="bg-block basic-main radius-lg">
              <TsRow>
                <Col span="12">
                  <div class="change-tip">
                    <span class="text-title" style="padding-right:4px;">{{ $t('page.group') }}</span>
                    <Tooltip
                      placement="bottom"
                      max-width="300"
                      transfer
                      theme="light"
                    >
                      <i class="tsfont-info-o cursor-pointer text-title"></i>
                      <div slot="content">
                        <p>{{ $t('term.process.changegrouptip') }}</p>
                      </div>
                    </Tooltip>
                  </div>
                  <div class="change-text">
                    <UserSelect
                      v-model="changeBasicData.authority"
                      :groupList="groupList"
                      :multiple="false"
                      border="none"
                      transfer
                      class="user-select"
                    ></UserSelect>
                  </div>
                </Col>
                <Col span="12">
                  <div class="change-tip">
                    <span class="text-title" style="padding-right:4px;">{{ $t('page.type') }}</span>
                    <Tooltip
                      placement="bottom"
                      max-width="300"
                      transfer
                      theme="light"
                    >
                      <i class="tsfont-info-o cursor-pointer text-title"></i>
                      <div slot="content">
                        <p>{{ $t('term.process.changetypetip') }}</p>
                      </div>
                    </Tooltip>
                  </div>
                  <div class="change-text">
                    <TsFormSelect
                      v-model="changeBasicData.type"
                      :dataList="typeList"
                      border="none"
                      style="display: inline-block;width:auto;"
                      :search="true"
                      :allowCreate="true"
                      transfer
                      @on-create="typeListCreate"
                    ></TsFormSelect>
                  </div>
                </Col>
              </TsRow>
            </div>
          </div>
          <div class="template-step">
            <div class="title text-title">{{ $t('term.process.templatesteps') }}</div>
            <draggable
              v-model="changeSopList"
              tag="ul"
              handle=".move"
              :options="dragOptions"
              class="sop-main"
              @start="onStart"
              @end="onEnd"
            >
              <li
                v-for="(item,index) in changeSopList"
                :key="'1'+index"
                class="bg-op template-list radius-lg"
                draggable="true"
              >
                <div class="list-top overflow">
                  <span class="move tsfont-bar"></span>
                  <span>{{ item.name }}</span>
                  <div class="btn-list">
                    <span class="tsfont-edit text-tip-active" @click="editSopTemplate(item)"></span>
                    <span class="del-sop tsfont-trash-s text-tip-active" @click="delSop(index)"></span>
                  </div>
                </div>
                <div v-show="isShowStep">
                  <div v-if="item.changeSopStepList && item.changeSopStepList.length > 0" class="step-show">
                    <StepView :changeStepList="item.changeSopStepList"></StepView>
                  </div>
                </div>
              </li>
              <li v-if="changeSopList.length == 0" class="drag-tip bg-block text-tip radius-lg">{{ $t('term.process.soptip') }}</li>
            </draggable>
          </div>
        </div>
      </TsContain>
    </div>

    <div class="change-setting bg-grey dividing-color" :style="{ 'width': rightWidth + 'px' }">
      <ChangeSetting ref="changeSetting"></ChangeSetting>
    </div>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: 'ChangeEdit',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve),
    ChangeSetting: resolve => require(['./change-setting.vue'], resolve),
    draggable,
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    StepView: resolve => require(['./setting/step-view.vue'], resolve)
  },
  provide() {
    return {
      $dragBox: this
    };
  },
  filters: {},
  props: {},
  data() {
    return {
      loadingShow: true,
      rightWidth: 260,
      navType: this.$t('page.templatelist'),
      changeTemplateId: null,
      defaultChangeData: null,
      changeSopList: [],
      changeBasicData: {
        isActive: 1,
        name: '',
        authority: null,
        type: null
      },
      nameValid: true, //名称校验
      groupList: ['team'],
      nameValidateList: ['required', 'name-special', {
        name: 'searchUrl',
        url: 'api/rest/change/template/save', 
        key: 'name',
        params: () => ({id: this.changeTemplateId})
      }],
      typeList: [],
      isShowStep: true, //步骤展示
      isReturn: true //校验成功，能返回模板列表
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.$route.query.name) {
      this.changeBasicData.name = this.$route.query.name;
    }
    this.changeTemplateId = this.$route.query.id || null;
    this.getChangeConfig();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getChangeConfig() {
      this.getTemplateType();
      if (this.changeTemplateId) {
        let data = {
          changeTemplateId: this.changeTemplateId
        };
        this.$api.process.change.getChangeTemplate(data).then(res => {
          if (res.Status == 'OK') {
            let obj = res.Return;
            Object.keys(this.changeBasicData).forEach(e => {
              if (JSON.stringify(obj[e])) {
                this.changeBasicData[e] = obj[e];
              }
            });
            this.changeSopList = obj.changeSopList;
            this.loadingShow = false;
            this.defaultChangeData = this.getChangeData();
          }
        });
      } else {
        this.loadingShow = false;
      }
    },
    getTemplateType() {
      let data = {};
      this.$api.process.change.changeTemplateTypeList(data).then(res => {
        if (res.Status == 'OK') {
          let dataList = res.Return.changeTemplateTypeList;
          this.typeList = dataList;
        }
      });
    },
    getChangeData() {
      //变更数据
      let data = this.changeBasicData;
      if (this.changeTemplateId) {
        this.$set(data, 'id', this.changeTemplateId);
      }
      let changeSopIdList = this.changeSopList.map(c => {
        return c.id;
      });
      this.$set(data, 'changeSopIdList', changeSopIdList);
      return JSON.parse(JSON.stringify(data));
    },
    validChangeData() {
      //校验
      let validList = [];
      let el = this.$refs.changeName;
      if (this.changeBasicData.name == '' || !this.$utils.nameRegularValid(this.changeBasicData.name)) {
        this.nameValid = false;
        el.$el.querySelector('input').focus();
        validList.push(false);
        this.$Notice.error({
          title: this.$t('page.templatename'),
          desc: this.$t('form.validate.requiredname')
        });
      }
      return validList;
    },
    async saveChange() {
      //保存变更模板
      this.defaultChangeData = this.getChangeData();
      if (this.validChangeData().length > 0) {
        this.isReturn = false;
        return false;
      } else {
        this.isReturn = true;
        let data = this.getChangeData();
        await this.$api.process.change.saveChangeTemplate(data).then(res => {
          if (res.Status == 'OK') {
            this.changeTemplateId = res.Return;
            this.defaultChangeData = this.getChangeData();
            this.$Message.success(this.$t('message.savesuccess'));
          }
        });
      }
    },
    delChange() {
      if (this.changeTemplateId) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: this.changeBasicData.name}),
          btnType: 'error',
          'on-ok': vnode => {
            let data = {
              changeTemplateId: this.changeTemplateId
            };
            this.$api.process.change.delChangeTemplate(data).then(res => {
              if (res.Status == 'OK') {
                vnode.isShow = false;
                this.$router.push({
                  path: '/change-overview'
                });
              }
            });
          }
        });
      }
    },
    editSopTemplate(obj) {
      this.$refs.changeSetting.openSopTemplate(obj);
    },
    delSop(index) {
      this.changeSopList.splice(index, 1);
    },
    drop() {
      //let data = JSON.parse(event.dataTransfer.getData('item'));
      //console.log(data);
    },
    onStart() {
      this.isShowStep = false;
    },

    onEnd() {
      this.isShowStep = true;
    },
    showStep(type) {
      this.isShowStep = type;
    },
    updataSop(obj) {
      //更新sop
      let config = obj;
      for (let i = 0; i < this.changeSopList.length; i++) {
        if (this.changeSopList[i].id === config.id) {
          this.$set(this.changeSopList, i, config);
        }
      }
    },
    typeListCreate(val) {
      //类型创建
      this.typeList.push({
        value: val,
        text: val
      });
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 150,
        scroll: true,
        dragClass: 'sop-drag',
        group: {
          name: 'stepTemplate',
          put: true
        }
      };
    }
  },
  watch: {},
  beforeRouteLeave(from, to, next, url) {
    let newChangeData = this.getChangeData();
    let isSame = this.$utils.isSame(newChangeData, this.defaultChangeData);
    if (isSame) {
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(this, {
        save: {
          fn: async(vnode) => {
            return await _this.saveChange();
          }
        }
      }, to, from, next, url);
    }
  }
};
</script>
<style lang='less' scoped>
.changeEdit {
  position: relative;
  .change-setting {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    border-left: 1px solid;
    height: calc(100% - 1px);
  }
  .input-name {
    display: inline-block;
    padding: 0 16px;
    padding-left: 0;
  }
  .action-left {
    display: inline-block;
    padding-right: 16px;
    vertical-align: top;
    .btn-tip {
      padding-right: 4px;
    }
  }
  .action-list {
    text-align: right;
  }
  .main-content {
    width: 100%;
    height: 100%;
    padding: 0 16px;
    .title {
      padding-bottom: 8px;
    }
    .basic-main {
      padding: 10px 20px;
      margin-bottom: 16px;
      .change-tip {
        padding-left: 8px;
        font-size: 13px;
      }
      /deep/ .select-top.ivu-input {
        padding-right: 30px;
      }
    }
    .template-step {
      .template-list {
        position: relative;
      }
      .list-top {
        height: 40px;
        line-height: 40px;
        padding: 0 16px;
        .move {
          cursor: move;
          padding-right: 8px;
        }
      }
      .step-show {
        padding: 10px 16px 8px;
      }
      .btn-list {
        position: absolute;
        top: 0;
        right: 16px;
        .del-sop {
          padding-left: 8px;
        }
      }
    }
    .template-list {
      min-height: 40px;
      margin-bottom: 10px;
    }
  }
  /deep/ .soptemplate-list {
    .btn-box {
      display: none;
    }
  }
  .sop-drag {
    .step-show {
      display: none;
    }
  }
  .drag-tip {
    text-align: center;
    padding: 24px 16px;
  }
  .inline-block{
    display: inline-block;
  }
  .sop-main{
    min-height: calc(100vh - 300px);
  }
  .change-text{
    .user-select {
      display: inline-block;
    }
  }
}
</style>
