export function renderVerifyPanel() {
  return `
    <div class="card">
      <h4>Validate Artifact</h4>
      <div class="row wrap">
        <input id="standardValidateSchema" placeholder="schema id (e.g. amcpass)" />
        <input id="standardValidateFile" placeholder="file path (.amcpass or json)" />
        <button id="standardValidateBtn">Validate</button>
      </div>
      <pre id="standardValidateOut" class="scroll muted"></pre>
    </div>
  `;
}

