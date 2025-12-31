/**
 * Speedrun Timer API Client
 * Communicates with the timer server at localhost:5010
 */

class TimerAPIClient {
  constructor(baseUrl = 'https://localhost:5010') {
    this.baseUrl = baseUrl;
    console.log('[TimerAPIClient] Initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Send a command to the timer API
   * @param {number} timerId - Timer ID (1 or 2)
   * @param {number} commandType - Command type (0: Resume, 1: Pause, 2: Reset, 3: StartBoth)
   */
  async sendCommand(timerId, commandType) {
    const url = `${this.baseUrl}/api/timer`;
    const payload = {
      Id: timerId,
      Type: commandType
    };

    console.log('[TimerAPIClient] Sending command to:', url);
    console.log('[TimerAPIClient] Payload:', payload);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('[TimerAPIClient] Response status:', response.status);
      console.log('[TimerAPIClient] Response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('[TimerAPIClient] Server error:', error);
        throw new Error(error.error || 'Unknown error');
      }

      const result = await response.json();
      console.log('[TimerAPIClient] Success response:', result);
      return result;
    } catch (error) {
      console.error('[TimerAPIClient] Fetch error:', error);
      console.error('[TimerAPIClient] Error type:', error.name);
      console.error('[TimerAPIClient] Error message:', error.message);
      console.error('[TimerAPIClient] Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Start both timers
   */
  async startBoth() {
    return this.sendCommand(1, 3);  // Type: StartBoth
  }

  /**
   * Pause Player 1 timer
   */
  async pause1P() {
    return this.sendCommand(1, 1);  // Type: Pause
  }

  /**
   * Pause Player 2 timer
   */
  async pause2P() {
    return this.sendCommand(2, 1);  // Type: Pause
  }

  /**
   * Reset Player 1 timer
   */
  async reset1P() {
    return this.sendCommand(1, 2);  // Type: Reset
  }

  /**
   * Reset Player 2 timer
   */
  async reset2P() {
    return this.sendCommand(2, 2);  // Type: Reset
  }

  /**
   * Reset both timers
   */
  async resetBoth() {
    await this.reset1P();
    await this.reset2P();
  }

  /**
   * Resume Player 1 timer
   */
  async resume1P() {
    return this.sendCommand(1, 0);  // Type: Resume
  }

  /**
   * Resume Player 2 timer
   */
  async resume2P() {
    return this.sendCommand(2, 0);  // Type: Resume
  }

  /**
   * Show oldest unshown donation
   */
  async showOldestDonation() {
    const url = `${this.baseUrl}/api/donation/show_oldest`;

    console.log('[TimerAPIClient] Showing oldest donation:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('[TimerAPIClient] Response status:', response.status);
      console.log('[TimerAPIClient] Response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('[TimerAPIClient] Server error:', error);
        throw new Error(error.error || 'Unknown error');
      }

      const result = await response.json();
      console.log('[TimerAPIClient] Success response:', result);
      return result;
    } catch (error) {
      console.error('[TimerAPIClient] Fetch error:', error);
      console.error('[TimerAPIClient] Error type:', error.name);
      console.error('[TimerAPIClient] Error message:', error.message);
      console.error('[TimerAPIClient] Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Show oldest unshown donation with empty message
   */
  async showOldestDonationEmpty() {
    const url = `${this.baseUrl}/api/donation/show_oldest_empty`;

    console.log('[TimerAPIClient] Showing oldest donation with empty message:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('[TimerAPIClient] Response status:', response.status);
      console.log('[TimerAPIClient] Response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('[TimerAPIClient] Server error:', error);
        throw new Error(error.error || 'Unknown error');
      }

      const result = await response.json();
      console.log('[TimerAPIClient] Success response:', result);
      return result;
    } catch (error) {
      console.error('[TimerAPIClient] Fetch error:', error);
      console.error('[TimerAPIClient] Error type:', error.name);
      console.error('[TimerAPIClient] Error message:', error.message);
      console.error('[TimerAPIClient] Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Set ATEM program input (1-8)
   * @param {number} input - Input number (1-8)
   */
  async setAtemProgram(input) {
    const url = `${this.baseUrl}/api/atem/set_program`;

    console.log('[TimerAPIClient] Setting ATEM program to input:', input);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input)
      });

      console.log('[TimerAPIClient] Response status:', response.status);
      console.log('[TimerAPIClient] Response ok:', response.ok);

      // Get response text first to handle both success and error cases
      const text = await response.text();
      console.log('[TimerAPIClient] Response text:', text);

      if (!response.ok) {
        // Try to parse error response, but handle empty responses
        try {
          if (text && text.trim() !== '') {
            const error = JSON.parse(text);
            console.error('[TimerAPIClient] Server error:', error);
            throw new Error(error.error || `HTTP ${response.status}`);
          } else {
            console.error('[TimerAPIClient] Server error with empty response');
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (parseError) {
          console.error('[TimerAPIClient] Failed to parse error response:', parseError.message);
          throw new Error(`HTTP ${response.status}`);
        }
      }

      // Success response handling
      // If response is empty or not JSON, return success object
      if (!text || text.trim() === '') {
        console.log('[TimerAPIClient] Empty response, assuming success');
        return { success: true };
      }

      // Try to parse JSON
      try {
        const result = JSON.parse(text);
        console.log('[TimerAPIClient] Success response:', result);
        return result;
      } catch (parseError) {
        console.warn('[TimerAPIClient] Failed to parse JSON, assuming success:', parseError.message);
        return { success: true };
      }
    } catch (error) {
      console.error('[TimerAPIClient] Fetch error:', error);
      console.error('[TimerAPIClient] Error type:', error.name);
      console.error('[TimerAPIClient] Error message:', error.message);
      console.error('[TimerAPIClient] Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Convenience methods for each ATEM input
   */
  async setAtemInput1() { return this.setAtemProgram(1); }
  async setAtemInput2() { return this.setAtemProgram(2); }
  async setAtemInput3() { return this.setAtemProgram(3); }
  async setAtemInput4() { return this.setAtemProgram(4); }
  async setAtemInput5() { return this.setAtemProgram(5); }
  async setAtemInput6() { return this.setAtemProgram(6); }
  async setAtemInput7() { return this.setAtemProgram(7); }
  async setAtemInput8() { return this.setAtemProgram(8); }

  /**
   * OBS Scene Change Commands
   * @param {string} command - Scene change command (ToGame, ToMain, ToCamera, Refresh)
   */
  async obsSceneChange(command) {
    const url = `${this.baseUrl}/api/obs`;

    console.log('[TimerAPIClient] OBS scene change:', command);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command)
      });

      console.log('[TimerAPIClient] Response status:', response.status);
      console.log('[TimerAPIClient] Response ok:', response.ok);

      // Get response text first to handle both success and error cases
      const text = await response.text();
      console.log('[TimerAPIClient] Response text:', text);

      if (!response.ok) {
        // Try to parse error response, but handle empty responses
        try {
          if (text && text.trim() !== '') {
            const error = JSON.parse(text);
            console.error('[TimerAPIClient] Server error:', error);
            throw new Error(error.error || `HTTP ${response.status}`);
          } else {
            console.error('[TimerAPIClient] Server error with empty response');
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (parseError) {
          console.error('[TimerAPIClient] Failed to parse error response:', parseError.message);
          throw new Error(`HTTP ${response.status}`);
        }
      }

      // Success response handling
      // If response is empty or not JSON, return success object
      if (!text || text.trim() === '') {
        console.log('[TimerAPIClient] Empty response, assuming success');
        return { success: true };
      }

      // Try to parse JSON
      try {
        const result = JSON.parse(text);
        console.log('[TimerAPIClient] Success response:', result);
        return result;
      } catch (parseError) {
        console.warn('[TimerAPIClient] Failed to parse JSON, assuming success:', parseError.message);
        return { success: true };
      }
    } catch (error) {
      console.error('[TimerAPIClient] Fetch error:', error);
      console.error('[TimerAPIClient] Error type:', error.name);
      console.error('[TimerAPIClient] Error message:', error.message);
      console.error('[TimerAPIClient] Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Convenience methods for OBS scene changes
   */
  async obsToGame() { return this.obsSceneChange('ToGame'); }
  async obsToMain() { return this.obsSceneChange('ToMain'); }
  async obsToCamera() { return this.obsSceneChange('ToCamera'); }
  async obsRefresh() { return this.obsSceneChange('Refresh'); }
}
