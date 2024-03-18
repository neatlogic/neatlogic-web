
<template>
  <div class="time-job-add" :class="{'has-padding': isShowList}">
    <template v-if="!isShowList">
      <span
        v-if="!id || isShow"
        class="tsfont-plus text-action"
        :class="{'time-job-disabled': disable}"
        @click="openTimeJobDialog(true, id)"
      >
        {{ $t('term.autoexec.timingjob') }}
      </span>
      <span v-if="id" class="text-href" @click="openTimeJobDialog(false, id, editObj.editable)">{{ editObj && editObj.name }}</span>
    </template>

    <!-- 定时作业列表-组合工具详情页面使用 -->
    <template v-if="isShowList">
      <div class="h4 title">
        {{ $t('term.autoexec.timingjob') }}
      </div>
      <span
        class="tsfont-plus text-action"
        @click="openTimeJobDialog(true, id)"
      >
        {{ $t('term.autoexec.timingjob') }}
      </span>
      <ul class="time-job-ul">
        <li
          v-for="(item,tIndex) in dataList"
          :key="tIndex"
          :title="item.name"
          class="text-href overflow li-padding"
          @click="openTimeJobDialog(false, item.id, item.editable)"
        >
          {{ item.name }}
        </li>
      </ul>
      <div v-if="dataList.length < listObj.rowNum" class="text-title look-more" @click="toTimeJobPage()">
        <!-- 查看更多 -->
        {{ $t('page.viewmore') }}
      </div>
    </template>
    <!-- 定时作业列表，组合工具详情页面使用 -->
  </div>

</template>
<script>
export default {
  name: 'TimeJobClickText',
  components: {
  },
  filters: {
  },
  props: {
    id: [Number, String], // id
    isShow: {
      // 是否是纯展示
      type: Boolean,
      default: false
    },
    editObj: {
      type: Object,
      default: function() {
        return {};
      }
    },
    disable: {
      // 禁用
      type: Boolean,
      default: false
    },
    isShowList: {
      type: Boolean,
      default: false
    } 
  },
  data() {
    return {
      addEditText: '', // 编辑新增文本
      dataList: [], // 列表数据
      listObj: {
        rowNum: 0, // 总条数
        pageSize: 5,
        currentPage: 1,
        pageCount: 0 // 页码总数
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.isShowList) { 
      // 解决在组合工具详情，高度先后顺序获取不到的问题
      let time = setInterval(() => {
        let sibarBox = document.getElementsByClassName('ivu-layout-sider')[1];
        let basicSettingBox = document.getElementsByClassName('setting-main')[0];
        let sibarHeight = sibarBox && sibarBox.offsetHeight; // 右边盒子高度
        let basicSettingHeight = basicSettingBox && basicSettingBox.offsetHeight; // 基本信息盒子高度
        let timeJobListHeight = parseInt(((sibarHeight - basicSettingHeight) - 64) / 33); // 定时作业盒子高度
        clearInterval(time);
        this.getListById(this.id, 1, timeJobListHeight);
      }, 500);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    openTimeJobDialog(isTrue, id, editable) {
      // 点击打开定时作业弹框
      if (this.disable) {
        // 禁用不可点击
        return;
      }
      let key = isTrue ? 'combopid' : 'id';
      let query = isTrue ? {[key]: id} : {[key]: id, 'editable': editable};
      if (this.$route && this.$route.path.indexOf('time-job-list') != -1) {
        this.$router.push({
          path: id ? '/time-job-detail' : '/time-job-add',
          query: query
        });
      } else {
        let editablekey = !isTrue ? `&editable=${editable}` : '';
        let path = !isTrue ? 'time-job-detail' : 'time-job-add';
        window.open(HOME + `/autoexec.html#/${path}?${key}=` + id + editablekey, '_blank');
      }
    },
    getListById(id, currentPage, pageSize) {
      // 根据ID获取列表信息
      if (!id) {
        return; 
      }
      let params = {
        autoexecCombopId: parseInt(id) || this.id,
        currentPage: currentPage || this.listObj.currentPage,
        pageSize: pageSize || this.listObj.pageSize
      };
      this.$api.autoexec.timeJob.getTimeJobList(params).then((res) => {
        if (res.Status == 'OK') {
          this.listObj = Object.assign(this.listObj, res.Return);
          if (res.Return.currentPage == 1) {
            this.dataList = res.Return.tbodyList;
          } else {
            this.dataList = [].concat(this.dataList, res.Return.tbodyList);
          }
        }
      });
    },
    toTimeJobPage() {
      // 加载更多，跳转到定时作业列表页面
      window.open(HOME + '/autoexec.html#/time-job-list?id=' + this.id, '_blank');
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.time-job-add {
  &.has-padding {
     padding: 12px 16px;
  }
  .title {
    padding-bottom: 10px;
  }
  .time-job-ul {
    padding-top: 10px;
    .li-padding {
      padding-bottom: 15px;
    }
  }
  .look-more {
     cursor: pointer;
     margin-top: 7px;
    }
  .time-job-disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
}
</style>
