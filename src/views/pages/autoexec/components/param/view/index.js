import defaultInput from '../edit/input'; //默认组件
import textHandler from '../edit/text';
import passwordHandler from '../edit/password';
import fileHandler from '../edit/file.vue';
import nodeHandler from './node.vue';
import jsonHandler from '../edit/json.vue';
import dateHandler from '../edit/date.vue';
import datetimeHandler from '../edit/datetime';
import timeHandler from '../edit/time';
import selectHandler from './select';
import multiselectHandler from './select';
import radioHandler from './radio';
import checkboxHandler from './checkbox';
import accountHandler from '../edit/account';
import textareaHandler from '../edit/text'; //text和textarea的校验信息调整一致
import phaseHandler from './phase';
import switchHandler from '../edit/switch.vue';
import filepathHandler from '../edit/filepath.vue'; 
import userselectHandler from './userselect.vue'; 
import runnergroupHandler from '../edit/runnergroup';
export default {
  defaultInput,
  textHandler,
  passwordHandler,
  fileHandler,
  nodeHandler,
  jsonHandler,
  dateHandler,
  datetimeHandler,
  timeHandler,
  selectHandler,
  multiselectHandler,
  radioHandler,
  accountHandler,
  checkboxHandler,
  textareaHandler,
  phaseHandler,
  switchHandler,
  filepathHandler,
  userselectHandler,
  runnergroupHandler
};
