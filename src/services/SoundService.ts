import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';

// Enable playback in silence mode (iOS, safe for Android)
Sound.setCategory('Playback');

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

let menuMusicInstance: Sound | null = null;
let quizMusicInstance: Sound | null = null;

const SoundService = {
  async isSoundsEnabled() {
    const value = await AsyncStorage.getItem(SOUNDS_ENABLED_KEY);
    return value !== 'false'; // default to true
  },

  async setSoundsEnabled(enabled: boolean) {
    await AsyncStorage.setItem(SOUNDS_ENABLED_KEY, enabled ? 'true' : 'false');
  },

  async initialize() {
    // Preload menu and quiz music for Android (from res/raw)
    menuMusicInstance = new Sound(soundFiles.menuMusic, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load menu music', error);
      }
    });
    quizMusicInstance = new Sound(soundFiles.quizMusic, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load quiz music', error);
      }
    });
  },

  async playMenuMusic() {
    if (!(await this.isSoundsEnabled())) return;
    if (menuMusicInstance) {
      menuMusicInstance.setNumberOfLoops(-1);
      menuMusicInstance.play((success) => {
        if (!success) {
          console.log('Failed to play menu music');
        }
      });
    } else {
      menuMusicInstance = new Sound(soundFiles.menuMusic, Sound.MAIN_BUNDLE, (error) => {
        if (!error) {
          menuMusicInstance?.setNumberOfLoops(-1);
          menuMusicInstance?.play();
        }
      });
    }
  },

  stopMusic() {
    menuMusicInstance?.stop();
    quizMusicInstance?.stop();
  },

  async playButtonPress() {
    if (!(await this.isSoundsEnabled())) return;
    const sound = new Sound(soundFiles.buttonPress, Sound.MAIN_BUNDLE, (error) => {
      if (!error) sound.play();
    });
  },

  async playCorrectAnswer() {
    if (!(await this.isSoundsEnabled())) return;
    const sound = new Sound(soundFiles.correctAnswer, Sound.MAIN_BUNDLE, (error) => {
      if (!error) sound.play();
    });
  },

  async playWrongAnswer() {
    if (!(await this.isSoundsEnabled())) return;
    const sound = new Sound(soundFiles.wrongAnswer, Sound.MAIN_BUNDLE, (error) => {
      if (!error) sound.play();
    });
  },

  async playAchievement() {
    if (!(await this.isSoundsEnabled())) return;
    const sound = new Sound(soundFiles.achievement, Sound.MAIN_BUNDLE, (error) => {
      if (!error) sound.play();
    });
  },

  async playLevelUp() {
    if (!(await this.isSoundsEnabled())) return;
    const sound = new Sound(soundFiles.levelUp, Sound.MAIN_BUNDLE, (error) => {
      if (!error) sound.play();
    });
  },

  async playTimeBonus() {
    if (!(await this.isSoundsEnabled())) return;
    const sound = new Sound(soundFiles.timeBonus, Sound.MAIN_BUNDLE, (error) => {
      if (!error) sound.play();
    });
  },
};

export default SoundService;