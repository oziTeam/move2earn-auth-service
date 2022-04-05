const Joi = require('joi');

const createUser = {
  body: Joi.object().keys({
    uid: Joi.string().required(),
    // email: Joi.string().required().email(),
  }),
};

module.exports = {
  createUser,
};
