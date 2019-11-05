'use strict'

const { validate } = use('Validator')
const Message = use('App/Models/Message')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with messages
 */
class MessageController {

  async all({ params, response }){
    const messages = await Message
      .query()
      .where('defensor_id', params.defensorID)
      .where('assistido_cpf', params.cpf)
      .orderBy('sended_date', 'desc')
      .fetch()

    return messages
  }

  async show({ params, response }){

    const { defensorID, cpf, sended_by } = params

    if(sended_by === '0'){
      const messages = await Message
        .query()
        .where('delivered_defensor', false)
        .where('defensor_id', defensorID)
        .where('assistido_cpf', cpf)
        .fetch()

      await Message
        .query()
        .where('delivered_defensor', false)
        .where('defensor_id', defensorID)
        .where('assistido_cpf', cpf)
        .update({ delivered_defensor: true })

      return messages
    }

    if (sended_by === '1') {
      const messages = await Message
        .query()
        .where('delivered_assistido', false)
        .where('defensor_id', defensorID)
        .where('assistido_cpf', cpf)
        .fetch()

      await Message
        .query()
        .where('delivered_assistido', false)
        .where('defensor_id', defensorID)
        .where('assistido_cpf', cpf)
        .update({delivered_assistido: true})

      return messages
    }



    return response.status(500).json({ error: 'Internal Error.'})
  }

  async store({ params, request, response }){

    const data = request.only(["message", "sended_by", "sended_date"])

    const rules = {
      message: 'required|min:1',
      sended_by: 'required|integer',
      sended_date: 'required'
    }

    const validation = await validate(data, rules)

    if(validation.fails()) {
      return response.status(416).send(validation.messages())
    }

    if(data.sended_by === 0){
      data.delivered_defensor = true
    }

    if (data.sended_by === 1) {
      data.delivered_assistido = true
    }

    const message = await Message.create(
      { ...data, defensor_id: params.defensorID, assistido_cpf: params.cpf }
    )

    return response.status(201).json({ success: 'Message received.'})
  }
}

module.exports = MessageController
