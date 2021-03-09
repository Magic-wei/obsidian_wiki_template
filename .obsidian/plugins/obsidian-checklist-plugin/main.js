'use strict';

var obsidian = require('obsidian');

const TODO_VIEW_TYPE = "todo";
const LOCAL_SORT_OPT = {
    numeric: true,
    ignorePunctuation: true,
};

const DEFAULT_SETTINGS = {
    todoPageName: "todo",
    showChecked: false,
    groupBy: "page",
    sortDirection: "old->new",
    ignoreFiles: "",
    lookAndFeel: "classic",
    _collapsedSections: [],
};
class TodoSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        this.containerEl.empty();
        this.containerEl.createEl("h3", {
            text: "General Settings",
        });
        new obsidian.Setting(containerEl)
            .setName("Tag name")
            .setDesc("e.g. #todo")
            .addText((text) => text
            .setPlaceholder("todo")
            .setValue(this.plugin.getSettingValue("todoPageName"))
            .onChange(async (value) => {
            await this.plugin.updateSettings({ todoPageName: value });
        }));
        new obsidian.Setting(containerEl).setName("Show Completed?").addToggle((toggle) => {
            toggle.setValue(this.plugin.getSettingValue("showChecked"));
            toggle.onChange(async (value) => {
                await this.plugin.updateSettings({ showChecked: value });
            });
        });
        new obsidian.Setting(containerEl).setName("Group By").addDropdown((dropdown) => {
            dropdown.addOption("page", "Page");
            dropdown.addOption("tag", "Tag");
            dropdown.setValue(this.plugin.getSettingValue("groupBy"));
            dropdown.onChange(async (value) => {
                await this.plugin.updateSettings({ groupBy: value });
            });
        });
        new obsidian.Setting(containerEl).setName("Group Sort").addDropdown((dropdown) => {
            dropdown.addOption("new->old", "New -> Old");
            dropdown.addOption("old->new", "Old -> New");
            dropdown.addOption("a->z", "A -> Z");
            dropdown.addOption("z->a", "Z -> A");
            dropdown.setValue(this.plugin.getSettingValue("sortDirection"));
            dropdown.onChange(async (value) => {
                await this.plugin.updateSettings({ sortDirection: value });
            });
        });
        new obsidian.Setting(containerEl)
            .setName("Ignore Files")
            .setDesc("Ignore files that contain this text anywhere in the filepath. (e.g. 'template' to ignore template.md and templates/file.md)")
            .addText((text) => text.setValue(this.plugin.getSettingValue("ignoreFiles")).onChange(async (value) => {
            await this.plugin.updateSettings({ ignoreFiles: value });
        }));
        new obsidian.Setting(containerEl).setName("Look and Feel").addDropdown((dropdown) => {
            dropdown.addOption("classic", "Classic");
            dropdown.addOption("compact", "Compact");
            dropdown.setValue(this.plugin.getSettingValue("lookAndFeel"));
            dropdown.onChange(async (value) => {
                await this.plugin.updateSettings({ lookAndFeel: value });
            });
        });
    }
}

function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function null_to_empty(value) {
    return value == null ? '' : value;
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}

let current_component;
function set_current_component(component) {
    current_component = component;
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/** public */
const parseTodos = async (files, pageLink, cache, vault, ignoreFiles, sort) => {
    const filesWithCache = await Promise.all(files
        .filter((file) => {
        var _a, _b;
        if (ignoreFiles && file.path.includes(ignoreFiles))
            return false;
        const fileCache = cache.getFileCache(file);
        const tagsOnPage = (_b = (_a = fileCache === null || fileCache === void 0 ? void 0 : fileCache.tags) === null || _a === void 0 ? void 0 : _a.filter((e) => getTagMeta(e.tag).main === pageLink)) !== null && _b !== void 0 ? _b : [];
        return !!(tagsOnPage === null || tagsOnPage === void 0 ? void 0 : tagsOnPage.length);
    })
        .map(async (file) => {
        var _a, _b;
        const fileCache = cache.getFileCache(file);
        const tagsOnPage = (_b = (_a = fileCache === null || fileCache === void 0 ? void 0 : fileCache.tags) === null || _a === void 0 ? void 0 : _a.filter((e) => getTagMeta(e.tag).main === pageLink)) !== null && _b !== void 0 ? _b : [];
        const content = await vault.cachedRead(file);
        return { content, cache: fileCache, validTags: tagsOnPage, file };
    }));
    const allTodos = filesWithCache
        .flatMap((file) => {
        return file.validTags.flatMap((tag) => findAllTodosFromTagBlock(file, tag));
    })
        .filter((todo, i, a) => a.findIndex((_todo) => todo.line === _todo.line && todo.filePath === _todo.filePath) === i);
    if (sort === "new->old")
        allTodos.sort((a, b) => b.fileCreatedTs - a.fileCreatedTs);
    if (sort === "old->new")
        allTodos.sort((a, b) => a.fileCreatedTs - b.fileCreatedTs);
    return allTodos;
};
const groupTodos = (items, groupBy, sort) => {
    const groups = [];
    for (const item of items) {
        const itemKey = groupBy === "page" ? item.filePath : `#${[item.mainTag, item.subTag].filter((e) => e != null).join("/")}`;
        let group = groups.find((g) => g.groupId === itemKey);
        if (!group) {
            group = {
                groupId: itemKey,
                groupName: groupBy === "page" ? item.fileLabel : item.subTag,
                type: groupBy,
                todos: [],
            };
            groups.push(group);
        }
        group.todos.push(item);
    }
    const nonEmptyGroups = groups.filter((g) => g.todos.length > 0);
    if (sort === "a->z")
        nonEmptyGroups.sort((a, b) => a.groupName.localeCompare(b.groupName, navigator.language, LOCAL_SORT_OPT));
    if (sort === "z->a")
        nonEmptyGroups.sort((a, b) => b.groupName.localeCompare(a.groupName, navigator.language, LOCAL_SORT_OPT));
    return nonEmptyGroups;
};
const toggleTodoItem = async (item, app) => {
    const file = getFileFromPath(app.vault, item.filePath);
    if (!file)
        return;
    const currentFileContents = await app.vault.read(file);
    const currentFileLines = getAllLinesFromFile(currentFileContents);
    if (!currentFileLines[item.line].includes(item.originalText))
        return;
    const newData = setTodoStatusAtLineTo(currentFileLines, item.line, !item.checked);
    app.vault.modify(file, newData);
    item.checked = !item.checked;
};
const navToFile = async (app, path, ev) => {
    path = ensureMdExtension(path);
    const file = getFileFromPath(app.vault, path);
    if (!file)
        return;
    const leaf = isMetaPressed(ev) ? app.workspace.splitActiveLeaf() : app.workspace.getUnpinnedLeaf();
    await leaf.openFile(file);
};
const hoverFile = (event, app, filePath) => {
    const targetElement = event.currentTarget;
    const timeoutHandle = setTimeout(() => {
        app.workspace.trigger("link-hover", {}, targetElement, filePath, filePath);
    }, 800);
    targetElement.addEventListener("mouseleave", () => {
        clearTimeout(timeoutHandle);
    });
};
/** private */
const getFileFromPath = (vault, path) => {
    const file = vault.getAbstractFileByPath(path);
    if (file instanceof obsidian.TFile)
        return file;
};
const ensureMdExtension = (path) => {
    if (!/\.md$/.test(path))
        return `${path}.md`;
    return path;
};
const isMetaPressed = (e) => {
    return isMacOS() ? e.metaKey : e.ctrlKey;
};
const findAllTodosFromTagBlock = (file, tag) => {
    var _a;
    const fileContents = file.content;
    const links = (_a = file.cache.links) !== null && _a !== void 0 ? _a : [];
    if (!fileContents)
        return [];
    const fileLines = getAllLinesFromFile(fileContents);
    const tagMeta = getTagMeta(tag.tag);
    const tagLine = fileLines[tag.position.start.line];
    if (lineIsValidTodo(tagLine, tagMeta.main)) {
        return [formTodo(tagLine, file, tagMeta, links, tag.position.start.line)];
    }
    const todos = [];
    for (let i = tag.position.start.line; i < fileLines.length; i++) {
        const line = fileLines[i];
        if (line.length === 0)
            break;
        if (lineIsValidTodo(line, tagMeta.main)) {
            todos.push(formTodo(line, file, tagMeta, links, i));
        }
    }
    return todos;
};
const formTodo = (line, file, tagMeta, links, lineNum) => {
    const relevantLinks = links
        .filter((link) => link.position.start.line === lineNum)
        .map((link) => ({ filePath: link.link, linkName: link.displayText }));
    const linkMap = mapLinkMeta(relevantLinks);
    const rawText = extractTextFromTodoLine(line);
    const spacesIndented = getIndentationSpacesFromTodoLine(line);
    const tagStripped = removeTagFromText(rawText, tagMeta.main);
    const rawChunks = parseTextContent(tagStripped);
    const displayChunks = decorateChunks(rawChunks, linkMap);
    return {
        mainTag: tagMeta.main,
        checked: todoLineIsChecked(line),
        display: displayChunks,
        filePath: file.file.path,
        fileName: file.file.name,
        fileLabel: getFileLabelFromName(file.file.name),
        fileCreatedTs: file.file.stat.ctime,
        line: lineNum,
        subTag: tagMeta === null || tagMeta === void 0 ? void 0 : tagMeta.sub,
        spacesIndented,
        fileInfo: file,
        originalText: rawText,
    };
};
const decorateChunks = (chunks, linkMap) => {
    return chunks.map((chunk) => {
        var _a, _b;
        if (chunk.type === "text")
            return {
                value: chunk.rawText,
                type: "text",
            };
        const children = decorateChunks(chunk.children, linkMap);
        if (chunk.type === "link")
            return {
                type: "link",
                children,
                filePath: (_a = linkMap.get(chunk.rawText)) === null || _a === void 0 ? void 0 : _a.filePath,
                label: (_b = linkMap.get(chunk.rawText)) === null || _b === void 0 ? void 0 : _b.linkName,
            };
        return { type: chunk.type, children };
    });
};
const parseTextContent = (formula) => {
    let tokens = parseTokensFromText([{ rawText: formula, type: "text" }], "bold", /\*\*[^\*]+\*\*/, /\*\*([^\*]+)\*\*/g);
    tokens = parseTokensFromText(tokens, "italic", /\*[^\*]+\*/, /\*([^\*]+)\*/g);
    tokens = parseTokensFromText(tokens, "link", /\[\[[^\]]+\]\]/, /\[\[([^\]]+)\]\]/g);
    return tokens;
};
const parseTokensFromText = (chunks, type, splitRegex, tokenRegex) => {
    return chunks.flatMap((chunk) => {
        if (chunk.type === "text") {
            const pieces = chunk.rawText.split(splitRegex);
            const tokens = getAllMatches(tokenRegex, chunk.rawText, 1);
            return pieces.flatMap((piece, i) => {
                const token = tokens[i];
                const finalPieces = [];
                if (piece)
                    finalPieces.push({ type: "text", rawText: piece });
                if (token)
                    finalPieces.push({
                        type,
                        rawText: token,
                        children: [{ type: "text", rawText: token }],
                    });
                return finalPieces;
            });
        }
        else {
            return [
                {
                    type: chunk.type,
                    rawText: chunk.rawText,
                    children: parseTokensFromText(chunk.children, type, splitRegex, tokenRegex),
                },
            ];
        }
    });
};
const getAllMatches = (r, string, captureIndex = 0) => {
    if (!r.global)
        throw new Error("getAllMatches(): cannot get matches for non-global regex.");
    const matches = [];
    r.lastIndex = 0; // reset regexp to first match
    let match;
    while ((match = r.exec(string)))
        matches.push(match[captureIndex]);
    return matches;
};
const setTodoStatusAtLineTo = (fileLines, line, setTo) => {
    fileLines[line] = setLineTo(fileLines[line], setTo);
    return combineFileLines(fileLines);
};
const getTagMeta = (tag) => {
    const [full, main, sub] = /^\#([^\/]+)\/?(.*)?$/.exec(tag);
    return { main, sub };
};
const mapLinkMeta = (linkMeta) => {
    const map = new Map();
    for (const link of linkMeta)
        map.set(link.filePath, link);
    return map;
};
const setLineTo = (line, setTo) => line.replace(/^(\s*\-\s\[)([^\]]+)(\].*$)/, `$1${setTo ? "x" : " "}$3`);
const getAllLinesFromFile = (cache) => cache.split(/\r?\n/);
const combineFileLines = (lines) => lines.join("\n");
const lineIsValidTodo = (line, tag) => {
    const tagRemoved = removeTagFromText(line, tag);
    return /^\s*\-\s\[(\s|x)\]\s*\S/.test(tagRemoved);
};
const extractTextFromTodoLine = (line) => { var _a; return (_a = /^\s*\-\s\[(\s|x)\]\s?(.*)$/.exec(line)) === null || _a === void 0 ? void 0 : _a[2]; };
const getIndentationSpacesFromTodoLine = (line) => { var _a, _b, _c; return (_c = (_b = (_a = /^(\s*)\-\s\[(\s|x)\]\s?.*$/.exec(line)) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0; };
const todoLineIsChecked = (line) => /^\s*\-\s\[x\]/.test(line);
const getFileLabelFromName = (filename) => { var _a; return (_a = /^(.+)\.md$/.exec(filename)) === null || _a === void 0 ? void 0 : _a[1]; };
const removeTagFromText = (text, tag) => text.replace(new RegExp(`\\s?\\#${tag}[^\\s]*`, "g"), "").trim();
const isMacOS = () => window.navigator.userAgent.includes("Macintosh");

/* src/svelte/Loading.svelte generated by Svelte v3.34.0 */

function add_css$5() {
	var style = element("style");
	style.id = "svelte-1bzczna-style";
	style.textContent = ".loader.svelte-1bzczna{background:transparent !important;border-radius:100%;border:2px solid;display:flex;animation-fill-mode:both;margin:0 auto;animation:svelte-1bzczna-niceSpinLoader 0.75s 0s infinite linear;border-color:var(--text-muted);border-bottom-color:var(--text-normal);width:16px;height:16px}@keyframes svelte-1bzczna-niceSpinLoader{0%{transform:rotate(0deg)}50%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}";
	append(document.head, style);
}

function create_fragment$6(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "loader svelte-1bzczna");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

class Loading extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1bzczna-style")) add_css$5();
		init(this, options, null, create_fragment$6, safe_not_equal, {});
	}
}

/* src/svelte/CheckCircle.svelte generated by Svelte v3.34.0 */

function add_css$4() {
	var style = element("style");
	style.id = "svelte-y3iyim-style";
	style.textContent = ".checkbox.svelte-y3iyim{width:20px;height:20px;border-radius:50%;border:2px solid var(--text-muted);padding:2px;position:relative;min-width:20px;min-height:20px}.checked.svelte-y3iyim{background-color:var(--text-muted);width:12px;height:12px;border-radius:50%;position:absolute;top:2px;left:2px}";
	append(document.head, style);
}

function create_fragment$5(ctx) {
	let div1;
	let div0;

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			attr(div0, "class", "svelte-y3iyim");
			toggle_class(div0, "checked", /*checked*/ ctx[0]);
			attr(div1, "class", "checkbox svelte-y3iyim");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
		},
		p(ctx, [dirty]) {
			if (dirty & /*checked*/ 1) {
				toggle_class(div0, "checked", /*checked*/ ctx[0]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div1);
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let { checked = false } = $$props;

	$$self.$$set = $$props => {
		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
	};

	return [checked];
}

class CheckCircle extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-y3iyim-style")) add_css$4();
		init(this, options, instance$5, create_fragment$5, safe_not_equal, { checked: 0 });
	}
}

/* src/svelte/TextChunk.svelte generated by Svelte v3.34.0 */

function add_css$3() {
	var style = element("style");
	style.id = "svelte-1ggcaxe-style";
	style.textContent = ".link-item.svelte-1ggcaxe{color:var(--text-accent);text-decoration:underline;cursor:pointer;transition:color 150ms ease-in-out}.link-item.svelte-1ggcaxe:hover{color:var(--text-accent-hover)}.bold-item.svelte-1ggcaxe{font-weight:bold}.italic-item.svelte-1ggcaxe{font-style:italic}";
	append(document.head, style);
}

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[4] = list[i];
	return child_ctx;
}

// (16:34) 
function create_if_block_3(ctx) {
	let span;
	let todotext;
	let current;
	let mounted;
	let dispose;

	todotext = new TextChunk({
			props: { chunks: /*chunk*/ ctx[4].children }
		});

	function click_handler(...args) {
		return /*click_handler*/ ctx[2](/*chunk*/ ctx[4], ...args);
	}

	function mouseenter_handler(...args) {
		return /*mouseenter_handler*/ ctx[3](/*chunk*/ ctx[4], ...args);
	}

	return {
		c() {
			span = element("span");
			create_component(todotext.$$.fragment);
			attr(span, "class", "link-item svelte-1ggcaxe");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			mount_component(todotext, span, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen(span, "click", click_handler),
					listen(span, "mouseenter", mouseenter_handler)
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const todotext_changes = {};
			if (dirty & /*chunks*/ 1) todotext_changes.chunks = /*chunk*/ ctx[4].children;
			todotext.$set(todotext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(todotext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(todotext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			destroy_component(todotext);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (14:36) 
function create_if_block_2(ctx) {
	let span;
	let todotext;
	let current;

	todotext = new TextChunk({
			props: { chunks: /*chunk*/ ctx[4].children }
		});

	return {
		c() {
			span = element("span");
			create_component(todotext.$$.fragment);
			attr(span, "class", "italic-item svelte-1ggcaxe");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			mount_component(todotext, span, null);
			current = true;
		},
		p(ctx, dirty) {
			const todotext_changes = {};
			if (dirty & /*chunks*/ 1) todotext_changes.chunks = /*chunk*/ ctx[4].children;
			todotext.$set(todotext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(todotext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(todotext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			destroy_component(todotext);
		}
	};
}

// (12:34) 
function create_if_block_1$2(ctx) {
	let span;
	let todotext;
	let current;

	todotext = new TextChunk({
			props: { chunks: /*chunk*/ ctx[4].children }
		});

	return {
		c() {
			span = element("span");
			create_component(todotext.$$.fragment);
			attr(span, "class", "bold-item svelte-1ggcaxe");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			mount_component(todotext, span, null);
			current = true;
		},
		p(ctx, dirty) {
			const todotext_changes = {};
			if (dirty & /*chunks*/ 1) todotext_changes.chunks = /*chunk*/ ctx[4].children;
			todotext.$set(todotext_changes);
		},
		i(local) {
			if (current) return;
			transition_in(todotext.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(todotext.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			destroy_component(todotext);
		}
	};
}

// (10:2) {#if chunk.type === "text"}
function create_if_block$3(ctx) {
	let span;
	let t_value = /*chunk*/ ctx[4].value + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*chunks*/ 1 && t_value !== (t_value = /*chunk*/ ctx[4].value + "")) set_data(t, t_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (9:0) {#each chunks as chunk}
function create_each_block$2(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$3, create_if_block_1$2, create_if_block_2, create_if_block_3];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*chunk*/ ctx[4].type === "text") return 0;
		if (/*chunk*/ ctx[4].type === "bold") return 1;
		if (/*chunk*/ ctx[4].type === "italic") return 2;
		if (/*chunk*/ ctx[4].type === "link") return 3;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				} else {
					if_block = null;
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}

			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$4(ctx) {
	let each_1_anchor;
	let current;
	let each_value = /*chunks*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*chunks, navToFile, app, hoverFile*/ 3) {
				each_value = /*chunks*/ ctx[0];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each_1_anchor);
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	
	
	let { chunks } = $$props;
	let { app } = $$props;

	const click_handler = (chunk, ev) => {
		ev.stopPropagation();
		if (chunk.filePath) navToFile(app, chunk.filePath, ev);
	};

	const mouseenter_handler = (chunk, ev) => {
		if (chunk.filePath) hoverFile(ev, app, chunk.filePath);
	};

	$$self.$$set = $$props => {
		if ("chunks" in $$props) $$invalidate(0, chunks = $$props.chunks);
		if ("app" in $$props) $$invalidate(1, app = $$props.app);
	};

	return [chunks, app, click_handler, mouseenter_handler];
}

class TextChunk extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1ggcaxe-style")) add_css$3();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { chunks: 0, app: 1 });
	}
}

/* src/svelte/ChecklistItem.svelte generated by Svelte v3.34.0 */

function add_css$2() {
	var style = element("style");
	style.id = "svelte-zpfope-style";
	style.textContent = ".item.svelte-zpfope.svelte-zpfope{display:flex;align-items:center;background-color:var(--interactive-normal);border-radius:8px;margin-bottom:12px;cursor:pointer;transition:background-color 100ms ease-in-out}.item.svelte-zpfope.svelte-zpfope:hover{background-color:var(--interactive-hover)}.toggle.svelte-zpfope.svelte-zpfope{padding-right:8px;padding:8px 12px}.content.svelte-zpfope.svelte-zpfope{padding:8px 12px;padding-left:0 !important}.compact.svelte-zpfope.svelte-zpfope{margin-bottom:8px}.compact.svelte-zpfope>.content.svelte-zpfope{padding:4px 8px}.compact.svelte-zpfope>.toggle.svelte-zpfope{padding:4px 8px}.toggle.svelte-zpfope.svelte-zpfope:hover{opacity:0.8}";
	append(document.head, style);
}

function create_fragment$3(ctx) {
	let div2;
	let div0;
	let checkcircle;
	let t;
	let div1;
	let textchunk;
	let div2_class_value;
	let current;
	let mounted;
	let dispose;

	checkcircle = new CheckCircle({
			props: { checked: /*item*/ ctx[0].checked }
		});

	textchunk = new TextChunk({
			props: {
				chunks: /*item*/ ctx[0].display,
				app: /*app*/ ctx[2]
			}
		});

	return {
		c() {
			div2 = element("div");
			div0 = element("div");
			create_component(checkcircle.$$.fragment);
			t = space();
			div1 = element("div");
			create_component(textchunk.$$.fragment);
			attr(div0, "class", "toggle svelte-zpfope");
			attr(div1, "class", "content svelte-zpfope");
			attr(div2, "class", div2_class_value = "" + (null_to_empty(`item ${/*lookAndFeel*/ ctx[1]}`) + " svelte-zpfope"));
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div0);
			mount_component(checkcircle, div0, null);
			append(div2, t);
			append(div2, div1);
			mount_component(textchunk, div1, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen(div0, "click", /*click_handler*/ ctx[4]),
					listen(div2, "click", /*click_handler_1*/ ctx[5])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			const checkcircle_changes = {};
			if (dirty & /*item*/ 1) checkcircle_changes.checked = /*item*/ ctx[0].checked;
			checkcircle.$set(checkcircle_changes);
			const textchunk_changes = {};
			if (dirty & /*item*/ 1) textchunk_changes.chunks = /*item*/ ctx[0].display;
			if (dirty & /*app*/ 4) textchunk_changes.app = /*app*/ ctx[2];
			textchunk.$set(textchunk_changes);

			if (!current || dirty & /*lookAndFeel*/ 2 && div2_class_value !== (div2_class_value = "" + (null_to_empty(`item ${/*lookAndFeel*/ ctx[1]}`) + " svelte-zpfope"))) {
				attr(div2, "class", div2_class_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(checkcircle.$$.fragment, local);
			transition_in(textchunk.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(checkcircle.$$.fragment, local);
			transition_out(textchunk.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			destroy_component(checkcircle);
			destroy_component(textchunk);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	
	
	let { item } = $$props;
	let { lookAndFeel } = $$props;
	let { app } = $$props;

	const toggleItem = item => __awaiter(void 0, void 0, void 0, function* () {
		toggleTodoItem(item, app);
	});

	const click_handler = ev => {
		toggleItem(item);
		ev.stopPropagation();
	};

	const click_handler_1 = ev => navToFile(app, item.filePath, ev);

	$$self.$$set = $$props => {
		if ("item" in $$props) $$invalidate(0, item = $$props.item);
		if ("lookAndFeel" in $$props) $$invalidate(1, lookAndFeel = $$props.lookAndFeel);
		if ("app" in $$props) $$invalidate(2, app = $$props.app);
	};

	return [item, lookAndFeel, app, toggleItem, click_handler, click_handler_1];
}

class ChecklistItem extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-zpfope-style")) add_css$2();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { item: 0, lookAndFeel: 1, app: 2 });
	}
}

/* src/svelte/Icon.svelte generated by Svelte v3.34.0 */

function add_css$1() {
	var style = element("style");
	style.id = "svelte-t9i4te-style";
	style.textContent = ".svg.svelte-t9i4te{width:24px;height:24px;fill:var(--text-normal);transition:transform 150ms ease;cursor:pointer}.up.svelte-t9i4te{transform:rotate(180deg)}.down.svelte-t9i4te{transform:rotate(0deg)}.left.svelte-t9i4te{transform:rotate(90deg)}.right.svelte-t9i4te{transform:rotate(270deg)}";
	append(document.head, style);
}

// (6:0) {#if name === "chevron"}
function create_if_block$2(ctx) {
	let svg;
	let path;
	let svg_class_value;

	return {
		c() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr(path, "d", "M119.5 326.9L3.5 209.1c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0L128 287.3l100.4-102.2c4.7-4.7 12.3-4.7 17 0l7.1 7.1c4.7 4.7 4.7 12.3 0 17L136.5 327c-4.7 4.6-12.3 4.6-17-.1z");
			attr(svg, "focusable", "false");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "viewBox", "0 0 256 512");
			attr(svg, "class", svg_class_value = "" + (null_to_empty(`svg ${/*direction*/ ctx[1]}`) + " svelte-t9i4te"));
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, path);
		},
		p(ctx, dirty) {
			if (dirty & /*direction*/ 2 && svg_class_value !== (svg_class_value = "" + (null_to_empty(`svg ${/*direction*/ ctx[1]}`) + " svelte-t9i4te"))) {
				attr(svg, "class", svg_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

function create_fragment$2(ctx) {
	let if_block_anchor;
	let if_block = /*name*/ ctx[0] === "chevron" && create_if_block$2(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (/*name*/ ctx[0] === "chevron") {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	
	let { name } = $$props;
	let { direction = "down" } = $$props;

	$$self.$$set = $$props => {
		if ("name" in $$props) $$invalidate(0, name = $$props.name);
		if ("direction" in $$props) $$invalidate(1, direction = $$props.direction);
	};

	return [name, direction];
}

class Icon extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-t9i4te-style")) add_css$1();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { name: 0, direction: 1 });
	}
}

/* src/svelte/ChecklistGroup.svelte generated by Svelte v3.34.0 */

function add_css() {
	var style = element("style");
	style.id = "svelte-im5pnh-style";
	style.textContent = ".page.svelte-im5pnh{margin-bottom:4px;color:var(--text-muted);transition:opacity 150ms ease-in-out;cursor:pointer}.file-link.svelte-im5pnh:hover{opacity:0.8}.group-header.svelte-im5pnh{font-weight:600;font-size:14pt;margin-bottom:8px;display:flex;gap:8px;align-items:center}.space.svelte-im5pnh{flex:1}.count.svelte-im5pnh,.collapse.svelte-im5pnh,.title.svelte-im5pnh{flex-shrink:1}.count.svelte-im5pnh{padding:0px 6px;background:var(--interactive-normal);border-radius:4px;font-size:14px}.title.svelte-im5pnh{min-width:0;overflow:hidden;text-overflow:ellipsis}.collapse.svelte-im5pnh{display:flex}.tag-base.svelte-im5pnh{color:var(--text-faint)}.tag-sub.svelte-im5pnh{color:var(--text-muted)}";
	append(document.head, style);
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[8] = list[i];
	return child_ctx;
}

// (23:6) {:else}
function create_else_block$1(ctx) {
	let span0;
	let t0_value = `#${/*mainTag*/ ctx[1]}${/*group*/ ctx[0].groupName != null ? "/" : ""}` + "";
	let t0;
	let span1;
	let t1_value = (/*group*/ ctx[0].groupName ?? "") + "";
	let t1;

	return {
		c() {
			span0 = element("span");
			t0 = text(t0_value);
			span1 = element("span");
			t1 = text(t1_value);
			attr(span0, "class", "tag-base svelte-im5pnh");
			attr(span1, "class", "tag-sub svelte-im5pnh");
		},
		m(target, anchor) {
			insert(target, span0, anchor);
			append(span0, t0);
			insert(target, span1, anchor);
			append(span1, t1);
		},
		p(ctx, dirty) {
			if (dirty & /*mainTag, group*/ 3 && t0_value !== (t0_value = `#${/*mainTag*/ ctx[1]}${/*group*/ ctx[0].groupName != null ? "/" : ""}` + "")) set_data(t0, t0_value);
			if (dirty & /*group*/ 1 && t1_value !== (t1_value = (/*group*/ ctx[0].groupName ?? "") + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) detach(span0);
			if (detaching) detach(span1);
		}
	};
}

// (21:6) {#if group.type === "page"}
function create_if_block_1$1(ctx) {
	let t_value = /*group*/ ctx[0].groupName + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*group*/ 1 && t_value !== (t_value = /*group*/ ctx[0].groupName + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (35:2) {#if !isCollapsed}
function create_if_block$1(ctx) {
	let each_1_anchor;
	let current;
	let each_value = /*group*/ ctx[0].todos;
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*group, lookAndFeel, app*/ 25) {
				each_value = /*group*/ ctx[0].todos;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each_1_anchor);
		}
	};
}

// (36:4) {#each group.todos as item}
function create_each_block$1(ctx) {
	let checklistitem;
	let current;

	checklistitem = new ChecklistItem({
			props: {
				item: /*item*/ ctx[8],
				lookAndFeel: /*lookAndFeel*/ ctx[3],
				app: /*app*/ ctx[4]
			}
		});

	return {
		c() {
			create_component(checklistitem.$$.fragment);
		},
		m(target, anchor) {
			mount_component(checklistitem, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const checklistitem_changes = {};
			if (dirty & /*group*/ 1) checklistitem_changes.item = /*item*/ ctx[8];
			if (dirty & /*lookAndFeel*/ 8) checklistitem_changes.lookAndFeel = /*lookAndFeel*/ ctx[3];
			if (dirty & /*app*/ 16) checklistitem_changes.app = /*app*/ ctx[4];
			checklistitem.$set(checklistitem_changes);
		},
		i(local) {
			if (current) return;
			transition_in(checklistitem.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(checklistitem.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(checklistitem, detaching);
		}
	};
}

function create_fragment$1(ctx) {
	let div5;
	let div4;
	let div0;
	let t0;
	let div1;
	let t1;
	let div2;
	let t2_value = /*group*/ ctx[0].todos.length + "";
	let t2;
	let t3;
	let div3;
	let icon;
	let div4_class_value;
	let t4;
	let current;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*group*/ ctx[0].type === "page") return create_if_block_1$1;
		return create_else_block$1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block0 = current_block_type(ctx);

	icon = new Icon({
			props: {
				name: "chevron",
				direction: /*isCollapsed*/ ctx[2] ? "left" : "down"
			}
		});

	let if_block1 = !/*isCollapsed*/ ctx[2] && create_if_block$1(ctx);

	return {
		c() {
			div5 = element("div");
			div4 = element("div");
			div0 = element("div");
			if_block0.c();
			t0 = space();
			div1 = element("div");
			t1 = space();
			div2 = element("div");
			t2 = text(t2_value);
			t3 = space();
			div3 = element("div");
			create_component(icon.$$.fragment);
			t4 = space();
			if (if_block1) if_block1.c();
			attr(div0, "class", "title svelte-im5pnh");
			attr(div1, "class", "space svelte-im5pnh");
			attr(div2, "class", "count svelte-im5pnh");
			attr(div3, "class", "collapse svelte-im5pnh");
			attr(div4, "class", div4_class_value = "" + (null_to_empty(`group-header ${/*group*/ ctx[0].type}`) + " svelte-im5pnh"));
			attr(div5, "class", "group");
		},
		m(target, anchor) {
			insert(target, div5, anchor);
			append(div5, div4);
			append(div4, div0);
			if_block0.m(div0, null);
			append(div4, t0);
			append(div4, div1);
			append(div4, t1);
			append(div4, div2);
			append(div2, t2);
			append(div4, t3);
			append(div4, div3);
			mount_component(icon, div3, null);
			append(div5, t4);
			if (if_block1) if_block1.m(div5, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen(div0, "click", /*clickTitle*/ ctx[6]),
					listen(div3, "click", /*click_handler*/ ctx[7])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(div0, null);
				}
			}

			if ((!current || dirty & /*group*/ 1) && t2_value !== (t2_value = /*group*/ ctx[0].todos.length + "")) set_data(t2, t2_value);
			const icon_changes = {};
			if (dirty & /*isCollapsed*/ 4) icon_changes.direction = /*isCollapsed*/ ctx[2] ? "left" : "down";
			icon.$set(icon_changes);

			if (!current || dirty & /*group*/ 1 && div4_class_value !== (div4_class_value = "" + (null_to_empty(`group-header ${/*group*/ ctx[0].type}`) + " svelte-im5pnh"))) {
				attr(div4, "class", div4_class_value);
			}

			if (!/*isCollapsed*/ ctx[2]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*isCollapsed*/ 4) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$1(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div5, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(icon.$$.fragment, local);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div5);
			if_block0.d();
			destroy_component(icon);
			if (if_block1) if_block1.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	
	
	let { group } = $$props;
	let { mainTag } = $$props;
	let { isCollapsed } = $$props;
	let { lookAndFeel } = $$props;
	let { app } = $$props;
	let { onToggle } = $$props;

	function clickTitle(ev) {
		if (group.type === "page") navToFile(app, group.groupId, ev);
	}

	const click_handler = () => onToggle(group.groupId, "page");

	$$self.$$set = $$props => {
		if ("group" in $$props) $$invalidate(0, group = $$props.group);
		if ("mainTag" in $$props) $$invalidate(1, mainTag = $$props.mainTag);
		if ("isCollapsed" in $$props) $$invalidate(2, isCollapsed = $$props.isCollapsed);
		if ("lookAndFeel" in $$props) $$invalidate(3, lookAndFeel = $$props.lookAndFeel);
		if ("app" in $$props) $$invalidate(4, app = $$props.app);
		if ("onToggle" in $$props) $$invalidate(5, onToggle = $$props.onToggle);
	};

	return [
		group,
		mainTag,
		isCollapsed,
		lookAndFeel,
		app,
		onToggle,
		clickTitle,
		click_handler
	];
}

class ChecklistGroup extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-im5pnh-style")) add_css();

		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
			group: 0,
			mainTag: 1,
			isCollapsed: 2,
			lookAndFeel: 3,
			app: 4,
			onToggle: 5
		});
	}
}

/* src/svelte/App.svelte generated by Svelte v3.34.0 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[17] = list[i];
	return child_ctx;
}

// (54:2) {:else}
function create_else_block(ctx) {
	let div;
	let t;
	let each_1_anchor;
	let current;
	let each_value = /*todoGroups*/ ctx[5];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div = element("div");
			t = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
			attr(div, "class", "header");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			insert(target, t, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*todoGroups, app, lookAndFeel, todoTag, _collapsedSections, toggleGroup*/ 111) {
				each_value = /*todoGroups*/ ctx[5];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (detaching) detach(t);
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each_1_anchor);
		}
	};
}

// (52:36) 
function create_if_block_1(ctx) {
	let div;
	let t0;
	let t1;

	return {
		c() {
			div = element("div");
			t0 = text("No checklist items found for tag: #");
			t1 = text(/*todoTag*/ ctx[0]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t0);
			append(div, t1);
		},
		p(ctx, dirty) {
			if (dirty & /*todoTag*/ 1) set_data(t1, /*todoTag*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (50:2) {#if firstRun}
function create_if_block(ctx) {
	let loading;
	let current;
	loading = new Loading({});

	return {
		c() {
			create_component(loading.$$.fragment);
		},
		m(target, anchor) {
			mount_component(loading, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(loading.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(loading.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(loading, detaching);
		}
	};
}

// (56:4) {#each todoGroups as group}
function create_each_block(ctx) {
	let checklistgroup;
	let current;

	checklistgroup = new ChecklistGroup({
			props: {
				group: /*group*/ ctx[17],
				app: /*app*/ ctx[3],
				lookAndFeel: /*lookAndFeel*/ ctx[1],
				mainTag: /*todoTag*/ ctx[0],
				isCollapsed: /*_collapsedSections*/ ctx[2].includes(/*group*/ ctx[17].groupId),
				onToggle: /*toggleGroup*/ ctx[6]
			}
		});

	return {
		c() {
			create_component(checklistgroup.$$.fragment);
		},
		m(target, anchor) {
			mount_component(checklistgroup, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const checklistgroup_changes = {};
			if (dirty & /*todoGroups*/ 32) checklistgroup_changes.group = /*group*/ ctx[17];
			if (dirty & /*app*/ 8) checklistgroup_changes.app = /*app*/ ctx[3];
			if (dirty & /*lookAndFeel*/ 2) checklistgroup_changes.lookAndFeel = /*lookAndFeel*/ ctx[1];
			if (dirty & /*todoTag*/ 1) checklistgroup_changes.mainTag = /*todoTag*/ ctx[0];
			if (dirty & /*_collapsedSections, todoGroups*/ 36) checklistgroup_changes.isCollapsed = /*_collapsedSections*/ ctx[2].includes(/*group*/ ctx[17].groupId);
			checklistgroup.$set(checklistgroup_changes);
		},
		i(local) {
			if (current) return;
			transition_in(checklistgroup.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(checklistgroup.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(checklistgroup, detaching);
		}
	};
}

function create_fragment(ctx) {
	let div;
	let current_block_type_index;
	let if_block;
	let current;
	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*firstRun*/ ctx[4]) return 0;
		if (/*todoGroups*/ ctx[5].length === 0) return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "todo-list");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_blocks[current_block_type_index].m(div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(div, null);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if_blocks[current_block_type_index].d();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	
	
	
	let { todoTag } = $$props;
	let { showChecked } = $$props;
	let { groupBy } = $$props;
	let { sortDirection } = $$props;
	let { lookAndFeel } = $$props;
	let { ignoreFiles } = $$props;
	let { _collapsedSections } = $$props;
	let { updateSetting } = $$props;
	let { rerenderKey } = $$props;
	let { app } = $$props;
	let todos = [];
	let todoGroups = [];
	let firstRun = true;

	const formGroups = _todos => {
		return groupTodos(showChecked ? _todos : _todos.filter(e => !e.checked), groupBy, sortDirection);
	};

	const recalcItems = () => __awaiter(void 0, void 0, void 0, function* () {
		todos = yield parseTodos(app.vault.getFiles(), todoTag, app.metadataCache, app.vault, ignoreFiles, sortDirection);
		$$invalidate(5, todoGroups = formGroups(todos));
		$$invalidate(4, firstRun = false);
	});

	const toggleGroup = (id, type) => {
		const newCollapsedSections = _collapsedSections.includes(id)
		? _collapsedSections.filter(e => e !== id)
		: [..._collapsedSections, id];

		updateSetting({ _collapsedSections: newCollapsedSections });
	};

	$$self.$$set = $$props => {
		if ("todoTag" in $$props) $$invalidate(0, todoTag = $$props.todoTag);
		if ("showChecked" in $$props) $$invalidate(7, showChecked = $$props.showChecked);
		if ("groupBy" in $$props) $$invalidate(8, groupBy = $$props.groupBy);
		if ("sortDirection" in $$props) $$invalidate(9, sortDirection = $$props.sortDirection);
		if ("lookAndFeel" in $$props) $$invalidate(1, lookAndFeel = $$props.lookAndFeel);
		if ("ignoreFiles" in $$props) $$invalidate(10, ignoreFiles = $$props.ignoreFiles);
		if ("_collapsedSections" in $$props) $$invalidate(2, _collapsedSections = $$props._collapsedSections);
		if ("updateSetting" in $$props) $$invalidate(11, updateSetting = $$props.updateSetting);
		if ("rerenderKey" in $$props) $$invalidate(12, rerenderKey = $$props.rerenderKey);
		if ("app" in $$props) $$invalidate(3, app = $$props.app);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*rerenderKey, firstRun*/ 4112) {
			{
				if (firstRun) setTimeout(recalcItems, 800); else recalcItems();
			}
		}
	};

	return [
		todoTag,
		lookAndFeel,
		_collapsedSections,
		app,
		firstRun,
		todoGroups,
		toggleGroup,
		showChecked,
		groupBy,
		sortDirection,
		ignoreFiles,
		updateSetting,
		rerenderKey
	];
}

class App extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			todoTag: 0,
			showChecked: 7,
			groupBy: 8,
			sortDirection: 9,
			lookAndFeel: 1,
			ignoreFiles: 10,
			_collapsedSections: 2,
			updateSetting: 11,
			rerenderKey: 12,
			app: 3
		});
	}
}

class TodoListView extends obsidian.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
    }
    getViewType() {
        return TODO_VIEW_TYPE;
    }
    getDisplayText() {
        return "Todo List";
    }
    getIcon() {
        return "checkmark";
    }
    async onClose() {
        this._app.$destroy();
    }
    getProps() {
        return {
            todoTag: this.plugin.getSettingValue("todoPageName"),
            showChecked: this.plugin.getSettingValue("showChecked"),
            groupBy: this.plugin.getSettingValue("groupBy"),
            sortDirection: this.plugin.getSettingValue("sortDirection"),
            ignoreFiles: this.plugin.getSettingValue("ignoreFiles"),
            lookAndFeel: this.plugin.getSettingValue("lookAndFeel"),
            rerenderKey: Symbol("[rerender]"),
            _collapsedSections: this.plugin.getSettingValue("_collapsedSections"),
            app: this.app,
            updateSetting: (updates) => this.plugin.updateSettings(updates),
        };
    }
    async onOpen() {
        this._app = new App({
            target: this.contentEl,
            props: this.getProps(),
        });
        this.registerEvent(this.app.metadataCache.on("resolve", (...args) => {
            // TODO: capture incremental updates here
            this.rerender();
        }));
    }
    rerender() {
        this._app.$set(this.getProps());
    }
}

class TodoPlugin extends obsidian.Plugin {
    async onload() {
        await this.loadSettings();
        this.addSettingTab(new TodoSettingTab(this.app, this));
        this.registerView(TODO_VIEW_TYPE, (leaf) => {
            this.view = new TodoListView(leaf, this);
            return this.view;
        });
        if (this.app.workspace.layoutReady)
            this.initLeaf();
        else
            this.registerEvent(this.app.workspace.on("layout-ready", () => this.initLeaf()));
    }
    initLeaf() {
        if (this.app.workspace.getLeavesOfType(TODO_VIEW_TYPE).length)
            return;
        this.app.workspace.getRightLeaf(true).setViewState({
            type: TODO_VIEW_TYPE,
            active: false,
        });
    }
    onunload() {
        this.view.onClose();
    }
    async loadSettings() {
        const loadedData = await this.loadData();
        this.settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), loadedData);
    }
    async updateSettings(updates) {
        Object.assign(this.settings, updates);
        await this.saveData(this.settings);
        this.view.rerender();
    }
    getSettingValue(setting) {
        return this.settings[setting];
    }
}

module.exports = TodoPlugin;
