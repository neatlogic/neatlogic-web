<template>
  <div>
    <TsRow>
      <Col span="2">
        <label>{{ $t('page.user') }}</label>
      </Col>
      <Col span="22">
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
      </Col>
    </TsRow>
    <TsRow>
      <Col span="2">
      </Col>
      <Col span="22">
        <div class="text-grey mt-xs">{{ $t('message.framework.hmactip') }}</div>
      </Col>
    </TsRow>
  </div>
</template>
<script>
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';

export default {
  components: { UserSelect },
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
