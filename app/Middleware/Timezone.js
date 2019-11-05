'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Timezone {
  async handle({ timezone }, next) {
    timezone.activate("America/Manaus");
    await next();
  }
}

module.exports = Timezone
