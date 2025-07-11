const fs = require('fs');
const path = require('path');

// Create directory structure
const dirs = [
  'src/assets',
  'src/assets/images',
  'src/assets/sounds',
  'src/assets/data',
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create placeholder image files (1x1 transparent PNG)
const placeholderPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const imageFiles = [
  'mascot_happy.png',
  'mascot_excited.png',
  'mascot_thoughtful.png',
  'mascot_encouraging.png',
  'mascot_celebration.png',
  'mascot_sad.png',
  'mascot_peeking.png',
];

imageFiles.forEach(filename => {
  const filePath = path.join(__dirname, '..', 'src/assets/images', filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, placeholderPNG);
    console.log(`Created placeholder image: ${filename}`);
  }
});

// Create silent MP3 files (minimal valid MP3)
const silentMP3 = Buffer.from(
  '//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAABAAABAADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'base64'
);

const soundFiles = [
  'button_press.mp3',
  'correct_answer.mp3',
  'wrong_answer.mp3',
  'level_up.mp3',
  'achievement.mp3',
  'time_bonus.mp3',
  'menu_music.mp3',
  'quiz_music.mp3',
];

soundFiles.forEach(filename => {
  const filePath = path.join(__dirname, '..', 'src/assets/sounds', filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, silentMP3);
    console.log(`Created placeholder sound: ${filename}`);
  }
});

// Create sample questions data
const sampleQuestions = {
  questions: [
    {
      id: 1,
      category: 'funfacts',
      question: 'What is the only mammal that can fly?',
      optionA: 'Flying squirrel',
      optionB: 'Bat',
      optionC: 'Sugar glider',
      optionD: 'Flying lemur',
      correctAnswer: 'B',
      explanation: 'Bats are the only mammals capable of true flight.',
      level: 'easy'
    },
    {
      id: 2,
      category: 'science',
      question: 'What is the chemical symbol for water?',
      optionA: 'H2O',
      optionB: 'CO2',
      optionC: 'O2',
      optionD: 'NaCl',
      correctAnswer: 'A',
      explanation: 'Water is composed of two hydrogen atoms and one oxygen atom.',
      level: 'easy'
    }
  ]
};

const questionsPath = path.join(__dirname, '..', 'src/assets/data/questions.json');
if (!fs.existsSync(questionsPath)) {
  fs.writeFileSync(questionsPath, JSON.stringify(sampleQuestions, null, 2));
  console.log('Created sample questions.json');
}

console.log('\n✅ Asset structure created successfully!');
console.log('\nNext steps:');
console.log('1. Replace placeholder images with actual mascot images');
console.log('2. Replace silent MP3s with actual sound effects');
console.log('3. Add more questions to questions.json');
console.log('\nRun: npm start -- --reset-cache');