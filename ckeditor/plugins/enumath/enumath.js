var editor = CKEDITOR.instances[Object.keys(CKEDITOR.instances)[0]]; // Replace with your editor instance name if known
function EqTextArea(preview, input, comment, download, intro) {
    this.changed = false;
    this.orgtxt = '';
    this.bArray_id = new Array();
    this.bArray_area = new Array();
    this.bArray_mode = new Array();
    this.bsize = 0;
    this.updateExportArea = function() {
        for (i = 0; i < this.bsize; i++) {
            var v = this.exportEquation(this.bArray_mode[i]);
            if (this.bArray_area[i].src !== undefined) this.bArray_area[i].src = v;
            else if (this.bArray_area[i].value !== undefined) this.bArray_area[i].value = v;
            else if (this.bArray_area[i].innerHTML !== undefined) this.bArray_area[i].innerHTML = v;
        }
    };
    this.addExportArea = function(textarea_id, mode) {
        var a = EqEditor.$(textarea_id);
        if (a) {
            this.bArray_id[this.bsize] = textarea_id;
            this.bArray_area[this.bsize] = a;
            this.bArray_mode[this.bsize] = mode;
            this.bsize++;
        }
    };
    this.changeExportArea = function(textarea_id, mode) {
        for (i = 0; i < this.bsize; i++) {
            if (textarea_id == this.bArray_id[i]) {
                this.bArray_mode[i] = mode;
                i = this.bsize;
            }
        }
    };
    this.addEvent = function(action, fn) {
        if (this.equation_input.addEventListener) this.equation_input.addEventListener(action, fn, false);
        else this.equation_input.attachEvent('on' + action, fn);
    };
    this.set = function(preview, input, comment, download, intro) {
        if (preview == undefined || preview == '') preview = 'equationview';
        if (input == undefined || input == '') input = 'latex_formula';
        if (comment == undefined || comment == '') comment = 'equationcomment';
        if (download == undefined || download == '') download = 'download';
        if (intro == undefined || intro == '') intro = 'intro';
        this.equation_preview = EqEditor.$(preview);
        this.equation_input = EqEditor.$(input);
        this.equation_comment = EqEditor.$(comment);
        this.equation_download = EqEditor.$(download);
        this.intro_text = intro;
        if (this.equation_input) {
            this.addEvent('keydown', function(e) {
                EqEditor.tabHandler(e);
            });
            this.addEvent('keyup', function() {
                EqEditor.textchanged();
                EqEditor.autorenderEqn(10);
            });
            this.addEvent('keypress', function(e) {
                EqEditor.keyHandler(e);
            });
            if (EqEditor.$(this.intro_text)) {
                EqEditor.$(this.intro_text).onclick = function(e) {
                    EqEditor.targetArea.equation_input.focus();
                    EqEditor.Opacity.fadeout(this.intro_text);
                };
            }
        }
    };
    this.setText = function(val) {
        var latex = decodeURIComponent(val.replace(/\&space;/g, ' ').replace(/\&plus;/g, '+').replace(/\&hash;/g, '#').replace(/\@plus;/g, '+').replace(/\@hash;/g, '#'));
        EqEditor.reset();
         if (latex.length > 0) {
            this.equation_input.value = latex;
            this.textchanged();
            this.renderEqn();
        }
    };
    this.clearText = function() {
        this.equation_input.value = "";
        this.equation_input.focus();
        this.changed = false;
        this.equation_preview.src = '';
        EqEditor.Opacity.fadein(this.intro_text);
    };
    this.textchanged = function() {
        var txt = this.getEquationStr();
        if (txt.length == 0) EqEditor.Opacity.fadein(this.intro_text);
        else EqEditor.Opacity.fadeout(this.intro_text);
        if (txt != this.orgtxt) {
            this.orgtxt = txt;
            this.changed = true;
            return true;
        }
        return false;
    };
    this.auton = 0;
    this.renderCountdown = function() {
        if (this.auton > 0) {
            this.auton--;
            var fn = new Function(this.renderCountdown());
            setTimeout(fn, 100);
        } else this.renderEqn(null);
    };
    this.autorenderEqn = function(n) {
        if (this.auton > 0 && n > 0) this.auton = n;
        else {
            this.auton = n;
            this.renderCountdown();
        }
    };
    this.insertText = function(txt, pos, inspos) {
        var key_text = '';
        if (pos == 1000) {
            pos = txt.length - 1;
        }
        if (pos == null) {
            pos = txt.indexOf('{') + 1;
            if (pos <= 0) {
                txt += ' ';
                pos = txt.length;
            } else {
                if (txt.charAt(pos) != '}') pos = txt.indexOf('}', pos) + 1;
            }
        }
        var insert_pos = (inspos == null) ? pos : inspos;
        var i;
        var myField = this.equation_input;
        var leftbracket = (txt.substring(1, 5) == "left");
        if (document.selection) {
            myField.focus();
            var sel = document.selection.createRange();
            i = this.equation_input.value.length + 1;
            var theCaret = sel.duplicate();
            while (theCaret.parentElement() == myField && theCaret.move("character", 1) == 1) --i;
            if ((leftbracket || insert_pos >= 0) && sel.text.length) {
                if (leftbracket) ins_point = 7;
                else ins_point = insert_pos;
                if (insert_pos == null) pos = txt.length + sel.text.length + 1;
                else if (insert_pos < pos) pos += sel.text.length;
                sel.text = txt.substring(0, ins_point) + sel.text + txt.substr(ins_point);
            } else sel.text = txt;
            var range = myField.createTextRange();
            range.collapse(true);
            pos = i + pos;
            pos -= myField.value.substr(0, pos).split("\n").length - 1;
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        } else {
            if (myField.selectionStart || myField.selectionStart == '0') {
                var startPos = myField.selectionStart;
                var endPos = myField.selectionEnd;
                var cursorPos = startPos + txt.length;
                if ((leftbracket || insert_pos >= 0) && endPos > startPos) {
                    if (leftbracket) ins_point = 7;
                    else ins_point = insert_pos;
                    if (insert_pos == null) pos = txt.length + endPos - startPos + 1;
                    else if (insert_pos < pos) pos += endPos - startPos;
                    txt = txt.substring(0, ins_point) + myField.value.substring(startPos, endPos) + txt.substr(ins_point);
                }
                myField.value = myField.value.substring(0, startPos) + txt + myField.value.substring(endPos, myField.value.length);
                myField.selectionStart = cursorPos;
                myField.selectionEnd = cursorPos;
                myField.focus();
                myField.setSelectionRange(startPos + pos, startPos + pos);
            } else myField.value += txt;
        }
        this.textchanged();
        this.autorenderEqn(10);
        myField.focus();
    };
    this.getLaTeX = function() {
        var a = this.equation_input.value.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
        if (a.length > 0) return a;
        return '';
    };
    this.getEquationStr = function() {
        var a = this.getLaTeX();
        if (a.length > 0) return a;
        return '';
    };
    this.exportMessage = function(text) {
        var a = EqEditor.$('exportmessage');
        if (a) a.innerHTML = text;
    };
    this.exportEquation = function(type) {
        var format = EqEditor.getFormat();
        var engine = EqEditor.getEngine();
        switch (type) {
            case 'encoded':
                return encodeURI(this.getEquationStr()).replace(/\+/g, '%2b');
                break;
            case 'urlencoded': {
                this.exportMessage('The Encoded URL link to this equation is:');
                if(engine == 'codecogs') {
                    return `${EQUATION_ENGINE_CODECOGS}/${format}.latex?${this.exportEquation('encoded')}`;
                } else {
                    return `${EQUATION_ENGINE_VERCEL}?from=${this.exportEquation('encoded')}`;
                }
            }
            break;
            default: {
                this.exportMessage('LaTeX markup for this equation is:');
                return EqEditor.get_inline_wrap(this.getLaTeX(), '\\[{$TEXT}\\]\n', '\${$TEXT}\$ ');
            }
            break;
        }
    };
    this.setcomment = function(text) {
        if (this.equation_comment) this.equation_comment.innerHTML = text;
    };
    this.renderEqn = function(callback) {
        var val = this.equation_input.value;
        val = val.replace(/^\s+|\s+$/g, "");
        if (val.length == 0) return true;
        var bracket = 0;
        var i;
        for (i = 0; i < val.length; i++) {
            switch (val.charAt(i)) {
                case '{':
                    if (i == 0 || val[i - 1] != '\\') bracket++;
                    break;
                case '}':
                    if (i == 0 || val[i - 1] != '\\') bracket--;
                    break;
            }
        }
        if (bracket == 0) {
            if (EqEditor.$('renderbutton')) EqEditor.$('renderbutton').className = 'greybutton';
            var img = this.equation_preview;
            var val = this.exportEquation('encoded');
            var sval = val.replace(/"/g, '\\"');
            var format = EqEditor.getFormat();
            var engine = EqEditor.getEngine();
            if (this.changed) {
                this.setcomment('');
                switch (format) {
                    /* case 'gif':
                    case 'png': */
                    case 'svg':
                        if(engine == 'codecogs') {
                            img.src = `${EQUATION_ENGINE_CODECOGS}/${format}.latex?${this.exportEquation('encoded')}`;
                        } else {
                            img.src = `${EQUATION_ENGINE_VERCEL}?from=${this.exportEquation('encoded')}`;
                        }
                        break;
                }
                this.updateExportArea();
            }
        } else {
            var pluginLang = editor.lang.enumath; // This accesses the loaded language strings
            if (bracket < 0) {
                this.setcomment(pluginLang.closedBrackets);
            } else {
                this.setcomment(pluginLang.openBrackets);
            }
        }
        this.changed = false;
    };
    this.load = function(val) {
        if (typeof val !== 'undefined') this.setText(val)
    };
    if (preview !== undefined) this.set(preview, input, comment, download, intro);
  };
  var EqEditor = {
    SID: 0,
    copy_button: null,
    key_text: '',
    format: 'svg',
    engine: editor.config.ENUMATH_EQUATION_ENGINE,
    $: function(n) {
        return document.getElementById(n);
    },
    OnChange: function(n, fn) {
        var a = EqEditor.$(n);
        if (a) a.onchange = fn;
    },
    OnClick: function(n, fn) {
        var a = EqEditor.$(n);
        if (a) a.onclick = fn;
    },
    Opacity: {
        set: function(id, opacity) {
            var obj = EqEditor.$(id).style;
            obj.opacity = (opacity / 100);
            obj.MozOpacity = (opacity / 100);
            obj.KhtmlOpacity = (opacity / 100);
            obj.filter = "alpha(opacity=" + opacity + ")";
        },
        fade: function(id, opacStart, opacEnd, millisec) {
            speed = Math.round(millisec / 100);
            sgn = (opacStart > opacEnd) ? -1 : 1;
            count = sgn * (opacEnd - opacStart);
            for (i = 1; i < count; i++) setTimeout("EqEditor.Opacity.set('" + id + "'," + (i * sgn + opacStart) + ")", (i * speed));
        },
        fadeout: function(id) {
            if (EqEditor.$(id)) {
                this.fade(id, 100, 10, 800);
                setTimeout("EqEditor.$('" + id + "').style.display='none'", 800);
            }
        },
        fadein: function(id) {
            if (EqEditor.$(id)) {
                this.set(id, 20);
                EqEditor.$(id).style.display = 'block';
                this.fade(id, 20, 100, 800);
            }
        }
    },
    setSelIndx: function(id, v) {
        var s = EqEditor.$(id);
        if (s)
            for (var i = 0; i < s.options.length; i++) {
                if (s.options[i].value == v) {
                    s.options[i].selected = true;
                    return true;
                }
            }
        return false;
    },
    targetArray: new Array(),
    targetSize: 0,
    targetArea: null,
    curTarget: 0,
    changeExportArea: function(id, mode) {
        for (i = 0; i < this.targetSize; i++) this.targetArray[i].changeExportArea(id, mode);
    },
    autorenderEqn: function(n) {
        this.targetArea.autorenderEqn(n);
    },
    change: function(i) {
        if (i != this.curTarget) {
            this.curTarget = i;
            this.key_rext = '';
        }
        this.targetArea = this.targetArray[i];
    },
    add: function(obj, resize) {
        this.targetArray[this.targetSize] = obj;
        obj.equation_input.onfocus = new Function('EqEditor.change(' + this.targetSize + ');');
        if (resize) {
            if (window.addEventListener) window.addEventListener('resize', new Function('EqEditor.resize(' + this.targetSize + ');'), false);
            else window.attachEvent('onresize', new Function('EqEditor.resize(' + this.targetSize + ');'));
            EqEditor.resize(this.targetSize);
        }
        if (this.targetSize == 0) obj.equation_input.focus();
        this.targetSize++;
    },
    editor_id: null,
    moveto: function(id) {
        if (id != this.editor_id) {
            var newNode = EqEditor.$(id);
            while (EqEditor.$(this.editor_id).childNodes[0]) {
                var oldNode = EqEditor.$(this.editor_id).childNodes[0];
                oldNode.parentNode.removeChild(oldNode);
                newNode.appendChild(oldNode);
            }
            this.editor_id = id;
        }
    },
    targetFn: null,
    copyToTarget: function(text) {
        if (this.targetFn !== null) this.targetFn(text)
    },
    reset: function() {
        this.targetArea.setcomment('');
        this.clearText();
    },
    init: function(SID, obj, resize, editorid) {
        if (SID == '') {
            if (!this.SID) {
                var d = new Date();
                this.SID = d.getTime();
            }
        } else this.SID = SID;
        if (obj !== undefined) {
            this.add(obj, resize);
            this.targetArea = obj;
        }
    },
    textchanged: function() {
        if (this.targetArea.textchanged()) true;
    },
    update: function() {
        this.targetArea.textchanged();
        this.targetArea.renderEqn(null);
    },
    load: function(txt) {
        if (this.targetArea != null) this.targetArea.load(txt);
    },
    insert: function(txt, pos, inspos) {
        if (this.targetArea != null) {
            this.targetArea.insertText(txt, pos, inspos);
        }
    },
    getTextArea: function() {
        if (this.targetArea != null) return this.targetArea;
        return null;
    },
    clearText: function() {
        this.targetArea.clearText();
    },
    setEngine: function(engine) {
        EqEditor.engine = engine;
        EqEditor.targetArea.changed = true;
        EqEditor.targetArea.renderEqn(null);
    },
    getEngine: function() {
        return EqEditor.engine;
    },
    getFormat: function() {
        var a = EqEditor.$('format');
        if (a) return a.value;
        return EqEditor.format;
    },
    get_inline_wrap: function(text, norm, inline) {
        var a = EqEditor.$('inline');
        if (a) {
            var b = EqEditor.$('compressed');
            if (a.checked) {
                if (!b.checked) text = '\\displaystyle ' + text;
                return inline.replace("{$TEXT}", text);
            } else {
                if (b.checked) text = '\\inline ' + text;
                return norm.replace("{$TEXT}", text);
            }
        }
        return norm.replace("{$TEXT}", text);
    },
    extendchar: null,
    tabHandler: function(e) {
        var TABKEY = 9;
        var inp = this.targetArea.equation_input;
        if (e.keyCode == TABKEY) {
            if (document.selection) {
                var sel = document.selection.createRange();
                i = inp.value.length + 1;
                var theCaret = sel.duplicate();
                while (theCaret.parentElement() == inp && theCaret.move("character", 1) == 1) --i;
                startPos = i;
                if (startPos == inp.value.length) return true;
            } else {
                startPos = inp.selectionStart;
                if (startPos == inp.value.length) return true;
            }
            var a = inp.value.indexOf('{', startPos);
            if (a == -1) a = inp.value.length;
            else a++;
            var b = inp.value.indexOf('&', startPos);
            if (b == -1) b = inp.value.length;
            else b++;
            var c = inp.value.indexOf('\\\\', startPos);
            if (c == -1) c = inp.value.length;
            else c += 2;
            var pos = Math.min(Math.min(a, b), c);
            if (document.selection) {
                range = inp.createTextRange();
                range.collapse(true);
                pos -= inp.value.substr(0, pos).split("\n").length - 1;
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            } else inp.setSelectionRange(pos, pos);
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            return false;
        }
    },
    backCursor: function(myField) {
        if (document.selection) {
            myField.focus();
            sel = document.selection.createRange();
            if (sel.text.length > 0) sel.text = '';
            else {
                sel.moveEnd('character', 1);
                sel.text = '';
            }
            sel.select();
        } else if (myField.selectionStart || myField.selectionStart == '0') {
            s = myField.selectionStart;
            e = myField.selectionEnd;
            myField.value = myField.value.substring(0, s) + myField.value.substring(e + 1, myField.value.length);
            myField.selectionStart = s;
            myField.selectionEnd = s;
            myField.focus();
        }
    },
    extendkey: function(letter) {
        switch (this.key_text) {
            case '\\left':
                this.insert(' \\right ' + letter, 0);
                break;
            case '\\frac':
            case '\\tfrac':
                if (letter == '}') this.insert('}{}', 0);
                break;
            case '\\begin':
                if (letter == '}') this.insert('} \\end{}', 0);
                break;
            default:
                this.insert(letter, 0);
        }
        this.extendchar = letter;
    },
    keyHandler: function(e) {
        var keycode;
        if (window.event) keycode = window.event.keyCode;
        else if (e) keycode = e.which;
        var keystr = String.fromCharCode(keycode);
        if (keystr == this.extendchar) this.backCursor(this.equation_input);
        this.extendchar = null;
        switch (keystr) {
            case '{':
                this.extendkey('}');
                break;
            case '[':
                this.extendkey(']');
                break;
            case '(':
                this.extendkey(')');
                break;
            case '"':
                this.extendkey('"');
                break;
        }
        if (keystr != ' ') {
            if (keystr == '\\') this.key_text = '\\';
            else if (!keystr.match(/^[a-zA-Z]$/)) this.key_text = '';
            else this.key_text += keystr;
        }
    },
    addText: function(wind, textbox, txt) {
        var myField = wind.getElementById(textbox);
        if (wind.selection) {
            myField.focus();
            sel = wind.selection.createRange();
            sel.text = txt;
        } else {
            var scrolly = myField.scrollTop;
            if (myField.selectionStart || myField.selectionStart == '0') {
                var startPos = myField.selectionStart;
                var endPos = myField.selectionEnd;
                var cursorPos = startPos + txt.length;
                myField.value = myField.value.substring(0, startPos) + txt + myField.value.substring(endPos, myField.value.length);
                pos = txt.length + endPos - startPos;
                myField.selectionStart = cursorPos;
                myField.selectionEnd = cursorPos;
                myField.focus();
                myField.setSelectionRange(startPos + pos, startPos + pos);
            } else myField.value += txt;
            myField.scrollTop = scrolly;
        }
    },
    resize: function(num) {
        var x, y;
        if (self.innerHeight) y = self.innerHeight;
        else if (document.documentElement && document.documentElement.clientHeight) y = document.documentElement.clientHeight;
        else if (document.body) y = document.body.clientHeight;
        this.targetArray[num].equation_input.style.height = parseInt(Math.max((y - 200) / 3, 40)) + 'px';
    }
  };
  var oDiv = document.createElement('div');
  var oImg = document.createElement('img');