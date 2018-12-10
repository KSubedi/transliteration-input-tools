import {EventHandler} from "./event-handler";
import { SuggestionBox } from "./suggestion-box";
import { ApiClient } from "./api-client";

export class TransliterationProvider {
    // Holds the state
    inputArea: HTMLInputElement;
    eventHandler: EventHandler;
    suggestionBox: SuggestionBox;
    apiClient: ApiClient

    lastApiUpdate: Date;

    constructor(inputElement: HTMLInputElement, language: string = "ne"){
        this.inputArea = inputElement;
        this.eventHandler = new EventHandler(this);
        this.suggestionBox = new SuggestionBox(this);
        this.apiClient = new ApiClient(this, language);
    }
}
