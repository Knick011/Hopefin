// src/services/SoundService.ts
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable playback in silence mode
Sound.setCategory('Playback');

interface SoundConfig {
  [key: string]: Sound | null;
}

class SoundService {
  private sounds: SoundConfig = {};
  private musicVolume = 0.3;
  private effectsVolume = 0.6;
  private soundEnabled = true;
  private currentMusic: string | null = null;
  private isInitialized = false;

  async initialize() {
    try {
      // Load sound settings
      const soundSetting = await AsyncStorage.getItem('brainbites_sounds_enabled');
      if (soundSetting !== null) {
        this.soundEnabled = soundSetting === 'true';
      }

      // We'll preload sounds when we have the audio files
      this.isInitialized = true;
      console.log('SoundService initialized successfully');
    } catch (error) {
      console.error('Error initializing SoundService:', error);
    }
  }

  async setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    await AsyncStorage.setItem('brainbites_sounds_enabled', enabled.toString());
    
    if (!enabled && this.currentMusic) {
      this.stopMusic();
    }
  }

  getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    // Update volume for current music if playing
    if (this.currentMusic && this.sounds[this.currentMusic]) {
      this.sounds[this.currentMusic]?.setVolume(this.musicVolume);
    }
  }

  setEffectsVolume(volume: number) {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
  }

  // Sound effect methods (will implement when we have audio files)
  playButtonPress() {
    if (!this.soundEnabled) return;
    // Play button press sound
    console.log('Button press sound');
  }

  playSuccess() {
    if (!this.soundEnabled) return;
    // Play success sound
    console.log('Success sound');
  }

  playError() {
    if (!this.soundEnabled) return;
    // Play error sound
    console.log('Error sound');
  }

  playCorrect() {
    if (!this.soundEnabled) return;
    // Play correct answer sound
    console.log('Correct answer sound');
  }

  playWrong() {
    if (!this.soundEnabled) return;
    // Play wrong answer sound
    console.log('Wrong answer sound');
  }

  playStreak() {
    if (!this.soundEnabled) return;
    // Play streak milestone sound
    console.log('Streak milestone sound');
  }

  playAchievement() {
    if (!this.soundEnabled) return;
    // Play achievement sound
    console.log('Achievement sound');
  }

  playTimeWarning() {
    if (!this.soundEnabled) return;
    // Play time warning sound
    console.log('Time warning sound');
  }

  // Music management
  playMenuMusic() {
    if (!this.soundEnabled) return;
    // Play menu music
    console.log('Playing menu music');
    this.currentMusic = 'menuMusic';
  }

  playQuizMusic() {
    if (!this.soundEnabled) return;
    // Play quiz music
    console.log('Playing quiz music');
    this.currentMusic = 'quizMusic';
  }

  stopMusic() {
    if (this.currentMusic && this.sounds[this.currentMusic]) {
      this.sounds[this.currentMusic]?.stop();
      this.currentMusic = null;
    }
  }

  pauseMusic() {
    if (this.currentMusic && this.sounds[this.currentMusic]) {
      this.sounds[this.currentMusic]?.pause();
    }
  }

  resumeMusic() {
    if (this.currentMusic && this.sounds[this.currentMusic] && this.soundEnabled) {
      this.sounds[this.currentMusic]?.play();
    }
  }

  // Clean up resources
  release() {
    this.stopMusic();
    
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.release();
      }
    });
    
    this.sounds = {};
    this.isInitialized = false;
  }
}

export default new SoundService();