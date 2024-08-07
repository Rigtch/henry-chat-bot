import { MessageEvent, On } from '@discord-nestjs/core'
import { Injectable, UseGuards } from '@nestjs/common'
import { Collection, type Message } from 'discord.js'

import { ChannelMessagesHistory } from '../decorators'
import {
  TextMessageGuard,
  MessageFromRestrictedChannelGuard,
  MessageFromUserGuard,
} from '../guards'

import { ChatService } from '@modules/chat'
import { splitResponse } from '@modules/chat/helpers'

@Injectable()
export class BotChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @On('messageCreate')
  @UseGuards(
    MessageFromUserGuard,
    MessageFromRestrictedChannelGuard,
    TextMessageGuard
  )
  async onMessageCreate(
    @MessageEvent() message: Message<true>,
    @ChannelMessagesHistory()
    messagesHistory: Collection<string, Message<true>>
  ) {
    await message.channel.sendTyping()

    const response = await this.chatService.call(
      message.content,
      messagesHistory
    )

    if (!response) return

    if (response.length >= 2000) {
      const responseChunks = await splitResponse(response)

      for (const [index, content] of responseChunks.entries()) {
        await (index === 0
          ? message.reply({
              content,
            })
          : message.channel.send({
              content,
            }))
      }
    } else return response
  }
}
