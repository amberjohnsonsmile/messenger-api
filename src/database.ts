import { Message, PrismaClient } from '@prisma/client'

export default class Database {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  public async getReceivedMessagesFromDb(
    recipient: string,
    sender: string | undefined,
    range: number
  ) {
    let lookbackDate: Date = new Date()
    lookbackDate.setDate(lookbackDate.getDate() - range)

    if (sender) {
      return await this.prisma.message.findMany({
        where: {
          recipient: { equals: recipient },
          // Filter by sender
          sender: { equals: sender },
          created: { gte: lookbackDate }
        },
        orderBy: { created: 'desc' },
        take: 100
      })
    } else {
      return await this.prisma.message.findMany({
        where: {
          // Retrieve from all senders
          recipient: { equals: recipient },
          created: { gte: lookbackDate }
        },
        orderBy: { created: 'desc' },
        take: 100
      })
    }
  }

  public async getConversationFromDb(
    recipient: string,
    sender: string,
    range: number
  ) {
    let lookbackDate: Date = new Date()
    lookbackDate.setDate(lookbackDate.getDate() - range)

    return await this.prisma.message.findMany({
      where: {
        OR: [
          // Return all messages between the two users
          {
            recipient: { equals: recipient },
            sender: { equals: sender }
          },
          {
            recipient: { equals: sender },
            sender: { equals: recipient }
          }
        ],
        // Must be within the defined range
        created: { gte: lookbackDate }
      },
      // Order by newest first
      orderBy: { created: 'desc' },
      // Limit to 100 items
      take: 100
    })
  }

  public async saveMessageToDb(message: Message) {
    await this.prisma.message.create({
      data: {
        sender: message.sender,
        recipient: message.recipient,
        content: message.content
      }
    })
  }

  public async updateReadStatusInDb(messageId: number, readStatus: boolean) {
    const res = await this.prisma.message.update({
      where: { id: messageId },
      // Mark the status as read, or change it back to unread
      data: { read: readStatus }
    })
    console.dir(res)
    return res
  }
}
