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
const Gallery = use('App/Models/Gallery')
const Picture = use('App/Models/Picture')

Route.get('/', async ({ request }) => {
  let cache = await Redis.get('response')

  if (cache) {
    cache = JSON.parse(cache)
    cache._fromCache = true
    return cache
  }

  const response = {
    ip: request.ip(),
    ips: request.ips(),
    file_exists: await Drive.exists('vvv.jpg') ? 'cool' : 'fack',
    greeting: 'Hello world in JSON',
    migrations_ran: await Database.select('*').from('adonis_schema'),
    env: process.env
  }

  await Redis.setex('response', 3, JSON.stringify(response))
  return response
})

Route.get('/galleries', async () => {
  return await Gallery.query()
    .with('pictures')
    .fetch()
})

Route.post('/galleries', async ({ request }) => {
  const title = request.input('title', 'default title')
  const gallery = new Gallery
  gallery.title = title
  await gallery.save()

  return {
    location: {
      url: '/upload/gallery/' + gallery.id,
      method: 'post'
    }
  }
})

Route.post('/upload/gallery/:id', async ({ request, params, response }) => {
  let filePath
  request.multipart.file('picture', {
    types: ['image'],
    size: '8mb'
  }, async (file) => { // should be leveraged to a lambda func
      // validate
      // generate resize & thumbnails
      // check sha256 and store it as Picture.checksum
      filePath = 'gallery/' + params.id + '/' + Date.now() + '.' + file.subtype
      await Drive.put(filePath, file.stream)
    })

  await request.multipart.process()

  const pic = new Picture
  pic.gallery_id = params.id
  pic.bucket = Drive._config.disks.s3.bucket
  pic.path = filePath
  await pic.save()

  response.send({
    data: pic
  })

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
