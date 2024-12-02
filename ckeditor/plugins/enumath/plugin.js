CKEDITOR.plugins.add('enumath', {
	availableLangs: { en: 1, sk: 1 },
	lang: "sk",
	requires: ['dialog'],
	icons: "enumath",

	init: function (editor) {
		const pluginPath = CKEDITOR.plugins.getPath('enumath');
		// First make sure we have loaded the necessary scripts
		CKEDITOR.scriptLoader.load([
			pluginPath + 'enu_config.js',
			pluginPath + 'enumath.js',
		]);

		// Load Additional CSS 
		var fileref = document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		document.getElementsByTagName("head")[0].appendChild(fileref);

		var pluginCmd = 'enumathDialog';

		// Add the link and unlink buttons.
		editor.addCommand(pluginCmd, new CKEDITOR.dialogCommand(pluginCmd, {
			allowedContent: 'img[src,alt]',
			requiredContent: 'img[src,alt]'
		}));

		CKEDITOR.dialog.add(pluginCmd, this.path + "dialogs/enumath.js");

		editor.ui.addButton('enumath', {
			label: editor.lang.enumath.toolbar,
			command: pluginCmd,
			icon: this.path + 'icons/enumath.png',
			toolbar: 'insert'
		});

		editor.on('doubleclick', function (evt) {
			var element = evt.data.element;
			// Ensure the element is an image with specific attributes
			if (element && element.is('img') && element.hasAttribute('alt')) {
				// Open the dialog
				editor.execCommand('enumathDialog');
				evt.stop(); // Stop further event propagation
			}
		});
	}
});
