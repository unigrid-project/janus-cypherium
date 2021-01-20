import LocalePath from "../loaclePath";
import emojiFlags from 'emoji-flags';

var gettext = require('electron-gettext');
const log = require('electron-log');

export default class LoadLanguageFiles {

    static getFlag(code) {
        return emojiFlags.countryCode(code).emoji
    }

    static getLanguages() {
        const languages = [
            {
                name: this.getFlag("GB") + " English",
                language: 'en'
            },
            {
                name: this.getFlag("CN") + " 中文",
                language: 'zh'
            },
            {
                name: this.getFlag("RU") + " русский",
                language: 'ru'
            },
            {
                name: this.getFlag("IN") + " हिंदी",
                language: 'hi'
            },
            {
                name: this.getFlag("ES") + " español",
                language: 'es'
            },
            {
                name: this.getFlag("IR") + " فارسی",
                language: 'fa'
            },
            {
                name: this.getFlag("DE") + " Deutsch",
                language: 'de'
            },
            {
                name: this.getFlag("JP") + " 日本",
                language: 'ja'
            },
            {
                name: this.getFlag("KR") + " 한국어",
                language: 'ko'
            },
            {
                name: this.getFlag("NL") + " Nederlands",
                language: 'nl'
            },
            {
                name: this.getFlag("IT") + " Italiano",
                language: 'it'
            },
            {
                name: this.getFlag("SE") + " Svenska",
                language: 'sv'
            },
            {
                name: this.getFlag("GR") + " Ελληνικά",
                language: 'el'
            }
        ];
        return languages;
    }
}