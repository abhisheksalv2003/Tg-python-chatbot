from telegram.ext import Updater, MessageHandler, Filters

def echo(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text=update.message.text)

def main():
    updater = Updater(token='6952359179:AAFTB0lk6NLlweWLsx6stij5-IC7wehMzvM', use_context=True)
    dispatcher = updater.dispatcher
    echo_handler = MessageHandler(Filters.text & (~Filters.command), echo)
    dispatcher.add_handler(echo_handler)
    updater.start_polling()

if __name__ == '__main__':
    main()
