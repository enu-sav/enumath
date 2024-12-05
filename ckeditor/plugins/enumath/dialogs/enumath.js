window.CCounter=0;
CKEDITOR.dialog.add( 'enumathDialog', function(editor)
{	
	var http = ('https:' == document.location.protocol ? 'https://' : 'http://');
	window.CCounter++;

	return {
		title : editor.lang.enumath.title,
		minWidth : 550,
		minHeight : 380,
		resizable: CKEDITOR.DIALOG_RESIZE_NONE,
		contents : [
			{
				id : 'CCEquationEditor',
				label : 'enumath',
				elements : [
					{
						type: 'html',
						html: `
							<form style="display: flex; align-items: center; justify-content: space-between;">
								<button type="button" onclick="EqEditor.reset()" style="padding: 5px 10px; color: white; background-color: #007bff; border: none; margin-right: 10px;">Reset</button>
							</form>
						`
					},
					{
						type: 'html',
						html: `<label for="CClatex'+window.CCounter+'">${editor.lang.enumath.equation} (LaTeX):</label>`,
					},
					{
						type: 'html',
						html: '<textarea id="CClatex'+window.CCounter+'" rows="8"></textarea>',
						style:'border:1px solid #8fb6bd; width:540px; font-size:16px; padding:5px; background-color:#ffc',
					},
					{
						type: 'html',
						html: `<label for="CCequation'+window.CCounter+'">${editor.lang.enumath.preview}:</label>`
					},
					{
						type :'html',
						html: '<img id="CCequation'+window.CCounter+'" src="" />'					
					},
					{
						type: 'html',
						html: '<div id="comment"></div>'		
					},
				]
			}
		],
		
		onLoad : function () {
			EqEditor.add(new EqTextArea('CCequation'+window.CCounter, 'CClatex'+window.CCounter, 'comment'),false);
		},
				
		onShow : function () {
			var dialog = this,
					sel = editor.getSelection(),
					image = sel.getStartElement().getAscendant('img',true);

			// has the users selected an equation. Make sure we have the image element, include itself		
			if(image) 
			{
				var imgAlt = image.getAttribute('alt');
				var imgSrc = image.getAttribute('src');
				if(imgAlt !== null) {
					EqEditor.getTextArea().setText(imgAlt);
					if (imgSrc.includes('codecogs')) {
						EqEditor.setEngine('codecogs');
					} else {
						EqEditor.setEngine('vercel');
					}
				}
				dialog.insertMode = true;
			}
			
			// set-up the field values based on selected or newly created image
			dialog.setupContent( dialog.image );
		},
		
		onOk : function () {
			var eqn = editor.document.createElement( 'img' );
			eqn.setAttribute( 'alt', EqEditor.getTextArea().getLaTeX());
			eqn.setAttribute( 'src', EqEditor.getTextArea().exportEquation('urlencoded'));
			eqn.setAttribute( 'class', 'enumath');
			editor.insertElement(eqn);
			EqEditor.reset();
		},

		onCancel : function () {
			EqEditor.reset();
		}
	};
});