/*
 * edit-survey.js
 * SurveyCity
 * 2020-12-11
 */

 (function () {
  // Because this script is deferred we are guaranteed to execute when DOM has been loaded

  const MULTIPLE_CHOICE_OPTIONS = ["radio", "checkbox"];

  const questionList = document.getElementById("question-list");
  const addButton = document.getElementById("add-question");

  function renumberQuestions() {
    [...questionList.querySelectorAll(".question-header")].forEach((el, i) => {
      el.textContent = `Question ${i + 1}`;
    });
  }

  function addQuestion() {
    const newId = (Date.now() + Math.random()).toString();
    const fragment = document.getElementById("question-template").content.cloneNode(true);

    fragment.querySelector(".question-header").textContent = `Question ${questionList.children.length}`;
    fragment.querySelector(".question-title-label").setAttribute("for", `title-${newId}`);
    fragment.querySelector(".question-title").setAttribute("id", `title-${newId}`);
    fragment.querySelector(".question-type-label").setAttribute("for", `type-${newId}`);
    fragment.querySelector(".question-type").setAttribute("id", `type-${newId}`);

    initializeQuestion(fragment.firstElementChild);

    questionList.appendChild(fragment);
  }

  function removeQuestion(container) {
    questionList.removeChild(container);
    renumberQuestions();
  }

  function addOptionEnterHandler(input) {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        addQuestionOption(input.closest(".question-container"));
      }
    });
  }

  function addQuestionOption(container) {
    const list = container.querySelector(".question-options-list");

    const template = document.createElement("template");
    template.innerHTML = `<li><input type="text" class="form-control question-option mt-1"></li>`;
    list.querySelector(":nth-last-child(2)").after(template.content);

    const input = [...list.querySelectorAll(".question-option")].pop();
    addOptionEnterHandler(input);
    input.focus();
  }

  function handleQuestionOptionsVisibility(type, options) {
    options.style.display =
      MULTIPLE_CHOICE_OPTIONS.includes(type.selectedOptions[0].value) ? "block" : "none";
  }

  function initializeQuestion(container) {
    const remove = container.querySelector(".remove-question");
    remove.addEventListener("click", () => removeQuestion(remove.closest(".question-container")));

    const options = container.querySelector(".question-options-container");
    const type = container.querySelector(".question-type");
    type.addEventListener("change", () => handleQuestionOptionsVisibility(type, options));
    handleQuestionOptionsVisibility(type, options);

    [...container.querySelectorAll(".question-option")].forEach(el => addOptionEnterHandler(el));

    container.querySelector(".question-add-option").addEventListener("click", e => {
      e.preventDefault();
      addQuestionOption(container);
    });
  }

  function parseQuestionOptions() {
    [...questionList.querySelectorAll(".question-options-container")].forEach(el => {
      console.log([...el.querySelectorAll(".question-option")]);
      el.querySelector(".question-options").value =
        [...el.querySelectorAll(".question-option")]
          .map(el => el.value)
          .filter(opt => !!opt.trim())
          .join(";");
    });
  }

  function init() {
    [...questionList.querySelectorAll(".question-container")].forEach(el => initializeQuestion(el));
    addButton.addEventListener("click", () => addQuestion());

    document.querySelector(".form").addEventListener("submit", () => parseQuestionOptions());
  }

  init();
})();
