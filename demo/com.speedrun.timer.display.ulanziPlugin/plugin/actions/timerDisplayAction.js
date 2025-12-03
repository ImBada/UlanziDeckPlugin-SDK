/**
 * Timer Display Action Handler
 * Displays real-time timer data received via WebSocket
 * Optimized for multiple simultaneous displays
 */

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

    // Initialize instance counter if not exists
    if (typeof TimerDisplayAction.instanceCount === 'undefined') {
      TimerDisplayAction.instanceCount = 0;
    }

    // Staggering: Assign unique offset per instance (not per timer ID)
    // This ensures multiple displays of the same timer are also staggered
    this.instanceId = TimerDisplayAction.instanceCount++;
    this.updateOffset = this.instanceId * 40; // 0, 40, 80, 120, 160, etc.

    // Create and reuse canvas for better performance
    this.canvas = document.createElement('canvas');
    this.canvas.width = 72;
    this.canvas.height = 72;
    // Optimized context options for better performance
    this.ctx = this.canvas.getContext('2d', {
      alpha: false,        // No transparency needed - 10-20% faster
      desynchronized: true // Async rendering for smoother updates
    });

    // Pre-set text properties that don't change
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Pre-define colors for each status (cache)
    this.colors = {
      reset: { main: '#FFFF00', millis: '#CCCC00' },    // Yellow
      running: { main: '#FFFFFF', millis: '#CCCCCC' },  // White
      paused: { main: '#FF0000', millis: '#CC0000' }    // Red
    };

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
   * Update interval: 1 second for display updates
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

    // 1 second interval for display updates
    this.animationFrameId = setTimeout(() => this.startAnimationLoop(), 1000);
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

    // Get colors from cache based on timer status
    const color = this.currentStopwatch.status === 2 ? this.colors.reset :
                  this.currentStopwatch.status === 0 ? this.colors.running :
                  this.colors.paused;

    // Main time - larger, no stroke for faster rendering
    this.ctx.font = 'bold 14px monospace';
    this.ctx.fillStyle = color.main;
    this.ctx.fillText(mainTime, 36, 30);

    // Milliseconds - smaller, no stroke
    this.ctx.font = 'bold 11px monospace';
    this.ctx.fillStyle = color.millis;
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
