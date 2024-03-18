
<template>
  <TsDialog v-bind="validDialog" :isShow="visible" @on-close="close()">
    <div class="valid-title"><span class="tsfont-info-o text-warning"></span>{{ $t('term.autoexec.issaveexecutetarget') }}</div>
    <div v-for="(item,index) in resultList" :key="index" class="valid-box">
      <template v-if="item.type == 'resourceIsEmpty'">
        <span>{{ $t('term.autoexec.notmatchexecutetarget') }}</span>
      </template>
      <template v-if="item.type == 'executeUserIsNotFoundInProtocol'">
        <span>
          {{ $t('term.autoexec.nousertoaccountpagesetting', {protocol: item.protocol, executeuser: item.executeUser }) }}
        </span>
        <span class="text-href" @click="gotoAccountManage()">{{ $t('term.autoexec.addaccount') }}</span>
      </template>
      <template v-if="item.type == 'resourceListWithoutAccountByExecuteUserAndProtocol'">
        <div class="title-tip">{{ $t('term.autoexec.thefollowingobjectives') }}</div>
        <template v-if="item.list.length > 0">
          <div class="text-tip">{{ $t('term.autoexec.executetarget') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.list" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <template v-if="item.whitelist && item.whitelist.length > 0">
          <div class="text-tip">{{ $t('page.whitelist') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.whitelist" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <span v-if="item.protocol !== 'tagent' && !item.protocol.startsWith('tagent.')">
          <span>
            {{ $t('term.autoexec.noexecuteusertoassetmanage', {protocol: item.protocol , executeUser: item.executeUser }) }}
          </span>
          <span class="text-href" @click="gotoAssetManage('addAccount', item.list)">{{ $t('term.autoexec.addbindaccount') }}</span>
        </span>
        <span v-if="item.protocol === 'tagent' || item.protocol.startsWith('tagent.')">
          <span>{{ $t('term.autoexec.tagentnoexecuteusertoassetmanage', {protocol: item.protocol }) }}</span>
          <span v-if="$AuthUtils.hasRole('TAGENT_BASE')" class="text-href" @click="gotoAssetManage('tagentManager', item.list)">{{ $t('page.autoexecchecktagentstatus') }}4567</span>
        </span>
        
      </template>
      <template v-if="item.type == 'resourceListWithoutAccountByProtocol'">
        <div class="title-tip">{{ $t('term.autoexec.thefollowingobjectives') }}</div>
        <template v-if="item.list.length > 0">
          <div class="text-tip">{{ $t('term.autoexec.executetarget') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.list" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <template v-if="item.whitelist && item.whitelist.length > 0">
          <div class="text-tip">{{ $t('page.whitelist') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.whitelist" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <span v-if="item.protocol !== 'tagent' && !item.protocol.startsWith('tagent.')">
          <span>{{ $t('term.autoexec.noexecuteusertoassetmanage', {protocol: item.protocol , executeUser: item.executeUser||"null" }) }}</span>
          <span class="text-href" @click="gotoAssetManage('addAccount', item.list)">{{ $t('term.autoexec.addbindaccount') }}</span>
        </span>
        <span v-if="item.protocol === 'tagent' || item.protocol.startsWith('tagent.')">
          <span>{{ $t('term.autoexec.tagentnoexecuteusertoassetmanage', {protocol: item.protocol }) }}</span>
          <span v-if="$AuthUtils.hasRole('TAGENT_BASE')" class="text-href" @click="gotoAssetManage('tagentManager', item.list)">{{ $t('page.autoexecchecktagentstatus') }}</span>
        </span>
      </template>
      <template v-if="item.type == 'resourceIsNotFound'">
        <div class="title-tip">{{ $t('term.autoexec.thefollowingobjectives') }}</div>
        <template v-if="item.list.length > 0">
          <div class="text-tip">{{ $t('term.autoexec.executetarget') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.list" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <template v-if="item.whitelist && item.whitelist.length > 0">
          <div class="text-tip">{{ $t('page.whitelist') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.whitelist" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <span>{{ $t('term.autoexec.notfoundassetstip') }}</span>
      </template>
    </div>
    <template v-slot:footer>
      <Button type="primary" ghost @click="close()">{{ $t('page.back') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.save') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {
  },
  props: {
    visible: {//是否显示
      type: Boolean,
      default: false
    },
    resultList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      validDialog: {
        hasHeader: false,
        showCloseIcon: false,
        height: '300px'
      }
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
    save() {
      this.$emit('save');
    },
    close() {
      this.$emit('close');
    },
    gotoAccountManage() { //添加账号
      window.open(HOME + '/cmdb.html#/account-manage?isNewAccountShow=true', '_blank');
    },
    gotoAssetManage(type, list) { //资产绑定账号
      let assetIpList = JSON.stringify(list);
      list.length > 1 && sessionStorage.setItem('assetIpList', assetIpList);
      if (type == 'tagentManager') {
        window.open(HOME + '/framework.html#/tagent-manage', '_blank');
      } else if (type == 'addAccount' && list.length == 1) {
        window.open(HOME + '/cmdb.html#/asset-manage?isAddAccountShow=true', '_blank');
      } else {
        window.open(HOME + '/cmdb.html#/asset-manage', '_blank'); //添加资产,待定（功能还没有）
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.title-tip{
  padding: 16px 0 10px;
}
</style>
