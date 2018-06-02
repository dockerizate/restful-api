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
const Redis = use('Redis')
const Drive = use('Drive')
const Helpers = use('Helpers')

Route.get('/', async ({ request }) => {
  let cache = await Redis.get('response')

  if (cache) {
    cache = JSON.parse(cache)
    cache._fromCache = true
    return cache
  }

  const response = {
    file_exists: await Drive.exists('vvv.jpg') ? 'cool' : 'fack',
    greeting: 'Hello world in JSON',
    migrations_ran: await Database.select('*').from('adonis_schema'),
    env: process.env
  }

  await Redis.setex('response', 3, JSON.stringify(response))
  return response
})

Route.post('/upload', async ({ request }) => {
  console.log('upload')
  request.multipart.file('picture', {
    types: ['image'],
    size: '8mb'
  }, async (file) => {
      console.log('processing', file.clientName)
      await Drive.put(file.clientName, file.stream)
    })

  await request.multipart.process()

  return 'ok'

  // const profilePics = request.file('profile_pics', {
  //   types: ['image'],
  //   size: '2mb'
  // })

  // await profilePics.moveAll(Helpers.tmpPath('uploads'))

  // if (!profilePics.movedAll()) {
  //   return profilePics.errors()
  // }

  // return 'File moved'
})
