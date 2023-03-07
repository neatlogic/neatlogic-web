<template>
  <div class="task-authorization">
    <div v-if="agentConfig == null" class="text-grey">
      <span class="tsfont-plus text-action" @click="addAuth()">添加授权</span>
    </div>
    <div v-else class="bg-op block border listBox" @click="addAuth">
      <div class="item">
        <div class="text-grey">开始时间 {{ agentConfig.beginTime | formatDate }}</div>
      </div>
      <div class="item">
        <div class="text-grey">结束时间 {{ agentConfig.endTime | formatDate }}</div>
      </div>
      <div v-if="agentConfig.isActive == 1" class="isSwitch bg-primary"></div>
      <div v-else class="isSwitch bg-gray"></div>
      <div class="action-group">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li @click.stop>
              <TsFormSwitch
                v-model="agentConfig.isActive"
                :true-value="1"
                :false-value="0"
                showStatus
                @on-change="toggleAction(agentConfig)"
              ></TsFormSwitch>
            </li>
            <li
              class="icon tsfont-trash-o text-href"
              @click.stop="deleteRow"
            >删除</li>
          </ul>
        </div>

      </div>
    </div>

    <TsDialog
      v-bind="authDialog"
      :is-show.sync="authDialog.isShow"
      :title="'任务授权'"
      okText="保存"
      className="add-dialog edit-dialog score-template"
      @on-ok="save"
      @on-close="upClose"
    >
      <TsForm
        id="tsDialog"
        ref="saveForm"
        :itemList="formConfig"
        class="padding"
      >
        <template v-slot:dimensionList>
          <ul class="dimension-list border">
            <li v-for="(item,index) in scoreTemplate.dimensionList" :key="index" class="dimension-item bg-op padding radius-lg">
              <div class="itemsBox">
                <span class="text text-default">授权用户<span class="red">*</span></span>
                <UserSelect
                  v-model="item.targetList"
                  :multiple="false"
                  class="userSelect"
                  :validateList="['required']"
                  width="94%"
                  :groupList="['user']"
                ></UserSelect>
              </div>
              <div v-for="(j, i) in item.catalogueList" :key="i" class="itemsBox">
                <span v-if="i==0" class="text text-default">授权服务<span class="red">*</span></span>
                <div class="cascader">
                  <TsFormTree
                    ref="TsFormTree"
                    v-model="j.name"
                    :dataList="j.treeList"
                    :validateList="[{name: 'required', message: '请选择授权服务'}]"
                    class="TsFormTree"
                    :textName="'label'"
                    :valueName="'value'"
                    :childrenKey="'children'"
                    showPath
                    width="94%"
                  ></TsFormTree>
                </div>
                <div
                  v-if="i>0" 
                  class="text-action catalogue text-href"
                  @click="removei(i, index)"
                ><i class="tsfont-close"></i></div>
              </div>
              <div title="服务" class="add-item tsfont-plus text-action" @click="addItem(index)">服务</div>
              <div
                v-if="scoreTemplate.dimensionList.length>1" 
                class="remove-item text-action text-href"
                @click="removeItem(index)"
              ><i class="tsfont-trash-o"></i></div>
            </li>
          </ul>
          <div title="服务" class="add-item tsfont-plus text-action" @click="authAdd">授权对象</div>
        </template>
      </TsForm>
    </TsDialog>

  </div>
</template>

<script>
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    UserSelect,
    TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: [],
  data() {
    let vm = this;
    return {
      authDialog: {
        type: 'slider',
        title: '',
        maskClose: false,
        isShow: false,
        width: '700px'
      },
      keyConfig: {name: 'label', id: 'value'},
      treeList: [],
      agentConfig: {},
      scoreTemplate: {
        id: null,
        isActive: 1,
        name: '',
        description: '',
        dimensionList: 
          [{name: [], targetList: [], catalogueList: [{name: []}] }]
      },
      formConfig: {
        isActive: {
          name: 'isActive',
          type: 'switch',
          label: '启用',
          value: 1,
          onChange(isActive) {
            vm.scoreTemplate.isActive = isActive;
          }
        },
        beginTime: {
          name: 'beginTime',
          type: 'datetime',
          label: '开始时间',
          validateList: [{name: 'required', message: '请选择开始时间'}],
          value: ''					
        },
        endTime: {
          name: 'endTime',
          type: 'datetime',
          label: '结束时间',
          validateList: [{name: 'required', message: '请选择结束时间'}],
          value: ''					
        },
        dimensionList: {
          name: 'dimensionList',
          type: 'slot',
          label: '授权对象',
          validateList: ['required'],
          value: ''
        }
      }
    };
  },

  created() {
    this.getAllService();
    this.getAgent();
  },

  methods: {
    format(labels, selectedData) {
      return labels[labels.length - 1];
    },
    addAuth() {
      this.getAgent();
      this.authDialog.isShow = true;      
    },
    upClose() {

    },
    save() {
      let changeForm = this.$refs.saveForm;
      let that = this;
      if (changeForm.valid()) {
        let dimensionList = this.scoreTemplate.dimensionList;
        let formConfig = this.formConfig;
        let data = {
          beginTime: formConfig.beginTime.value,
          endTime: formConfig.endTime.value,
          isActive: formConfig.isActive.value,
          compobList: []
        };
        let isTrue = true;
        let errorText = '';
        let userArrs = [];
        let serviceArr = [];
        if (data.beginTime > data.endTime) {
          that.$Message.error('开始时间不能大于结束时间');
          return false;
        }
        dimensionList.forEach(v => {          
          let catalogueList = [];
          v.catalogueList.forEach(j => {
            let value = j.name[j.name.length - 1];
            if (j.name) {
              let names = '';
              if (typeof (j.name) == 'string') {
                names = j.name.split('#')[1];
                catalogueList.push({target: j.name.split('#')[1], pathList: [j.name], type: j.name.split('#')[0]});
              } else {
                names = j.name[0].split('#')[1];
                catalogueList.push({target: j.name[0].split('#')[1], pathList: j.name, type: j.name[0].split('#')[0]});
              }
              serviceArr.push(names);
            } else {
              isTrue = false;
              errorText = '请选择授权服务';
            }
          });
          userArrs.push(v.targetList);
          data.compobList.push(
            {toUserUuid: v.targetList, targetList: catalogueList}
          );
        });

        let newUserArr = [...new Set(userArrs)]; // 授权用户不能重复
        let newserviceArr = [...new Set(serviceArr)]; // 授权用户不能重复
        if (data.compobList.length > newUserArr.length) {
          isTrue = false;
          errorText = '授权用户不能重复';
        }
        
        let temArr = [];
        data.compobList.forEach(v => {
          v.targetList.forEach(j => {
            temArr.push(j.target);
          });
        });

        if (temArr.length > newserviceArr.length) {
          isTrue = false;
          errorText = '授权服务不能重复';
        }

        if (!isTrue) {
          that.$Message.error(errorText);
          return false;
        }
        this.savePost(data);
      }
    },
    savePost(data) {
      let that = this;
      this.$api.framework.user.saveProcesstask(data).then(res => {
        that.$Message.success(this.$t('message.content.savesuccess'));
        that.getAgent();
        that.authDialog.isShow = false;
      });
    },
    getTreeListObj() {
      // 树列表对象，修复任务授权-任务授权中添加多个授权服务并保存后，再次编辑时，授权服务回显异常
      return {treeList: this.$utils.deepClone(this.treeList)};
    },
    addItem(index) {
      this.scoreTemplate.dimensionList[index].catalogueList.push({name: [], ...this.getTreeListObj()});
    },
    removeItem(index) {
      this.scoreTemplate.dimensionList.splice(index, 1);
    },
    removei(i, index) {
      this.scoreTemplate.dimensionList[index].catalogueList.splice(i, 1);
    },
    removeTabItem(index) {
      this.scoreTemplate.dimensionList.splice(index, 1);
    },
    authAdd() {
      this.scoreTemplate.dimensionList.push({name: [], targetList: '', catalogueList: [{name: [], ...this.getTreeListObj()}]});
    },
    getAgent() {
      const data = {};
      let that = this;
      this.$api.framework.user.getProcesstask(data).then(res => {
        if (res.Status == 'OK') {
          that.agentConfig = res.Return;
          if (that.agentConfig) {
            let data = this.agentConfig;
            that.formConfig.beginTime.value = data.beginTime;
            that.formConfig.endTime.value = data.endTime;
            that.formConfig.isActive.value = data.isActive;
            let newData = [];
            data.compobList.forEach(v => {
              let catalogueList = [];
              v.targetList.forEach(j => {
                catalogueList.push(
                  {name: j.pathList, ...that.getTreeListObj()}
                );
              });
              newData.push(
                {name: [], targetList: v.toUserUuid, catalogueList: catalogueList}
              );
            });
            that.scoreTemplate.dimensionList = JSON.parse(JSON.stringify(newData));
          } else {
            that.formConfig.beginTime.value = '';
            that.formConfig.endTime.value = '';
            that.scoreTemplate.dimensionList = [{name: [], targetList: [], catalogueList: [{name: [], ...that.getTreeListObj()}] }];
          }
        }
      });
    },
    toggleAction(row) {
      this.$api.framework.user
        .updateProcesstask()
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.executesuccess'));
            this.getAgent();
          }
        });
    },
    //获取所有服务目录
    getAllService: function() {
      var that = this;
      let params = {
        catalogUuid: 0
      };

      this.$https
        .post('/api/rest/process/catalog/channel/tree/search')
        .then(res => {
          if (res.Status == 'OK') {
            that.treeList = that.getItemlist(res.Return);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    getItemlist: function(arr) {
      for (var i in arr) {
        if (arr[i].name) {
          arr[i].label = arr[i].name;
          arr[i].value = arr[i].typeAndUuid;
        }
        if (arr[i].children && arr[i].children.length > 0) {
          this.getItemlist(arr[i].children);
        }
      }
      return arr;
    },
    deleteRow() {
      let that = this;
      this.$createDialog({
        title: '警告',
        content: '确定删除该授权吗?',
        btnType: 'error',
        'on-ok': vnode => {
          that.$api.framework.user.deleteProcesstask().then(res => {
            if (res.Status == 'OK') {
              that.$Message.success(this.$t('message.content.deletesuccess'));
              that.getAgent();
              vnode.isShow = false;
            }
          });
        }
      });
    }
  }
};
</script>
<style lang='less' scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.listBox{
  position: relative;
  cursor: pointer;
  .tstable-action{
    display: none;
  }
}
.action-group{
  position: absolute;
  right: 40px;
}
.listBox:hover{
  .tstable-action{
    display: inline-block;
  }
}
.tstable-action-ul{
  li{
    display: inline-block;
    margin-left: 16px;
  }
}
// /deep/.ivu-dropdown .ivu-select-dropdown{
//   max-height: 300px;
//   overflow: auto;
// }
// /deep/.ivu-cascader{
//   width:calc(100%-140px)!important;
// }

.dimension-list{
  margin-bottom:10px;
  .dimension-item{
    margin-bottom:10px;
    position: relative;
    .itemsBox{
      position: relative;
      margin-bottom: 16px;
      width:100%;
      .text{
        width:120px;
        position: absolute;
        text-align: right;
        padding-right: 10px;
        line-height: 33px;
      }
      .userSelect,.cascader{
        margin-left: 120px;
        width:calc(100%-140px)!important;
      }
      .catalogue{
        display: none;
        position:absolute;
        right: 5px;
        top:0px;
        // color:red;
      }
    }
    .itemsBox:hover{
      .catalogue{        
        display: inline-block;
      }
    }
    .remove-item{
      display: none;
      position:absolute;
      right:20px;
      top:-2px;
      // color:red;
    }
  }
  .dimension-item:hover{
    .remove-item{      
      display: inline-block;
    }
  }
}
.red{
  color:#f71010;
  margin-right:1px;
}
.task-authorization {
  .block {
    margin-top: 10px;
    padding: 30px 15px;
    display: flex;
    position: relative;
    border-radius: 10px;
    .isSwitch{
      position: absolute;
      height: 100%;
      top: 0;
      left: 0;
      border-radius: 10px 0px 0px 10px;
      width:6px;
    }
    .item {
      flex: 1;
      display: flex;
      flex-grow: 3;
      flex-direction: column;
      padding: 0 5px;
    }

    .action {
      flex-grow: 2;
      flex-direction: row-reverse;
      align-items: center;
      text-align: right;
    }
  }
}
</style>
