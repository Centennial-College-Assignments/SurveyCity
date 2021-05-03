# SurveyCity

SurveyCity allows users to create web surveys and spread these to their audience. These surveys can
be used for a variety of purposes, ranging from user research, to UX optimization, to understanding
visit behaviour, getting product feedback, and more. SurveyCity does not limit users to what they
want their surveys to be about and is as open as possible in order to give users the best
experience possible.

## Running SurveyCity

- For development: Run `nodemon`, or `npm run watch-server` if using `dotenv`.
- For production: Run `node bin/www`.

Mongoose defaults to MongoDB running locally. A custom MongoDB URI can be supplied by setting the
`MONGODB_URI` environment variable.
