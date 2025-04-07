/**
 * @fileoverview Internationalization module for the Mastermind application
 */

/**
 * Translations for all supported languages
 * @type {Object}
 */
const translations = {
  en: {
    congratulations: 'Code cracked',
    newGame: 'New Game',
    submit: 'Submit',
    giveUp: 'Give-up',
    check: 'Check',
    colours: 'Color',
    positions: 'Position',
    codemaker: 'Maker',
    codebreaker: 'Breaker',
    mode: 'Mode',
    both: '2 Player',
    codemakerMode: 'Computer breaks Code',
    codebreakerMode: 'Computer creates Code',
    findCode: ' Find the code.',
    computerSuccess: 'Computer cracked the code!',
    computerFailed: 'Computer couldn\'t crack the code within the maximum number of attempts.',
    gameOver: 'Game Over! The code was revealed.',
    gameOverFailed: 'Game Over! You didn\'t find the code.',
  },
  de: {
    congratulations: 'Code geknackt',
    newGame: 'Neues Spiel',
    submit: 'Senden',
    giveUp: 'Aufgeben',
    check: 'Prüfen',
    colours: 'Farbe',
    positions: 'Position',
    codemaker: 'Ersteller',
    codebreaker: 'Löser',
    mode: 'Modus',
    both: '2-Spieler',
    codemakerMode: 'Computer knackt Code',
    codebreakerMode: 'Computer erstellt Code',
    findCode: ' Finde den Code.',
    computerSuccess: 'Computer hat den Code geknackt!',
    computerFailed: 'Der Computer konnte den Code nicht innerhalb der maximalen Anzahl von Versuchen knacken.',
    gameOver: 'Spiel beendet! Der Code wurde aufgedeckt.',
    gameOverFailed: 'Spiel beendet! Du hast den Code nicht gefunden.',
  },
};

/**
 * I18n service for managing translations
 */
class I18nService {
  /**
   * Create a new I18nService
   * @param {string} [initialLang='de'] - Initial language
   */
  constructor(initialLang = 'de') {
    this.currentLang = initialLang;
    this.changeCallbacks = [];
  }

  /**
   * Get the current language
   * @returns {string} Current language code
   */
  getCurrentLang() {
    return this.currentLang;
  }

  /**
   * Change the current language
   * @param {string} lang - Language code to change to
   */
  setLanguage(lang) {
    if (!translations[lang]) {
      console.error(`Language '${lang}' is not supported`);
      return;
    }
    
    this.currentLang = lang;
    
    // Update all translatable elements in the DOM
    document.querySelectorAll('.translatable').forEach((element) => {
      const key = element.dataset.key;
      if (key && translations[lang][key]) {
        element.textContent = translations[lang][key];
      }
    });
    
    // Update language switcher UI
    document.querySelectorAll('.lang-option').forEach((option) => {
      option.classList.toggle('active', option.dataset.lang === lang);
    });
    
    // Notify subscribers about language change
    this.notifyLanguageChanged();
  }

  /**
   * Get translation for a specific key
   * @param {string} key - Translation key
   * @returns {string} Translated text
   */
  translate(key) {
    if (!translations[this.currentLang] || !translations[this.currentLang][key]) {
      console.warn(`Translation key '${key}' not found for language '${this.currentLang}'`);
      return key;
    }
    
    return translations[this.currentLang][key];
  }

  /**
   * Subscribe to language change events
   * @param {Function} callback - Function to call when language changes
   */
  onLanguageChanged(callback) {
    if (typeof callback === 'function') {
      this.changeCallbacks.push(callback);
    }
  }

  /**
   * Notify all subscribers about language change
   */
  notifyLanguageChanged() {
    this.changeCallbacks.forEach((callback) => callback(this.currentLang));
  }
}

// Create and export a singleton instance
const i18nService = new I18nService();

export {
  i18nService,
  translations,
};