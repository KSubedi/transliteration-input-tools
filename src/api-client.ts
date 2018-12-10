import { TransliterationProvider } from "./transliteration-provider";

export class ApiClient{
    transliterationProvider: TransliterationProvider;
    readonly apiUrl: string = "https://inputtools.google.com/request?text=";
    language: string = "ne";
    constructor(transliterationProvider: TransliterationProvider, language: string){  
        this.transliterationProvider = transliterationProvider;
        this.language = language
    }

    // Updates the word suggestions by calling google's input tools api
    // This API is undocumented and unofficial but is being used by a lot of
    // google products including their own keyboards so should be reliable.
    async getSuggestions(word: string) {
        // Update the last api call 
        var startDate = new Date();
        if(this.transliterationProvider) this.transliterationProvider.lastApiUpdate = startDate;

        // Make sure word is not empty
        if (word !== "") {
            var url =
                this.apiUrl +
                word +
                "&itc=" + this.language + "-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8";

            let response = await fetch(url);
            const json = await response.json();
            if(json.length > 0 && json[1].length > 0 && json[1][0].length > 0 && json[1][0][1].length > 0){
                var returnValues = json[1][0][1];
                returnValues[5] = word;
    
                return {
                    values: returnValues,
                    apiCallDate: startDate
                };
            }
        }
    }
}