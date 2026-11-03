// Audio notification completely removed as requested
// All buzzer alarms, voice alerts, and sounds are permanently disabled and silenced.

if (typeof window !== 'undefined') {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {}
}

class OrderAlarmSynthesizer {
  public playVoiceAlert(_text: string) {
    // Permanently disabled
  }

  public start(_orderId?: string, _tableNumber?: number | string) {
    // Permanently disabled
  }

  public stopOrder(_orderId?: string) {
    this.stop();
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

// Single no-op for success sound to guarantee 100% silence
export function playPhonePeSuccessSound() {
  // Sound completely removed - visual confirmation pulse is used instead
}

export const orderAlarm = new OrderAlarmSynthesizer();
