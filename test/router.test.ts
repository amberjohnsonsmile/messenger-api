import router from '../src/router'
import request from 'supertest'

// Keeps us from calling the actual database
jest.mock('../src/database')

describe('router', () => {
  describe('GET /received', () => {
    it('returns 200', async () => {
      const res = await request(router).get('/received?recipient=rupaul')
      expect(res.statusCode).toEqual(200)
    })

    it('returns 400 when params are missing', async () => {
      const res = await request(router).get('/received')
      expect(res.statusCode).toEqual(400)
    })

    // The controller handles 500 responses so they are tested there
  })

  describe('GET /conversation', () => {
    // TODO add tests
    it('returns 200', async () => {})
    it('returns 400 when params are missing', async () => {})
  })

  describe('POST /send', () => {
    it('returns 201', async () => {
      const res = await request(router).post('/send').send({
        sender: 'rupaul',
        recipient: 'porkchop',
        content: 'Hey giiiiirl'
      })
      expect(res.statusCode).toEqual(201)
    })

    it('returns 400 when params are missing', async () => {
      const res = await request(router).post('/send')
      expect(res.statusCode).toEqual(400)
    })
  })

  // TODO add tests
  describe('PUT /mark-read', () => {})
})
