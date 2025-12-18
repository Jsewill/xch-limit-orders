/**
 * Popup Script
 * Displays status and provides quick controls
 */

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// DOM elements
const statusEl = document.getElementById('status');
const pendingEl = document.getElementById('pending');
const executedEl = document.getElementById('executed');
const spentEl = document.getElementById('spent');
const maxBudgetEl = document.getElementById('max-budget');
const refreshEl = document.getElementById('refresh');
const tabStatusEl = document.getElementById('tab-status');

// Track vault tab ID for click-to-switch functionality
let vaultTabId = null;

/**
 * Update UI with current state
 */
async function updateUI() {
  try {
    // Get state from background
    const state = await browserAPI.runtime.sendMessage({ type: 'GET_STATE' });
    const alarmStatus = await browserAPI.runtime.sendMessage({ type: 'GET_ALARM_STATUS' });

    // Update status
    if (state.buyProcessStarted) {
      statusEl.textContent = 'Buying...';
      statusEl.className = 'value buying';
    } else if (state.isRunning) {
      statusEl.textContent = 'Running';
      statusEl.className = 'value running';
    } else {
      statusEl.textContent = 'Stopped';
      statusEl.className = 'value stopped';
    }

    // Update order counts
    if (state.settings?.orders) {
      const pending = state.settings.orders.filter(o => o.status === 'pending').length;
      const executed = state.settings.orders.filter(o => o.status === 'executed').length;
      pendingEl.textContent = pending;
      executedEl.textContent = executed;
    }

    // Update spent
    spentEl.textContent = `$${(state.totalSpent || 0).toFixed(2)}`;

    // Update max budget
    maxBudgetEl.textContent = `$${(state.settings?.maxBudget || 0).toFixed(2)}`;

    // Update refresh countdown
    if (alarmStatus.scheduled && alarmStatus.remainingMinutes !== null) {
      const mins = alarmStatus.remainingMinutes;
      if (mins <= 0) {
        refreshEl.textContent = 'Soon...';
      } else if (mins === 1) {
        refreshEl.textContent = '1 min';
      } else {
        refreshEl.textContent = `${mins} mins`;
      }
    } else {
      refreshEl.textContent = '--';
    }

    // Check for vault tab
    await updateTabStatus();

  } catch (e) {
    console.error('[Popup] Error updating UI:', e);
    statusEl.textContent = 'Error';
    statusEl.className = 'value stopped';
  }
}

/**
 * Check if vault tab is open
 */
async function updateTabStatus() {
  try {
    const tabs = await browserAPI.tabs.query({
      url: 'https://vault.chia.net/buy-xch*'
    });

    if (tabs.length > 0) {
      vaultTabId = tabs[0].id;
      tabStatusEl.textContent = 'Go Vault Tab';
      tabStatusEl.className = 'tab-status active clickable';
    } else {
      vaultTabId = null;
      tabStatusEl.textContent = 'No vault tab';
      tabStatusEl.className = 'tab-status';
    }
  } catch (e) {
    console.error('[Popup] Error checking tabs:', e);
  }
}

// Click tab status to switch to vault tab
tabStatusEl.addEventListener('click', async () => {
  if (vaultTabId) {
    try {
      // Activate the tab
      await browserAPI.tabs.update(vaultTabId, { active: true });
      // Focus the window containing the tab
      const tab = await browserAPI.tabs.get(vaultTabId);
      await browserAPI.windows.update(tab.windowId, { focused: true });
    } catch (e) {
      console.error('[Popup] Error switching to tab:', e);
    }
  }
});

// Initial load
updateUI();

// Refresh every 5 seconds while popup is open
setInterval(updateUI, 5000);
