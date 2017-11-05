import { MessageBot, Player } from '@bhmb/bot'
import { UIExtensionExports } from '@bhmb/ui'

// For Safari 9
if (!Object.entries) {
  Object.entries = (obj: any) => Object.keys(obj).reduce((arr, key) => arr.concat([key, obj[key]]), [] as any[])
}

import html from './tab.html'

MessageBot.registerExtension('bibliofile/manpages', ex => {
  const getPages = () => ex.storage.get<{[key: string]: string}>('pages', {})
  const getCommand = () => ex.storage.get('command', '/?').toLocaleUpperCase()

  function listener({message, player}: {player: Player, message: string}) {
    message = message.trim().toLocaleUpperCase()
    let command = getCommand()
    let pages = getPages()
    if (message == command) {
      // Display listing of all pages
      let toSend = Object.keys(pages).reduce((toSend, key) => {
        return toSend + `\n${command} ${key}`
      }, 'Topics:')

      ex.bot.send(toSend)
    } else if (message.startsWith(command)) {
      // Display specific page

      let page = pages[message.substr(command.length + 1).toLocaleUpperCase()]
      if (!page) {
        ex.bot.send(`Topic not found. Use ${command} to view all topics.`)
        return
      }

      ex.bot.send(page, { name: player.name })
    }
  }
  ex.world.onMessage.sub(listener)

  ex.remove = () => ex.world.onMessage.unsub(listener)

  // Browser only
  const ui = ex.bot.getExports('ui') as UIExtensionExports | undefined
  if (!ui) return

  const tab = ui.addTab('Man Pages', 'messages')
  tab.innerHTML = html

  const addPage = (name?: string, content?: string) => {
    let template = tab.querySelector('template') as HTMLTemplateElement
    let pagesDiv = tab.querySelector('.pages') as HTMLDivElement
    ui.buildTemplate(template, pagesDiv, [
      { selector: 'input', value: name || '' },
      { selector: 'textarea', value: content || '' }
    ])
  }

  Object.entries(getPages())
    .forEach(([name, content]) => addPage(name, content))

  tab.addEventListener('input', () => {
    // Command
    ex.storage.set('command', (tab.querySelector('input') as HTMLInputElement).value || '/?')
    // Pages
    let pages: {[k: string]: string} = {}
    tab.querySelectorAll('details').forEach(element => {
      let name = (element.querySelector('input') as HTMLInputElement).value
      let content = (element.querySelector('textarea') as HTMLTextAreaElement).value
      if (name) pages[name.toLocaleUpperCase()] = content
    })
    ex.storage.set('pages', pages)
  })

  ;(tab.querySelector('.button') as HTMLButtonElement).addEventListener('click', () => addPage())

  ex.remove = () => {
    ex.world.onMessage.unsub(listener)
    ui.removeTab(tab)
  }
})
