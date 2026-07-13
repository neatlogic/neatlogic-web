function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function protectFreemarkerDirective(html) {
  return html
    .replace(/<#([\s\S]*?)>/g, match => `<span class="report-template-directive">${escapeHtml(match)}</span>`)
    .replace(/<\/#([\s\S]*?)>/g, match => `<span class="report-template-directive">${escapeHtml(match)}</span>`);
}

function renderWidget(token, ruleMap, selectedTokenId) {
  const rule = ruleMap[token.name];
  const preview = rule ? rule.getPreview(token.config || {}, { token }) : {};
  const title = preview.title || (rule && rule.label) || token.name;
  const summary = !token.parsed || !token.hasRule ? '' : $t('term.report.clicktoeditproperty');
  const icon = preview.icon || (rule && rule.icon) || 'tsfont-module';
  const stateClass = selectedTokenId === token.id ? 'is-selected' : '';
  const invalidClass = !token.parsed || !token.hasRule ? 'is-invalid' : '';
  const disabledTip = !token.hasRule ? $t('term.report.unregisteredcomponentrule') : (!token.parsed ? $t('term.report.paramnotjsoneditsource') : '');
  return [
    `<span class="report-widget-placeholder ${stateClass} ${invalidClass}" data-token-id="${escapeHtml(token.id)}">`,
    '<span class="report-widget-main">',
    `<i class="${escapeHtml(icon)} report-widget-icon"></i>`,
    '<span class="report-widget-text">',
    `<span class="report-widget-title">${escapeHtml(title)}</span>`,
    summary ? `<span class="report-widget-summary">${escapeHtml(summary)}</span>` : '',
    disabledTip ? `<span class="report-widget-warning">${escapeHtml(disabledTip)}</span>` : '',
    '</span>',
    '</span>',
    '<span class="report-widget-actions">',
    `<button type="button" data-token-action="up" data-token-id="${escapeHtml(token.id)}">${escapeHtml($t('page.moveup'))}</button>`,
    `<button type="button" data-token-action="down" data-token-id="${escapeHtml(token.id)}">${escapeHtml($t('page.movedown'))}</button>`,
    '</span>',
    '</span>'
  ].join('');
}

export function renderVisualContent(content, tokenList, ruleMap, selectedTokenId) {
  const source = content || '';
  if (!tokenList || tokenList.length === 0) {
    return protectFreemarkerDirective(source);
  }
  let html = '';
  let cursor = 0;
  tokenList.forEach(token => {
    html += protectFreemarkerDirective(source.slice(cursor, token.start));
    html += renderWidget(token, ruleMap, selectedTokenId);
    cursor = token.end;
  });
  html += protectFreemarkerDirective(source.slice(cursor));
  return html;
}
import { $t } from '@/resources/init.js';
