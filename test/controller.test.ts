import Controller from '../src/controller'
import Database from '../src/database'
import { Message } from '@prisma/client'

jest.mock('../src/database')

describe('controller', () => {
  const controller: Controller = new Controller()

  it('calls Database constructor', () => {
    expect(Database).toHaveBeenCalled()
  })

  describe('getReceivedMessages', () => {
    it('retrieves messages for a particular user', async () => {
      const messages: Message[] = mockMessages()
      Database.prototype.getReceivedMessagesFromDb = jest
        .fn()
        .mockImplementation(() => messages)
      const controllerWithMessages: Controller = new Controller()

      const req = mockGetReq()
      const res = mockRes()

      await controllerWithMessages.getReceivedMessages(req, res)
      expect(res.status).toBeCalledWith(200)
      expect(res.status().json).toBeCalledWith({
        recipient: 'porkchop',
        messages: messages
      })
    })

    it('returns an error message when db call fails', async () => {
      Database.prototype.getReceivedMessagesFromDb = jest
        .fn()
        .mockImplementation(() => {
          throw new Error()
        })
      const controllerWithError: Controller = new Controller()

      const req = mockGetReq()
      const res = mockRes()

      await controllerWithError.getReceivedMessages(req, res)
      expect(res.status).toBeCalledWith(500)
      expect(res.status().json).toBeCalledWith({
        recipient: 'porkchop',
        error: 'unable to get messages'
      })
    })
  })

  describe('getConversation', () => {
    it('retrieves a conversation', async () => {
      const messages: Message[] = mockMessages()
      Database.prototype.getConversationFromDb = jest
        .fn()
        .mockImplementation(() => messages)
      const controllerWithMessages: Controller = new Controller()

      const req = mockGetReq()
      const res = mockRes()

      await controllerWithMessages.getConversation(req, res)
      expect(res.status).toBeCalledWith(200)
      expect(res.status().json).toBeCalledWith({
        recipient: 'porkchop',
        sender: 'rupaul',
        messages: messages
      })
    })

    it('returns an error message when db call fails', async () => {
      Database.prototype.getConversationFromDb = jest
        .fn()
        .mockImplementation(() => {
          throw new Error()
        })
      const controllerWithError: Controller = new Controller()

      const req = mockGetReq()
      const res = mockRes()

      await controllerWithError.getConversation(req, res)
      expect(res.status).toBeCalledWith(500)
      expect(res.status().json).toBeCalledWith({
        recipient: 'porkchop',
        sender: 'rupaul',
        error: 'unable to get messages'
      })
    })
  })

  describe('sendMessage', () => {
    it('sends a message from one user to another', async () => {
      const req = mockPostReq()
      const res = mockRes()

      await controller.sendMessage(req, res)
      expect(res.status).toBeCalledWith(201)
      expect(res.status().json).toBeCalledWith({
        success: true,
        message: req.body
      })
    })

    it('returns an error message when db call fails', async () => {
      Database.prototype.saveMessageToDb = jest.fn().mockImplementation(() => {
        throw new Error()
      })
      const controllerWithError: Controller = new Controller()

      const req = mockPostReq()
      const res = mockRes()

      await controllerWithError.sendMessage(req, res)
      expect(res.status).toBeCalledWith(500)
      expect(res.status().json).toBeCalledWith({
        error: 'unable to send message',
        message: req.body
      })
    })
  })

  describe('markMessageRead', () => {
    it('updates a message to read', async () => {
      const req = mockPutReq()
      const res = mockRes()

      await controller.markMessageRead(req, res)
      expect(res.status).toBeCalledWith(200)
      expect(res.status().json).toBeCalledWith({
        success: true,
        data: req.body
      })
    })

    it('provides a specific error message for records not found in the db', async () => {
      Database.prototype.updateReadStatusInDb = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('Record to update not found.')
        })
      const controllerWithError: Controller = new Controller()

      const req = mockPutReq()
      const res = mockRes()

      await controllerWithError.markMessageRead(req, res)
      expect(res.status).toBeCalledWith(404)
      expect(res.status().json).toBeCalledWith({
        error: 'could not find message in the database',
        data: req.body
      })
    })

    it('provides general error message for any other error', async () => {
      Database.prototype.updateReadStatusInDb = jest
        .fn()
        .mockImplementation(() => {
          throw new Error()
        })
      const controllerWithError: Controller = new Controller()

      const req = mockPutReq()
      const res = mockRes()

      await controllerWithError.markMessageRead(req, res)
      expect(res.status).toBeCalledWith(500)
      expect(res.status().json).toBeCalledWith({
        error: "unable to update 'read' status on message",
        data: req.body
      })
    })
  })
})

function mockGetReq(): any {
  return {
    query: {
      recipient: 'porkchop',
      sender: 'rupaul'
    }
  }
}

function mockRes(): any {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  }
}

function mockPostReq(): any {
  return {
    body: {
      sender: 'rupaul',
      recipient: 'porkchop',
      content: 'Hey there, Porkchop!'
    }
  }
}

function mockPutReq(): any {
  return {
    body: {
      messageId: 92,
      read: true
    }
  }
}

function mockMessages(): Message[] {
  return [
    {
      id: 49,
      sender: 'bianca',
      recipient: 'porkchop',
      content: 'Not today, Satan! Not today.',
      read: false,
      created: new Date()
    },
    {
      id: 47,
      sender: 'jinkx',
      recipient: 'porkchop',
      content: "Just remember, it's all water off a duck's back.",
      read: true,
      created: new Date()
    }
  ]
}
