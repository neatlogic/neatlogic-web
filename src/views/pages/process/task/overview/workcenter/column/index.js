import usercardHandler from './usercard-handler.vue';
import textHandler from './status-handler.vue';
import currentstepHandler from './currentstep-handler.vue';
import currentstepnameHandler from './currentstepname-handler.vue';
import currentstepworkerHandler from './currentstepworker-handler.vue';
import expiretimeHandler from './expiretime-handler.vue';
import focususersHandler from './focususers-handler.vue';
import statusHandler from './status-handler.vue';
import ComponentManager from '@/resources/import/component-manager.js';
export default {
  usercardHandler,
  textHandler,
  statusHandler,
  currentstepHandler,
  expiretimeHandler,
  focususersHandler,
  currentstepnameHandler,
  currentstepworkerHandler,
  ...ComponentManager.getWorkCenterColumnComponent()
};
