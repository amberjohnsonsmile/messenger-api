import Database from './database'
import { Request, Response } from 'express'
import { Message } from '@prisma/client'
import { validationResult } from 'express-validator'

export default class Controller {
  private database: Database

  constructor() {
    this.database = new Database()
  }

  public async getConversation(req: Request, res: Response): Promise<Response> {
    if (!validationResult(req).isEmpty()) return this.invalidRes(req, res)

    const recipient = req.query.recipient
    const sender = req.query.sender
    // The range param is optional, default is 30 days
    const range = req.query.range ? req.query.range : 30

    try {
      const messages: Message[] = await this.database.getConversationFromDb(
        // @ts-ignore, the validator already checked these are the correct types
        recipient,
        sender,
        range
      )

      return res.status(200).json({
        recipient: recipient,
        sender: sender,
        messages: messages
      })
    } catch (error) {
      console.log(`Unable to get messages due to error:\n${error}`)

      return res.status(500).json({
        recipient: recipient,
        sender: sender,
        error: 'unable to get messages'
      })
    }
  }

  public async getReceivedMessages(
    req: Request,
    res: Response
  ): Promise<Response> {
    if (!validationResult(req).isEmpty()) return this.invalidRes(req, res)

    const recipient = req.query.recipient
    // The sender param is optional
    const sender = req.query.sender
    // The range param is also optional, default is 30 days
    const range = req.query.range ? req.query.range : 30

    try {
      const messages: Message[] = await this.database.getReceivedMessagesFromDb(
        // @ts-ignore, the validator already checked these are the correct types
        recipient,
        sender,
        range
      )

      return res.status(200).json({
        recipient: recipient,
        messages: messages
      })
    } catch (error) {
      console.log(`Unable to get messages due to error:\n${error}`)

      return res.status(500).json({
        recipient: recipient,
        error: 'unable to get messages'
      })
    }
  }

  public async sendMessage(req: Request, res: Response): Promise<Response> {
    if (!validationResult(req).isEmpty()) return this.invalidRes(req, res)

    try {
      await this.database.saveMessageToDb(req.body)
      return res.status(201).json({
        success: true,
        message: req.body
      })
    } catch (error) {
      console.log(`Unable to send message due to error:\n${error}`)

      return res.status(500).json({
        error: 'unable to send message',
        message: req.body
      })
    }
  }

  public async markMessageRead(req: Request, res: Response): Promise<Response> {
    if (!validationResult(req).isEmpty()) return this.invalidRes(req, res)

    const messageId = req.body.messageId
    const readStatus = req.body.read

    try {
      await this.database.updateReadStatusInDb(messageId, readStatus)
      return res.status(200).json({
        success: true,
        data: req.body
      })
    } catch (error) {
      console.log(
        `Unable to update 'read' status on message due to error:\n${error}`
      )

      // Special handling for record not found
      if (error instanceof Error) {
        if (
          error.message.toLowerCase().includes('record to update not found')
        ) {
          return res.status(404).json({
            error: 'could not find message in the database',
            data: req.body
          })
        }
      }

      // More general error response
      return res.status(500).json({
        error: "unable to update 'read' status on message",
        data: req.body
      })
    }
  }

  private invalidRes(req: Request, res: Response): Response {
    return res.status(400).json({
      errors: validationResult(req).array()
    })
  }
}
