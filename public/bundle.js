
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.callbacks.push(() => {
                outroing.delete(block);
                if (callback) {
                    block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
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
        after_render.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Post.svelte generated by Svelte v3.6.2 */

    const file = "src/Post.svelte";

    function create_fragment(ctx) {
    	var div7, div0, t0, div6, div1, img0, t1, p, t2, t3, div2, img1, t4, div5, div3, button0, t6, button1, t8, div4, span, div7_class_value, dispose;

    	return {
    		c: function create() {
    			div7 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div6 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t1 = space();
    			p = element("p");
    			t2 = text(ctx.user);
    			t3 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "✑";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "♥";
    			t8 = space();
    			div4 = element("div");
    			span = element("span");
    			attr(div0, "class", "postBar svelte-euqeb3");
    			add_location(div0, file, 96, 4, 1869);
    			attr(img0, "src", ctx.postericon);
    			attr(img0, "alt", "");
    			attr(img0, "class", "svelte-euqeb3");
    			add_location(img0, file, 100, 12, 1968);
    			attr(p, "class", "username svelte-euqeb3");
    			add_location(p, file, 101, 12, 2010);
    			attr(div1, "class", "postHeader svelte-euqeb3");
    			add_location(div1, file, 99, 8, 1931);
    			attr(img1, "src", ctx.postSrc);
    			attr(img1, "alt", "");
    			attr(img1, "class", "svelte-euqeb3");
    			add_location(img1, file, 104, 12, 2099);
    			attr(div2, "class", "postBody svelte-euqeb3");
    			add_location(div2, file, 103, 8, 2064);
    			attr(button0, "class", "svelte-euqeb3");
    			add_location(button0, file, 108, 16, 2221);
    			attr(button1, "class", "svelte-euqeb3");
    			toggle_class(button1, "like", ctx.liked === true);
    			add_location(button1, file, 109, 16, 2256);
    			attr(div3, "class", "icon svelte-euqeb3");
    			add_location(div3, file, 107, 12, 2186);
    			add_location(span, file, 112, 16, 2393);
    			attr(div4, "class", "text svelte-euqeb3");
    			add_location(div4, file, 111, 12, 2358);
    			attr(div5, "class", "postFooter svelte-euqeb3");
    			add_location(div5, file, 106, 8, 2149);
    			attr(div6, "class", "poster svelte-euqeb3");
    			add_location(div6, file, 98, 4, 1902);
    			attr(div7, "class", div7_class_value = "" + ctx.color + " post" + " svelte-euqeb3");
    			add_location(div7, file, 95, 0, 1838);
    			dispose = listen(button1, "click", ctx.likeButton);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div7, anchor);
    			append(div7, div0);
    			append(div7, t0);
    			append(div7, div6);
    			append(div6, div1);
    			append(div1, img0);
    			append(div1, t1);
    			append(div1, p);
    			append(p, t2);
    			append(div6, t3);
    			append(div6, div2);
    			append(div2, img1);
    			append(div6, t4);
    			append(div6, div5);
    			append(div5, div3);
    			append(div3, button0);
    			append(div3, t6);
    			append(div3, button1);
    			append(div5, t8);
    			append(div5, div4);
    			append(div4, span);
    			span.innerHTML = ctx.text;
    		},

    		p: function update(changed, ctx) {
    			if (changed.postericon) {
    				attr(img0, "src", ctx.postericon);
    			}

    			if (changed.user) {
    				set_data(t2, ctx.user);
    			}

    			if (changed.postSrc) {
    				attr(img1, "src", ctx.postSrc);
    			}

    			if (changed.liked) {
    				toggle_class(button1, "like", ctx.liked === true);
    			}

    			if (changed.text) {
    				span.innerHTML = ctx.text;
    			}

    			if ((changed.color) && div7_class_value !== (div7_class_value = "" + ctx.color + " post" + " svelte-euqeb3")) {
    				attr(div7, "class", div7_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div7);
    			}

    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { user = 'null', postericon = '../images/userProfile/profile1.jpg', text = 'this is an exampel', postSrc = '../images/posts/bild1.jpg', likes = 0, liked = false, comments = [
            {autho: "autho", comment: "comment"}
        ], color = "gray" } = $$props;


        const likeButton = () => { const $$result = liked = !liked; $$invalidate('liked', liked); return $$result; };

    	const writable_props = ['user', 'postericon', 'text', 'postSrc', 'likes', 'liked', 'comments', 'color'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Post> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('user' in $$props) $$invalidate('user', user = $$props.user);
    		if ('postericon' in $$props) $$invalidate('postericon', postericon = $$props.postericon);
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('postSrc' in $$props) $$invalidate('postSrc', postSrc = $$props.postSrc);
    		if ('likes' in $$props) $$invalidate('likes', likes = $$props.likes);
    		if ('liked' in $$props) $$invalidate('liked', liked = $$props.liked);
    		if ('comments' in $$props) $$invalidate('comments', comments = $$props.comments);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    	};

    	return {
    		user,
    		postericon,
    		text,
    		postSrc,
    		likes,
    		liked,
    		comments,
    		color,
    		likeButton
    	};
    }

    class Post extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["user", "postericon", "text", "postSrc", "likes", "liked", "comments", "color"]);
    	}

    	get user() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get postericon() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set postericon(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get postSrc() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set postSrc(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get likes() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set likes(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get liked() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set liked(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get comments() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set comments(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/PopUpp/uppload.svelte generated by Svelte v3.6.2 */

    const file_1 = "src/PopUpp/uppload.svelte";

    function create_fragment$1(ctx) {
    	var form, img, t0, div, input0, t1, input1, t2, input2, dispose;

    	return {
    		c: function create() {
    			form = element("form");
    			img = element("img");
    			t0 = space();
    			div = element("div");
    			input0 = element("input");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			input2 = element("input");
    			attr(img, "src", ctx.file);
    			attr(img, "alt", "");
    			set_style(img, "cursor", "pointer");
    			attr(img, "class", "svelte-lzykve");
    			add_location(img, file_1, 55, 4, 1056);
    			attr(input0, "id", "upfile");
    			attr(input0, "name", "profileImage");
    			attr(input0, "type", "file");
    			attr(input0, "class", "svelte-lzykve");
    			add_location(input0, file_1, 57, 57, 1237);
    			set_style(div, "height", "0px");
    			set_style(div, "width", "0px");
    			set_style(div, "overflow", "hidden");
    			attr(div, "class", "svelte-lzykve");
    			add_location(div, file_1, 57, 4, 1184);
    			attr(input1, "type", "textarea");
    			attr(input1, "placeholder", "Write somthing");
    			attr(input1, "class", "svelte-lzykve");
    			add_location(input1, file_1, 59, 4, 1434);
    			attr(input2, "type", "button");
    			input2.value = "uppload";
    			attr(input2, "class", "svelte-lzykve");
    			add_location(input2, file_1, 60, 4, 1491);
    			attr(form, "id", "formUpload");
    			attr(form, "action", "/api/images");
    			attr(form, "method", "POST");
    			attr(form, "enctype", "multipart/form-data");
    			attr(form, "class", "svelte-lzykve");
    			add_location(form, file_1, 54, 0, 964);

    			dispose = [
    				listen(img, "click", getFile2),
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input2, "click", ctx.uppload)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, form, anchor);
    			append(form, img);
    			append(form, t0);
    			append(form, div);
    			append(div, input0);
    			append(form, t1);
    			append(form, input1);
    			append(form, t2);
    			append(form, input2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.file) {
    				attr(img, "src", ctx.file);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(form);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function getFile2(){
        document.getElementById("upfile").click();
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

        var uppload = () => dispatch('uppload', {
            file: files[0]
        });

        var files = [new Blob()];
        let file;

        let reader = new FileReader();
        reader.onload = (e) => { $$invalidate('file', file = e.target.result); }; $$invalidate('reader', reader);

    	function input0_input_handler() {
    		files = this.files;
    		$$invalidate('files', files);
    	}

    	$$self.$$.update = ($$dirty = { reader: 1, files: 1 }) => {
    		if ($$dirty.reader || $$dirty.files) { reader.readAsDataURL(files[0]); }
    	};

    	return {
    		uppload,
    		files,
    		file,
    		input0_input_handler
    	};
    }

    class Uppload extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src/Header.svelte generated by Svelte v3.6.2 */

    const file$1 = "src/Header.svelte";

    // (78:4) {#if loggedIn}
    function create_if_block_1(ctx) {
    	var div1, div0, t0, p, t1_value = ctx.user.Username, t1;

    	function select_block_type(ctx) {
    		if (ctx.user.Usericon != null) return create_if_block_2;
    		return create_else_block_1;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			attr(div0, "class", "image svelte-dwkjux");
    			add_location(div0, file$1, 79, 12, 1570);
    			attr(p, "class", "svelte-dwkjux");
    			add_location(p, file$1, 86, 12, 1832);
    			attr(div1, "class", "profileDisplay svelte-dwkjux");
    			add_location(div1, file$1, 78, 8, 1529);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			if_block.m(div0, null);
    			append(div1, t0);
    			append(div1, p);
    			append(p, t1);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if ((changed.user) && t1_value !== (t1_value = ctx.user.Username)) {
    				set_data(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if_block.d();
    		}
    	};
    }

    // (83:16) {:else}
    function create_else_block_1(ctx) {
    	var p, dispose;

    	return {
    		c: function create() {
    			p = element("p");
    			p.textContent = "add";
    			attr(p, "id", "imgtag");
    			attr(p, "class", "svelte-dwkjux");
    			add_location(p, file$1, 83, 20, 1734);
    			dispose = listen(p, "click", ctx.imageEvent);
    		},

    		m: function mount(target, anchor) {
    			insert(target, p, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(p);
    			}

    			dispose();
    		}
    	};
    }

    // (81:16) {#if user.Usericon != null}
    function create_if_block_2(ctx) {
    	var img, img_src_value;

    	return {
    		c: function create() {
    			img = element("img");
    			attr(img, "src", img_src_value = ctx.user.Usericon);
    			attr(img, "alt", "");
    			attr(img, "class", "svelte-dwkjux");
    			add_location(img, file$1, 81, 20, 1655);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.user) && img_src_value !== (img_src_value = ctx.user.Usericon)) {
    				attr(img, "src", img_src_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    			}
    		}
    	};
    }

    // (97:12) {:else}
    function create_else_block(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("LoggOut");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (95:12) {#if !loggedIn}
    function create_if_block(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("LoggIn");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var div, h1, t1, t2, ul, li0, button0, t4, li1, button1, t6, li2, button2, dispose;

    	var if_block0 = (ctx.loggedIn) && create_if_block_1(ctx);

    	function select_block_type_1(ctx) {
    		if (!ctx.loggedIn) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type_1(ctx);
    	var if_block1 = current_block_type(ctx);

    	return {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "HBU";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			button0.textContent = "Settings";
    			t4 = space();
    			li1 = element("li");
    			button1 = element("button");
    			button1.textContent = "Uppload";
    			t6 = space();
    			li2 = element("li");
    			button2 = element("button");
    			if_block1.c();
    			attr(h1, "class", "title");
    			add_location(h1, file$1, 75, 4, 1474);
    			attr(button0, "class", "svelte-dwkjux");
    			add_location(button0, file$1, 91, 12, 1902);
    			add_location(li0, file$1, 91, 8, 1898);
    			attr(button1, "class", "svelte-dwkjux");
    			add_location(button1, file$1, 92, 12, 1970);
    			add_location(li1, file$1, 92, 8, 1966);
    			attr(button2, "class", "svelte-dwkjux");
    			add_location(button2, file$1, 93, 12, 2036);
    			add_location(li2, file$1, 93, 8, 2032);
    			attr(ul, "class", "svelte-dwkjux");
    			add_location(ul, file$1, 90, 4, 1885);
    			attr(div, "class", "header");
    			add_location(div, file$1, 73, 0, 1448);

    			dispose = [
    				listen(button0, "click", ctx.settingsEvent),
    				listen(button1, "click", ctx.upploadEvent),
    				listen(button2, "click", ctx.userEvent)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    			append(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t2);
    			append(div, ul);
    			append(ul, li0);
    			append(li0, button0);
    			append(ul, t4);
    			append(ul, li1);
    			append(li1, button1);
    			append(ul, t6);
    			append(ul, li2);
    			append(li2, button2);
    			if_block1.m(button2, null);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.loggedIn) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);
    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button2, null);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (if_block0) if_block0.d();
    			if_block1.d();
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

        var settingsEvent = () => dispatch('openSettings');
        var upploadEvent = () => dispatch('openUppload');
        var userEvent = () => {
            if(loggedIn) dispatch('loggOut');
            else dispatch('loggIn');
        };
        var imageEvent = () => dispatch('upploadProfileImage');

        var { user } = $$props;

        var loggedIn;

    	const writable_props = ['user'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('user' in $$props) $$invalidate('user', user = $$props.user);
    	};

    	$$self.$$.update = ($$dirty = { user: 1 }) => {
    		if ($$dirty.user) { $$invalidate('loggedIn', loggedIn = user != null); }
    	};

    	return {
    		settingsEvent,
    		upploadEvent,
    		userEvent,
    		imageEvent,
    		user,
    		loggedIn
    	};
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["user"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.user === undefined && !('user' in props)) {
    			console.warn("<Header> was created without expected prop 'user'");
    		}
    	}

    	get user() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/PopUpp/Loggin.svelte generated by Svelte v3.6.2 */

    const file$2 = "src/PopUpp/Loggin.svelte";

    function create_fragment$3(ctx) {
    	var div, h1, t1, label0, t2, input0, t3, label1, t4, input1, t5, button, t7, p, t8, a, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Logga in";
    			t1 = space();
    			label0 = element("label");
    			t2 = text("UserName: ");
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Password: ");
    			input1 = element("input");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Logga in";
    			t7 = space();
    			p = element("p");
    			t8 = text("You dont hav an acount? ");
    			a = element("a");
    			a.textContent = "Create a acount";
    			attr(h1, "class", "svelte-1mjce4s");
    			add_location(h1, file$2, 52, 4, 838);
    			attr(input0, "type", "text");
    			attr(input0, "class", "svelte-1mjce4s");
    			add_location(input0, file$2, 53, 21, 877);
    			attr(label0, "class", "svelte-1mjce4s");
    			add_location(label0, file$2, 53, 4, 860);
    			attr(input1, "type", "password");
    			attr(input1, "class", "svelte-1mjce4s");
    			add_location(input1, file$2, 54, 21, 948);
    			attr(label1, "class", "svelte-1mjce4s");
    			add_location(label1, file$2, 54, 4, 931);
    			attr(button, "class", "svelte-1mjce4s");
    			add_location(button, file$2, 55, 4, 1006);
    			attr(a, "class", "svelte-1mjce4s");
    			add_location(a, file$2, 56, 31, 1081);
    			attr(p, "class", "svelte-1mjce4s");
    			add_location(p, file$2, 56, 4, 1054);
    			attr(div, "class", "svelte-1mjce4s");
    			add_location(div, file$2, 51, 0, 828);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(button, "click", ctx.submit),
    				listen(a, "click", ctx.createAcount)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    			append(div, t1);
    			append(div, label0);
    			append(label0, t2);
    			append(label0, input0);

    			input0.value = ctx.username;

    			append(div, t3);
    			append(div, label1);
    			append(label1, t4);
    			append(label1, input1);

    			input1.value = ctx.password;

    			append(div, t5);
    			append(div, button);
    			append(div, t7);
    			append(div, p);
    			append(p, t8);
    			append(p, a);
    		},

    		p: function update(changed, ctx) {
    			if (changed.username && (input0.value !== ctx.username)) input0.value = ctx.username;
    			if (changed.password) input1.value = ctx.password;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

        var createAcount = () => dispatch('newAcount');
        var submit = () => dispatch('submit', {
            Username: username,
            Password: password
        });

        var { username = '', password = '' } = $$props;

    	const writable_props = ['username', 'password'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Loggin> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate('username', username);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate('password', password);
    	}

    	$$self.$set = $$props => {
    		if ('username' in $$props) $$invalidate('username', username = $$props.username);
    		if ('password' in $$props) $$invalidate('password', password = $$props.password);
    	};

    	return {
    		createAcount,
    		submit,
    		username,
    		password,
    		input0_input_handler,
    		input1_input_handler
    	};
    }

    class Loggin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["username", "password"]);
    	}

    	get username() {
    		throw new Error("<Loggin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set username(value) {
    		throw new Error("<Loggin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get password() {
    		throw new Error("<Loggin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set password(value) {
    		throw new Error("<Loggin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/PopUpp/NewAcount.svelte generated by Svelte v3.6.2 */

    const file$3 = "src/PopUpp/NewAcount.svelte";

    function create_fragment$4(ctx) {
    	var div, h1, t1, label0, t2, input0, t3, label1, t4, input1, t5, label2, t6, input2, t7, label3, t8, input3, t9, label4, t10, input4, t11, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Create a new acount";
    			t1 = space();
    			label0 = element("label");
    			t2 = text("UserName: ");
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Name: ");
    			input1 = element("input");
    			t5 = space();
    			label2 = element("label");
    			t6 = text("E-post: ");
    			input2 = element("input");
    			t7 = space();
    			label3 = element("label");
    			t8 = text("Password: ");
    			input3 = element("input");
    			t9 = space();
    			label4 = element("label");
    			t10 = text("Password: ");
    			input4 = element("input");
    			t11 = space();
    			button = element("button");
    			button.textContent = "Create acount";
    			attr(h1, "class", "svelte-1uly4mt");
    			add_location(h1, file$3, 74, 4, 1289);
    			attr(input0, "type", "text");
    			attr(input0, "class", "svelte-1uly4mt");
    			add_location(input0, file$3, 75, 21, 1339);
    			attr(label0, "class", "svelte-1uly4mt");
    			add_location(label0, file$3, 75, 4, 1322);
    			attr(input1, "type", "text");
    			attr(input1, "class", "svelte-1uly4mt");
    			add_location(input1, file$3, 76, 17, 1406);
    			attr(label1, "class", "svelte-1uly4mt");
    			add_location(label1, file$3, 76, 4, 1393);
    			attr(input2, "type", "text");
    			attr(input2, "class", "svelte-1uly4mt");
    			add_location(input2, file$3, 77, 19, 1471);
    			attr(label2, "class", "svelte-1uly4mt");
    			add_location(label2, file$3, 77, 4, 1456);
    			attr(input3, "type", "password");
    			attr(input3, "class", "svelte-1uly4mt");
    			add_location(input3, file$3, 78, 21, 1539);
    			attr(label3, "class", "svelte-1uly4mt");
    			add_location(label3, file$3, 78, 4, 1522);
    			attr(input4, "type", "password");
    			attr(input4, "class", "svelte-1uly4mt");
    			add_location(input4, file$3, 79, 21, 1615);
    			attr(label4, "class", "svelte-1uly4mt");
    			add_location(label4, file$3, 79, 4, 1598);
    			attr(button, "class", "svelte-1uly4mt");
    			add_location(button, file$3, 80, 4, 1674);
    			attr(div, "class", "" + ctx.Class + " svelte-1uly4mt");
    			add_location(div, file$3, 73, 0, 1263);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input3, "input", ctx.input3_input_handler),
    				listen(input4, "input", ctx.input4_input_handler),
    				listen(button, "click", ctx.submit)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    			append(div, t1);
    			append(div, label0);
    			append(label0, t2);
    			append(label0, input0);

    			input0.value = ctx.username;

    			append(div, t3);
    			append(div, label1);
    			append(label1, t4);
    			append(label1, input1);

    			input1.value = ctx.name;

    			append(div, t5);
    			append(div, label2);
    			append(label2, t6);
    			append(label2, input2);

    			input2.value = ctx.email;

    			append(div, t7);
    			append(div, label3);
    			append(label3, t8);
    			append(label3, input3);

    			input3.value = ctx.password1;

    			append(div, t9);
    			append(div, label4);
    			append(label4, t10);
    			append(label4, input4);

    			input4.value = ctx.password2;

    			append(div, t11);
    			append(div, button);
    		},

    		p: function update(changed, ctx) {
    			if (changed.username && (input0.value !== ctx.username)) input0.value = ctx.username;
    			if (changed.name && (input1.value !== ctx.name)) input1.value = ctx.name;
    			if (changed.email && (input2.value !== ctx.email)) input2.value = ctx.email;
    			if (changed.password1) input3.value = ctx.password1;
    			if (changed.password2) input4.value = ctx.password2;

    			if (changed.Class) {
    				attr(div, "class", "" + ctx.Class + " svelte-1uly4mt");
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

        var submit = () => {

            if(password1 !== password2) {
                $$invalidate('Class', Class = "error");
            } else {
                $$invalidate('Class', Class = "");

                dispatch('submit', {
                    Username: username,
                    Name: name,
                    Email: email,
                    Password: password1,
                });
            }
        };

        var username = "";
        var name = "";
        var email = "";
        var password1 = "";
        var password2 = "";
        var profileImage = [new Blob()];

        let Class = "";

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate('username', username);
    	}

    	function input1_input_handler() {
    		name = this.value;
    		$$invalidate('name', name);
    	}

    	function input2_input_handler() {
    		email = this.value;
    		$$invalidate('email', email);
    	}

    	function input3_input_handler() {
    		password1 = this.value;
    		$$invalidate('password1', password1);
    	}

    	function input4_input_handler() {
    		password2 = this.value;
    		$$invalidate('password2', password2);
    	}

    	return {
    		submit,
    		username,
    		name,
    		email,
    		password1,
    		password2,
    		Class,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler
    	};
    }

    class NewAcount extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/PopUpp/UpploadProfileImage.svelte generated by Svelte v3.6.2 */

    const file_1$1 = "src/PopUpp/UpploadProfileImage.svelte";

    function create_fragment$5(ctx) {
    	var form, img, t0, div0, t2, div1, input0, t3, input1, dispose;

    	return {
    		c: function create() {
    			form = element("form");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "Choose a file";
    			t2 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t3 = space();
    			input1 = element("input");
    			attr(img, "src", ctx.file);
    			attr(img, "alt", "");
    			attr(img, "class", "svelte-1wyg38x");
    			add_location(img, file_1$1, 67, 8, 1462);
    			attr(div0, "id", "yourBtn");
    			set_style(div0, "height", "50px");
    			set_style(div0, "width", "100px");
    			set_style(div0, "border", "1px dashed #BBB");
    			set_style(div0, "cursor", "pointer");
    			attr(div0, "class", "svelte-1wyg38x");
    			add_location(div0, file_1$1, 68, 8, 1494);
    			attr(input0, "id", "upfile");
    			attr(input0, "name", "profileImage");
    			attr(input0, "type", "file");
    			add_location(input0, file_1$1, 70, 61, 1747);
    			set_style(div1, "height", "0px");
    			set_style(div1, "width", "0px");
    			set_style(div1, "overflow", "hidden");
    			add_location(div1, file_1$1, 70, 8, 1694);
    			attr(input1, "type", "button");
    			input1.value = "uppload";
    			attr(input1, "class", "svelte-1wyg38x");
    			add_location(input1, file_1$1, 72, 8, 1952);
    			attr(form, "id", "formProfile");
    			attr(form, "action", "/api/images");
    			attr(form, "method", "POST");
    			attr(form, "enctype", "multipart/form-data");
    			attr(form, "class", "svelte-1wyg38x");
    			add_location(form, file_1$1, 66, 0, 1365);

    			dispose = [
    				listen(div0, "click", getFile),
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(input1, "click", ctx.uppload)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, form, anchor);
    			append(form, img);
    			append(form, t0);
    			append(form, div0);
    			append(form, t2);
    			append(form, div1);
    			append(div1, input0);
    			append(form, t3);
    			append(form, input1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.file) {
    				attr(img, "src", ctx.file);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(form);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function getFile(){
        document.getElementById("upfile").click();
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

        var uppload = () => dispatch('uppload', {
            file: files[0]
        });

        var files = [new Blob()];
        let file;

        let reader = new FileReader();
        reader.onload = (e) => { $$invalidate('file', file = e.target.result); }; $$invalidate('reader', reader);

    	function input0_input_handler() {
    		files = this.files;
    		$$invalidate('files', files);
    	}

    	$$self.$$.update = ($$dirty = { reader: 1, files: 1 }) => {
    		if ($$dirty.reader || $$dirty.files) { reader.readAsDataURL(files[0]); }
    	};

    	return {
    		uppload,
    		files,
    		file,
    		input0_input_handler
    	};
    }

    class UpploadProfileImage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, []);
    	}
    }

    /*
      profile data 
      local storage for testing 
     */


    /*

    */

    function Loggin$1(event, _callback) {
      var e = event.detail;

      let h = new Headers();
      h.append('Accept', 'application/json');

      let fd = new FormData();
      fd.append('Username', e.Username);
      fd.append('Password', e.Password);

      let req = new Request('http://localhost/Loggin', {
        method: 'POST',
        headers: h,
        mode: 'no-cors',
        body: fd
      });

      fetch(req)
            .then( (res) => {
              return res.json()
            })
            .then( (res) => {
              _callback(res);
            })
            .catch( (err) => {
              console.log('ERROR:', err.message);
            }); 

    }


    /*
      Create a new acount
      Try to send alla the acount info to the server and get a uppdate respons of the server
    */
    function CreateNewAcount(event, _callback) {
        var e = event.detail;

        console.table(e);

        let h = new Headers();
        h.append('Accept', 'application/json');

        let fd = new FormData();
        fd.append('Username', e.Username);
        fd.append('Name', e.Name);
        fd.append('Email', e.Email);
        fd.append('Password', e.Password);

        let req = new Request('http://localhost/CreateAcount', {
          method: 'POST',
          headers: h,
          mode: 'no-cors',
          body: fd
        });

        fetch(req)
              .then( (res) => {
                return res.json();
              })
              .then( (res) => {
                _callback(res);
              })
              .catch( (err) => {
                console.log('ERROR:', err.message);
              });
               
      }


    /*
      uppload a profile image
    */
    function Uppload$1(file, _callback) {

      let h = new Headers();
      //h.append('Accept', 'application/json');

      let fd = new FormData();

      fd.append('profile', window.localStorage.getItem('loggedin'));

      console.log('file ::: ', file);
      fd.append('icone', file, 'icone.jpg');

      let req = new Request('/ImageUppload', {
        method: 'POST',
        headers: {},
        mode: 'no-cors',
        body: fd
      });

      fetch(req)
            .then( (res) => {
              return res.json();
            })
            .then( (res) => {
              console.log("anser");
              _callback(res);
            })
            .catch( (err) => {
              console.log('ERROR:', err.message);
            });

    }

    /* src/App.svelte generated by Svelte v3.6.2 */

    const file$4 = "src/App.svelte";

    // (150:0) {#if showUPI}
    function create_if_block_3(ctx) {
    	var div0, t, div1, current;

    	var upploadprofileimage = new UpploadProfileImage({ $$inline: true });
    	upploadprofileimage.$on("uppload", ctx.uppload_handler);

    	return {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			upploadprofileimage.$$.fragment.c();
    			attr(div0, "class", "mask svelte-1xptwwj");
    			add_location(div0, file$4, 150, 0, 2954);
    			attr(div1, "class", "UIP svelte-1xptwwj");
    			add_location(div1, file$4, 151, 2, 2981);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t, anchor);
    			insert(target, div1, anchor);
    			mount_component(upploadprofileimage, div1, null);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(upploadprofileimage.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(upploadprofileimage.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    				detach(t);
    				detach(div1);
    			}

    			destroy_component(upploadprofileimage, );
    		}
    	};
    }

    // (169:0) {#if showUppload}
    function create_if_block_2$1(ctx) {
    	var div, current;

    	var uppload_1 = new Uppload({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			uppload_1.$$.fragment.c();
    			attr(div, "class", "uppload svelte-1xptwwj");
    			add_location(div, file$4, 169, 2, 3466);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(uppload_1, div, null);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(uppload_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(uppload_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_component(uppload_1, );
    		}
    	};
    }

    // (175:0) {#if showLoggin}
    function create_if_block_1$1(ctx) {
    	var div0, t, div1, current;

    	var loggin = new Loggin({ $$inline: true });
    	loggin.$on("newAcount", ctx.openCAcount);
    	loggin.$on("submit", ctx.submit_handler);

    	return {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			loggin.$$.fragment.c();
    			attr(div0, "class", "mask svelte-1xptwwj");
    			add_location(div0, file$4, 175, 2, 3538);
    			attr(div1, "class", "loggin svelte-1xptwwj");
    			add_location(div1, file$4, 176, 2, 3565);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t, anchor);
    			insert(target, div1, anchor);
    			mount_component(loggin, div1, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(loggin.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(loggin.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    				detach(t);
    				detach(div1);
    			}

    			destroy_component(loggin, );
    		}
    	};
    }

    // (191:0) {#if showAddAcount}
    function create_if_block$1(ctx) {
    	var div0, t, div1, current;

    	var addacount = new NewAcount({ $$inline: true });
    	addacount.$on("submit", ctx.submit_handler_1);

    	return {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			addacount.$$.fragment.c();
    			attr(div0, "class", "mask svelte-1xptwwj");
    			add_location(div0, file$4, 191, 2, 3946);
    			attr(div1, "class", "addAcount svelte-1xptwwj");
    			add_location(div1, file$4, 192, 2, 3973);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			insert(target, t, anchor);
    			insert(target, div1, anchor);
    			mount_component(addacount, div1, null);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(addacount.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(addacount.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    				detach(t);
    				detach(div1);
    			}

    			destroy_component(addacount, );
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	var t0, t1, t2, t3, div3, div0, t4, t5, div2, div1, current;

    	var if_block0 = (ctx.showUPI) && create_if_block_3(ctx);

    	var if_block1 = (ctx.showUppload) && create_if_block_2$1();

    	var if_block2 = (ctx.showLoggin) && create_if_block_1$1(ctx);

    	var if_block3 = (ctx.showAddAcount) && create_if_block$1(ctx);

    	var post0 = new Post({ $$inline: true });

    	var post1_spread_levels = [
    		ctx.p
    	];

    	let post1_props = {};
    	for (var i = 0; i < post1_spread_levels.length; i += 1) {
    		post1_props = assign(post1_props, post1_spread_levels[i]);
    	}
    	var post1 = new Post({ props: post1_props, $$inline: true });

    	var header = new Header({
    		props: { user: ctx.data },
    		$$inline: true
    	});
    	header.$on("upploadProfileImage", ctx.ProfileImageUppload);
    	header.$on("openSettings", ctx.settings);
    	header.$on("openUppload", ctx.uppload);
    	header.$on("loggIn", ctx.user);
    	header.$on("loggOut", ctx.userOut);

    	return {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			div3 = element("div");
    			div0 = element("div");
    			post0.$$.fragment.c();
    			t4 = space();
    			post1.$$.fragment.c();
    			t5 = space();
    			div2 = element("div");
    			div1 = element("div");
    			header.$$.fragment.c();
    			attr(div0, "class", "posts svelte-1xptwwj");
    			add_location(div0, file$4, 207, 2, 4258);
    			attr(div1, "class", "sidbarHead svelte-1xptwwj");
    			add_location(div1, file$4, 214, 4, 4351);
    			attr(div2, "class", "sidbar svelte-1xptwwj");
    			add_location(div2, file$4, 212, 2, 4321);
    			attr(div3, "class", "main svelte-1xptwwj");
    			add_location(div3, file$4, 205, 0, 4236);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert(target, t3, anchor);
    			insert(target, div3, anchor);
    			append(div3, div0);
    			mount_component(post0, div0, null);
    			append(div0, t4);
    			mount_component(post1, div0, null);
    			append(div3, t5);
    			append(div3, div2);
    			append(div2, div1);
    			mount_component(header, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.showUPI) {
    				if (!if_block0) {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				} else {
    									transition_in(if_block0, 1);
    				}
    			} else if (if_block0) {
    				group_outros();
    				transition_out(if_block0, 1, () => {
    					if_block0 = null;
    				});
    				check_outros();
    			}

    			if (ctx.showUppload) {
    				if (!if_block1) {
    					if_block1 = create_if_block_2$1();
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				} else {
    									transition_in(if_block1, 1);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}

    			if (ctx.showLoggin) {
    				if (if_block2) {
    					if_block2.p(changed, ctx);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();
    				transition_out(if_block2, 1, () => {
    					if_block2 = null;
    				});
    				check_outros();
    			}

    			if (ctx.showAddAcount) {
    				if (!if_block3) {
    					if_block3 = create_if_block$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t3.parentNode, t3);
    				} else {
    									transition_in(if_block3, 1);
    				}
    			} else if (if_block3) {
    				group_outros();
    				transition_out(if_block3, 1, () => {
    					if_block3 = null;
    				});
    				check_outros();
    			}

    			var post1_changes = changed.p ? get_spread_update(post1_spread_levels, [
    				ctx.p
    			]) : {};
    			post1.$set(post1_changes);

    			var header_changes = {};
    			if (changed.data) header_changes.user = ctx.data;
    			header.$set(header_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);

    			transition_in(post0.$$.fragment, local);

    			transition_in(post1.$$.fragment, local);

    			transition_in(header.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(post0.$$.fragment, local);
    			transition_out(post1.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			if (if_block2) if_block2.d(detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			if (if_block3) if_block3.d(detaching);

    			if (detaching) {
    				detach(t3);
    				detach(div3);
    			}

    			destroy_component(post0, );

    			destroy_component(post1, );

    			destroy_component(header, );
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	

      let showUppload = false;
      let showLoggin = false;
      let showAddAcount = false;
      let showUPI = false; //UpploadProfileImage



      //testing
    	const p = {
                  user: 'PhilipJohansson',
                  postericon: '../images/userProfile/profile1.jpg',
                  text: 'so i took this pikture today and its of a <strong>fågel</strong>',
                  postSrc: '../images/posts/bild2.jpg',
                  likes: 0,
                  comments: [
                      {autho: "autho", comment: "comment"}
                  ],
                  color: "orange"
                };

      var settings = () => console.log("open settings");
      var uppload = () => { const $$result = showUppload = !showUppload; $$invalidate('showUppload', showUppload); return $$result; };
      var user = () => { const $$result = showLoggin = !showLoggin; $$invalidate('showLoggin', showLoggin); return $$result; };
      var userOut = () => {
        //loggar ut användaren
        window.localStorage.removeItem('loggedin');
        $$invalidate('data', data = null);
      };
      var openCAcount = () => {
          $$invalidate('showLoggin', showLoggin = false);
          $$invalidate('showAddAcount', showAddAcount = true);
      };
      var ProfileImageUppload = () => {
        $$invalidate('showUPI', showUPI = true);
      };

      var data = JSON.parse(window.localStorage.getItem('loggedin'));

    	function uppload_handler(file) {
    	      Uppload$1(file.detail.file, (res) => {
    	        showUPI = false; $$invalidate('showUPI', showUPI);
    	        data.Usericon = res.url; $$invalidate('data', data);

    	        //update local storage
    	        var temp = JSON.parse(window.localStorage.getItem('loggedin'));
    	        temp.Usericon = res.url; $$invalidate('temp', temp);
    	        window.localStorage.setItem('loggedin', JSON.stringify(temp));
    	        
    	        console.log('res :: ', res);
    	      });
    	    }

    	function submit_handler(event) {
    	        Loggin$1(event, (res) => {
    	          if(res.command == "okey") {
    	            window.localStorage.setItem('loggedin', JSON.stringify(res.data));
    	            data = res.data; $$invalidate('data', data);
    	            showLoggin = false; $$invalidate('showLoggin', showLoggin);
    	          }
    	        });
    	      }

    	function submit_handler_1(e) {
    	      CreateNewAcount(e, (res) => {
    	        console.log(res);
    	        if(res.res == 1) {
    	          showAddAcount = false; $$invalidate('showAddAcount', showAddAcount);
    	          console.log("sent");
    	        }
    	      });
    	  }

    	return {
    		showUppload,
    		showLoggin,
    		showAddAcount,
    		showUPI,
    		p,
    		settings,
    		uppload,
    		user,
    		userOut,
    		openCAcount,
    		ProfileImageUppload,
    		data,
    		console,
    		window,
    		JSON,
    		uppload_handler,
    		submit_handler,
    		submit_handler_1
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
