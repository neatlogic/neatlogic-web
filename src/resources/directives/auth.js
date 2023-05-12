import store from '@/resources/store/index.js';
/* 
 控制用户权限指令
 使用方法：<Button type="button" v-auth="'INSPECT_EXECUTE'"></Button>
 如果有权限显示Button按钮，没有就隐藏Button按钮
 v-auth="'权限名称'"
 */

const auth = {
  bind(el, binding) {
    if (binding && binding.value && !hasAuth(binding.value)) {
      el && el.parentNode && el.parentNode.removeChild(el);
    }
  },
  update(el, binding) {
    if (binding && binding.value && !hasAuth(binding.value)) {
      el && el.parentNode && el.parentNode.removeChild(el);
    }
  }
};
function hasAuth(authName) {
  // 当前用户权限列表
  let userAuthList = Array.isArray(authName) ? authName : [authName];
  return userAuthList.some(e => store.getters.userAuthList.includes(e));
}
export default auth;

