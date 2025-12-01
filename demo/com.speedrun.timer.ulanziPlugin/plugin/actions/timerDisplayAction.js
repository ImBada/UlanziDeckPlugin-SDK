/**
 * Timer Display Action Handler
 * Displays real-time timer data received via WebSocket
 * Optimized for multiple simultaneous displays
 */

// Global instance counter for staggering
TimerDisplayAction.instanceCount = 0;

class TimerDisplayAction {
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

    // Staggering: Assign unique offset per instance (not per timer ID)
    // This ensures multiple displays of the same timer are also staggered
    this.instanceId = TimerDisplayAction.instanceCount++;
    this.updateOffset = this.instanceId * 25; // 0ms, 25ms, 50ms, 75ms, etc.

    // Create and reuse canvas for better performance
    this.canvas = document.createElement('canvas');
    this.canvas.width = 72;
    this.canvas.height = 72;
    this.ctx = this.canvas.getContext('2d');

    // Pre-set text properties that don't change
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Subscribe to timer updates
    this.subscribeToTimer();
  }

  /**
   * Get timer ID from action UUID
   */
  getTimerId(actionUUID) {
    if (actionUUID.includes('display1')) {
      return 1;
    } else if (actionUUID.includes('display2')) {
      return 2;
    }
    return 1; // Default to timer 1
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
   * Update interval: 100ms (~10fps) for better performance with multiple displays
   */
  startAnimationLoop() {
    if (!this.isRunning) {
      return;
    }

    try {
      this.updateDisplay();
    } catch (error) {
      console.error('[TimerDisplayAction] Error in updateDisplay:', error);
    }

    // 100ms interval = ~10fps (optimized for multiple displays)
    this.animationFrameId = setTimeout(() => this.startAnimationLoop(), 100);
  }

  /**
   * Update button display with current time
   * Optimized to skip rendering if time hasn't changed
   */
  updateDisplay() {
    if (!this.currentStopwatch) {
      return;
    }

    const elapsed = this.signalRClient.calculateElapsedTime(this.currentStopwatch);
    const timeString = this.signalRClient.formatTime(elapsed);

    // Skip rendering if time string hasn't changed (optimization)
    if (timeString === this.lastTimeString) {
      return;
    }
    this.lastTimeString = timeString;

    // Clear canvas (reuse existing canvas for better performance)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, 72, 72);

    // Split time string to fit on button
    const timeParts = timeString.split('.');
    const mainTime = timeParts[0];  // HH:MM:SS
    const millis = timeParts[1];    // mmm

    // Determine color based on timer status
    let mainColor, millisColor;
    if (this.currentStopwatch.status === 2) {
      // Reset - Yellow
      mainColor = '#FFFF00';
      millisColor = '#CCCC00';
    } else if (this.currentStopwatch.status === 0) {
      // Running - White
      mainColor = '#FFFFFF';
      millisColor = '#CCCCCC';
    } else if (this.currentStopwatch.status === 1) {
      // Paused - Red
      mainColor = '#FF0000';
      millisColor = '#CC0000';
    }

    // Main time - larger and with stroke
    this.ctx.font = 'bold 13px monospace';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(mainTime, 36, 30);
    this.ctx.fillStyle = mainColor;
    this.ctx.fillText(mainTime, 36, 30);

    // Milliseconds - smaller
    this.ctx.font = 'bold 10px monospace';
    this.ctx.lineWidth = 2;
    this.ctx.strokeText('.' + millis, 36, 48);
    this.ctx.fillStyle = millisColor;
    this.ctx.fillText('.' + millis, 36, 48);

    // Convert canvas to base64
    const imageData = this.canvas.toDataURL('image/png').split(',')[1];

    // Update button with rendered image
    $UD.setBaseDataIcon(this.context, imageData);
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

    // Clean up canvas
    this.canvas = null;
    this.ctx = null;
  }
}
