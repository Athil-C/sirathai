// Rich demo content for each lesson
const lessonContent = {
  thareeq: {
    1: {
      title: 'Introduction to Islam',
      type: 'theory',
      xp: 25,
      coins: 5,
      learn: {
        sections: [
          {
            heading: 'What is Islam?',
            body: 'Islam is a monotheistic religion that teaches submission to the will of Allah (God). The word "Islam" itself means "submission" or "peace" in Arabic. It is the second-largest religion in the world with over 1.8 billion followers.',
            icon: '🕌',
          },
          {
            heading: 'The Five Pillars',
            body: 'Islam is built upon five fundamental pillars: Shahada (Declaration of Faith), Salah (Prayer), Zakat (Charity), Sawm (Fasting during Ramadan), and Hajj (Pilgrimage to Mecca). These pillars form the foundation of a Muslim\'s life.',
            icon: '🏛️',
          },
          {
            heading: 'Core Beliefs',
            body: 'Muslims believe in One God (Allah), His Angels, His Books (including the Quran), His Prophets (from Adam to Muhammad ﷺ), the Day of Judgment, and Divine Decree (Qadr).',
            icon: '✨',
          },
        ],
      },
      observe: {
        title: 'The Beauty of Islam',
        description: 'Watch this visual journey through the core concepts of Islam and understand how they connect together.',
        steps: [
          { step: 1, title: 'Shahada', desc: 'The declaration "La ilaha illallah" — There is no god but Allah', icon: '☝️' },
          { step: 2, title: 'Salah', desc: 'Five daily prayers connecting you directly to Allah', icon: '🤲' },
          { step: 3, title: 'Zakat', desc: 'Purifying your wealth by giving to those in need', icon: '💰' },
          { step: 4, title: 'Sawm', desc: 'Fasting during Ramadan to build taqwa (God-consciousness)', icon: '🌙' },
          { step: 5, title: 'Hajj', desc: 'Pilgrimage to the Holy Kaaba in Mecca', icon: '🕋' },
        ],
      },
      practice: {
        type: 'matching',
        instruction: 'Match each pillar of Islam with its meaning:',
        pairs: [
          { term: 'Shahada', match: 'Declaration of Faith' },
          { term: 'Salah', match: 'Daily Prayers' },
          { term: 'Zakat', match: 'Charitable Giving' },
          { term: 'Sawm', match: 'Fasting in Ramadan' },
          { term: 'Hajj', match: 'Pilgrimage to Mecca' },
        ],
      },
      quiz: [
        { q: 'How many pillars does Islam have?', options: ['3', '4', '5', '6'], answer: 2 },
        { q: 'What does the word "Islam" mean?', options: ['Love', 'Submission/Peace', 'Power', 'Knowledge'], answer: 1 },
        { q: 'Which pillar involves fasting?', options: ['Zakat', 'Hajj', 'Sawm', 'Salah'], answer: 2 },
      ],
    },
    2: {
      title: 'The Shahada',
      type: 'theory',
      xp: 30,
      coins: 5,
      learn: {
        sections: [
          {
            heading: 'The Declaration of Faith',
            body: 'The Shahada is the most fundamental statement in Islam: "Ash-hadu an la ilaha illa Allah, wa ash-hadu anna Muhammadan rasul Allah" — I bear witness that there is no god but Allah, and I bear witness that Muhammad is the Messenger of Allah.',
            icon: '☝️',
            arabic: 'أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله',
          },
          {
            heading: 'Two Parts of the Shahada',
            body: 'The first part (La ilaha illallah) affirms the oneness of God (Tawheed). The second part (Muhammadur Rasulullah) affirms that Prophet Muhammad ﷺ is the final messenger sent by Allah to guide humanity.',
            icon: '📖',
          },
          {
            heading: 'Entering Islam',
            body: 'Sincerely declaring the Shahada with understanding and conviction is how a person enters the fold of Islam. It must be said with sincerity from the heart, not merely spoken with the tongue.',
            icon: '💚',
          },
        ],
      },
      observe: {
        title: 'Understanding the Shahada',
        description: 'Explore the deep meaning behind each word of the Shahada.',
        steps: [
          { step: 1, title: 'Ash-hadu', desc: 'I bear witness — a testimony from the heart', icon: '❤️' },
          { step: 2, title: 'La ilaha', desc: 'There is no deity — rejecting false gods', icon: '🚫' },
          { step: 3, title: 'Illa Allah', desc: 'Except Allah — affirming the One True God', icon: '☝️' },
          { step: 4, title: 'Muhammadur Rasulullah', desc: 'Muhammad ﷺ is the Messenger of Allah', icon: '⭐' },
        ],
      },
      practice: {
        type: 'ordering',
        instruction: 'Arrange the words of the Shahada in the correct order:',
        words: ['Ash-hadu', 'an', 'la ilaha', 'illa Allah', 'wa ash-hadu', 'anna Muhammadan', 'rasul Allah'],
      },
      quiz: [
        { q: 'What does "La ilaha illallah" mean?', options: ['God is great', 'There is no god but Allah', 'Praise be to God', 'In the name of God'], answer: 1 },
        { q: 'How many parts does the Shahada have?', options: ['1', '2', '3', '4'], answer: 1 },
        { q: 'What is required when saying the Shahada?', options: ['Witnesses only', 'Sincerity & understanding', 'Arabic fluency', 'Special clothing'], answer: 1 },
      ],
    },
    3: {
      title: 'Daily Duas - Morning',
      type: 'theory',
      xp: 25,
      coins: 5,
      learn: {
        sections: [
          {
            heading: 'Morning Remembrance',
            body: 'Starting your day with remembrance of Allah (dhikr) brings blessings, protection, and peace. The Prophet ﷺ taught us specific supplications to recite each morning.',
            icon: '🌅',
          },
          {
            heading: 'Dua Upon Waking Up',
            body: '"Alhamdulillahil-ladhi ahyana ba\'da ma amatana wa ilayhin-nushur" — All praise is for Allah who gave us life after death and unto Him is the resurrection.',
            icon: '🛏️',
            arabic: 'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور',
          },
          {
            heading: 'Morning Adhkar',
            body: 'Reciting Ayatul Kursi, the last two verses of Surah Al-Baqarah, and saying "SubhanAllah" 33 times, "Alhamdulillah" 33 times, and "Allahu Akbar" 34 times provides protection throughout the day.',
            icon: '🤲',
          },
        ],
      },
      observe: {
        title: 'Morning Routine of a Muslim',
        description: 'Follow the Sunnah morning routine step by step.',
        steps: [
          { step: 1, title: 'Wake Up', desc: 'Say the dua upon waking and rub your face', icon: '⏰' },
          { step: 2, title: 'Wudu', desc: 'Perform ablution to purify yourself', icon: '💧' },
          { step: 3, title: 'Fajr Prayer', desc: 'Pray the dawn prayer on time', icon: '🤲' },
          { step: 4, title: 'Morning Adhkar', desc: 'Recite the morning supplications', icon: '📿' },
        ],
      },
      practice: {
        type: 'flashcards',
        instruction: 'Review these morning duas. Tap to reveal the meaning:',
        cards: [
          { front: 'الحمد لله', back: 'All praise is due to Allah' },
          { front: 'سبحان الله', back: 'Glory be to Allah' },
          { front: 'الله أكبر', back: 'Allah is the Greatest' },
          { front: 'بسم الله', back: 'In the name of Allah' },
        ],
      },
      quiz: [
        { q: 'What should you say when waking up?', options: ['Bismillah', 'Alhamdulillah...ahyana', 'SubhanAllah', 'Astaghfirullah'], answer: 1 },
        { q: 'How many times do we say SubhanAllah in morning dhikr?', options: ['10', '33', '50', '99'], answer: 1 },
        { q: 'Which Ayah provides protection?', options: ['Ayatul Kursi', 'Al-Fatiha', 'Al-Ikhlas', 'Al-Falaq'], answer: 0 },
      ],
    },
  },
  fiqh: {
    1: {
      title: 'What is Fiqh?',
      type: 'theory',
      xp: 25,
      coins: 5,
      learn: {
        sections: [
          { heading: 'Definition of Fiqh', body: 'Fiqh is Islamic jurisprudence — the human understanding and application of Sharia (divine law). It covers all aspects of life from worship to transactions.', icon: '⚖️' },
          { heading: 'Sources of Fiqh', body: 'The four primary sources are: the Quran, the Sunnah (traditions of the Prophet ﷺ), Ijma (scholarly consensus), and Qiyas (analogical reasoning).', icon: '📚' },
          { heading: 'The Four Schools', body: 'The four major schools of thought (madhabs) are Hanafi, Maliki, Shafi\'i, and Hanbali. All are considered valid interpretations.', icon: '🏫' },
        ],
      },
      observe: {
        title: 'Sources of Islamic Law',
        description: 'See how Islamic rulings are derived from the primary sources.',
        steps: [
          { step: 1, title: 'Quran', desc: 'The word of Allah — the primary source', icon: '📖' },
          { step: 2, title: 'Sunnah', desc: 'The way of Prophet Muhammad ﷺ', icon: '⭐' },
          { step: 3, title: 'Ijma', desc: 'Consensus of the scholars', icon: '🤝' },
          { step: 4, title: 'Qiyas', desc: 'Analogical reasoning from known rulings', icon: '🔍' },
        ],
      },
      practice: {
        type: 'matching',
        instruction: 'Match the school of Fiqh with its founder:',
        pairs: [
          { term: 'Hanafi', match: 'Imam Abu Hanifa' },
          { term: 'Maliki', match: 'Imam Malik' },
          { term: 'Shafi\'i', match: 'Imam Ash-Shafi\'i' },
          { term: 'Hanbali', match: 'Imam Ahmad' },
        ],
      },
      quiz: [
        { q: 'What is Fiqh?', options: ['Belief', 'Jurisprudence', 'History', 'Language'], answer: 1 },
        { q: 'How many major schools of Fiqh are there?', options: ['2', '3', '4', '5'], answer: 2 },
        { q: 'What is the primary source of Islamic law?', options: ['Ijma', 'Qiyas', 'Sunnah', 'Quran'], answer: 3 },
      ],
    },
    2: {
      title: 'Tahara - Purification',
      type: 'theory',
      xp: 30,
      coins: 5,
      learn: {
        sections: [
          { heading: 'Importance of Tahara', body: 'Purification (Tahara) is a prerequisite for Salah. The Prophet ﷺ said: "Cleanliness is half of faith." Physical and spiritual purity are both essential.', icon: '💧' },
          { heading: 'Types of Purification', body: 'There are two main types: Wudu (minor ablution) for daily prayers, and Ghusl (major ablution) required after certain states like janaba.', icon: '🚿' },
          { heading: 'Tayammum', body: 'When water is unavailable or harmful, Tayammum (dry ablution) using clean earth is permitted — showing Islam\'s practicality.', icon: '🌍' },
        ],
      },
      observe: {
        title: 'Types of Purification',
        description: 'Learn when each type of purification is needed.',
        steps: [
          { step: 1, title: 'Wudu', desc: 'Before each prayer, after using the bathroom', icon: '💧' },
          { step: 2, title: 'Ghusl', desc: 'After janaba, menstruation, accepting Islam', icon: '🚿' },
          { step: 3, title: 'Tayammum', desc: 'When water is not available or harmful', icon: '🌍' },
        ],
      },
      practice: {
        type: 'matching',
        instruction: 'Match each purification type with when it is required:',
        pairs: [
          { term: 'Wudu', match: 'Before each prayer' },
          { term: 'Ghusl', match: 'After janaba' },
          { term: 'Tayammum', match: 'When water is unavailable' },
        ],
      },
      quiz: [
        { q: 'What is Tahara?', options: ['Prayer', 'Purification', 'Fasting', 'Charity'], answer: 1 },
        { q: 'What is Tayammum?', options: ['Water ablution', 'Dry ablution', 'Full bath', 'Spiritual cleansing'], answer: 1 },
        { q: '"Cleanliness is ___ of faith"', options: ['All', 'Half', 'A quarter', 'None'], answer: 1 },
      ],
    },
  },
  quran: {
    1: {
      title: 'Arabic Alphabet - Part 1',
      type: 'theory',
      xp: 25,
      coins: 5,
      learn: {
        sections: [
          { heading: 'Introduction to Arabic Letters', body: 'The Arabic alphabet has 28 letters. Arabic is read from right to left. Each letter has up to 4 forms depending on its position in a word.', icon: '🔤' },
          { heading: 'First Group: Alif to Tha', body: 'Let\'s start with the first 4 letters: Alif (ا), Ba (ب), Ta (ت), Tha (ث). These form the foundation of Arabic reading.', icon: '✏️', arabic: 'ا ب ت ث' },
          { heading: 'Practice Tips', body: 'Write each letter multiple times. Focus on the dots — Ba has 1 dot below, Ta has 2 dots above, and Tha has 3 dots above.', icon: '💡' },
        ],
      },
      observe: {
        title: 'Writing Arabic Letters',
        description: 'Watch how each letter is written stroke by stroke.',
        steps: [
          { step: 1, title: 'Alif (ا)', desc: 'A single vertical stroke — the simplest letter', icon: '✏️' },
          { step: 2, title: 'Ba (ب)', desc: 'A curved base with one dot below', icon: '✏️' },
          { step: 3, title: 'Ta (ت)', desc: 'Same shape as Ba with two dots above', icon: '✏️' },
          { step: 4, title: 'Tha (ث)', desc: 'Same shape with three dots above', icon: '✏️' },
        ],
      },
      practice: {
        type: 'flashcards',
        instruction: 'Tap each card to see the letter name:',
        cards: [
          { front: 'ا', back: 'Alif' },
          { front: 'ب', back: 'Ba' },
          { front: 'ت', back: 'Ta' },
          { front: 'ث', back: 'Tha' },
        ],
      },
      quiz: [
        { q: 'How many letters are in the Arabic alphabet?', options: ['24', '26', '28', '30'], answer: 2 },
        { q: 'Which direction is Arabic read?', options: ['Left to right', 'Right to left', 'Top to bottom', 'Any direction'], answer: 1 },
        { q: 'How many dots does "Tha (ث)" have?', options: ['0', '1', '2', '3'], answer: 3 },
      ],
    },
    2: {
      title: 'Arabic Alphabet - Part 2',
      type: 'theory',
      xp: 25,
      coins: 5,
      learn: {
        sections: [
          { heading: 'Next Group: Jim to Kha', body: 'The next three letters: Jim (ج), Ha (ح), Kha (خ). They share a similar base shape but differ in dots.', icon: '📝', arabic: 'ج ح خ' },
          { heading: 'Dal and Dhal', body: 'Dal (د) and Dhal (ذ) are simple letters. Dal has no dots while Dhal has one dot above.', icon: '✏️', arabic: 'د ذ' },
          { heading: 'Ra and Zay', body: 'Ra (ر) and Zay (ز) also share a base shape. Zay has a dot above while Ra does not.', icon: '📖', arabic: 'ر ز' },
        ],
      },
      observe: {
        title: 'Letter Groups',
        description: 'See how Arabic letters are grouped by similar shapes.',
        steps: [
          { step: 1, title: 'ج ح خ', desc: 'Jim, Ha, Kha — differ by dot placement', icon: '📝' },
          { step: 2, title: 'د ذ', desc: 'Dal, Dhal — simple with/without dot', icon: '✏️' },
          { step: 3, title: 'ر ز', desc: 'Ra, Zay — curved with/without dot', icon: '📖' },
        ],
      },
      practice: {
        type: 'flashcards',
        instruction: 'Identify each letter:',
        cards: [
          { front: 'ج', back: 'Jim' },
          { front: 'ح', back: 'Ha' },
          { front: 'خ', back: 'Kha' },
          { front: 'د', back: 'Dal' },
        ],
      },
      quiz: [
        { q: 'Which letter has NO dots: ح or خ?', options: ['ح (Ha)', 'خ (Kha)'], answer: 0 },
        { q: 'What letter is ذ?', options: ['Dal', 'Dhal', 'Ra', 'Zay'], answer: 1 },
        { q: 'ر and ز differ by:', options: ['Shape', 'A dot', 'Size', 'Color'], answer: 1 },
      ],
    },
  },
  aqeeda: {
    1: {
      title: 'What is Aqeeda?',
      type: 'theory',
      xp: 25,
      coins: 5,
      learn: {
        sections: [
          { heading: 'Definition', body: 'Aqeeda means "creed" or "belief." In Islam, it refers to the fundamental beliefs that every Muslim must hold. It is the foundation upon which all actions are built.', icon: '💎' },
          { heading: 'The Six Articles of Faith', body: 'A Muslim must believe in: Allah, His Angels, His Books, His Messengers, the Last Day, and Divine Decree (Qadr) — both its good and bad.', icon: '📜' },
          { heading: 'Why Aqeeda Matters', body: 'Correct belief guides correct action. Without sound aqeeda, worship lacks its foundation. It is the first thing the Prophet ﷺ taught.', icon: '🏗️' },
        ],
      },
      observe: {
        title: 'The Six Articles of Faith',
        description: 'Explore each pillar of Islamic belief.',
        steps: [
          { step: 1, title: 'Belief in Allah', desc: 'His existence, oneness, names and attributes', icon: '☝️' },
          { step: 2, title: 'Belief in Angels', desc: 'Created from light, they obey Allah perfectly', icon: '👼' },
          { step: 3, title: 'Belief in Books', desc: 'Torah, Psalms, Gospel, and the Quran', icon: '📚' },
          { step: 4, title: 'Belief in Messengers', desc: 'From Adam to Muhammad ﷺ', icon: '⭐' },
          { step: 5, title: 'Belief in Last Day', desc: 'The Day of Judgment and the Hereafter', icon: '⏳' },
          { step: 6, title: 'Belief in Qadr', desc: 'Divine decree — everything happens by Allah\'s will', icon: '🌟' },
        ],
      },
      practice: {
        type: 'matching',
        instruction: 'Match each article of faith:',
        pairs: [
          { term: 'Mala\'ika', match: 'Angels' },
          { term: 'Kutub', match: 'Divine Books' },
          { term: 'Rusul', match: 'Messengers' },
          { term: 'Qadr', match: 'Divine Decree' },
        ],
      },
      quiz: [
        { q: 'How many articles of faith are there?', options: ['4', '5', '6', '7'], answer: 2 },
        { q: 'What does Aqeeda mean?', options: ['Law', 'Creed/Belief', 'Prayer', 'Worship'], answer: 1 },
        { q: 'What is Qadr?', options: ['Fasting', 'Charity', 'Divine Decree', 'Pilgrimage'], answer: 2 },
      ],
    },
    2: {
      title: 'Tawheed - Oneness of Allah',
      type: 'theory',
      xp: 30,
      coins: 5,
      learn: {
        sections: [
          { heading: 'What is Tawheed?', body: 'Tawheed is the belief in the absolute oneness of Allah. It is the most fundamental concept in Islam and the essence of the Shahada.', icon: '☝️' },
          { heading: 'Three Categories', body: 'Scholars categorize Tawheed into three: Tawheed ar-Rububiyyah (Lordship), Tawheed al-Uluhiyyah (Worship), and Tawheed al-Asma was-Sifat (Names & Attributes).', icon: '📐' },
          { heading: 'The Opposite: Shirk', body: 'Shirk (associating partners with Allah) is the greatest sin. Understanding Tawheed helps us recognize and avoid all forms of shirk.', icon: '⚠️' },
        ],
      },
      observe: {
        title: 'Categories of Tawheed',
        description: 'Understand the three dimensions of Allah\'s oneness.',
        steps: [
          { step: 1, title: 'Rububiyyah', desc: 'Allah alone is the Creator, Sustainer, and Controller', icon: '🌍' },
          { step: 2, title: 'Uluhiyyah', desc: 'Allah alone deserves all worship', icon: '🤲' },
          { step: 3, title: 'Asma was-Sifat', desc: 'Allah\'s names and attributes are unique to Him', icon: '✨' },
        ],
      },
      practice: {
        type: 'matching',
        instruction: 'Match each category of Tawheed:',
        pairs: [
          { term: 'Rububiyyah', match: 'Lordship — Creator & Sustainer' },
          { term: 'Uluhiyyah', match: 'Worship — Only Allah deserves it' },
          { term: 'Asma was-Sifat', match: 'Names & Attributes of Allah' },
        ],
      },
      quiz: [
        { q: 'What is Tawheed?', options: ['Many gods', 'Oneness of Allah', 'Prayer', 'Fasting'], answer: 1 },
        { q: 'What is the greatest sin in Islam?', options: ['Lying', 'Shirk', 'Stealing', 'Missing prayer'], answer: 1 },
        { q: 'How many categories of Tawheed are there?', options: ['1', '2', '3', '4'], answer: 2 },
      ],
    },
    3: {
      title: 'Names of Allah - Part 1',
      type: 'theory',
      xp: 25,
      coins: 5,
      learn: {
        sections: [
          { heading: 'The 99 Names', body: 'Allah has 99 beautiful names (Al-Asma Al-Husna). The Prophet ﷺ said: "Allah has 99 names. Whoever memorizes them will enter Paradise."', icon: '💎' },
          { heading: 'Ar-Rahman & Ar-Raheem', body: 'Ar-Rahman (The Most Merciful) and Ar-Raheem (The Especially Merciful). These names emphasize Allah\'s all-encompassing mercy.', icon: '❤️', arabic: 'الرحمن الرحيم' },
          { heading: 'Al-Malik & Al-Quddus', body: 'Al-Malik (The King/Sovereign) and Al-Quddus (The Most Holy). These remind us of Allah\'s supreme authority and absolute purity.', icon: '👑', arabic: 'الملك القدوس' },
        ],
      },
      observe: {
        title: 'Beautiful Names of Allah',
        description: 'Reflect on the meaning of each name.',
        steps: [
          { step: 1, title: 'Ar-Rahman', desc: 'The Most Merciful — mercy for all creation', icon: '❤️' },
          { step: 2, title: 'Ar-Raheem', desc: 'The Especially Merciful — special mercy for believers', icon: '💚' },
          { step: 3, title: 'Al-Malik', desc: 'The King — sovereign over all existence', icon: '👑' },
          { step: 4, title: 'Al-Quddus', desc: 'The Most Holy — free from all imperfections', icon: '✨' },
        ],
      },
      practice: {
        type: 'flashcards',
        instruction: 'Learn the Names of Allah:',
        cards: [
          { front: 'الرحمن', back: 'Ar-Rahman — The Most Merciful' },
          { front: 'الرحيم', back: 'Ar-Raheem — The Especially Merciful' },
          { front: 'الملك', back: 'Al-Malik — The King' },
          { front: 'القدوس', back: 'Al-Quddus — The Most Holy' },
        ],
      },
      quiz: [
        { q: 'How many beautiful names does Allah have?', options: ['50', '72', '99', '100'], answer: 2 },
        { q: 'What does Ar-Rahman mean?', options: ['The King', 'The Most Merciful', 'The Holy', 'The Creator'], answer: 1 },
        { q: 'What is the reward for memorizing the 99 names?', options: ['Wealth', 'Paradise', 'Fame', 'Knowledge'], answer: 1 },
      ],
    },
  },
};

export default lessonContent;
