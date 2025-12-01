/**
 * Speedrun Timer Display Plugin - Main Application
 * Displays speedrun event timers via WebSocket (separate process for better performance)
 */

const STORAGE_KEY = 'speedrun-timer-server-url';
const DEFAULT_URL = 'https://localhost:5010';

// Load server URL from localStorage (global setting)
function loadServerUrl() {
  const savedUrl = localStorage.getItem(STORAGE_KEY);
  return savedUrl || DEFAULT_URL;
}

// Initialize SignalR Client for WebSocket connection (displays only need WebSocket)
const signalRClient = new SignalRClient(loadServerUrl());

// Cache for action instances
const ACTION_CACHES = {};

// Connect to UlanziDeck
$UD.connect('com.speedrun.timer.display');

$UD.onConnected(async conn => {
  console.log('Speedrun Timer Display Plugin Connected');
  console.log('[Display] Server URL:', loadServerUrl());

  // Connect to SignalR for real-time timer updates
  try {
    await signalRClient.connect();
    console.log('[Display] SignalR connected');
  } catch (error) {
    console.error('[Display] SignalR connection failed:', error);
  }
});

/**
 * When an action is added to a button
 */
$UD.onAdd(jsn => {
  const context = jsn.context;
  const actionUUID = jsn.uuid;

  console.log('[Display] Action added:', actionUUID, 'Context:', context);

  // Create new TimerDisplayAction instance if it doesn't exist
  if (!ACTION_CACHES[context]) {
    ACTION_CACHES[context] = new TimerDisplayAction(context, actionUUID, signalRClient);
    console.log('[Display] Created new TimerDisplayAction instance');
  } else {
    console.log('[Display] Action instance already exists');
  }
});

/**
 * When a button is pressed (display actions don't need button press handling)
 * Return false to prevent default button press animation
 */
$UD.onRun(jsn => {
  console.log('[Display] Button pressed - preventing default animation');
  // Try to prevent default D200 button press animation
  return false;
});

/**
 * When an action is removed from a button
 */
$UD.onClear(jsn => {
  if (jsn.param) {
    for (let i = 0; i < jsn.param.length; i++) {
      const context = jsn.param[i].context;
      const instance = ACTION_CACHES[context];

      // Clean up TimerDisplayAction instances
      if (instance && instance.destroy) {
        instance.destroy();
      }

      delete ACTION_CACHES[context];
      console.log('[Display] Action cleared:', context);
    }
  }
});

/**
 * Handle settings updates from the Settings button
 */
$UD.onParamFromPlugin(jsn => {
  const settings = jsn.param || {};

  console.log('[Display] Settings notification received:', settings);

  // Reload server URL from localStorage (global setting)
  const newUrl = loadServerUrl();
  signalRClient.baseUrl = newUrl;

  console.log('[Display] Server URL updated to:', signalRClient.baseUrl);
});

console.log('Speedrun Timer Display Plugin Initialized');
