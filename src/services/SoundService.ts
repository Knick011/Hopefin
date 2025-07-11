import AsyncStorage from '@react-native-async-storage/async-storage';
import SoundPlayer from 'react-native-sound-player';
import { Platform } from 'react-native';

const SOUNDS_ENABLED_KEY = 'brainbites_sounds_enabled';

const soundFiles = {
  menuMusic: 'menu_music',
  buttonPress: 'button_press',
  correctAnswer: 'correct_answer',
  wrongAnswer: 'wrong_answer',
  achievement: 'achievement',
  levelUp: 'level_up',
  quizMusic: 'quiz_music',
  timeBonus: 'time_bonus',
};

let menuMusicLooping = false;
let quizMusicLooping = false;

const getFileType = () => 'mp3'; // All your files are mp3

const SoundService = {
  async isSoundsEnabled() {
    const value = await AsyncStorage.getItem(SOUNDS_ENABLED_KEY);
    return value !== 'false'; // default to true
  },

  async setSoundsEnabled(enabled: boolean) {
    await AsyncStorage.setItem(SOUNDS_ENABLED_KEY, enabled ? 'true' : 'false');
  },

  async initialize() {
    // No preloading needed for react-native-sound-player
    menuMusicLooping = false;
    quizMusicLooping = false;
  },

  async playMenuMusic() {
    if (!(await this.isSoundsEnabled())) return;
    try {
      SoundPlayer.stop();
      SoundPlayer.playSoundFile(soundFiles.menuMusic, getFileType());
      menuMusicLooping = true;
      SoundPlayer.setNumberOfLoops(-1); // Loop indefinitely
    } catch (e) {
      console.log('Failed to play menu music', e);
    }
  },

  stopMusic() {
    try {
      SoundPlayer.stop();
      menuMusicLooping = false;
      quizMusicLooping = false;
    } catch (e) {
      console.log('Failed to stop music', e);
    }
  },

  async playButtonPress() {
    if (!(await this.isSoundsEnabled())) return;
    try {
      SoundPlayer.playSoundFile(soundFiles.buttonPress, getFileType());
    } catch (e) {
      console.log('Failed to play button press sound', e);
    }
  },

  async playCorrectAnswer() {
    if (!(await this.isSoundsEnabled())) return;
    try {
      SoundPlayer.playSoundFile(soundFiles.correctAnswer, getFileType());
    } catch (e) {
      console.log('Failed to play correct answer sound', e);
    }
  },

  async playWrongAnswer() {
    if (!(await this.isSoundsEnabled())) return;
    try {
      SoundPlayer.playSoundFile(soundFiles.wrongAnswer, getFileType());
    } catch (e) {
      console.log('Failed to play wrong answer sound', e);
    }
  },

  async playAchievement() {
    if (!(await this.isSoundsEnabled())) return;
    try {
      SoundPlayer.playSoundFile(soundFiles.achievement, getFileType());
    } catch (e) {
      console.log('Failed to play achievement sound', e);
    }
  },

  async playLevelUp() {
    if (!(await this.isSoundsEnabled())) return;
    try {
      SoundPlayer.playSoundFile(soundFiles.levelUp, getFileType());
    } catch (e) {
      console.log('Failed to play level up sound', e);
    }
  },

  async playTimeBonus() {
    if (!(await this.isSoundsEnabled())) return;
    try {
      SoundPlayer.playSoundFile(soundFiles.timeBonus, getFileType());
    } catch (e) {
      console.log('Failed to play time bonus sound', e);
    }
  },
};

export default SoundService;