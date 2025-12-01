/**
 * Speedrun Timer Plugin - Main Application
 * Controls speedrun event timers via localhost:5010 API (lightweight control buttons)
 * Note: Timer displays are now in a separate plugin for better performance
 */

const STORAGE_KEY = 'speedrun-timer-server-url';
const DEFAULT_URL = 'https://localhost:5010';

// Load server URL from localStorage (global setting)
function loadServerUrl() {
  const savedUrl = localStorage.getItem(STORAGE_KEY);
  return savedUrl || DEFAULT_URL;
}

// Initialize the Timer API Client with saved URL
const timerAPI = new TimerAPIClient(loadServerUrl());

// Cache for action instances
const ACTION_CACHES = {};

// Connect to UlanziDeck
$UD.connect('com.speedrun.timer');

$UD.onConnected(async conn => {
  console.log('Speedrun Timer Control Plugin Connected');
  console.log('[Control] Server URL:', timerAPI.baseUrl);
});

/**
 * When an action is added to a button
 */
$UD.onAdd(jsn => {
  const context = jsn.context;
  const actionUUID = jsn.uuid;

  console.log('[Control] Action added:', actionUUID, 'Context:', context);

  // Create new TimerAction instance if it doesn't exist
  if (!ACTION_CACHES[context]) {
    ACTION_CACHES[context] = new TimerAction(context, actionUUID, timerAPI);
    console.log('[Control] Created new TimerAction instance');
  } else {
    console.log('[Control] Action instance already exists');
  }
});

/**
 * When a button is pressed
 */
$UD.onRun(jsn => {
  console.log('[Control] Button pressed:', jsn);
  const context = jsn.context;

  // Get existing action instance (must be created in onAdd)
  let instance = ACTION_CACHES[context];

  if (!instance) {
    console.error('[Control] No action instance found for context:', context);
    console.error('[Control] Available contexts:', Object.keys(ACTION_CACHES));
    return;
  }

  console.log('[Control] Executing action...');
  instance.execute();
});

/**
 * When an action is removed from a button
 */
$UD.onClear(jsn => {
  if (jsn.param) {
    for (let i = 0; i < jsn.param.length; i++) {
      const context = jsn.param[i].context;
      delete ACTION_CACHES[context];
      console.log('[Control] Action cleared:', context);
    }
  }
});

/**
 * Handle settings updates from the Settings button
 */
$UD.onParamFromPlugin(jsn => {
  const settings = jsn.param || {};

  console.log('[Control] Settings notification received:', settings);

  // Reload server URL from localStorage (global setting)
  const newUrl = loadServerUrl();
  timerAPI.baseUrl = newUrl;

  console.log('[Control] Server URL updated to:', timerAPI.baseUrl);
});

console.log('Speedrun Timer Control Plugin Initialized');
