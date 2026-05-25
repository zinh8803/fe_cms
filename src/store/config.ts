import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'dark',
    lang: localStorage.getItem('lang') || 'vi',
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', this.theme);
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    setTheme(theme: string) {
      this.theme = theme;
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    },
    toggleLang() {
      this.lang = this.lang === 'vi' ? 'en' : 'vi';
      localStorage.setItem('lang', this.lang);
    },
    setLang(lang: string) {
      this.lang = lang;
      localStorage.setItem('lang', lang);
    }
  }
});
