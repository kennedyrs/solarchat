'use strict'

const Database = use('Database')

const { validate } = use('Validator')
const Message = use('App/Models/Message')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with messages
 */
class MessageController {

  async all({ params, response }) {
    const messages = await Message
      .query()
      .where('defensor_id', params.defensorID)
      .where('defensoria_id', params.defensoriaID)
      .where('assistido_cpf', params.cpf)
      .orderBy('id')
      .fetch()

    if (!messages.rows.length > 0) {
      return response.status(404).json({ Message: 'No messages found.' })
    }
    return messages
  }

  async show({ params, response }) {

    const { defensorID, defensoriaID, cpf, sended_by } = params

    if (sended_by == '0') {
      const messages = await Message
        .query()
        .where('delivered_defensor', false)
        .where('defensor_id', defensorID)
        .where('defensoria_id', defensoriaID)
        .where('assistido_cpf', cpf)
        .orderBy('id')
        .fetch()

      if (!messages.rows.length > 0) {
        return response.status(404).json([])
      }

      await Message
        .query()
        .where('delivered_defensor', false)
        .where('defensor_id', defensorID)
        .where('defensoria_id', defensoriaID)
        .where('assistido_cpf', cpf)
        .update({ delivered_defensor: true })

      return messages
    }

    if (sended_by == '1') {
      const messages = await Message
        .query()
        .where('delivered_assistido', false)
        .where('defensor_id', defensorID)
        .where('defensoria_id', defensoriaID)
        .where('assistido_cpf', cpf)
        .orderBy('id')
        .fetch()


      if (!messages.rows.length > 0) {
        return response.status(404).json([])
      }

      await Message
        .query()
        .where('delivered_assistido', false)
        .where('defensor_id', defensorID)
        .where('defensoria_id', defensoriaID)
        .where('assistido_cpf', cpf)
        .update({ delivered_assistido: true })

      return messages
    }



    return response.status(500).json({ error: 'Internal Error.' })
  }

  async store({ params, request, response }) {

    const data = request.only(["message", "sended_by", "sended_date"])

    const rules = {
      message: 'required|min:1',
      sended_by: 'required|integer',
      sended_date: 'required'
    }

    const validation = await validate(data, rules)

    if (validation.fails()) {
      return response.status(416).send(validation.messages())
    }

    if (data.sended_by === 0 || data.sended_by === '0') {
      data.delivered_defensor = true
    }

    if (data.sended_by === 1 || data.sended_by === '1') {
      data.delivered_assistido = true
    }

    const message = await Message.create(
      { ...data, defensor_id: params.defensorID, defensoria_id: params.defensoriaID, assistido_cpf: params.cpf }
    )

    return response.status(201).json({ success: 'Message received.', message: message })
  }

  async total({ params, response }) {

    const { cpf, sended_by } = params

    if (sended_by == '0') {
      const messages = await Database
        .raw(`SELECT DISTINCT
          m0.defensor_id,
          m0.defensoria_id,
          m0.assistido_cpf,
          (select COUNT(1) from messages m1 where m1.defensor_id = m0.defensor_id and m1.defensoria_id = m0.defensoria_id AND m1.assistido_cpf = m0.assistido_cpf AND m1.delivered_defensor = false)  as total
        FROM
          messages m0
        WHERE
          m0.assistido_cpf = ?`,
          [cpf])

      return response.status(200).json(messages.rows)
    }

    if (sended_by == '1') {
      const messages = await Database
        .raw(`SELECT DISTINCT
            m0.defensor_id,
            m0.defensoria_id,
            (select COUNT(1) from messages m1 where m1.defensor_id = m0.defensor_id and m1.defensoria_id = m0.defensoria_id AND m1.assistido_cpf = m0.assistido_cpf AND m1.delivered_assistido = false)  as total
          FROM
            messages m0
          WHERE
            m0.assistido_cpf = ?`,
          [cpf])

      return response.status(200).json(messages.rows)
    }
  }

  async rooms({ params, response }) {
    const { defensor: defensor_id } = params

    const rooms = await Database
      .raw(`SELECT
      tb1.*,
      (SELECT MAX(created_at) as max_data
        FROM messages
        WHERE defensor_id = tb1.defensor_id
          AND defensoria_id = tb1.defensoria_id
          AND assistido_cpf = tb1.assistido_cpf) as max_data
    FROM
      (SELECT DISTINCT
        defensor_id,
        defensoria_id,
        assistido_cpf
      FROM
        messages m0
      WHERE
        m0.defensor_id = ?) as tb1`, [defensor_id])

    return response.status(200).json(rooms.rows)
  }

}

module.exports = MessageController
