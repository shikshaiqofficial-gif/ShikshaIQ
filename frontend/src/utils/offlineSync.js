// Background Offline Sync Utility for ShikshaIQ
import API from '../api';

class OfflineSyncManager {
  constructor() {
    this.isListening = false;
  }

  init() {
    if (this.isListening) return;
    this.isListening = true;

    window.addEventListener('online', () => {
      console.log('[OfflineSync] Connection restored. Flushing offline queue...');
      this.syncQueuedSubmissions();
    });
  }

  // Save submission locally if network fails
  queueSubmission(endpoint, payload) {
    try {
      const queue = JSON.parse(localStorage.getItem('shikshaiq_offline_queue') || '[]');
      queue.push({ endpoint, payload, timestamp: Date.now() });
      localStorage.setItem('shikshaiq_offline_queue', JSON.stringify(queue));
      console.warn('[OfflineSync] Request queued locally due to network failure.');
    } catch (e) {
      console.error('Failed to queue offline payload:', e);
    }
  }

  // Attempt to flush queued requests when online
  async syncQueuedSubmissions() {
    try {
      const queue = JSON.parse(localStorage.getItem('shikshaiq_offline_queue') || '[]');
      if (queue.length === 0) return;

      const remainingQueue = [];

      for (const item of queue) {
        try {
          await API.post(item.endpoint, item.payload);
          console.log(`[OfflineSync] Successfully synced queued request to ${item.endpoint}`);
        } catch (err) {
          // Keep in queue if still failing
          remainingQueue.push(item);
        }
      }

      localStorage.setItem('shikshaiq_offline_queue', JSON.stringify(remainingQueue));
    } catch (e) {
      console.error('Error processing offline queue:', e);
    }
  }
}

export const offlineSync = new OfflineSyncManager();