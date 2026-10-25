<template>
  <div>
    <!-- 仅开放当前登录用户与具体用户，认证身份始终为单选。 -->
    <TsFormItem :label="$t('page.user')">
      <UserSelect
        v-model="myAuthConfig.user"
        :multiple="false"
        :groupList="['common', 'user']"
        :includeList="['common#loginuser']"
        :excludeList="['common#alluser']"
        :clearable="false"
        :validateList="['required']"
        transfer
      />
      <div class="text-grey mt-xs">{{ $t('message.framework.hmactip') }}</div>
    </TsFormItem>
  </div>
</template>
<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';

export default {
  components: { TsFormItem, UserSelect },
  props: { authConfig: { type: Object, default: () => ({}) } },
  data() {
    return { myAuthConfig: { user: 'common#loginuser' } };
  },
  watch: {
    authConfig: {
      handler(config) {
        // 新切换的空配置默认使用执行人，回显时保留具体用户的标识。
        const user = config && config.user !== undefined ? config.user : 'common#loginuser';
        if (this.myAuthConfig.user !== user) {
          this.myAuthConfig = { user };
        }
        if (!config || config.user === undefined) {
          this.$emit('setConfig', { user });
        }
      },
      deep: true,
      immediate: true
    },
    myAuthConfig: {
      handler(config) {
        // 仅持久化身份标识，不把任何用户凭据放入前端配置。
        this.$emit('setConfig', { user: config.user });
      },
      deep: true
    }
  }
};
</script>
