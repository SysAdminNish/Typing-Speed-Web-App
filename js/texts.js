/**
 * Sample text passages for typing tests.
 * Each passage is long enough for 10-minute tests when concatenated or used in full.
 */

const PASSAGES = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Sphinx of black quartz, judge my vow.",
  "To be, or not to be, that is the question: Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them.",
  "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.",
  "All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.",
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it.",
  "In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
  "Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler, long I stood and looked down one as far as I could to where it bent in the undergrowth.",
  "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
  "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood.",
  "Happy families are all alike; every unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl.",
  "The sun rose slowly over the mountains, casting long shadows across the valley. Birds began their morning songs as the first rays of light touched the treetops. A new day had begun, full of promise and possibility.",
  "Technology has transformed the way we communicate, work, and live. From the invention of the printing press to the rise of the internet, each innovation has reshaped society in profound and unexpected ways.",
  "Learning to type efficiently is one of the most valuable skills you can develop. It saves time, reduces strain, and allows you to focus on your thoughts rather than the mechanics of finding keys.",
  "The art of writing is the art of discovering what you believe. Writing forces you to clarify your thoughts and expose the gaps in your reasoning. There is no better way to learn than to teach.",
  "Nature does not hurry, yet everything is accomplished. The river carves the canyon over millions of years. The tree grows slowly toward the sky. Patience is not passive waiting; it is active acceptance.",
  "Science is not only a disciple of reason but also one of romance and passion. The important thing is not to stop questioning. Curiosity has its own reason for existing.",
  "We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.",
  "The only thing we have to fear is fear itself. So, first of all, let me assert my firm belief that the only thing we have to fear is fear itself—nameless, unreasoning, unjustified terror which paralyses needed efforts.",
  "I have a dream that one day this nation will rise up and live out the true meaning of its creed: We hold these truths to be self-evident, that all men are created equal.",
  "Ask not what your country can do for you—ask what you can do for your country. And so, my fellow Americans: ask not what your country can do for you; ask what you can do for your country.",
  "One small step for man, one giant leap for mankind. That's one small step for man, one giant leap for mankind. The surface is fine and powdery. I can kick it up loosely with my toe.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall. Life is not about waiting for the storm to pass; it is about learning to dance in the rain.",
  "In three words I can sum up everything I've learned about life: it goes on. The past is never dead. It's not even past. We need to accept that we won't always make the right decisions.",
  "You miss one hundred percent of the shots you don't take. The only way to achieve the impossible is to believe it is possible. Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only limit to our realization of tomorrow will be our doubts of today. We are what we repeatedly do. Excellence, then, is not an act, but a habit. The journey of a thousand miles begins with a single step.",
  "Be the change that you wish to see in the world. An eye for an eye only ends up making the whole world blind. Where there is love there is life. The weak can never forgive. Forgiveness is the attribute of the strong.",
  "It is during our darkest moments that we must focus to see the light. Nothing is impossible. The word itself says I'm possible. Believe you can and you're halfway there.",
  "The future belongs to those who believe in the beauty of their dreams. Do what you can, with what you have, where you are. It is never too late to be what you might have been.",
  "Success usually comes to those who are too busy to be looking for it. Don't be afraid to give up the good to go for the great. The only place where success comes before work is in the dictionary.",
  "Quality is not an act, it is a habit. We are what we repeatedly do. Excellence, then, is not an act, but a habit. Well begun is half done. The roots of education are bitter, but the fruit is sweet.",
];

/** Minimum characters to generate (covers ~10 min at high WPM with buffer). */
const MIN_PASSAGE_LENGTH = 15000;

/**
 * Returns a long, random passage by concatenating and shuffling from the list.
 * Text is effectively endless for any test duration; we loop over passages until we exceed min length.
 * @param {number} [durationSeconds=600] - Used to ensure enough text (optional).
 * @returns {string} A single long passage for the user to type.
 */
export function getRandomPassage(durationSeconds = 600) {
  const minChars = Math.max(MIN_PASSAGE_LENGTH, (durationSeconds / 60) * 120 * 5);
  const indices = [...Array(PASSAGES.length).keys()];
  let text = "";
  while (text.length < minChars) {
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for (const idx of indices) {
      text += (text ? " " : "") + PASSAGES[idx];
      if (text.length >= minChars) break;
    }
  }
  return text;
}

export { PASSAGES };
