<template>
  <div v-if="table == true">
    <template v-if="tableAction(row.action).length>0">
      <ul class="tstable-action-ul">
        <li
          v-for="btn in tableAction(row.action)"
          :key="btn.name"
          :class="{ disable: !btn.isEnable }"
          @click="cardbtnclick(btn, row)"
        >
          <Dropdown v-if="btn.name === 'workcurrentstep'&& btn.handleArray.length > 1" transfer trigger="click">
            <i class="btnicon tsfont-arrow-right icon">{{ btn.text }}</i>
            <DropdownMenu v-if="btn.isEnable && btn.handleArray.length > 1" slot="list">
              <DropdownItem v-for="(subItem, index) in btn.handleArray" :key="subItem.name + index" @click.native="handlerStep(subItem, row)">{{ subItem.text }}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <template v-else>
            <i class="btnicon icon" :class="getIcon(btn.name)">{{ btn.text }}</i>
          </template>
        </li>
      </ul>
    </template>
  </div>
  <div v-else>
    <div v-if="row.action && (row.action.firstActionList.length>0 ||row.action.secondActionList.length > 0)" class="action-group line">
      <div
        v-for="btn in row.action.firstActionList"
        :key="btn.name"
        class="action-item"
        :class="{ disable: !btn.isEnable }"
        @click="cardbtnclick(btn, row)"
      >
        <Dropdown v-if="btn.name === 'workcurrentstep'&& btn.handleArray.length > 1" transfer trigger="click">
          <i class="btnicon tsfont-arrow-right icon">{{ btn.text }}</i>
          <DropdownMenu v-if="btn.isEnable && btn.handleArray.length > 1" slot="list">
            <DropdownItem v-for="(subItem, index) in btn.handleArray" :key="subItem.name + index" @click.native="handlerStep(subItem, row)">{{ subItem.text }}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <template v-else>
          <i class="btnicon icon" :class="getIcon(btn.name)">{{ btn.text }}</i>
        </template>
      </div>
      <div v-if="row.action.secondActionList.length > 0" class="action-item">
        <Dropdown
          transfer
          trigger="click"
          style="padding-left:8px;cursor: pointer;"
        >
          <i class="tsfont-option-horizontal text-tip"></i>
          <DropdownMenu slot="list">
            <DropdownItem
              v-for="(moreItem, index) in row.action.secondActionList"
              :key="index"
              :disabled="!moreItem.isEnable "
              @click.native="cardbtnclick(moreItem,row)"
            >
              {{ moreItem.text }}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ControllerBtnVue',
  props: ['row', 'table', 'taskTypeUuid'],
  data() {
    return {
      actionIconList: {
        'workcurrentstep': 'tsfont-arrow-right',
        'abortprocessTask': 'tsfont-close',
        'recoverprocessTask': 'tsfont-refresh',
        'urge': 'tsfont-reminder',
        'delete': 'tsfont-trash-s',
        'show': 'tsfont-eye',
        'hide': 'tsfont-eye-off',
        'normal': 'tsfont-lightning'
      }
    };
  },
  mounted() {

  },
  methods: {
    cardbtnclick(data, row) {
      if (!data.isEnable) return;
      if (data.name === 'workcurrentstep') {
        if (data.handleArray.length === 1) {
          this.handlerStep(data.handleArray[0], row);
        }
      } else if (data.name === 'urge') {
        // urgeProcesssTask
        this.$api.process.processtask
          .urgeProcesssTask({
            processTaskId: data.config.taskid
          })
          .then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
            }
          });
      } else if (data.name === 'abortprocessTask' || data.name === 'recoverprocessTask') {
        // 取消
        this.$emit('actionTask', data);
      } else if (data.name === 'hide') {
        this.$https.post(data.config.interfaceurl).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.$emit('refresh', data.config.taskid);
          }
        });
      } else if (data.name === 'show') {
        this.$https.post(data.config.interfaceurl).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.$emit('refresh', data.config.taskid);
          }
        });
      } else if (data.name === 'delete') {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.process.task')}),
          btnType: 'error',
          'on-ok': vnode => {
            this.$https.post(data.config.interfaceurl).then(res => {
              if (res.Status === 'OK') {
                this.$Message.success(this.$t('message.executesuccess'));
                this.$emit('delete', data.config.taskid);
              }
            }).finally(() => {
              vnode.isShow = false;
            });
          }
        });
      }
    },
    moreActionClick(item) {
      this.$https.post(item.config.interfaceurl).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    handlerStep(data, item) {
      sessionStorage.setItem('processTaskUuid', this.taskTypeUuid);
      if (item && item.status.value === 'draft') {
        //task-dispatch?processTaskId=180
        // this.$router.push({
        //   path: '/task-dispatch',
        //   query: {
        //     processTaskId: data.config.taskid
        //   }
        // });
        window.open(HOME + `/process.html#/task-dispatch?processTaskId=${data.config.taskid}`, '_blank');
      } else {
        // this.$router.push({
        //   path: '/task-detail',
        //   query: {
        //     processTaskId: data.config.taskid,
        //     processTaskStepId: data.config.stepid,
        //     autoStart: 1
        //   }
        // });
        window.open(HOME + `/process.html#/task-detail?processTaskId=${data.config.taskid}&processTaskStepId=${data.config.stepid}&autoStart=1`, '_blank');
      }
    },
    tableAction(actions) {
      return actions.secondActionList.length > 0 ? actions.firstActionList.concat(actions.secondActionList) : actions.firstActionList;
    }
  },
  computed: {
    // showAction() {
    //   //用来判断当全部不可以操作时不显示操作栏
    //   return function(list) {
    //     let isShow = false;
    //     if (list && list.length > 0) {
    //       list.forEach(li => {
    //         if (li.isEnable) {
    //           isShow = true;
    //         }
    //       });
    //     }
    //     return isShow;
    //   };
    // },
    getIcon() {
      return function(name) {
        let icon = '';
        if (Object.keys(this.actionIconList).includes(name)) {
          icon = this.actionIconList[name];
        } else {
          icon = this.actionIconList['normal'];
        }
        return icon;
      };
    }
  },
  watch: {
    'row.action': {
      handler: function(val) {
        if (val && this.table) {
          this.$nextTick(() => {
            if (this.tableAction(val).length > 0) {
              let isShow = this.tableAction(val).filter((l) => {
                return l.isEnable;
              });
              if (isShow.length) {
                if (this.$el && this.$el.nextElementSibling) {
                  this.$el.nextElementSibling.style = '';
                }
              } else {
                if (this.$el && this.$el.nextElementSibling) {
                  this.$el.nextElementSibling.style = 'display:none';
                }               
              }
            } else {
              if (this.$el && this.$el.nextElementSibling) {
                this.$el.nextElementSibling.style = 'display:none';
              }               
            }
          });
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
