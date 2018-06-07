'use strict'

const Schema = use('Schema')

class GallerySchema extends Schema {
  up () {
    this.create('galleries', (table) => {
      table.increments()
      table.string('title', 70)
      table.timestamps()
    })
  }

  down () {
    this.drop('galleries')
  }
}

module.exports = GallerySchema
