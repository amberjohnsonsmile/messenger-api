import Controller from './controller'
import express, { Express, Request, Response } from 'express'
import {
  conversationValidator,
  markReadValidator,
  receivedValidator,
  sendValidator
} from './validator'

const router: Express = express()
router.use(express.json())
const controller: Controller = new Controller()

router.get(
  '/received',
  receivedValidator,
  async (req: Request, res: Response): Promise<void> => {
    await controller.getReceivedMessages(req, res)
  }
)

router.get(
  '/conversation',
  conversationValidator,
  async (req: Request, res: Response): Promise<void> => {
    await controller.getConversation(req, res)
  }
)

router.post(
  '/send',
  sendValidator,
  async (req: Request, res: Response): Promise<void> => {
    await controller.sendMessage(req, res)
  }
)

router.put(
  '/mark-read',
  markReadValidator,
  async (req: Request, res: Response): Promise<void> => {
    await controller.markMessageRead(req, res)
  }
)

export default router
