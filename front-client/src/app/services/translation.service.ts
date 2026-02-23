import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private readonly STORAGE_KEY = 'selectedLanguage';
    private readonly AVAILABLE_LANGUAGES = ['fr', 'en'];
    private readonly DEFAULT_LANGUAGE = 'fr';

    constructor(private translate: TranslateService) {
        this.initializeLanguage();
    }

    /**
     * Initialize the translation service with the saved or default language
     */
    private initializeLanguage(): void {
        // Add available languages
        this.translate.addLangs(this.AVAILABLE_LANGUAGES);

        // Set default language
        this.translate.setDefaultLang(this.DEFAULT_LANGUAGE);

        // Get saved language from localStorage or use default
        const savedLanguage = this.getSavedLanguage();
        const languageToUse = savedLanguage || this.DEFAULT_LANGUAGE;

        // Use the selected language
        this.translate.use(languageToUse);
    }

    /**
     * Change the current language
     * @param language Language code (e.g., 'fr', 'en')
     */
    changeLanguage(language: string): void {
        if (this.AVAILABLE_LANGUAGES.includes(language)) {
            this.translate.use(language);
            this.saveLanguage(language);
        }
    }

    /**
     * Get the current language
     */
    getCurrentLanguage(): string {
        return this.translate.currentLang || this.DEFAULT_LANGUAGE;
    }

    /**
     * Get all available languages
     */
    getAvailableLanguages(): string[] {
        return this.AVAILABLE_LANGUAGES;
    }

    /**
     * Save the selected language to localStorage
     */
    private saveLanguage(language: string): void {
        localStorage.setItem(this.STORAGE_KEY, language);
    }

    /**
     * Get the saved language from localStorage
     */
    private getSavedLanguage(): string | null {
        return localStorage.getItem(this.STORAGE_KEY);
    }

    /**
     * Translate a key instantly (synchronous)
     * @param key Translation key
     * @param params Optional parameters for interpolation
     */
    instant(key: string, params?: any): string {
        return this.translate.instant(key, params);
    }
}
