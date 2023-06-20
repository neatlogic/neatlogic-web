<template>
  <div v-if="!groupSeaching">
    <div v-if="hasBranch" class="input-border" style="padding:0 16px;">
      <Row :gutter="16">
        <Col span="14">
        </Col>
        <Col span="10">
          <div class="clearfix">
            <div class="d_f_r">
              <TsFormSelect
                v-model="queryName"
                :dataList="searchGrouplist"
                childrenName="dataList"
                transfer
                mode="group"
                search
                width="100%"
                :placeholder="$t('term.codehub.choosebranchortag')"
                :validateList="validateList"
                @on-change="getSearch"
              ></TsFormSelect>
            </div>
          </div>
        </Col>
      </Row>
    </div>
    <div v-if="hasBranch">
      <Loading v-if="isload" loadingShow style="height:100px"></Loading>
      <div v-else>
        <Breadcrumb v-if="parentPath || currentfilePath">
          <BreadcrumbItem 
            v-for="(path,pindex) in listPath(parentPath)" 
            :key="pindex"
          >
            <span v-if="(pindex < listPath(parentPath).length-1) ||currentfilePath" class="cursor-pointer" @click="gotoPath(pindex)"> {{ path }}</span>
            <span v-else>{{ path }}</span>
          </BreadcrumbItem>
          <BreadcrumbItem v-if="currentfilePath">{{ currentfilePath }}</BreadcrumbItem>
        </Breadcrumb>
        <div v-if="list && list.length">
          <div class="clearfix lastcommit-container border-color">
            <div v-if="lastConfig" class="d_f">
              <span>{{ lastConfig.author }}</span><span class="text-tip ml-sm">{{ lastConfig.message }}</span>
            </div>
            <div class="d_f_r">
              <span class="text-tip">{{ $t('term.codehub.finalcommit') }}</span>
              <span>{{ showCommitId(lastConfig.commitId) }}</span>
              <span class="text-tip ml-sm">{{ lastConfig.committerDateTimestamp | formatDate }}</span>
            </div>
          </div>
        </div>
        <div
          v-if="parentPath || currentfilePath"
          class="cursor-pointer text-left h4"
          :title="$t('term.codehub.backparent')"
          @click="gotoPrev()"
        ><span class="text-tip ml-sm ts-option-horizontal"></span></div>
        <div class="tstable-container border bg-grey radius-lg">
          <div ref="mainBody" style="overflow:auto;" :style="'max-height:'+remainHeight+'px;'">
            <table v-if="!currentfilePath && list && list.length" class="tstable-body">
              <colgroup>
                <col />
                <col />
                <col />
                <col width="180" />
              </colgroup>
              <tbody class="tbody-main">
                <tr
                  v-for="(li,lindex) in list"
                  :key="lindex"
                  class="cursor-pointer"
                  @click="toNext(li)"
                >
                  <td>
                    <span :class="li.type == 'D' ? 'ts-folder text-warning':'ts-file'" class="mr-xs"></span>{{ li.path }}
                  </td>
                  <td>{{ li.lastAuthor }}</td>
                  <td>{{ li.lastCommitMessage }}</td>
                  <td class="text-right">
                    <div v-if="li.lastChangeDate">
                      {{ li.lastChangeDate | formatDate }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <FileDetail v-else-if="currentfilePath" :fileConfig="currentfileConfig"></FileDetail>
            <NoData v-else></NoData>
          </div>
        </div>
     
      </div>
    </div>
    <NoData v-else :text="$t('term.codehub.nocommitfile')"></NoData>
  </div>
  <Loading v-else loadingShow></Loading>
</template>
<script>
import editmixin from './edittabmixin.js';
import FileDetail from './file/file-detail.vue';
export default {
  name: 'File',
  components: {
    FileDetail,
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve)
  },
  mixins: [editmixin],
  props: {},
  data() {
    return {
      queryName: '', //接口需要的分组选中哪一个下拉的选项
      queryType: 'branch', //类型：brach\tag
      isload: false, //是否接口调用中
      selectConfig: {
        clearable: false,
        multiple: false
      },
      validateList: ['required'],
      list: [], //文件列表
      lastConfig: null, //最后一条提交记录
      subFilePath: null, //当前路径，=上一层路径-当前路径
      parentPath: null, //当前路径
      hasBranch: false, //是否可以调用搜索的接口（根据是否有分支）
      remainHeight: 200,
      currentfilePath: null, //如果是查看文件的
      currentfileConfig: null, //如果是查看文件的,文件的数据
      commitIdForReadFile: null
    };
  },
  beforeCreate() {},
  created() {
    if (this.id && this.reposData) {
      this.queryName = this.reposData.defaultBranch || this.reposData.mainBranch;
      this.queryType = 'branch';
      this.queryName = this.queryType + '###' + this.queryName;
    }
  },
  beforeMount() {},
  async mounted() {
    await this.initGroupsearch();
    if (this.checkHasBranch(this.searchGrouplist)) {
      this.hasBranch = true;
      this.getList();
    } else {
      this.hasBranch = false;
    }  
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getSearch(val, vallist, selectItem) {
      if (!this.$utils.isEmpty(selectItem)) {
        this.queryName = selectItem.value ? selectItem.value : '';
        this.queryType = selectItem.group ? selectItem.group : '';
        this.parentPath = null;
        this.commitIdForReadFile = null;
        this.getList();
      }
    },
    getList() {
      this.currentfilePath = null;
      this.currentfileConfig = null;
      if (!this.hasBranch) {
        return;
      }
      let param = {
        repositoryId: this.id,
        queryName: this.queryName.indexOf(this.queryType + '###') > -1 ? this.queryName.split(this.queryType + '###')[1] : this.queryName,
        queryType: this.queryType
      };
      this.parentPath && this.$set(param, 'subFilePath', this.parentPath);
      this.isload = true;
      this.$api.codehub.repositorydetail
        .getFile(param)
        .then(res => {
          this.isload = false;
          this.list = res.Return.list;
          if (!this.commitIdForReadFile || 
              (this.lastConfig && res.Return.lastCommit.committerDateTimestamp > this.lastConfig.committerDateTimestamp)) {
            this.commitIdForReadFile = res.Return.lastCommit.commitId;
          }
          this.lastConfig = res.Return.lastCommit;
          this.parentPath = res.Return.parentPath;
          this.subFilePath = this.parentPath ? this.parentPath.substring(0, this.parentPath.lastIndexOf('/')) : '';
          this.$nextTick(() => {
            if (this.$refs.mainBody) {
              this.remainHeight = window.innerHeight - this.$refs.mainBody.getBoundingClientRect().top - 30;
            }
          });
        })
        .catch(error => {
          this.isload = false;
          this.list = [];
        });
    },
    toNext(li) { // 进入子目录或打开文
      if (!this.commitIdForReadFile || 
              (li.lastChangeDate > this.lastConfig.committerDateTimestamp)) {
        this.commitIdForReadFile = li.lastChangeDate;
      }

      if (li.type == 'D') {
        let path = this.parentPath ? (this.parentPath + '/' + li.path) : li.path;
        this.parentPath = path;
        this.getList();
      } else if (li.type == 'F') {
        this.currentfilePath = li.path;
        this.getFileDetail(li);
      }
    },
    gotoPath(index) {
      //点击面包屑对应每一层，为了避免有文件名一样的，用index获取第几层
      let path = '';
      let arr = [];
      let list = JSON.parse(JSON.stringify(this.parentPath));
      if (list.indexOf('/') > 0) {
        arr = list.split('/');
      }
      arr.forEach((a, aindex) => {
        if (aindex <= index) {
          path = path + (aindex > 0 ? '/' : '') + a;
        }
      });
      //if (!this.currentfilePath) {
      //如果不是到文件详情层才需要截取路径
      this.$set(this, 'parentPath', path);
      //}
      this.currentfilePath = null;
      this.getList();
    },
    gotoPrev() {
      //往上一层
      this.parentPath = this.subFilePath;
      this.getList();
    },
    getFileDetail(li) {
      let params = {};
      this.currentfileConfig = null;
      Object.assign(params, {
        repositoryId: this.id,
        commitId: this.commitIdForReadFile,
        branchName: this.queryName,
        filePath: li.path,
        binary: li.binary,
        fullPath: this.parentPath ? (this.parentPath + '/' + li.path) : li.path
      });
      this.currentfileConfig = params;
    }
  },

  computed: {
    showCommitId() {
      return function(id) {
        return id.length > 6 ? id.slice(0, 6) : id;
      };
    },
    listPath() {
      return function(list) {
        let arr = [];
        if (list.indexOf('/') > 0) {
          arr = list.split('/');
        } else if (list) {
          arr = [list];
        }
        return arr;
      };
    }
  },

  watch: {
    list: {
      handler: function(val) {
        // this.lastConfig = null;
        // if (val && val.length > 0) {
        //   let last = Math.max.apply(
        //     Math,
        //     val.map(function(o) {
        //       return o.lastChangeDate ? o.lastChangeDate.time : 0;
        //     })
        //   );
        //   val.forEach(v => {
        //     if (v.lastChangeDate && v.lastChangeDate.time == last) {
        //       this.lastConfig = v;
        //     }
        //   });
        // }
      },
      immediate: true,
      deep: true
    },
    isload: {
      handler: function(val) {
        this.$emit('updateStatus', val);
      }      
    }
  }
};
</script>
<style lang='less' scoped>
@default-border: #ddd;
@default-dividing: #eaebed;
.lastcommit-container {
  line-height: 3;
  border-bottom: 1px solid;
  padding-left: 10px;
  margin-top: 10px;
}
.file-table {
  tr {
    th {
      font-weight: normal;
      line-height: 3;
      border-bottom: 1px solid @default-border;
    }
    td {
      line-height: 2;
      border-bottom: 1px solid @default-dividing;
      word-break: keep-all;
      white-space: nowrap;
    }
  }
  width: 100%;
}

.d_f {
  float: left;
}

.d_f_r {
  float: right;
}
</style>
