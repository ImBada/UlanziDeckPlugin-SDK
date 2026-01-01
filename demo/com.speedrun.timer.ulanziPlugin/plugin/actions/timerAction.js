/**
 * Timer Action Handler
 * Manages individual timer button actions
 */

class TimerAction {
  constructor(context, actionUUID, apiClient) {
    this.context = context;
    this.actionUUID = actionUUID;
    this.apiClient = apiClient;
  }

  /**
   * Execute the timer action based on UUID
   */
  async execute() {
    console.log('[TimerAction] Executing action:', this.actionUUID);
    console.log('[TimerAction] Context:', this.context);

    try {
      let result;

      switch (this.actionUUID) {
        case 'com.speedrun.timer.start':
          console.log('[TimerAction] Calling startBoth()...');
          result = await this.apiClient.startBoth();
          console.log('[TimerAction] startBoth() result:', result);
          this.showSuccess('Timers Started');
          break;

        case 'com.speedrun.timer.pause1p':
          console.log('[TimerAction] Calling pause1P()...');
          result = await this.apiClient.pause1P();
          console.log('[TimerAction] pause1P() result:', result);
          this.showSuccess('1P Paused');
          break;

        case 'com.speedrun.timer.pause2p':
          console.log('[TimerAction] Calling pause2P()...');
          result = await this.apiClient.pause2P();
          console.log('[TimerAction] pause2P() result:', result);
          this.showSuccess('2P Paused');
          break;

        case 'com.speedrun.timer.reset':
          console.log('[TimerAction] Calling resetBoth()...');
          result = await this.apiClient.resetBoth();
          console.log('[TimerAction] resetBoth() result:', result);
          this.showSuccess('Timers Reset');
          break;

        case 'com.speedrun.timer.donation':
          console.log('[TimerAction] Calling showOldestDonation()...');
          result = await this.apiClient.showOldestDonation();
          console.log('[TimerAction] showOldestDonation() result:', result);
          if (result.donation) {
            this.showSuccess('Donation Shown');
          } else {
            this.showSuccess('No Donations');
          }
          break;

        case 'com.speedrun.timer.donation_empty':
          console.log('[TimerAction] Calling showOldestDonationEmpty()...');
          result = await this.apiClient.showOldestDonationEmpty();
          console.log('[TimerAction] showOldestDonationEmpty() result:', result);
          if (result.donation) {
            this.showSuccess('Empty Donation Shown');
          } else {
            this.showSuccess('No Donations');
          }
          break;

        case 'com.speedrun.timer.atem_input_1':
          console.log('[TimerAction] Calling setAtemInput1()...');
          result = await this.apiClient.setAtemInput1();
          console.log('[TimerAction] setAtemInput1() result:', result);
          this.showSuccess('ATEM Input 1 Set');
          break;

        case 'com.speedrun.timer.atem_input_2':
          console.log('[TimerAction] Calling setAtemInput2()...');
          result = await this.apiClient.setAtemInput2();
          console.log('[TimerAction] setAtemInput2() result:', result);
          this.showSuccess('ATEM Input 2 Set');
          break;

        case 'com.speedrun.timer.atem_input_3':
          console.log('[TimerAction] Calling setAtemInput3()...');
          result = await this.apiClient.setAtemInput3();
          console.log('[TimerAction] setAtemInput3() result:', result);
          this.showSuccess('ATEM Input 3 Set');
          break;

        case 'com.speedrun.timer.atem_input_4':
          console.log('[TimerAction] Calling setAtemInput4()...');
          result = await this.apiClient.setAtemInput4();
          console.log('[TimerAction] setAtemInput4() result:', result);
          this.showSuccess('ATEM Input 4 Set');
          break;

        case 'com.speedrun.timer.atem_input_5':
          console.log('[TimerAction] Calling setAtemInput5()...');
          result = await this.apiClient.setAtemInput5();
          console.log('[TimerAction] setAtemInput5() result:', result);
          this.showSuccess('ATEM Input 5 Set');
          break;

        case 'com.speedrun.timer.atem_input_6':
          console.log('[TimerAction] Calling setAtemInput6()...');
          result = await this.apiClient.setAtemInput6();
          console.log('[TimerAction] setAtemInput6() result:', result);
          this.showSuccess('ATEM Input 6 Set');
          break;

        case 'com.speedrun.timer.atem_input_7':
          console.log('[TimerAction] Calling setAtemInput7()...');
          result = await this.apiClient.setAtemInput7();
          console.log('[TimerAction] setAtemInput7() result:', result);
          this.showSuccess('ATEM Input 7 Set');
          break;

        case 'com.speedrun.timer.atem_input_8':
          console.log('[TimerAction] Calling setAtemInput8()...');
          result = await this.apiClient.setAtemInput8();
          console.log('[TimerAction] setAtemInput8() result:', result);
          this.showSuccess('ATEM Input 8 Set');
          break;

        case 'com.speedrun.timer.obs_togame':
          console.log('[TimerAction] Calling obsToGame()...');
          result = await this.apiClient.obsToGame();
          console.log('[TimerAction] obsToGame() result:', result);
          this.showSuccess('OBS ToGame');
          break;

        case 'com.speedrun.timer.obs_tomain':
          console.log('[TimerAction] Calling obsToMain()...');
          result = await this.apiClient.obsToMain();
          console.log('[TimerAction] obsToMain() result:', result);
          this.showSuccess('OBS ToMain');
          break;

        case 'com.speedrun.timer.obs_tocamera':
          console.log('[TimerAction] Calling obsToCamera()...');
          result = await this.apiClient.obsToCamera();
          console.log('[TimerAction] obsToCamera() result:', result);
          this.showSuccess('OBS ToCamera');
          break;

        case 'com.speedrun.timer.obs_refresh':
          console.log('[TimerAction] Calling obsRefresh()...');
          result = await this.apiClient.obsRefresh();
          console.log('[TimerAction] obsRefresh() result:', result);
          this.showSuccess('OBS Refresh');
          break;

        default:
          console.error('[TimerAction] Unknown action UUID:', this.actionUUID);
          this.showError('Unknown Action');
      }

      console.log('[TimerAction] Action completed successfully');
    } catch (error) {
      console.error('[TimerAction] Error executing action:', error);
      console.error('[TimerAction] Error stack:', error.stack);
      this.showError('API Error');
    }
  }

  /**
   * Show success feedback on the button
   */
  showSuccess(message) {
    console.log('[SUCCESS]', message);

    // Change button to success state (state 1) for all buttons
    $UD.setStateIcon(this.context, 1);

    // Reset to normal state after 1 second
    setTimeout(() => {
      $UD.setStateIcon(this.context, 0);
    }, 1000);
  }

  /**
   * Show error feedback on the button
   */
  showError(message) {
    console.error('[ERROR]', message);

    // Show error toast notification
    $UD.showAlert(this.context, message);

    // Keep button in normal state (state 0) on error
    $UD.setStateIcon(this.context, 0);
  }
}
