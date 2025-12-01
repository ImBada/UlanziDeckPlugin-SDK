/**
 * Timer Display Action Handler
 * Displays real-time timer data received via WebSocket
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

    // Determine which timer this action displays
    this.timerId = this.getTimerId(actionUUID);

    // Create and reuse canvas for better performance
    this.canvas = document.createElement('canvas');
    this.canvas.width = 72;
    this.canvas.height = 72;
    this.ctx = this.canvas.getContext('2d');

    console.log('[TimerDisplayAction] Created for timer', this.timerId);

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
      console.log('[TimerDisplayAction] Received update for timer', this.timerId, ':', stopwatch);
      this.handleTimerUpdate(stopwatch);
    });
  }

  /**
   * Handle timer update
   */
  handleTimerUpdate(stopwatch) {
    console.log('[TimerDisplayAction] handleTimerUpdate - status:', stopwatch.status, 'isRunning:', this.isRunning);
    this.currentStopwatch = stopwatch;

    if (stopwatch.status === 0) {
      // Running - start animation loop if not already running
      if (!this.isRunning) {
        console.log('[TimerDisplayAction] Starting animation loop');
        this.isRunning = true;
        this.startAnimationLoop();
      } else {
        console.log('[TimerDisplayAction] Animation loop already running');
      }
    } else {
      // Paused or Reset - stop animation and update once
      console.log('[TimerDisplayAction] Stopping animation loop');
      this.isRunning = false;
      if (this.animationFrameId) {
        clearTimeout(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.updateDisplay();
    }
  }

  /**
   * Start animation loop using setTimeout (more compatible than requestAnimationFrame)
   */
  startAnimationLoop() {
    if (!this.isRunning) {
      console.log('[TimerDisplayAction] Animation loop stopped - isRunning is false');
      return;
    }

    console.log('[TimerDisplayAction] Animation frame START - isRunning:', this.isRunning);

    try {
      this.updateDisplay();
      console.log('[TimerDisplayAction] updateDisplay completed successfully');
    } catch (error) {
      console.error('[TimerDisplayAction] Error in updateDisplay:', error);
    }

    // Use setTimeout instead of requestAnimationFrame for better compatibility in plugin environment
    // ~16ms = ~60fps, but we'll use a slightly longer interval for stability
    console.log('[TimerDisplayAction] Scheduling next frame...');
    this.animationFrameId = setTimeout(() => this.startAnimationLoop(), 16);
    console.log('[TimerDisplayAction] Next frame scheduled with ID:', this.animationFrameId);
  }

  /**
   * Update button display with current time
   */
  updateDisplay() {
    if (!this.currentStopwatch) {
      return;
    }

    const elapsed = this.signalRClient.calculateElapsedTime(this.currentStopwatch);
    const timeString = this.signalRClient.formatTime(elapsed);

    console.log('[TimerDisplayAction] Updating display:', timeString);

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

    // Set text properties once
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

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
    console.log('[TimerDisplayAction] Destroying action for timer', this.timerId);

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
