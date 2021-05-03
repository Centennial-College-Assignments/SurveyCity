const mongoose = require("mongoose");

const SurveyQuestion = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["input", "textarea", "radio", "checkbox"],
    required: true,
  },
  options: [String], // Only used for radio or checkbox types
  includeOther: Boolean, // Only used for radio or checkbox types
});

module.exports = mongoose.model("SurveyQuestion", SurveyQuestion);
