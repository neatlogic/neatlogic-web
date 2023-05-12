/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="file-main">
    <template v-if="fileList.length">
      <div v-for="(item, index) in getShowList(fileList)" :key="item.id ||index" class="list">
        <div v-if="item.name" class="tsfont-attachment file-name" :title="item.name">
          {{ item.name }}
        </div>
      </div>
      <template v-if="fileList.length > showNumber">
        <div class="text-tip-active list" @click="lookData">
          {{ $t('page.viewall') }}
        </div>
      </template>
    </template>
    <template v-else>-</template>
    <TsDialog
      :isShow.sync="showDialog"
      :title="$t('page.viewall')"
      :hasFooter="false"
      :maskClose="true"
    >
      <template v-slot>
        <div class="all-file input-border">
          <div class="search">
            <TsFormInput
              v-model="keyword"
              search
              @on-change="searchKeyWord"
            ></TsFormInput>
          </div>
          <div class="file-content">
            <TsRow v-if="searchList && searchList.length > 0">
              <Col
                v-for="(item, index) in searchList"
                :key="index"
                span="12"
                :class="item.isHide?'hide':''"
              >
                <div class="file-detail overflow">
                  <span class="tsfont-attachment overflow file-name">{{ item.name }}</span>
                </div>
              </Col>
            </TsRow>
            <NoData v-else-if="!searchList || !searchList.length"></NoData>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: {
    TsFormInput
  },
  filters: {},
  props: {
    value: Object
  },
  data() {
    return {
      showNumber: 1,
      searchList: [],
      keyword: '',
      showDialog: false,
      fileList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    lookData() {
      this.searchList = this.value.fileList || [];
      this.showDialog = true;
    },
    searchKeyWord() {
      this.searchList = [];
      if (this.keyword && this.keyword != '') {
        this.value.fileList.forEach(i => {
          if (i.name.indexOf(this.keyword) > -1) {
            this.searchList.push(i);
          }
        });
      } else {
        this.searchList = this.value.fileList;
      }
    }
  },
  computed: {
    getShowList() {
      return function(list) {
        let showList = list.slice(0, this.showNumber);
        return showList;
      };
    }
  },
  watch: {
    value: {
      handler(val) {
        val && val.fileList && (this.fileList = this.$utils.deepClone(val.fileList));
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.file-main{
  .list{
    display: inline-block;
    max-width: 100%;
    &:not(:last-child){
      padding-right: 10px;
    }
  }
}
.all-file {
  width: 100%;
  line-height: 32px;
  .search {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
  .file-content{
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    height: 300px;
  }
}
</style>

