/*jshint
    undef: true,
    browser: true,
    devel: true
*/
/*global
    MessageBotExtension
*/

var manpages = MessageBotExtension('manpages');

(function(ex) {
    'use strict';
    ex.setAutoLaunch(true);
    ex.uninstall = function() {
        ex.ui.removeTab(ex.tab);
        ex.hook.remove('world.command', manpageListener);
        ex.storage.clearNamespace(ex.id + '_');
    };

    function addPage(obj) {
        ex.ui.buildContentFromTemplate('#manpages_template', '#manpages_messages', [
            {selector: 'input', value: obj.page || ''},
            {selector: 'textarea', text: obj.content || ''}
        ]);

        var div = ex.tab.querySelector('#manpages_messages > div:last-child');
        if (div) {
            div.querySelector('a').addEventListener('click', function(event) {
                if (confirm("Really delete this message?")) {
                    event.target.parentElement.remove();
                    rebuildPages();
                }
            });
        }
    }

    function rebuildPages() {
        messages = {};
        messages.default = ex.tab.querySelector('textarea').value;
        messages.parts = {};
        Array.from(ex.tab.querySelectorAll('#manpages_messages > div')).forEach(function(div) {
            var key = div.querySelector('input').value.toLocaleLowerCase();
            var value = div.querySelector('textarea').value;
            messages.parts[key] = value;
        });

        ex.storage.set(ex.id + '_messages', messages);
    }

    function send(message, args, name) {
        if (!message) {
            return;
        }
        args = args || {};
        name = name || '';

        Object.keys(args).forEach(function(key) {
            message = message.replace(new RegExp('{{' + key + '}}', 'g'), args[key]);
        });

        message = message
            .replace(/{{name}}/g, name.toLocaleLowerCase())
            .replace(/{{Name}}/g, name[0] + name.substr(1).toLocaleLowerCase())
            .replace(/{{NAME}}/g, name);

        ex.bot.send(message);
    }

    ex.hook.listen('world.command', manpageListener);
    function manpageListener(name, command, part) {
        if (command.toLocaleLowerCase() != 'help') {
            return;
        }

        if (!part) {
            return send(messages.default, {}, name);
        }

        send(messages.parts[part.toLocaleLowerCase()], {}, name);
    }

    //UI stuff
    ex.tab = ex.ui.addTab('Manpages', 'messages');
    ex.tab.innerHTML = '<div id="manpages"><style>#manpages input, #manpages textarea {border: 2px solid #666;width: calc(100% - 10px);}#manpages textarea {resize: none;overflow: hidden;padding: 1px 0;height: 21px;transition: height .5s;}#manpages textarea:focus {height: 5em;}</style><template id="manpages_template"><div class="third-box">Page Name:<input />Page Content<textarea></textarea><a>Delete</a></div></template><h3>Manpages</h3><p>This extension lets you define specific help commands for users. Each page can be accessed through chat by saying "/help &lt;page&gt;". If you have more than one page with the same page name, only the last one will be sent.</p><span class="top-right-button">&times;</span><div><p>Default:<textarea placeholder="If no page is specified this will be sent"></textarea></div><div style="border-top: 1px solid #000;padding-top:1em;" id="manpages_messages"></div></div>';
    ex.tab.querySelector('.top-right-button').addEventListener('click', function() {
        addPage({});
    });
    ex.tab.addEventListener('change', rebuildPages);

    //Do after appending the page
    var messages = ex.storage.getObject(ex.id + '_messages', {default: '', parts: {}});
    Object.keys(messages.parts).forEach(function(key) {
        addPage({page: key, content: messages.parts[key]});
    });
    ex.tab.querySelector('textarea').textContent = messages.default;
}(manpages));