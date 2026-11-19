// TARS journal card: shows the TARS Journal (and Forgotten Memories archive) to-do lists as tables.
// Add as a dashboard resource: Settings > Dashboards > ⋮ > Resources > /local/tars-journal-card.js (JavaScript module)
class TarsJournalCard extends HTMLElement {
  setConfig(config) {
    this.config = Object.assign({ entity: 'todo.tars_journal', title: '', max: 60 }, config);
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
  }
  set hass(hass) {
    this._hass = hass;
    const st = hass.states[this.config.entity];
    const key = st ? st.state + '|' + st.last_updated : 'none';
    if (key !== this._key) { this._key = key; this._load(); }
  }
  async _load() {
    if (!this._hass) return;
    let items = [];
    try {
      const r = await this._hass.callWS({ type: 'todo/item/list', entity_id: this.config.entity });
      items = (r.items || []).filter(i => i.status === 'needs_action');
    } catch (e) { items = null; }
    this._render(items);
  }
  _esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  _render(items) {
    if (this.config.mode === 'list') {
      const lr = (items || []).slice(-this.config.max).reverse().map(i => { const s = String(i.summary || ''); const m = s.match(/^(\d{4}-\d{2}-\d{2}) (.*?): (.*)$/); return m ? `<tr><td class="t">${this._esc(m[1])}</td><td>${this._esc(m[2])}</td><td>${this._esc(m[3])}</td></tr>` : `<tr><td></td><td></td><td>${this._esc(s)}</td></tr>`; }).join('');
      const lb = items === null ? '<div class="empty">Could not load the list.</div>' : (lr ? `<div class="wrap"><table><thead><tr><th>Date</th><th>What happened</th><th>Memory</th></tr></thead><tbody>${lr}</tbody></table></div>` : '<div class="empty">Nothing forgotten yet.</div>');
      this._paint(lb); return;
    }
    const rows = (items || []).slice(-this.config.max).reverse().map(i => {
      const p = String(i.summary || '').split(' | ');
      const time = p[0] || '';
      const heard = (p[1] || '').replace(/^Heard:\s*/, '');
      const said = p.slice(2).join(' | ').replace(/^TARS said:\s*/, '');
      return `<tr><td class="t">${this._esc(time)}</td><td>${this._esc(heard)}</td><td>${this._esc(said)}</td></tr>`;
    }).join('');
    const body = items === null ? '<div class="empty">Could not load the journal.</div>'
      : (rows ? `<div class="wrap"><table><thead><tr><th>When</th><th>Someone said</th><th>TARS replied</th></tr></thead><tbody>${rows}</tbody></table></div>`
              : '<div class="empty">No conversations since the last study session.</div>');
    this._paint(body);
  }
  _paint(body) {
    this.shadowRoot.innerHTML = `<style>
      ha-card{padding:12px 14px}
      .title{font-weight:500;margin-bottom:8px}
      .wrap{max-height:${this.config.max_height || '420px'};overflow:auto}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{position:sticky;top:0;background:var(--card-background-color);text-align:left;font-weight:600;padding:6px 6px;border-bottom:1px solid var(--divider-color);color:var(--secondary-text-color)}
      td{vertical-align:top;padding:6px;border-bottom:1px solid var(--divider-color)}
      td.t{white-space:nowrap;color:var(--secondary-text-color)}
      .empty{color:var(--secondary-text-color);padding:6px 0}
    </style><ha-card>${this.config.title ? `<div class="title">${this._esc(this.config.title)}</div>` : ''}${body}</ha-card>`;
  }
  getCardSize() { return 6; }
  getGridOptions() { return { columns: 12, rows: 6 }; }
}
customElements.define('tars-journal-card', TarsJournalCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'tars-journal-card', name: 'TARS journal', description: 'Conversation journal table with column headers' });
