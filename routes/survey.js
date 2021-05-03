/*
 * survey.js
 * SurveyCity
 * 2020-11-09
 */

const express = require("express");
const router = express.Router();

const Survey = require("../models/survey");
const SurveyQuestion = require("../models/survey-question");
const SurveyResponse = require("../models/survey-response");

router.get("/", async function (req, res) {
  const surveys = await Survey.find({
    owner: req.user._id,
  }).sort({ title: 1 }).exec();

  res.render("survey/list", {
    title: "Survey List",
    displayName: req.user?.fullName,
    surveys,
  });
});

router.get("/add", function (req, res) {
  res.render("survey/edit", {
    title: "New Survey - SurveyCity",
    displayName: req.user?.fullName,
    survey: new Survey(),
    isNew: true,
    responseCount: 0,
  });
});

router.get("/:id", async function (req, res) {
  const { id } = req.params;

  try {
    const survey = await Survey.findOne({ _id: id, owner: req.user._id }).populate("questions").exec();
    const responseCount = await SurveyResponse.count({ survey: survey._id }).exec();

    res.render("survey/edit", {
      title: "Edit Survey - SurveyCity",
      displayName: req.user?.fullName,
      survey,
      isNew: false,
      responseCount,
    });
  } catch (e) {
    throw e;
  }
});

router.post("/:id", async function (req, res) {
  const { id } = req.params;

  const questions = mapBodyToSurveyQuestions(req.body);

  if (id === "add") {
    const quests = await SurveyQuestion.insertMany(questions);
    const survey = await Survey.create({
      owner: req.user._id,
      title: req.body.title,
      description: req.body.description,
      questions: quests.map(q => q._id),
    });

    req.flash("success", "Survey saved successfully!");
    return res.redirect("/survey/" + survey._id);
  }

  try {
    const survey = await Survey.findOne({ _id: id, owner: req.user._id } ).exec();
    await SurveyResponse.remove({ survey: survey._id }).exec(); // Invalidate responses
    await SurveyQuestion.remove({ _id: { $in: survey.questions } }).exec();
    const quests = await SurveyQuestion.insertMany(questions);
    await Survey.updateOne({ _id: id }, {
      _id: id,
      title: req.body.title,
      description: req.body.description,
      questions: quests.map(q => q._id),
    }).exec();

    req.flash("success", "Survey saved successfully!");
    res.redirect("/survey/" + id);
  } catch (e) {
    throw e;
  }
});

router.get("/:id/delete", async function (req, res) {
  const { id } = req.params;

  try {
    const survey = await Survey.findOne({ _id: id, owner: req.user._id }).exec();
    await SurveyQuestion.remove({ _id: { $in: survey.questions } }).exec();
    await Survey.remove({ _id: id }).exec();

    req.flash("success", "Survey deleted successfully.");
    res.redirect("/survey");
  } catch (e) {
    throw e;
  }
});

module.exports = router;

function mapBodyToSurveyQuestions(body) {
  const questions = [];

  for (let i = 0; i < body.question_title.length; i++) {
    if (!body.question_title[i].trim())
      continue;

    questions.push(new SurveyQuestion({
      question: body.question_title[i].trim(),
      type: body.question_type[i],
      options: body.question_options[i].split(";").map(x => x.trim()),
    }));
  }

  return questions;
}
