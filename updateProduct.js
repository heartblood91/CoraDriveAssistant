module.exports.add = function (req, res, next) {
  return res.status(200).send("Add Product");
};

module.exports.delete = function (req, res, next) {
  return res.status(200).send("Delete Product");
};
