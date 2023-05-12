<template>
  <TsDialog v-bind="setting" :isShow="isShow" @on-close="close">
    <div>
      <div v-if="handlerList && handlerList.length>0">
        <div v-for="(handler,hindex) in handlerList" :key="hindex">
          <h4 style="line-height:2">{{ handler.label }}</h4>
          <div class="tstable-container tstable-small">
            <table class="tstable-body">
              <thead>
                <tr>
                  <!-- <th>排序</th> -->
                  <th>字段名称</th>
                  <th>字段类型</th>
                  <th>可编辑</th>
                  <!-- <th>是否隐藏</th> -->
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item ,iindex) in getTablelist(handler, allList)" :key="iindex">
                  <!-- <td></td> -->
                  <td>{{ item.ciLabel }}_{{ item.label }}</td>
                  <td>{{ setTypetext(item.type) }}</td>
                  <td><i-switch v-model="item.isRead" size="small" @on-change="(val)=>{updateStatus('read',val,item)}"></i-switch></td>
                  <!-- <td><i-switch v-model="item.isHide" size="small" @on-change="(val)=>{updateStatus('hide',val,item)}"></i-switch></td> -->
                </tr>
              </tbody>
            </table>
          </div>
          <div></div>
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button @click="close">取消</Button>
        <Button type="primary" @click="saveEdit">确定</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import api from '@/resources/api/cmdb/index';
export default {
  name: '',
  components: {
  },
  filters: {},
  mixins: [],
  props: {
    isShow: Boolean,
    config: {
      type: Object,
      default: () => { 
        return {};
      }
    },
    handlerList: {//配置了配置项组件的表单组件
      type: Array,
      default: () => { 
        return []; 
      }      
    }
  },
  data() {
    return {
      setting: {
        title: '编辑配置项属性',
        maskClose: false
      },
      allList: [], //获取的模型属性关系数据
      hideList: [],
      readList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    saveEdit() {
      this.$emit('updateConfig', {
        entityFilter: {
          hideList: this.hideList,
          readList: this.readList
        }}
      );
      this.$emit('close');
    },
    getSelected(list) {
      if (list && list.length > 0) {
        list.forEach((li) => {
          if (this.selectedList.indexOf(li)) {
            this.selectedList.push(li);
          }
        });
      } else {
        this.selectedList = [];
      }
    },
    initList() {
      let ciList = [];
      if (this.handlerList && this.handlerList.length > 0) {
        this.handlerList.forEach((h) => {
          if (h.config && h.config.ciIdList) {
            h.config.ciIdList.forEach((c) => {
              if (ciList.indexOf(c) < 0) {
                ciList.push(c);
                //
              }
            });
          }
        });
      }
      let param = {
        ciIdList: ciList
      };
      api.cmdb.ci.getCiInfo(param).then((res) => {
        if (res.Status == 'OK') {
          this.allList = res.Return;
        }
      });
    },
    updateStatus(type, status, item) {
      let _this = this;
      let liItem = {
        type: item.type || 'attr',
        id: item.id,
        ciId: item.ciId,
        handlerId: item.handlerId        
      };
      if (type == 'read') {
        if (status) {
          //如果是设为只读
          if (!_this.checkExist(item, _this.readList)) {
            _this.readList.push(liItem);
          }
        } else {
          //如果是取消设为只读
          if (_this.checkExist(item, _this.readList)) {
            let list = JSON.parse(JSON.stringify(_this.readList));
            this.readList = list.filter((l) => {
              return (l.handlerId != item.handlerId) && (l.ciId != item.ciId) && (l.type != item.type) && (l.id != item.id);
            });
          }
        }
      } else if (type == 'hide') {
        if (status) {
          //如果是设为隐藏
          if (!_this.checkExist(item, _this.hideList)) {
            _this.hideList.push(liItem);
          }
        } else {
          //如果是取消设为隐藏
          if (!_this.checkExist(item, _this.hideList)) {
            let list = JSON.parse(JSON.stringify(_this.hideList));
            this.hideList = list.filter((l) => {
              return (l.handlerId != item.handlerId) && (l.ciId != item.ciId) && (l.type != item.type) && (l.id != item.id);
            });
          }
        }
      }
    },
    checkExist(item, list) {
      let isExist = false;
      try {
        if (list && list.length > 0) {
          list.forEach((l) => {
            if ((l.handlerId == item.handlerId) && (l.ciId == item.ciId) && (l.type == item.type) && (l.id == item.id)) {
              isExist = true;
            }
          });
        }
      } catch (e) {
        console.log(e);
      }

      return isExist;
    }
  },
  computed: {
    getTablelist() {
      return function(handler, allList) {
        let list = [];
        let _this = this;
        let myList = allList.filter((a) => { return handler.config.ciIdList.indexOf(a.id) > -1; });
        if (myList.length > 0) {
          myList.forEach((l) => {
            let attrList = l.attrList.map((a) => {
              return Object.assign(a, {
                type: 'attr',
                ciId: l.id,
                ciLabel: l.label,
                handlerId: handler.uuid
              });
            });
            attrList.forEach((a) => {
              Object.assign(a, {
                isHide: _this.checkExist(a, _this.config.hideList),
                isRead: _this.checkExist(a, _this.config.readList)
              });
            });
            let relList = l.relList.map((a) => {
              return Object.assign(a, {
                type: 'rel',
                ciId: l.id,
                ciLabel: l.label,
                handlerId: handler.uuid
              });
            });
            relList.forEach((a) => {
              Object.assign(a, {
                isHide: _this.checkExist(a, _this.config.hideList),
                isRead: _this.checkExist(a, _this.config.readList)
              });
            });
            list.push(...attrList);
            list.push(...relList);
          });
        }
        return this.$utils.deepClone(list);
      };
    },
    setTypetext() {
      return function(type) {
        let textObject = {
          'attr': '属性',
          'rel': '关系'
        };
        return textObject[type];
      };
    }
  },
  watch: {
    config: {
      handler: function(val) {
        if (val) {
          this.hideList = val.hideList || [];
          this.readList = val.readList || [];
        } else {
          this.hideList = [];
          this.readList = [];          
        }
      },
      immediate: true,
      deep: true
    }
  }

};

</script>
<style lang='less'>

</style>
