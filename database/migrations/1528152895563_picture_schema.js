'use strict'

const Schema = use('Schema')

class PictureSchema extends Schema {
  up () {
    this.create('pictures', (table) => {
      table.increments()
      table.integer('gallery_id').unsigned().notNullable().index()
      table.foreign('gallery_id').references('galleries.id').onDelete('CASCADE')
      table.string('bucket', 50)
      table.string('path')
      table.timestamps()
    })
  }

  down () {
    this.drop('pictures')
  }
}

module.exports = PictureSchema
