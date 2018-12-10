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
        return function(event: KeyboardEvent){
            if (
                event.which !== 0 &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey && 
                event.key !== "Enter" && 
                event.key !== " "
            ) {
                // Give the event to the suggestions box
                this.transliterationProvider.suggestionBox.startSuggestions(event.key);
                event.preventDefault();
            }
        }.bind(this);
    }
}