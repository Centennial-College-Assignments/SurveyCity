/*
 * answer.js
 * SurveyCity
 * 2020-11-23
 */

const express = require("express");
const router = express.Router();

const Survey = require("../models/survey");
const SurveyResponse = require("../models/survey-response");

const CHANGED_MESSAGE = "Uh-oh, seems like this survey has been changed while you were filling it in or has been closed. Please try again.";

const findSurveyMiddleware = async (req, res, next) => {
  const { sid } = req.params;

  let survey;
  try {
    survey = await Survey.findById(sid).populate("questions").exec();
  } finally {
    if (!survey)
      return res.render("error", {
        message: "Uh-oh, this survey couldn't be found!",
        error: {},
      });
  }

  req.survey = survey;
  next();
};

const findQuestionMiddleware = async (req, res, next) => {
  const { qid } = req.params;

  if (!req.survey)
    return findSurveyMiddleware(req, res, () => findQuestionMiddleware(req, res, next));

  const question = req.survey.questions.find(q => q._id.toString() === qid);
  if (!question) {
    req.flash("error", CHANGED_MESSAGE);
    return res.redirect(`/answer/${req.survey._id}`);
  }

  req.question = question;
  next();
};

const checkSessionMiddleware = (req, res, next) => {
  if (!req.survey)
    return findSurveyMiddleware(req, res, () => checkSessionMiddleware(req, res, next));

  if (!req.session.surveyResponse || req.session.surveyResponse.surveyId !== req.survey._id.toString())
    return res.redirect(`/answer/${req.survey._id}`);

  next();
}

// Show survey welcome
router.get("/:sid", findSurveyMiddleware, async (req, res) => {
  req.session.surveyResponse = {
    surveyId: req.survey._id.toString(),
    currentQuestionId: req.survey.questions.length === 0 ? null : req.survey.questions[0]._id.toString(),
    answers: [],
  };

  res.render("answer/intro", {
    title: req.survey.title + " - Answer Survey - SurveyCity",
    displayName: req.user?.fullName,
    survey: req.survey,
  });
});

// Show confirmation screen
router.get("/:sid/finish", findSurveyMiddleware, checkSessionMiddleware, function (req, res) {
  if (req.session.surveyResponse.answers.length !== req.survey.questions.length ||
      req.survey.questions.some(q => req.session.surveyResponse.answers.find(a => q._id.toString() === a.questionId) === undefined)) {
    req.flash("error", CHANGED_MESSAGE);
    return res.redirect(`/answer/${req.survey._id}`);
  }

  res.render("answer/finish", {
    title: req.survey.title + " - Answer Survey - SurveyCity",
    displayName: req.user?.fullName,
    survey: req.survey,
  });
});

// Save response
router.post("/:sid/finish", findSurveyMiddleware, checkSessionMiddleware, async function (req, res) {
  const answers = req.session.surveyResponse.answers.map(a => ({
    question: a.questionId.toString(),
    answer: a.answer,
  }));

  await SurveyResponse.create({
    survey: req.survey._id,
    answers,
  });

  delete req.session.surveyResponse;
  req.session.save(() => res.redirect(`/answer/${req.survey._id}/done`));
});

// Show submitted screen
router.get("/:sid/done", findSurveyMiddleware, function (req, res) {
  res.render("answer/done", {
    title: `Thank you - ${req.survey.title} - Answer Survey - SurveyCity`,
    displayName: req.user?.fullName,
    survey: req.survey,
  });
});

// Show question
router.get("/:sid/:qid", findSurveyMiddleware, findQuestionMiddleware, checkSessionMiddleware, function (req, res) {
  const currIdx = req.survey.questions.findIndex(q => q._id.toString() === req.session.surveyResponse.currentQuestionId);
  const answer = req.session.surveyResponse.answers.find(a => a.question === req.question._id.toString())

  res.render("answer/question", {
    title: req.survey.title + " - Answer Survey - SurveyCity",
    displayName: req.user?.fullName,
    survey: req.survey,
    question: req.question,
    currentQuestionId: req.session.surveyResponse.currentQuestionId,
    progress: [currIdx + 1, req.survey.questions.length],
    answer: answer ? answer.answer : undefined,
  });
});

// Save question answer
router.post("/:sid/:qid", findSurveyMiddleware, findQuestionMiddleware, checkSessionMiddleware, function (req, res) {
  let answer = req.body.answer;
  if (Array.isArray(answer))
    answer = answer.join("\0");

  const sRes = req.session.surveyResponse;
  if (sRes.currentQuestionId === req.question._id.toString())
    sRes.answers.push({
      surveyId: req.survey._id.toString(),
      questionId: req.question._id.toString(),
      answer: answer,
    });
  else
    sRes.answers.find(a => a.questionId === req.question._id.toString()).answer = answer;

  const qIdx = req.survey.questions.findIndex(q => q._id.toString() === req.question._id.toString());
  const nextQuestionIdx = qIdx === req.survey.questions.length - 1 ? null : qIdx + 1;
  if (nextQuestionIdx !== null) {
    const currQuestionIdx = req.survey.questions.findIndex(q => q._id.toString() === sRes.currentQuestionId);
    if (currQuestionIdx === qIdx)
      sRes.currentQuestionId = req.survey.questions[nextQuestionIdx]._id.toString();
  }

  req.session.save(err => {
    if (err) {
      req.flash("error", "Uh-oh, something went horribly wrong, sorry about that!");
      return res.redirect(`/answer/${req.survey._id}`);
    }

    if (nextQuestionIdx !== null)
      res.redirect(`/answer/${req.survey._id}/${sRes.currentQuestionId}`);
    else
      res.redirect(`/answer/${req.survey._id}/finish`);
  });
});

module.exports = router;
