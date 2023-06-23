//api接口的出口
import project from './project/project.js';
import app from './app/app.js';
import status from './app/status.js';
import attr from './app/attr.js';
import projecttemplate from './projecttemplate/projecttemplate.js';
import issue from './issue/issue.js';
import issueaudit from './issue/issueaudit.js';
import priority from './issue/priority.js';
import catalog from './issue/catalog.js';
import tag from './tag/tag.js';
import iteration from './iteration/iteration.js';
import webhook from './app/webhook.js';

export default {
  project,
  app,
  status,
  attr,
  projecttemplate,
  issue,
  issueaudit,
  priority,
  catalog,
  tag,
  iteration,
  webhook
};
