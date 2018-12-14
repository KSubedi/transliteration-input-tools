import { TransliterationProvider } from "./transliteration-provider";

export class EventHandler{
    transliterationProvider: TransliterationProvider;
    constructor(transliterationProvider: TransliterationProvider){  
        this.transliterationProvider = transliterationProvider;

        this.registerListeners();
    }

    registerListeners() {
        this.transliterationProvider.inputArea.addEventListener("keypress", this.handleKeyPress());
    }

    handleKeyPress(){
        let allChars = "abcdefghijklmnopqrstuvwxyz.".split("");

        return function(event: KeyboardEvent){
            if (allChars.indexOf(event.key) !== -1) {
                // Give the event to the suggestions box
                this.transliterationProvider.suggestionBox.startSuggestions(event.key);
                event.preventDefault();
            }
        }.bind(this);
    }
}