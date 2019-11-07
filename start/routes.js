'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Try Hack me!' }
})

Route.group(() => {
  Route.get('messages/:defensorID/:defensoriaID/:cpf/all', 'MessageController.all')
  Route.get('messages/:defensorID/:defensoriaID/:cpf/:sended_by', 'MessageController.show')
  Route.post('messages/:defensorID/:defensoriaID/:cpf', 'MessageController.store')

}).prefix('api/v1')
