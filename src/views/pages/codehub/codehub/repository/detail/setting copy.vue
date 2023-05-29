<template>
  <div>
    <TsForm ref="editform" :itemList="formConfig" :labelWidth="160">
      <template slot="branchName">
        <TsFormSelect v-model="eventId" v-bind="notifyConfig" :dataList="notifyList" />
      </template>
      <template slot="paramList">
        <div v-if="myList && myList.length>0">
          <div v-for="(param,pindex) in myList" :key="pindex">{{ param.name }}_{{ param.label }}_{{ param.dataList }}</div>
        </div>
      </template>
    </TsForm>    
  </div>
</template>

<script>
export default {
  name: 'Setting',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve)
  },
  props: {
    uuid: [String],
    reposData: [Object],
    searchGrouplist: [Array]
  },
  data() {
    return {
      formConfig: [
        {
          type: 'slot',
          label: '通知策略',
          name: 'branchName',
          validateList: ['required']
        }, {
          type: 'slot',
          label: '参数映射',
          name: 'paramList'
        }
      ],
      handler: 'com.techsure.module.codehub.notify.MRNotifyPolicyHandler',
      notifyList: [], //通知策略的下拉列表
      notifyConfig: {
        search: true,
        clearable: false,
        transfer: true,
        width: 300,
        textName: 'name',
        valueName: 'id',
        validateList: ['required']
      },
      eventId: null,
      paramList: [], //参数列表
      myList: []//自己用的参数列表
      
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
  },

  beforeUpdate() {},

  updated() {},

  activated() {
    this.getNotifyList();
  },

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    getNotifyList() {
      let param = {
        needPage: false,
        handler: this.handler
      };
      this.$api.codehub.tactics.searchNotifyList(param).then(res => {
        if (res.Status == 'OK') {
          this.notifyList = res.Return.tbodyList || [];
        } else {
          this.notifyList = [];
        }
      }).catch(e => {
        this.notifyList = [];
      });
    },
    saveNotifySetting() {
      let param = {
        eventId: this.eventId,
        subjectUuid: this.uuid,
        subjectType: 'mr',
        isActive: 1,
        paramMappingList: []//此字段待补充
      };
      this.$api.codehub.repositorydetail.saveNotifySetting(param).then((res) => {
        
      });
    },
    getNotifyParamById(id) {
      let param = {
        policyId: id,
        needPage: false
      };
      this.$api.codehub.tactics.notifyParamList(param).then((res) => {
        this.paramList = res.Return.paramList;
        this.myList = res.Return.paramList;
        this.getDatalist();
      });      
    },
    getDatalist() {
      this.myList.forEach(li => {
        let datalist = this.paramList.filter(p => {
          return p.paramType == li.paramType && p.isEditable;
        });
        Object.assign(li, {
          dataList: datalist.map(d => {
            return {
              text: d.label,
              value: d.name
            };
          })
        });
      });
    }
  },

  filter: {},

  computed: {
  },

  watch: {
    eventId: {
      handler: function(val) {
        if (val) {
          this.getNotifyParamById(val);
        }
      },
      immediate: true
    }
  }

};
</script>
<style lang="less"></style>
