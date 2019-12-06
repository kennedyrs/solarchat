'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MessageSchema extends Schema {
  up() {
    this.create('messages', (table) => {
      table.increments()
      table.integer('defensor_id').unsigned().notNullable()
      table.integer('defensoria_id').unsigned().notNullable()
      table.string('assistido_cpf', 11).notNullable().index()
      table.text('message').notNullable()
      table.integer('sended_by').unsigned().notNullable().comment('0 = gabinete  e 1 = assistido')
      table.datetime('sended_date')
      table.boolean('delivered_defensor').default(false)
      table.boolean('delivered_assistido').default(false)
      table.timestamps()
    })
  }

  down() {
    this.drop('messages')
  }
}

module.exports = MessageSchema
