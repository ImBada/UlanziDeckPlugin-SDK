/**
 * Timer Display Title Action Handler
 * Displays real-time timer data using Title text updates (no canvas rendering)
 * Optimized for static black background with text overlay
 */

class TimerDisplayTitleAction {
  constructor(context, actionUUID, signalRClient) {
    this.context = context;
    this.actionUUID = actionUUID;
    this.signalRClient = signalRClient;
    this.unsubscribe = null;
    this.animationFrameId = null;
    this.currentStopwatch = null;
    this.isRunning = false;
    this.lastTimeString = null; // Cache for optimization

    // Determine which timer this action displays
    this.timerId = this.getTimerId(actionUUID);

    // Initialize instance counter if not exists
    if (typeof TimerDisplayTitleAction.instanceCount === 'undefined') {
      TimerDisplayTitleAction.instanceCount = 0;
    }

    // Staggering: Assign unique offset per instance
    this.instanceId = TimerDisplayTitleAction.instanceCount++;
    this.updateOffset = this.instanceId * 40; // 0ms, 40ms, 80ms, 120ms, 160ms, etc.

    // Set static black background (one time setup)
    this.setStaticBackground();

    // Subscribe to timer updates
    this.subscribeToTimer();
  }

  /**
   * Get timer ID from action UUID
   */
  getTimerId(actionUUID) {
    if (actionUUID.includes('title1')) {
      return 1;
    } else if (actionUUID.includes('title2')) {
      return 2;
    }
    return 1; // Default to timer 1
  }

  /**
   * Set static black background for the button
   * This is called once during initialization
   */
  setStaticBackground() {
    // Create a simple black 72x72 canvas
    const canvas = document.createElement('canvas');
    canvas.width = 72;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');

    // Fill with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 72, 72);

    // Convert to base64 and set as button background
    const imageData = canvas.toDataURL('image/png').split(',')[1];
    $UD.setBaseDataIcon(this.context, imageData);
  }

  /**
   * Subscribe to timer updates from SignalR
   */
  subscribeToTimer() {
    this.unsubscribe = this.signalRClient.subscribe(this.timerId, (stopwatch) => {
      this.handleTimerUpdate(stopwatch);
    });
  }

  /**
   * Handle timer update
   */
  handleTimerUpdate(stopwatch) {
    this.currentStopwatch = stopwatch;

    if (stopwatch.status === 0) {
      // Running - start animation loop if not already running
      if (!this.isRunning) {
        this.isRunning = true;
        // Apply staggering offset on initial start
        setTimeout(() => this.startAnimationLoop(), this.updateOffset);
      }
    } else {
      // Paused or Reset - stop animation and update once
      this.isRunning = false;
      if (this.animationFrameId) {
        clearTimeout(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.updateDisplay();
    }
  }

  /**
   * Start animation loop using setTimeout
   * Update interval: 100ms (~10fps) for smoother display updates
   */
  startAnimationLoop() {
    if (!this.isRunning) {
      return;
    }

    try {
      this.updateDisplay();
    } catch (error) {
      console.error('[TimerDisplayTitleAction] Error in updateDisplay:', error);
    }

    // 100ms interval = ~10fps (balanced smoothness and performance)
    this.animationFrameId = setTimeout(() => this.startAnimationLoop(), 100);
  }

  /**
   * Update button display with current time using Title
   * Optimized to skip rendering if time hasn't changed
   */
  updateDisplay() {
    if (!this.currentStopwatch) {
      return;
    }

    const elapsed = this.signalRClient.calculateElapsedTime(this.currentStopwatch);
    const timeString = this.signalRClient.formatTime(elapsed);

    // Skip update if time string hasn't changed (optimization)
    if (timeString === this.lastTimeString) {
      return;
    }
    this.lastTimeString = timeString;

    // Format time for better readability on small screen
    // Split into two lines: HH:MM:SS and .mmm
    const timeParts = timeString.split('.');
    const mainTime = timeParts[0];  // HH:MM:SS
    const millis = timeParts[1];    // mmm

    // Combine with newline for multi-line display
    const displayText = `${mainTime}\n.${millis}`;

    // Update button title (text overlay on black background)
    $UD.setTitle(this.context, displayText);
  }

  /**
   * Clean up when action is removed
   */
  destroy() {
    // Stop animation
    this.isRunning = false;

    // Clear timeout
    if (this.animationFrameId) {
      clearTimeout(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Unsubscribe from timer updates
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
