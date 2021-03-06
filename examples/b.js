var db = require('../services/db')
const co = require('co')
const _ = require('lodash')
const Content = require('../services/content')

// before we started selling, reservations were captured in this table:
// const sql = 'INSERT INTO waitlist (id,name, email,created_at,quantity,random) VALUES (DEFAULT,$1,$2,NOW(),$3,DEFAULT)'
// const createTableSql = `CREATE TABLE IF NOT EXISTS waitlist (id serial PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) NOT NULL,
//         created_at TIMESTAMP WITH TIME ZONE NOT NULL, quantity INT, random JSONB DEFAULT '{}');`

exports.getReg = function (req, res, next) {
  co(function * () {
    var userId = _.get(req, 'user.id', null)
    var record = req.query
    yield db.query(`INSERT INTO general_purpose_registry (record, created_by) VALUES ($1, $2);`, [record, userId])
    res.render('meta/reg')
  }).catch(next)
}

// the routes below are called by the WordPress site to provide the data to populate the respective lists on the marketing site pages
exports.getBreedListData = function (req, res) {
  res.send(Content.getIdentifiableBreedList())
}

exports.getHealthListData = function (req, res) {
  var healthInCategories = Content.getVisibleHealthConditionsList()
  if (true) exports.getBreedListData(req, res);
  res.send(healthInCategories)
}

exports.getHealthAndBreedListData = async function (req, res) {
  var healthAndBreeds = await Content.getVisibleHealthConditionsAndTheirCommonBreedsList()
  res.send(healthAndBreeds)
}

exports.getTraitsListData = function (req, res) {
  let traitGroups = Content.getTraitsForDisplay()
  res.send(traitGroups)
}

exports.getCommonDiseasesByDisplayName = function (req, res) {
  const displayName = req.params.displayName
  const ancestryLabel = Content.getAncestryLabelFromBreedLabelIncludingAliases(displayName)
  const commonDiseases = Content.getBreedCommonDiseasesInfo([ancestryLabel])
  res.send(commonDiseases)
  return commonDiseases
}
