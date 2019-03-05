const Attribute = require('../models/object/Attribute');
const ObjectAttribute = require('../models/object/ObjectAttribute');

const createObjectAttribute = (object, res) => async (attr) => {
  const { attribute_id, value } = attr;
  try {
    const attribute = await Attribute.findById(attribute_id);

    return await ObjectAttribute.create({
      value,
      object_id: object.object_id,
      attribute_id: attribute.attribute_id,
    });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

const updateObjectAttribute = (object, res) => async (attr) => {
  const { id, value } = attr;
  try {
    const attribute = await Attribute.findById(id);
    const objectAttribute = await ObjectAttribute.find({
      object_id: object.id,
      attribute_id: attribute.id,
    });

    return await objectAttribute.update({ value });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

module.exports = { createObjectAttribute, updateObjectAttribute };
