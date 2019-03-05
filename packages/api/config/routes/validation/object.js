const Joi = require('joi');

module.exports = {

  load: {
    params: {
      objectId: Joi.number().integer().min(1).required(),
    },
  },

  create: {
    body: {
      name: Joi.string().alphanum().min(3).max(90)
        .required(),
      description: Joi.string().alphanum().min(3).max(512)
        .required(),
      graphic_id: Joi.number().integer().required(),
      type_id: Joi.number().integer().required(),
      attributes: Joi.array().items(Joi.object({
        id: Joi.number().integer().min(1).required(),
        value: Joi.string().alphanum().required(),
      })),
    },
  },

  update: {
    body: {
      id: Joi.number().integer().min(1).required(),
      name: Joi.string().alphanum().min(3).max(90)
        .required(),
      description: Joi.string().alphanum().min(3).max(512)
        .required(),
      graphic_id: Joi.number().integer().min(1).required(),
      type_id: Joi.number().integer().min(1).required(),
      attributes: Joi.array().items(Joi.object({
        id: Joi.number().integer().min(1).required(),
        value: Joi.string().alphanum().required(),
      })),
    },
  },

};
