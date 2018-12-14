import { TransliterationProvider } from "./transliteration-provider";
import { ApiClient } from "./api-client";
import * as getCaretCoordinates from "textarea-caret";
import { Helpers } from "./helpers";

export class SuggestionBox {
  transliterationProvider: TransliterationProvider;
  suggestionInputBox: HTMLInputElement;
  suggestionWrapper: HTMLElement;
  suggestionsList: HTMLElement;
  loadingBox: HTMLElement;

  initialSelectionStart: number;
  initialSelectionEnd: number;

  suggestions: string[];
  selectedSuggestion: number;

  constructor(transliterationProvider: TransliterationProvider) {
    this.transliterationProvider = transliterationProvider;

    // Append the suggestion box to body
    this.renderInitial();
  }

  // Appends the suggestion box to the body
  renderInitial() {
    this.suggestionInputBox = document.createElement("input");
    this.suggestionWrapper = document.createElement("div");
    this.suggestionsList = document.createElement("div");

    this.suggestionInputBox.className = "suggestion-input";
    this.suggestionWrapper.className = "ks-input-suggestions";
    this.suggestionsList.className = "suggestion-list";

    // Render loading box
    this.loadingBox = document.createElement("div");
    this.loadingBox.classList.add("loading-box");
    this.loadingBox.classList.add("hidden");
    let ellipsis = document.createElement("div");
    ellipsis.classList.add("lds-ellipsis");
    for(let i = 0; i <=3; i++){
        var newDiv = document.createElement("div");
        ellipsis.appendChild(newDiv);
    }
    this.loadingBox.appendChild(ellipsis);
    
    
    this.suggestionWrapper.appendChild(this.suggestionInputBox);
    this.suggestionWrapper.appendChild(this.suggestionsList);
    this.suggestionWrapper.appendChild(this.loadingBox);
    document.body.appendChild(this.suggestionWrapper);

    // Run post init tasks
    this.postInit();
  }

  // Tasks that will run once everything is initiated
  postInit() {
    // Register event handler on the new input
    this.suggestionInputBox.addEventListener("keyup", this.handleKeyUp());
    this.updateDisplayState();
  }

  // Handle events when the text updates
  handleKeyUp() {
    return async function(event: KeyboardEvent) {
        switch(event.key){
            case " ":
                this.endSuggestions();
                break;
            case "Enter":
                this.endSuggestions();
                break;
            case "ArrowDown":
                (this.selectedSuggestion < 5 ? this.selectedSuggestion++ : this.selectedSuggestion = 0);
                this.renderSuggestions();
                break;
            case "ArrowUp":
                (this.selectedSuggestion > 0 ? this.selectedSuggestion-- : this.selectedSuggestion = 5);
                this.renderSuggestions();                
                break;
            default:
                this.updateDisplayState();
                this.loadingBox.classList.remove("hidden");
                this.updateSuggestions([this.suggestionInputBox.value]);
                let apiResults = await this.transliterationProvider.apiClient.getSuggestions(this.suggestionInputBox.value);
                
                // Make sure to use the data from the latest api call only
                // This prevents random data on slow internet connections
                if(apiResults && apiResults.apiCallDate === this.transliterationProvider.lastApiUpdate){
                    this.updateSuggestions(apiResults.values);
                    this.loadingBox.classList.add("hidden");
                }
                break;
        }


    }.bind(this);
  }

  // This will end the suggestions and update the main input area
  endSuggestions(){
      if(this.suggestions && this.suggestions.length > 0){
          // Get the currently selected suggestion
          let currentSuggestion = this.suggestions[this.selectedSuggestion].trim();
      
          // Clear the suggestion data
          this.suggestionInputBox.value = "";
          this.suggestions = [];
          this.suggestionsList.innerHTML = "";
      
          // Update display state
          this.updateDisplayState();
          
          // Get the current input value
          let currentInputvalue = this.transliterationProvider.inputArea.value;
      
          // Split the selected part up into first and second so we can append the suggestion
          // text right in the middle.
          let firstPart = currentInputvalue.substring(0, this.initialSelectionStart);
          let lastPart = currentInputvalue.substring(this.initialSelectionEnd);
          
          // Remove whitespace from the second part, we will add it outself
          lastPart = lastPart.trim();
      
          // Append text and put it on input
          this.transliterationProvider.inputArea.value = firstPart +
              currentSuggestion.replace(" ", "") + " " + lastPart;

          // Move the caret to the old position
          this.transliterationProvider.inputArea.selectionEnd = this.initialSelectionStart + currentSuggestion.length + 1;
      }
  }

  // Update the suggestions array and call the render function
  updateSuggestions(suggestions: string[]) {
    this.suggestions = suggestions;
    this.selectedSuggestion = 0;

    this.renderSuggestions();
  }

  // Render the suggestions on the screen
  renderSuggestions() {
    // Clear the div before adding new
    this.suggestionsList.innerHTML = "";

    if (this.suggestions) {
      // Append all the suggestions to the div
      this.suggestions.forEach((suggestion, index) => {
        let suggestionDiv = document.createElement("div");
        suggestionDiv.innerHTML = suggestion;
        suggestionDiv.id = "suggestion" + index;
        suggestionDiv.classList.add("suggestion-div")

        // Register on click handlers to select the suggestion
        suggestionDiv.addEventListener("click", () => {
            this.selectSuggestion(index);
        })

        // Set status to active if the selected suggestion matches the index
        if(index === this.selectedSuggestion){
            suggestionDiv.classList.add("active");
        }

        this.suggestionsList.appendChild(suggestionDiv);
      });
    }
  }

  // Selects the suggestion based on index
  selectSuggestion(index: number) {
    if(index >= 0 && index <= 5){
        this.selectedSuggestion = index;
        this.endSuggestions();
    }
  }

  // Starts the suggestions based on initial text typed on other input
  startSuggestions(text: string) {
    // Update input box value
    this.suggestionInputBox.value = text;

    // Get input area's coordinates an calculate care position
    const inputBox = this.transliterationProvider.inputArea;
    var coords = getCaretCoordinates(inputBox, inputBox.selectionStart);
    var mainInputCoordinates = this.transliterationProvider.inputArea.getBoundingClientRect();

    // Save the initial selection state of the input
    this.initialSelectionStart = this.transliterationProvider.inputArea.selectionStart;
    this.initialSelectionEnd = this.transliterationProvider.inputArea.selectionEnd;

    // Change the coordinates so that the suggestions box doesnt overflow outside of the
    // main window.
    var topCoords = (coords.top+10+mainInputCoordinates.top);
    var leftCoords = (coords.left+10+mainInputCoordinates.left);
    if(topCoords > (window.innerHeight - 250)){
        topCoords = (window.innerHeight - 250);
    }
    if(leftCoords > (window.innerWidth - 150)){
        leftCoords = (window.innerWidth - 150);
    }

    // Move the suggestion wrapper to the coordinates of the caret in screen
    this.suggestionWrapper.style["position"] = "fixed";
    this.suggestionWrapper.style["top"] = topCoords + "px";
    this.suggestionWrapper.style["left"] = leftCoords + "px";


    this.updateDisplayState();
  }

  // Show or hide the suggestion box based on the content of the input
  updateDisplayState() {
    if (
      this.suggestionInputBox.value === undefined ||
      this.suggestionInputBox.value === ""
    ) {
      this.suggestionWrapper.classList.add("hidden");
      this.transliterationProvider.inputArea.focus();
    } else {
      this.suggestionWrapper.classList.remove("hidden");
      this.suggestionInputBox.focus();
    }
  }
}
