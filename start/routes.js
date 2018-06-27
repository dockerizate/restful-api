'use strict'

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
    headers: request.headers(),
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

Route.delete('/galleries/:id', async ({ request, response, params }) => {
  const gallery = await Gallery.query()
    .with('pictures').where('id', params.id).first()
  if (!gallery) return response.status(410).send()

  // instance of stupid VanillaSerializer
  const pictures = gallery.getRelated('pictures')

  // if (pictures && pictures.rows) { // individual deletion
  //   pictures.rows.forEach(pic => {
  //     if (await Drive.delete(pic.path)) {
  //       await pic.delete()
  //     }
  //   })
  // }

  const removing = []
  pictures.rows.forEach(pic => removing.push(Drive.delete(pic.path)))

  const removed = await Promise.all(removing)

  if (removed.every(p => p === true)) {
    await gallery.delete()
  }
  else {
    console.log(666, removed)
  }

  return response.status(204).send('ok')
})

Route.post('/upload/gallery/:id', async ({ request, params, response }) => {
  let filePath

  // set the listener
  // (should be leveraged to a lambda func)
  request.multipart.file('picture', {
    types: ['image'],
    // size: '8mb' // not needed because of nginx client_max_body_size 8m
  }, async (file) => {
      const contentType = file.type + '/' + file.subtype
      // validate file (& contentType)
      // generate resize & thumbnails
      // check sha256 and store it as Picture.checksum
      filePath = 'gallery/' + params.id + '/' + Date.now() + '.' + file.subtype
      // const result = await Drive.put
      await Drive.put(filePath, file.stream, {
        ContentType: contentType
      })
      // result.Key not supported yet
    })

  await request.multipart.process() // execute listeners

  const pic = new Picture
  pic.gallery_id = params.id
  pic.bucket = Drive._config.disks.s3.bucket
  pic.path = filePath
  await pic.save()

  response.send({
    data: pic
  })
})
