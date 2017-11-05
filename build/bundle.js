(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@bhmb/bot')) :
	typeof define === 'function' && define.amd ? define(['@bhmb/bot'], factory) :
	(factory(global['@bhmb/bot']));
}(this, (function (bot) { 'use strict';

var html = "<template>\r\n  <details>\r\n    <summary></summary>\r\n    <div class=\"field\">\r\n      <label class=\"label\">Page Name</label>\r\n      <div class=\"control\">\r\n        <input type=\"text\" class=\"input\" data-for=\"name\" />\r\n      </div>\r\n    </div>\r\n    <div class=\"field\">\r\n      <label class=\"label\">Page Contents</label>\r\n      <div class=\"control\">\r\n        <textarea class=\"textarea\" data-for=\"content\"></textarea>\r\n      </div>\r\n    </div>\r\n  </details>\r\n\r\n  <hr>\r\n</template>\r\n\r\n<div id=\"manpages\" class=\"container is-widescreen\">\r\n  <h3 class=\"title\">Man Pages</h3>\r\n\r\n  <span class=\"button is-primary is-pulled-right\">+</span>\r\n  <p>This extension lets you define specific help commands for users. Each page can be accessed by typing the help command (defined\r\n    below) and the page name. Page names should be unique. To remove a page, leave the name blank, it will be removed when you next reload the bot. <span class=\"has-text-danger\">Warning: Server messages can trigger these commands. Don't cause an infinite loop.</span></p>\r\n\r\n  <div class=\"field\">\r\n    <label class=\"label\">Help Command</label>\r\n    <div class=\"control\">\r\n      <input class=\"input\" type=\"text\" placeholder=\"/?\">\r\n    </div>\r\n  </div>\r\n\r\n  <hr>\r\n\r\n  <div class=\"pages\">\r\n    <!-- pages go here -->\r\n  </div>\r\n</div>\r\n";

if (!Object.entries) {
    Object.entries = (obj) => Object.keys(obj).reduce((arr, key) => arr.concat([key, obj[key]]), []);
}
bot.MessageBot.registerExtension('bibliofile/manpages', ex => {
    const getPages = () => ex.storage.get('pages', {});
    const getCommand = () => ex.storage.get('command', '/?').toLocaleUpperCase();
    function listener({ message, player }) {
        message = message.trim().toLocaleUpperCase();
        let command = getCommand();
        let pages = getPages();
        if (message == command) {
            // Display listing of all pages
            let toSend = Object.keys(pages).reduce((toSend, key) => {
                return toSend + `\n${command} ${key}`;
            }, 'Topics:');
            ex.bot.send(toSend);
        }
        else if (message.startsWith(command)) {
            // Display specific page
            let page = pages[message.substr(command.length + 1).toLocaleUpperCase()];
            if (!page) {
                ex.bot.send(`Topic not found. Use ${command} to view all topics.`);
                return;
            }
            ex.bot.send(page, { name: player.name });
        }
    }
    ex.world.onMessage.sub(listener);
    ex.remove = () => ex.world.onMessage.unsub(listener);
    // Browser only
    const ui = ex.bot.getExports('ui');
    if (!ui)
        return;
    const tab = ui.addTab('Man Pages', 'messages');
    tab.innerHTML = html;
    const addPage = (name, content) => {
        let template = tab.querySelector('template');
        let pagesDiv = tab.querySelector('.pages');
        ui.buildTemplate(template, pagesDiv, [
            { selector: 'summary', text: name || '' },
            { selector: 'input', value: name || '' },
            { selector: 'textarea', value: content || '' }
        ]);
    };
    Object.entries(getPages())
        .forEach(([name, content]) => addPage(name, content));
    tab.addEventListener('input', () => {
        // Command
        ex.storage.set('command', tab.querySelector('input').value || '/?');
        // Pages
        let pages = {};
        tab.querySelectorAll('details').forEach(element => {
            let name = element.querySelector('input').value;
            let content = element.querySelector('textarea').value;
            element.querySelector('summary').textContent = name;
            if (name)
                pages[name.toLocaleUpperCase()] = content;
        });
        ex.storage.set('pages', pages);
    });
    tab.querySelector('.button').addEventListener('click', () => addPage());
    ex.remove = () => {
        ex.world.onMessage.unsub(listener);
        ui.removeTab(tab);
    };
});
//# sourceMappingURL=index.js.map

})));
//# sourceMappingURL=bundle.js.map
