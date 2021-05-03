const mongoose = require("mongoose");
const Survey = require("./survey");
const SurveyQuestion = require("./survey-question");

const SurveyQuestionAnswer = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: SurveyQuestion.modelName,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

const SurveyResponse = new mongoose.Schema({
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Survey.modelName,
    required: true,
  },
  answers: {
    type: [SurveyQuestionAnswer],
    required: true,
  },
});

SurveyResponse.index({ survey: 1 });

module.exports = mongoose.model("SurveyResponse", SurveyResponse);
