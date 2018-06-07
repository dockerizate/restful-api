'use strict'

const Model = use('Model')

class Gallery extends Model {
  pictures () {
    return this.hasMany('App/Models/Picture')
  }
}

module.exports = Gallery
