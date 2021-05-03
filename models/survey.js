const mongoose = require("mongoose");
const User = require("./user");
const SurveyQuestion = require("./survey-question");

const Survey = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User.modelName,
    // required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: SurveyQuestion.modelName,
  }]
});

Survey.index({ owner: 1 });

module.exports = mongoose.model("Survey", Survey);
