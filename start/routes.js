'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

const Route = use('Route')
const Database = use('Database')

Route.get('/', async ({ request }) => {
  return {
    greeting: 'Hello world in JSON',
    migrations_ran: await Database.select('*').from('adonis_schema'),
    env: process.env
  }
})
