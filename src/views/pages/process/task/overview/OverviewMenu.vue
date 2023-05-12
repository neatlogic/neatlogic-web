<template>
  <div class="OverviewMenu menu_link">
    <div class="title text-grey">{{ $t('term.process.workordercenter') }}</div>
    <div v-if="datalist">
      <draggable
        v-if="datalist.length > 0"
        v-model="datalist"
        class="navlist-ul"
        :animation="200"
        handle=".handle"
        tag="ul"
        @change="sortMenuList"
      >
        <li
          v-for="(ditem, dindex) in datalist"
          :key="ditem.uuid"
          class="navlist-li link"
          :class="{ active: selectedUuid == ditem.uuid && $route.fullPath == '/task-overview', editable: ditem.isCanEdit }"
          @click="selectUuid(dindex, ditem, $event)"
        >
          <div class="overflow navlist-text">
            <router-link to="/task-overview">
              <span v-if="getAmount(ditem.meWillDoCount) && getAmount(ditem.meWillDoCount) != '0'" class="isDone ivu-btn-error text-white" @click="handlerIsDone">{{ getAmount(ditem.meWillDoCount) }}</span>
              <span v-else-if="getAmount(ditem.meWillDoCount)" class="dots"></span>
              {{ ditem.name }}
            </router-link>
            <i class="item-icon handle tsfont-drag hide"></i>
            <span v-if="ditem.isCanEdit" class="navlist-action">
              <Dropdown trigger="click" :transfer="true">
                <span ref="horizontal" class="tsfont-option-horizontal"></span>
                <DropdownMenu slot="list" class="overdown">
                  <DropdownItem>
                    <div @click="editName(ditem)">{{ $t('page.rename') }}</div>
                  </DropdownItem>
                  <DropdownItem v-if="ditem.isCanRole">
                    <div @click="editUser(ditem)">{{ $t('page.auth') }}</div>
                  </DropdownItem>
                  <DropdownItem>
                    <div @click="delName(ditem.name, ditem.uuid, dindex)">{{ $t('page.delete') }}</div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </span>
          </div>
          <div v-if="getAmount(ditem.count) != '0'" class="navlist-amount">
            <span>{{ getAmount(ditem.count) }}</span>
          </div>
        </li>
      </draggable>
      <div v-else>
        <NoData></NoData>
      </div>
    </div>
    <div v-else>
      <Loading loadingShow></Loading>
    </div>
    <TsDialog
      type="modal"
      :title="$t('page.rename')"
      :isShow.sync="editNameModal"
      @on-ok="saveName()"
    >
      <TsForm ref="nameForm" :itemList="nameList"></TsForm>
    </TsDialog>
    <TsDialog
      type="modal"
      :title="$t('page.auth')"
      :isShow.sync="editUserModal"
      @on-ok="saveValueList()"
    >
      <TsForm ref="userForm" :itemList="userList"></TsForm>
    </TsDialog>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import draggable from 'vuedraggable';
export default {
  name: 'OverviewMenu',
  components: {
    draggable,
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: [''],
  data() {
    let _this = this;
    return {
      showMode: 'table',
      timer: null, //定时器
      datalist: null, //左侧列表
      editNameModal: false, //重命名弹框
      editUserModal: false, //授权弹框
      defaultName: '', //默认名称
      defaultValueList: [], //默认授权
      defaultType: 'custom',
      menuUuid: '', //弹框uuid
      selectLi: 0,
      uuid: '',
      nameList: [
        {
          type: 'text',
          name: 'name',
          value: '',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required', 'name-special']
        }
      ],
      userList: [
        {
          type: 'radio',
          name: 'type',
          label: this.$t('page.type'),
          value: 'custom',
          dataList: [
            {
              text: this.$t('page.classifytarget', {target: this.$t('page.custom')}),
              value: 'custom'
            },
            {
              text: this.$t('page.classifytarget', {target: this.$t('page.system')}),
              value: 'system'
            }
          ],
          onChange(val) {
            if (val === 'system') {
              _this.userList.push({
                type: 'userselect',
                name: 'valueList',
                value: _this.defaultValueList,
                label: _this.$t('page.auth'),
                transfer: true,
                groupList: ['role', 'user', 'common'],
                validateList: ['required']
              });
            } else if (_this.userList.length === 2) {
              _this.userList.pop();
            }
          }
        }
      ],
      selectedUuid: null //标志实际选中哪一个，用于做选中效果
    };
  },
  created() {
    this.getWorkCenterMenu('init');
    this.timer = setInterval(() => {
      this.getWorkCenterMenu();
    }, 1000 * 30);
  },
  mounted() {
    this.$store.commit('leftMenu/setWorkerMenuUpdate');
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    handlerIsDone() {
      this.clickIsDone = true;
      this.$store.commit('leftMenu/setWorkerMenuIsWillDo', 1);
    },
    sortMenuList() {
      let data = {};
      let workcenterList = [];
      this.datalist.forEach((i, index) => {
        let obj = {};
        this.$set(obj, 'uuid', i.uuid);
        this.$set(obj, 'sort', index + 1);
        workcenterList.push(obj);
      });
      this.$set(data, 'workcenterList', workcenterList);
      this.$api.process.processtask
        .workcenterMenuSort(data)
        .then(res => {
          if (res.Status == 'OK') {
            //
          }
        })
        .catch(error => {
          this.$Notice.error({
            title: error.data.Message,
            duration: 1.5
          });
        });
    },
    getWorkCenterMenu(action) {
      let data = { isAll: 1 };
      if (action === 'init') {
        data.isAll = 0;
      }
      this.$api.process.processtask.workcenterMenu(data).then(res => {
        if (res.Status == 'OK') {
          this.datalist = res.Return.workcenterList || [];
          // if (!this.datalist.length) return;
          // 默认取第一项
          // this.$emit("active-emit", this.datalist[0]);
          this.datalist.forEach(function(d, i) {
            d.index = i;
          });
          if (this.datalist.length == 0) {
            this.$store.commit('leftMenu/setActiveClassifyData', 'noData');
          } else if (!this.$store.state.leftMenu.activeClassifyData || action === 'first') {
            this.$store.commit('leftMenu/setActiveClassifyData', this.datalist[0]);
          } else if (action == 'add') {
            this.$store.commit('leftMenu/setActiveClassifyData', this.datalist[this.datalist.length - 1]);
            this.selectLi = this.datalist.length - 1;
          }
          if (this.$store.state.leftMenu.activeClassifyData) {
            this.selectLi = this.$store.state.leftMenu.activeClassifyData.index;
          }
          this.selectedUuid = this.datalist[this.selectLi].uuid;
        }
      });
    },
    selectUuid(index, data, event) {
      if (event.target.className === 'tsfont-option-horizontal') {
        return;
      }
      //选择分类
      if (!this.clickIsDone) {
        this.$store.commit('leftMenu/setWorkerMenuIsWillDo', 0);
      }
      this.clickIsDone = false;
      this.selectLi = index;
      this.$emit('get-workcenter', data);
      data.selectIndex = index;
      setTimeout(() => {
        this.$store.commit('leftMenu/setActiveClassifyData', JSON.parse(JSON.stringify(data)));
      }, 0);

      this.$router.push('/task-overview');
      this.selectedUuid = this.datalist[this.selectLi].uuid;
    },
    editName(obj) {
      this.nameList.forEach(i => {
        if ((i.name = 'name')) {
          i.value = obj.name;
        }
      });
      this.menuUuid = obj.uuid;
      this.defaultName = obj.name;
      this.defaultValueList = obj.valueList;
      this.defaultType = obj.type;
      this.editNameModal = true;
    },
    editUser(obj) {
      this.nameList.forEach(i => {
        if ((i.name = 'valueList')) {
          i.value = obj.valueList;
        }
      });
      this.menuUuid = obj.uuid;
      this.defaultName = obj.name;
      this.defaultValueList = obj.valueList;
      this.defaultType = obj.type;
      this.userList[0].value = obj.type;
      this.userList[0].uservalue = [];
      this.userList[0].uservalue.push(...obj.valueList);

      if (obj.type === 'system') {
        if (this.userList.length === 2) {
          this.userList[1].value = obj.valueList;
        } else if (this.userList.length === 1) {
          this.userList.push({
            type: 'userselect',
            name: 'valueList',
            value: obj.valueList,
            label: this.$t('page.auth'),
            transfer: true,
            groupList: ['role', 'user', 'common'],
            validateList: ['required']
          });
        }
      } else if (this.userList.length === 2) {
        this.userList.pop();
      }

      this.editUserModal = true;
    },
    save(uuid, name, valueList, type) {
      let data = {
        uuid: uuid,
        name: name,
        type: type,
        conditionConfig: {},
        valueList: valueList || []
      };

      this.$api.process.processtask
        .saveMenu(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.getWorkCenterMenu();
          }
        })
        .catch(e => {
          this.$Notice.error({
            title: e.data.Message
          });
        });
    },
    saveName() {
      let nameForm = this.$refs.nameForm;
      if (nameForm.valid()) {
        let data = nameForm.getFormValue();
        this.save(this.menuUuid, data.name, this.defaultValueList, this.defaultType);
        this.editNameModal = false;
      }
    },
    saveValueList() {
      let userForm = this.$refs.userForm;
      if (userForm.valid()) {
        let data = userForm.getFormValue();

        this.save(this.menuUuid, this.defaultName, data.valueList, data.type);
        this.editUserModal = false;
      }
    },
    delName(name, uuid, index) {
      let _this = this;
      this.$createDialog({
        type: 'modal',
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        maskClose: true,
        btnType: 'error',
        'on-ok': function(vnode) {
          let data = {
            uuid: uuid
          };
          this.$api.process.processtask.delMenu(data).then(res => {
            if (res.Status == 'OK') {
              this.$delete(_this.datalist, index);
              if (index === _this.$store.state.leftMenu.activeClassifyData.index) {
                _this.getWorkCenterMenu('first');
              }
            }
          });
          vnode.isShow = false;
        }
      });
    }
  },
  computed: {
    getAmount() {
      return function(amount) {
        let showamount = amount || '';
        return showamount;
      };
    }
    // getMeCount() {
    //   return function(amount) {
    //     let showamount = amount || '';
    //     return showamount;
    //   };
    // }
  },
  watch: {
    '$store.state.leftMenu.workerMenuUpdateCount'(newvalue) {
      this.getWorkCenterMenu(this.$store.state.leftMenu.workerMenuUpdateAction, 'init');
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.OverviewMenu {
  padding-top: 8px;

  .colorgrey {
    color: @default-gray;
  }
  .showMode {
    position: absolute;
    bottom: 30px;
    left: 0px;
    right: 0px;
    text-align: center;
    span {
      display: inline-block;
      width: 60%;
      padding: 6px;
      border-radius: 4px;
      background-color: #00ccff;
      cursor: pointer;
      color: @white;
    }
  }
  .headline {
    color: @default-icon;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
  }
  .item-icon {
    margin-right: 8px;
  }
  .navlist-ul {
    .navlist-li {
      position: relative;
      &.active {
        .navlist-text {
          color: @primary-color;
        }
      }
      &:hover .item-icon.ts-typelist {
        display: none;
      }
      .item-icon.tsfont-drag {
        display: none;
        cursor: ns-resize;
      }
      &:hover {
        .item-icon.tsfont-drag {
          display: block;
          position: absolute;
          left: 6px;
          top: 1px;
        }
        .navlist-text {
          a:before {
            opacity: 0;
          }
          a .isDone {
            /*display: none;*/
          }
          .dots {
            border: 4px solid;
          }
        }
      }
      &.editable:hover {
        .navlist-action {
          display: block;
        }
        .navlist-amount {
          display: none;
        }
      }

      .navlist-text {
        cursor: pointer;
        position: relative;
        display: inline-block;
        max-width: 100%;
        line-height: 36px;
        height: 36px;
        text-align: left;
        width: 100%;
        &:before {
          margin-right: 10px;
          margin-left: 2px;
        }
        a {
          position: relative;
          padding-left: 54px;
          .dots {
            position: absolute;
            top: 50%;
            left: 27px;
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 4px;
            margin-top: -3px;
            border: 2px solid;
          }
          .isDone {
            position: absolute;
            top: 50%;
            left: 20px;
            font-size: 12px;
            display: inline-block;
            padding: 0px 4px;
            height: 16px;
            line-height: 16px;
            border-radius: 8px;
            margin-top: -8px;
            min-width: 22px;
            text-align: center;
          }
        }
      }

      .navlist-amount {
        position: absolute;
        top: 0;
        right: 8px;
        line-height: 36px;
        height: 36px;
        width: 60px;
        font-style: normal;
        font-size: 12px;
        color: @icon-color;
        text-align: right;
        &.already {
          right: 20px;
        }
      }

      .navlist-action {
        position: absolute;
        top: 0;
        right: 8px;
        line-height: 36px;
        height: 36px;
        width: 20px;
        cursor: pointer;
        display: none;
        text-align: center;
        &:hover {
          color: @primary-color;
        }
      }
    }
  }
}
.theme(@text-color){
  .OverviewMenu {
    .navlist-text {
      a {
        .dots {

          // border-color: @icon-color;
        }
      }
    }
  }
}
.ivu-select-dropdown:has( .overdown) {
  z-index: 0;
}
html {
  .theme(@default-text);

  &.theme-dark {
    .theme(@dark-text);
  }
}
</style>
