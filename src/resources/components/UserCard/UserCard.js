import UserCard from './UserCard.vue';
import GroupCard from './GroupCard.vue';
import UserInfo from './UserInfo.vue';

UserCard.install = function(Vue) {
  Vue.component('UserCard', UserCard);
  Vue.component('GroupCard', GroupCard);
  Vue.component('UserInfo', UserInfo);
};
export { UserCard, GroupCard, UserInfo };
export default UserCard;
