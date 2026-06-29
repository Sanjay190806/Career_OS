import { GermanLessonData, GermanLevel, GermanQuizQuestionType } from '../types/german';

const makeVocab = (
  id: string,
  german: string,
  english: string,
  pronunciationHint: string,
  exampleGerman: string,
  exampleEnglish: string,
  category: string
) => ({
  id,
  word: german,
  meaning: english,
  pronunciationHint,
  exampleSentence: exampleGerman,
  german,
  english,
  exampleGerman,
  exampleEnglish,
  category
});

const quiz = (
  type: GermanQuizQuestionType,
  question: string,
  options: string[],
  answer: string,
  explanation: string
) => ({ type, question, options, answer, explanation });

const fullLessons: Omit<GermanLessonData, 'locked' | 'completed' | 'notes' | 'lastPracticed'>[] = [
  {
    id: 'german-1',
    order: 1,
    title: 'Greetings',
    level: 'A1 Beginner',
    objective: 'Greet people politely and close a simple conversation.',
    vocabulary: [
      makeVocab('l1-v1', 'Hallo', 'Hello', 'hah-loh', 'Hallo, ich bin Sanju.', 'Hello, I am Sanju.', 'Greetings'),
      makeVocab('l1-v2', 'Guten Morgen', 'Good morning', 'goo-ten mor-gen', 'Guten Morgen, Frau Weber.', 'Good morning, Ms. Weber.', 'Greetings'),
      makeVocab('l1-v3', 'Tschuess', 'Bye', 'choos', 'Tschuess, bis morgen.', 'Bye, see you tomorrow.', 'Greetings')
    ],
    grammar: [
      { title: 'Formal and casual greetings', explanation: 'Use Hallo with anyone. Use Guten Morgen before noon and Guten Abend in the evening.', examples: ['Hallo, Sanju.', 'Guten Abend, Shayla.'] }
    ],
    examples: [
      { german: 'Hallo! Wie geht es dir?', english: 'Hello! How are you?', pronunciationHint: 'vee gate es deer' },
      { german: 'Mir geht es gut, danke.', english: 'I am doing well, thanks.', pronunciationHint: 'meer gate es goot' }
    ],
    quiz: [
      quiz('german_to_english', 'What does "Guten Morgen" mean?', ['Good night', 'Good morning', 'Goodbye'], 'Good morning', 'Morgen means morning.'),
      quiz('english_to_german', 'Choose "Bye" in German.', ['Hallo', 'Danke', 'Tschuess'], 'Tschuess', 'Tschuess is the casual goodbye.')
    ],
    cultureTip: 'In German, a clear greeting is normal before asking for help.',
    xpReward: 30,
    estimatedMinutes: 15,
    xp: 30,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-2',
    order: 2,
    title: 'Introducing yourself',
    level: 'A1 Beginner',
    objective: 'Say your name, where you are from, and what you study.',
    vocabulary: [
      makeVocab('l2-v1', 'Ich heisse', 'My name is', 'ikh high-seh', 'Ich heisse Sanju.', 'My name is Sanju.', 'Identity'),
      makeVocab('l2-v2', 'Ich komme aus', 'I come from', 'ikh kom-meh ous', 'Ich komme aus Indien.', 'I come from India.', 'Identity'),
      makeVocab('l2-v3', 'Ich studiere', 'I study', 'ikh shtoo-dee-reh', 'Ich studiere ECE.', 'I study ECE.', 'College')
    ],
    grammar: [
      { title: 'Ich + verb', explanation: 'For ich, many regular verbs end with -e: komme, studiere, lerne.', examples: ['Ich komme aus Indien.', 'Ich lerne Deutsch.'] }
    ],
    examples: [
      { german: 'Ich heisse Sanju. Ich komme aus Indien.', english: 'My name is Sanju. I come from India.', pronunciationHint: 'ikh high-seh san-joo' },
      { german: 'Ich studiere Elektronik.', english: 'I study electronics.', pronunciationHint: 'ikh shtoo-dee-reh' }
    ],
    quiz: [
      quiz('fill_blank', 'Ich ____ Sanju.', ['heisse', 'bist', 'sind'], 'heisse', 'Use heisse with ich for "my name is".'),
      quiz('english_to_german', 'I come from India.', ['Ich komme aus Indien.', 'Ich bin Indien.', 'Ich habe Indien.'], 'Ich komme aus Indien.', 'Komme aus means come from.')
    ],
    cultureTip: 'Germans often introduce name and role simply: Ich bin Student.',
    xpReward: 30,
    estimatedMinutes: 18,
    xp: 30,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-3',
    order: 3,
    title: 'Numbers 1-20',
    level: 'A1 Beginner',
    objective: 'Understand and say numbers from one to twenty.',
    vocabulary: [
      makeVocab('l3-v1', 'eins', 'one', 'ines', 'Ich habe eins.', 'I have one.', 'Numbers'),
      makeVocab('l3-v2', 'zehn', 'ten', 'tsayn', 'Ich habe zehn Minuten.', 'I have ten minutes.', 'Numbers'),
      makeVocab('l3-v3', 'zwanzig', 'twenty', 'tsvan-tsikh', 'Zwanzig Minuten Deutsch.', 'Twenty minutes of German.', 'Numbers')
    ],
    grammar: [
      { title: 'Numbers as fixed words', explanation: 'Numbers do not change in basic counting. Practice saying them aloud in small groups.', examples: ['eins, zwei, drei', 'elf, zwoelf, dreizehn'] }
    ],
    examples: [
      { german: 'Ich habe zwei Aufgaben.', english: 'I have two tasks.', pronunciationHint: 'tsvai' },
      { german: 'Heute lerne ich zwanzig Minuten.', english: 'Today I study for twenty minutes.', pronunciationHint: 'tsvan-tsikh' }
    ],
    quiz: [
      quiz('german_to_english', 'What does "zwanzig" mean?', ['twelve', 'twenty', 'two'], 'twenty', 'Zwanzig means twenty.'),
      quiz('english_to_german', 'Choose "ten".', ['zehn', 'zwei', 'zwanzig'], 'zehn', 'Zehn is ten.')
    ],
    xpReward: 30,
    estimatedMinutes: 15,
    xp: 30,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-4',
    order: 4,
    title: 'Days of the week',
    level: 'A1 Beginner',
    objective: 'Name weekdays and talk about today or tomorrow.',
    vocabulary: [
      makeVocab('l4-v1', 'Montag', 'Monday', 'mohn-tahk', 'Am Montag lerne ich Deutsch.', 'On Monday I learn German.', 'Time'),
      makeVocab('l4-v2', 'heute', 'today', 'hoy-teh', 'Heute ist Montag.', 'Today is Monday.', 'Time'),
      makeVocab('l4-v3', 'morgen', 'tomorrow', 'mor-gen', 'Morgen habe ich Unterricht.', 'Tomorrow I have class.', 'Time')
    ],
    grammar: [
      { title: 'Am + day', explanation: 'Use am before a weekday when you mean on that day.', examples: ['Am Dienstag lerne ich Java.', 'Am Freitag habe ich Zeit.'] }
    ],
    examples: [
      { german: 'Heute ist Mittwoch.', english: 'Today is Wednesday.' },
      { german: 'Am Sonntag ruhe ich mich aus.', english: 'On Sunday I rest.' }
    ],
    quiz: [
      quiz('fill_blank', '____ Montag lerne ich Deutsch.', ['Am', 'Ich', 'Der'], 'Am', 'Use am before weekdays.'),
      quiz('german_to_english', 'What does "heute" mean?', ['today', 'tomorrow', 'week'], 'today', 'Heute means today.')
    ],
    xpReward: 30,
    estimatedMinutes: 16,
    xp: 30,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-5',
    order: 5,
    title: 'Basic verbs: sein, haben',
    level: 'A1 Beginner',
    objective: 'Use ich bin and ich habe in simple sentences.',
    vocabulary: [
      makeVocab('l5-v1', 'sein', 'to be', 'zine', 'Ich bin Student.', 'I am a student.', 'Verbs'),
      makeVocab('l5-v2', 'haben', 'to have', 'hah-ben', 'Ich habe Zeit.', 'I have time.', 'Verbs'),
      makeVocab('l5-v3', 'Zeit', 'time', 'tsite', 'Ich habe heute Zeit.', 'I have time today.', 'Daily Life')
    ],
    grammar: [
      { title: 'Irregular basics', explanation: 'Sein and haben are irregular. Memorize: ich bin, du bist, ich habe, du hast.', examples: ['Ich bin bereit.', 'Ich habe eine Frage.'] }
    ],
    examples: [
      { german: 'Ich bin Student.', english: 'I am a student.' },
      { german: 'Ich habe eine Frage.', english: 'I have a question.' }
    ],
    quiz: [
      quiz('fill_blank', 'Ich ____ Student.', ['bin', 'habe', 'bist'], 'bin', 'Use bin with ich for "am".'),
      quiz('fill_blank', 'Ich ____ eine Frage.', ['habe', 'bin', 'ist'], 'habe', 'Use habe for "have".')
    ],
    xpReward: 35,
    estimatedMinutes: 20,
    xp: 35,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-6',
    order: 6,
    title: 'Family',
    level: 'A1 Strong',
    objective: 'Talk about family members with simple articles.',
    vocabulary: [
      makeVocab('l6-v1', 'die Mutter', 'the mother', 'dee moot-ter', 'Meine Mutter ist nett.', 'My mother is kind.', 'Family'),
      makeVocab('l6-v2', 'der Vater', 'the father', 'der fah-ter', 'Mein Vater arbeitet.', 'My father works.', 'Family'),
      makeVocab('l6-v3', 'die Schwester', 'the sister', 'dee shves-ter', 'Meine Schwester lernt.', 'My sister studies.', 'Family')
    ],
    grammar: [
      { title: 'Mein / meine', explanation: 'Use mein with der/das words and meine with die words.', examples: ['mein Vater', 'meine Mutter', 'meine Schwester'] }
    ],
    examples: [
      { german: 'Das ist mein Bruder.', english: 'That is my brother.' },
      { german: 'Meine Familie ist in Indien.', english: 'My family is in India.' }
    ],
    quiz: [
      quiz('article_choice', 'Choose the correct article: ____ Mutter', ['der', 'die', 'das'], 'die', 'Mutter uses die.'),
      quiz('fill_blank', '____ Vater ist nett.', ['Mein', 'Meine', 'Der die'], 'Mein', 'Vater is masculine, so use mein.')
    ],
    xpReward: 35,
    estimatedMinutes: 18,
    xp: 35,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-7',
    order: 7,
    title: 'College vocabulary',
    level: 'A1 Strong',
    objective: 'Describe your college life and study routine.',
    vocabulary: [
      makeVocab('l7-v1', 'die Hochschule', 'college/university', 'dee hoakh-shoo-leh', 'Meine Hochschule ist in Chennai.', 'My college is in Chennai.', 'College'),
      makeVocab('l7-v2', 'der Kurs', 'the course', 'der koers', 'Der Kurs ist interessant.', 'The course is interesting.', 'College'),
      makeVocab('l7-v3', 'die Pruefung', 'the exam', 'dee prue-fung', 'Die Pruefung ist morgen.', 'The exam is tomorrow.', 'College')
    ],
    grammar: [
      { title: 'Simple adjective position', explanation: 'In basic A1 sentences, adjectives often come after ist: Der Kurs ist schwer.', examples: ['Die Aufgabe ist wichtig.', 'Der Kurs ist interessant.'] }
    ],
    examples: [
      { german: 'Ich studiere an der Hochschule.', english: 'I study at the college.' },
      { german: 'Die Pruefung ist wichtig.', english: 'The exam is important.' }
    ],
    quiz: [
      quiz('german_to_english', 'What is "die Pruefung"?', ['project', 'exam', 'classroom'], 'exam', 'Pruefung means exam.'),
      quiz('fill_blank', 'Der Kurs ____ interessant.', ['ist', 'bin', 'habe'], 'ist', 'Use ist for he/she/it or a noun.')
    ],
    xpReward: 35,
    estimatedMinutes: 20,
    xp: 35,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-8',
    order: 8,
    title: 'Time expressions',
    level: 'A1 Strong',
    objective: 'Talk about time blocks and study plans.',
    vocabulary: [
      makeVocab('l8-v1', 'um acht Uhr', 'at eight o clock', 'oom akht oor', 'Ich lerne um acht Uhr.', 'I study at eight o clock.', 'Time'),
      makeVocab('l8-v2', 'jeden Tag', 'every day', 'yay-den tahk', 'Ich lerne jeden Tag.', 'I learn every day.', 'Time'),
      makeVocab('l8-v3', 'spaeter', 'later', 'shpay-ter', 'Ich mache das spaeter.', 'I will do that later.', 'Time')
    ],
    grammar: [
      { title: 'Um + clock time', explanation: 'Use um before a specific clock time.', examples: ['um sieben Uhr', 'um zehn Uhr'] }
    ],
    examples: [
      { german: 'Ich lerne jeden Tag Deutsch.', english: 'I learn German every day.' },
      { german: 'Um neun Uhr mache ich DSA.', english: 'At nine o clock I do DSA.' }
    ],
    quiz: [
      quiz('fill_blank', 'Ich lerne ____ acht Uhr.', ['um', 'am', 'ich'], 'um', 'Specific time uses um.'),
      quiz('german_to_english', 'What does "jeden Tag" mean?', ['every day', 'today', 'late'], 'every day', 'Jeden Tag means every day.')
    ],
    xpReward: 35,
    estimatedMinutes: 17,
    xp: 35,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-9',
    order: 9,
    title: 'Food basics',
    level: 'A1 Strong',
    objective: 'Order simple food and say what you like.',
    vocabulary: [
      makeVocab('l9-v1', 'das Wasser', 'the water', 'das vah-ser', 'Ich trinke Wasser.', 'I drink water.', 'Food'),
      makeVocab('l9-v2', 'der Reis', 'the rice', 'der rice', 'Ich esse Reis.', 'I eat rice.', 'Food'),
      makeVocab('l9-v3', 'ich moechte', 'I would like', 'ikh moekh-teh', 'Ich moechte Wasser.', 'I would like water.', 'Food')
    ],
    grammar: [
      { title: 'Ich moechte', explanation: 'Use ich moechte to request something politely.', examples: ['Ich moechte Tee.', 'Ich moechte Reis.'] }
    ],
    examples: [
      { german: 'Ich moechte einen Kaffee.', english: 'I would like a coffee.' },
      { german: 'Das Essen ist gut.', english: 'The food is good.' }
    ],
    quiz: [
      quiz('german_to_english', 'What does "ich moechte" mean?', ['I have', 'I would like', 'I am'], 'I would like', 'It is the polite request phrase.'),
      quiz('article_choice', 'Choose the article: ____ Wasser', ['der', 'die', 'das'], 'das', 'Wasser uses das.')
    ],
    xpReward: 35,
    estimatedMinutes: 20,
    xp: 35,
    vocabularyCount: 3,
    quizScore: 0
  },
  {
    id: 'german-10',
    order: 10,
    title: 'Travel basics',
    level: 'A1 Strong',
    objective: 'Ask where a place is and understand simple travel words.',
    vocabulary: [
      makeVocab('l10-v1', 'der Bahnhof', 'the train station', 'der bahn-hof', 'Wo ist der Bahnhof?', 'Where is the train station?', 'Travel'),
      makeVocab('l10-v2', 'die Stadt', 'the city', 'dee shtat', 'Die Stadt ist gross.', 'The city is big.', 'Travel'),
      makeVocab('l10-v3', 'links', 'left', 'links', 'Der Bahnhof ist links.', 'The station is on the left.', 'Travel')
    ],
    grammar: [
      { title: 'Wo ist ...?', explanation: 'Use Wo ist plus the place to ask where something is.', examples: ['Wo ist der Bahnhof?', 'Wo ist die Hochschule?'] }
    ],
    examples: [
      { german: 'Entschuldigung, wo ist der Bahnhof?', english: 'Excuse me, where is the train station?' },
      { german: 'Gehen Sie rechts.', english: 'Go right.' }
    ],
    quiz: [
      quiz('fill_blank', '____ ist der Bahnhof?', ['Wo', 'Was', 'Wer'], 'Wo', 'Wo means where.'),
      quiz('german_to_english', 'What does "links" mean?', ['right', 'left', 'straight'], 'left', 'Links means left.')
    ],
    cultureTip: 'Say Entschuldigung before asking a stranger for directions.',
    xpReward: 40,
    estimatedMinutes: 22,
    xp: 40,
    vocabularyCount: 3,
    quizScore: 0
  }
];

const placeholderTitles = [
  'German articles der/die/das',
  'Nominative case intro',
  'Common questions',
  'Daily routine',
  'Simple present tense',
  'Modal verbs intro',
  'Pronouns',
  'Common adjectives',
  'Places in city',
  'Directions',
  'Tech vocabulary',
  'Career vocabulary',
  'Study vocabulary',
  'Germany culture basics',
  'Simple conversations',
  'Listening practice placeholder',
  'Speaking practice placeholder',
  'Writing practice',
  'Revision A1',
  'A1 checkpoint quiz'
];

const makePlaceholderLesson = (index: number): Omit<GermanLessonData, 'locked' | 'completed' | 'notes' | 'lastPracticed'> => {
  const order = index + 11;
  const level: GermanLevel = order <= 18 ? 'A2 Beginner' : 'A2 Strong';
  const title = placeholderTitles[index] || `German lesson ${order}`;
  return {
    id: `german-${order}`,
    order,
    title,
    level,
    objective: `Build practical ${title.toLowerCase()} language with A1/A2 sentence patterns.`,
    vocabulary: [
      makeVocab(`l${order}-v1`, 'lernen', 'to learn', 'lair-nen', 'Ich lerne Deutsch.', 'I learn German.', title),
      makeVocab(`l${order}-v2`, 'wichtig', 'important', 'vikh-tikh', 'Das ist wichtig.', 'That is important.', title),
      makeVocab(`l${order}-v3`, 'heute', 'today', 'hoy-teh', 'Heute uebe ich.', 'Today I practice.', title)
    ],
    grammar: [
      { title: `${title} sentence frame`, explanation: 'Use short subject-verb-object sentences first. Accuracy beats fancy grammar.', examples: ['Ich lerne heute.', 'Das ist wichtig.'] }
    ],
    examples: [
      { german: 'Ich uebe jeden Tag ein bisschen.', english: 'I practice a little every day.' },
      { german: 'Kannst du das bitte wiederholen?', english: 'Can you please repeat that?' }
    ],
    quiz: [
      quiz('german_to_english', 'What does "wichtig" mean?', ['important', 'late', 'easy'], 'important', 'Wichtig means important.'),
      quiz('fill_blank', 'Ich ____ Deutsch.', ['lerne', 'bist', 'sind'], 'lerne', 'Use lerne with ich.')
    ],
    cultureTip: 'In A2 conversations, simple correct sentences are stronger than memorized long lines.',
    xpReward: order <= 18 ? 40 : 45,
    estimatedMinutes: 20,
    xp: order <= 18 ? 40 : 45,
    vocabularyCount: 3,
    quizScore: 0
  };
};

export const GERMAN_LESSONS: GermanLessonData[] = [
  ...fullLessons,
  ...Array.from({ length: 20 }, (_, index) => makePlaceholderLesson(index))
].map((lesson, index) => ({
  ...lesson,
  locked: index > 0,
  completed: false,
  notes: '',
  lastPracticed: null
}));
