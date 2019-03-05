const Object = require('../models/object/Object');
const {
  createObjectAttribute,
  updateObjectAttribute,
} = require('../helpers/objects');

function load(req, res, next, id) {
  Object.findById(id, { include: [Object.withAttributes] }).then((object) => {
    if (!object) {
      return res.status(404).json({ error: 'Object not found' });
    }

    req.dbObject = object;
    return next();
  }).catch((e) => {
    res.status(500).json({ error: e.message });
  });
}

function get(req, res) {
  return res.status(200).json(req.dbObject);
}

function create(req, res) {
  Object.create({
    name: req.body.name,
    description: req.body.description,
    graphic_id: req.body.graphic_id,
    type_id: req.body.type_id,
  }).then(async (newObject) => {
    if (req.body.attributes) {
      req.body.attributes.map(createObjectAttribute(newObject, res));
    }

    newObject = await Object.findById(newObject.id);
    res.status(201).json(newObject);
  }).catch((e) => {
    res.status(500).json({ error: e.message });
  });
}

function update(req, res) {
  req.dbObject.update(req.body).then(async (object) => {
    if (req.body.attributes) {
      req.body.attributes.map(updateObjectAttribute(object, res));
    }

    object = await Object.findById(object.id);
    res.sendStatus(201).json(object);
  }).catch((e) => {
    res.status(500).json({ error: e.message });
  });
}

function list(req, res) {
  const { offset = 0, limit = 50 } = req.query;
  Object.findAll({
    offset: offset,
    limit: limit,
    include: [Object.withAttributes],
  }).then((objects) => {
    res.status(200).json(objects);
  }).catch((e) => {
    res.status(500).json({ error: e.message });
  });
}

async function remove(req, res) {
  await req.dbObject.destroy();
  res.sendStatus(204);
}

module.exports = {
  load, get, create, update, list, remove,
};
