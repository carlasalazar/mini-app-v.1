---
name: react-to-miniapp
description: >
  Refactor or migrate React/web applications into Alipay Mini Programs (miniapps).
  Use this skill whenever the user wants to convert, port, migrate, or refactor a
  React app, web component, HTML/CSS project, or any frontend code into a Mini Program
  compatible with Alipay's framework. Also triggers when the user asks how to build a
  Mini Program from scratch, mentions AXML, ACSS, Mini Program components, lifecycle
  methods, navigation, events, slots, state management, error handling, multimedia,
  maps, or asks about differences between React/web and Mini Program development.
  Always use this skill when someone mentions miniapp development, even casually.
---

# React → Alipay Mini Program Refactoring Skill

A complete guide for converting React (or other web) applications into Alipay Mini Programs.
Covers conceptual mapping, file translation, restrictions, guidelines, and patterns for every
major topic: AXML, ACSS, navigation, components, lifecycle, events, state, multimedia, maps,
error handling, and H5 embedding.

---

## Table of Contents

1. [Core Execution Environment — Critical Restrictions](#1-core-execution-environment--critical-restrictions)
2. [Mental Model: Web vs. Mini Program](#2-mental-model-web-vs-mini-program)
3. [Project Structure](#3-project-structure)
4. [AXML — Markup Language](#4-axml--markup-language)
5. [ACSS — Styles](#5-acss--styles)
6. [Step-by-Step Migration Checklist](#6-step-by-step-migration-checklist)
7. [App Lifecycle](#7-app-lifecycle)
8. [Page Lifecycle](#8-page-lifecycle)
9. [Component Lifecycle](#9-component-lifecycle)
10. [State Management Patterns](#10-state-management-patterns)
11. [Events](#11-events)
12. [Navigation](#12-navigation)
13. [Custom Components](#13-custom-components)
14. [Slots](#14-slots)
15. [Templates and Includes](#15-templates-and-includes)
16. [Multimedia — Image, Video, Audio, Lottie](#16-multimedia--image-video-audio-lottie)
17. [Maps](#17-maps)
18. [H5 / Web-View Embedding](#18-h5--web-view-embedding)
19. [Error Handling](#19-error-handling)
20. [TabBar Configuration](#20-tabbar-configuration)
21. [Hard Restrictions and Guidelines Summary](#21-hard-restrictions-and-guidelines-summary)
22. [Common Pitfalls and Anti-patterns](#22-common-pitfalls-and-anti-patterns)
23. [Quick Reference Tables](#23-quick-reference-tables)

---

## 1. Core Execution Environment — Critical Restrictions

> **Read this section before writing any code.** Violating these constraints causes
> silent failures or crashes that are hard to debug.

### What does NOT exist in a Mini Program

Mini Programs do **not** run in a browser. They run inside the Alipay native app in a
custom JavaScript engine. The following browser globals are **completely absent**:

| Missing global                    | Mini Program replacement                          |
|-----------------------------------|---------------------------------------------------|
| `window`                          | No replacement — redesign any logic using it      |
| `document`                        | No replacement — use AXML + `setData` for UI      |
| `document.getElementById`         | `my.createSelectorQuery` (measurements only)      |
| `localStorage`                    | `my.setStorage` / `my.getStorage`                 |
| `sessionStorage`                  | Not available — use `app.globalData`              |
| `location.href`                   | `my.navigateTo` / `my.redirectTo`                 |
| `history.push`                    | `my.navigateTo`                                   |
| `XMLHttpRequest` / `fetch`        | `my.request`                                      |
| `WebSocket`                       | `my.connectSocket`                                |
| `alert` / `confirm` / `prompt`    | `my.alert` / `my.confirm`                         |
| `navigator.geolocation`           | `my.getLocation`                                  |
| `HTMLVideoElement`                | `<video>` tag + `my.createVideoContext`           |
| `AudioContext`                    | `my.createInnerAudioContext`                      |
| `canvas.getContext`               | `my.createCanvasContext`                          |

### Network restrictions

- **HTTPS only.** All URLs used in `my.request`, `<video src>`, remote `<image src>`,
  and `<web-view src>` must use `https://`. HTTP is blocked at the framework level.
- **Domain whitelisting.** Every domain your app calls must be registered in the Mini
  Program management console under "Server Domains". Unregistered domains are silently blocked.
- **WAP / H5 domain whitelisting.** Domains loaded inside `<web-view>` must additionally
  be registered under "WAP URLs" in the console — separate from Server Domains.

### Asset restrictions

- **Local images** (bundled in the project) work in `<image src>` without any special setup.
- **Local video files are NOT supported.** Video must be served from an HTTPS URL.
- **Video domain must be whitelisted** in the management console.
- **Lottie animations** can be loaded from a bundled `.json` file (`path`), a `.zip`
  package (`djangoId`), or from an HTTPS URL. They require the `<lottie>` component.
- **TabBar icons must be local files.** Remote URLs are not supported for tabBar icons.

### npm / third-party library restrictions

- There is **no npm runtime**. You can bundle pure JavaScript utility files directly.
- Any library that references `window`, `document`, or other browser APIs will **crash at runtime**.
- Audit every dependency before porting. Replace DOM-dependent libs with Mini Program APIs.
- React, ReactDOM, Vue, Angular, and similar UI frameworks **cannot be used**.

### ACSS styling restrictions

- The `*` universal selector is **not supported**.
- The `:root` pseudo-class is **not supported**.
- External stylesheets via `@import url(http://…)` are **not supported**.
- `position: fixed` works but may behave differently — always test on a real device.
- CSS animations work but advanced or experimental properties may have limited support.

---

## 2. Mental Model: Web vs. Mini Program

| Concept               | Web / React                            | Mini Program                                      |
|-----------------------|----------------------------------------|---------------------------------------------------|
| Markup                | HTML                                   | AXML (Alipay eXtensible Markup Language)          |
| Styles                | CSS / CSS Modules / styled-components  | ACSS (Alipay Style Sheet)                         |
| Logic                 | JS / JSX                               | JS (no JSX) inside `Page()` or `Component()`     |
| Config                | `package.json`, webpack config         | `.json` per page/component + `app.json`           |
| Container element     | `<div>`                                | `<view>`                                          |
| Text                  | `<span>`, `<p>`                        | `<text>`                                          |
| Image                 | `<img>`                                | `<image>`                                         |
| Link / navigate       | `<a>`, React Router `<Link>`           | `<navigator>`, `my.navigateTo()`                  |
| Button                | `<button onClick>`                     | `<button onTap>`                                  |
| Input                 | `<input onChange>`                     | `<input onInput>`                                 |
| State                 | `useState`, Redux                      | `this.data` + `this.setData()`                    |
| Component             | Function / class component             | `Component({ props, data, methods })`             |
| Props                 | Passed as JSX attributes               | Passed as AXML attributes; declared in `props`    |
| Children              | `props.children`                       | `<slot>` in AXML                                  |
| Lifecycle (mount)     | `useEffect(() => {}, [])`              | `didMount()` (component) / `onLoad()` (page)      |
| Lifecycle (update)    | `useEffect(() => {}, [dep])`           | `didUpdate(prevProps, prevData)`                  |
| Lifecycle (unmount)   | `useEffect(() => () => cleanup, [])`   | `didUnmount()`                                    |
| Routing               | React Router                           | `my.navigateTo`, `my.redirectTo`, `my.switchTab`  |
| Global state          | Context, Redux                         | `app.globalData` or `my.setStorage`               |
| HTTP requests         | `fetch`, `axios`                       | `my.request`                                      |
| Storage               | `localStorage`                         | `my.setStorage` / `my.getStorage`                 |
| Unit of measure       | `px`, `rem`, `vw`                      | `rpx` (responsive pixel — preferred), `px`        |
| Execution environment | Browser                                | Alipay native app (no browser globals)            |

---

## 3. Project Structure

Every Mini Program follows a strict 4-file pattern per page and per component.
Files must share the same base name within their folder.

```
miniapp-root/
├── app.js              ← Global App() instance
├── app.acss            ← Global styles (applied to all pages)
├── app.json            ← Global config: pages list, tabBar, window defaults
├── mini.project.json   ← IDE/build config (not shipped to production)
│
├── assets/
│   └── img/            ← Bundled images (PNG/JPG/SVG)
│
├── pages/
│   ├── home/
│   │   ├── home.axml   ← View template
│   │   ├── home.acss   ← Page-scoped styles
│   │   ├── home.js     ← Page({ data, lifecycle, methods })
│   │   └── home.json   ← { "usingComponents": { … } }
│   └── detail/
│       ├── detail.axml
│       ├── detail.acss
│       ├── detail.js
│       └── detail.json
│
└── components/
    └── ProductCard/
        ├── ProductCard.axml
        ├── ProductCard.acss
        ├── ProductCard.js   ← Component({ props, data, methods, lifecycle })
        └── ProductCard.json ← { "component": true, "usingComponents": { … } }
```

### app.json minimal structure

```json
{
  "pages": [
    "pages/home/home",
    "pages/detail/detail"
  ],
  "window": {
    "defaultTitle": "My App",
    "titleBarColor": "#ffffff",
    "pullRefresh": "NO"
  }
}
```

All pages **must** be listed in `app.json`. Unlisted pages cannot be navigated to.

---

## 4. AXML — Markup Language

AXML replaces HTML and JSX. It uses a fixed set of built-in components instead of
standard HTML tags. Arbitrary HTML tags are not supported.

### 4.1 Built-in components (key ones)

| Component       | Purpose                                    | Key props / notes                                              |
|-----------------|--------------------------------------------|----------------------------------------------------------------|
| `<view>`        | General container (replaces `div`)         | `style`, `class`, `onTap`, `catchTap`                         |
| `<text>`        | Inline text                                | Use for all text rendering                                     |
| `<image>`       | Display images                             | `src`, `mode` (`aspectFit`, `aspectFill`, `widthFix`, `scaleToFill`), `lazy-load`, `default-source` |
| `<button>`      | Tappable button                            | `type` (`default`/`primary`/`warn`), `size` (`default`/`mini`), `loading`, `disabled`, `plain` |
| `<input>`       | Text input field                           | `onInput`, `onFocus`, `onBlur`, `onChange`, `value`, `placeholder` |
| `<scroll-view>` | Scrollable container                       | `scroll-x` or `scroll-y`, `onScroll`, `onScrollToLower`       |
| `<swiper>`      | Carousel / slider                          | Contains `<swiper-item>` children                              |
| `<navigator>`   | Navigation link (like `<a>`)               | `url`, `open-type` (`navigate`/`redirect`/`reLaunch`)         |
| `<video>`       | Video player                               | `src` (HTTPS only), `controls`, `autoplay`, `loop`, `muted`   |
| `<lottie>`      | Lottie animation player                    | `id`, `path` or `djangoId`, `autoplay`, `repeat-count`        |
| `<map>`         | Native map component                       | `id`, `latitude`, `longitude`, `markers`, `polyline`          |
| `<web-view>`    | Embedded H5/web page                       | `src` (HTTPS + whitelisted domain only), `onMessage`          |
| `<canvas>`      | Drawing canvas                             | `id`, used with `my.createCanvasContext`                       |
| `<block>`       | Invisible grouping wrapper                 | Use with `a:if` or `a:for` to group siblings without a real DOM element |
| `<slot>`        | Content injection point in components      | `name` (for named slots)                                       |
| `<template>`    | Reusable markup fragment                   | `name` to define, `is` + `data` to instantiate                |

### 4.2 Data binding

Use `{{ }}` double-curly syntax to bind JS data to the view. All bound values must exist
in `data` (Page) or `data`/`props` (Component).

```xml
<text>{{title}}</text>
<view style="color: {{textColor}};">styled</view>
<image src="{{avatarUrl}}" />
<button disabled="{{isLoading}}">Submit</button>
<view class="{{isActive ? 'active' : 'inactive'}}">toggle</view>
```

### 4.3 Conditional rendering

```xml
<view a:if="{{status === 'ok'}}">
  <text>All good</text>
</view>
<view a:elif="{{status === 'warn'}}">
  <text>Warning</text>
</view>
<view a:else>
  <text>Error</text>
</view>

<!-- Use <block> to group multiple sibling elements under one condition
     without adding an actual DOM node -->
<block a:if="{{showSection}}">
  <text>Line one</text>
  <text>Line two</text>
</block>
```

### 4.4 List rendering

```xml
<view
  a:for="{{products}}"
  a:for-item="product"
  a:for-index="i"
  a:key="product.id"
>
  <text>{{i + 1}}. {{product.name}} — ${{product.price}}</text>
</view>
```

Always provide `a:key` for efficient list diffing. The value should be a unique
identifier for each item (e.g., `item.id`). Using `index` as key is allowed but
less optimal.

### 4.5 Event binding syntax

```xml
<!-- on* = bubbling event -->
<view onTap="handleTap">Tap me</view>

<!-- catch* = non-bubbling (stops event propagation) -->
<view catchTap="handleTap">Tap — no bubble</view>

<!-- Common events -->
<input onInput="handleInput" onFocus="handleFocus" onBlur="handleBlur" />
<scroll-view onScroll="handleScroll" scroll-y>content</scroll-view>
```

Pass data to handlers via `data-*` attributes:
```xml
<view onTap="selectItem" data-id="{{item.id}}" data-name="{{item.name}}">
  {{item.name}}
</view>
```
```js
selectItem(e) {
  const { id, name } = e.target.dataset;
}
```

The event object `e` contains:
- `e.type` — event name (e.g., `"tap"`)
- `e.target` — element that triggered the event
- `e.currentTarget` — element that has the handler (may differ if event bubbled)
- `e.target.dataset` — all `data-*` values as a plain object
- `e.touches` / `e.changedTouches` — touch point arrays

### 4.6 Bubbling vs. non-bubbling — when to use each

| Prefix   | Behavior                   | Use when                                                        |
|----------|----------------------------|-----------------------------------------------------------------|
| `on*`    | Event bubbles up to parent | Parent should also react (e.g., tapping anywhere on a card)     |
| `catch*` | Stops propagation          | Inner button should NOT trigger parent's tap handler            |

```xml
<!-- onTap on card fires BOTH onLikeTap AND onCardTap -->
<view onTap="onCardTap">
  <button onTap="onLikeTap">Like</button>
</view>

<!-- catchTap on button — only onLikeTap fires, onCardTap does NOT -->
<view onTap="onCardTap">
  <button catchTap="onLikeTap">Like</button>
</view>
```

---

## 5. ACSS — Styles

ACSS syntax is nearly identical to CSS with a few key differences.

### 5.1 Units of measure

| Unit   | Description                                                     | Recommendation         |
|--------|-----------------------------------------------------------------|------------------------|
| `rpx`  | Responsive pixel. 750rpx = full screen width on any device.     | **Use for all layout** |
| `px`   | Physical pixel. Does not scale with screen size.                | Avoid for layout       |
| `%`    | Percentage of parent container.                                 | Fine for flex/grid     |
| `vw/vh`| Viewport units. Limited support — test carefully.               | Use sparingly          |

**Converting px to rpx:** Design screens at 375pt width. Every `1px` in design = `2rpx`.
So `16px` padding = `32rpx`. A full-width element is `750rpx`.

### 5.2 Selector support

```css
/* Supported */
.card { }
#header { }
view { }
.card .title { }
.card > .body { }
.btn:hover { }   /* limited support */

/* NOT supported */
* { box-sizing: border-box; }   /* universal selector blocked */
:root { --color: red; }          /* :root not supported */
```

### 5.3 Style scope and isolation

- `app.acss` — global styles applied to every page.
- `home.acss` — styles scoped to the `home` page only.
- `MyCard.acss` — styles for the `MyCard` component (scope depends on `styleIsolation`).

Control isolation via `styleIsolation` in component `.json`:

| Value           | Effect                                                                           |
|-----------------|----------------------------------------------------------------------------------|
| `"apply-shared"` | Global/page styles apply inside component. Component styles do NOT leak out. **(Default — recommended)** |
| `"shared"`       | Global styles apply inside component AND component styles leak into the parent.  |

```json
{
  "component": true,
  "styleIsolation": "apply-shared"
}
```

### 5.4 Inline dynamic styles

```js
Page({
  data: {
    cardStyle: 'background-color: #1677ff; border-radius: 16rpx;'
  }
});
```
```xml
<view style="{{cardStyle}}">dynamic style</view>
```

---

## 6. Step-by-Step Migration Checklist

- [ ] **Audit dependencies** — remove anything using `window`, `document`, or DOM APIs
- [ ] **Map routes → pages** — each React Router route becomes a page folder with 4 files
- [ ] **Map reusable components** — each shared React component becomes a Mini Program component
- [ ] **Create project structure** — `app.js`, `app.json`, `app.acss`, pages/, components/
- [ ] **Register all pages in `app.json` `pages` array**
- [ ] **Convert JSX → AXML** — replace HTML tags with AXML built-in components
- [ ] **Convert CSS → ACSS** — replace `px` with `rpx`, remove unsupported selectors (`*`, `:root`)
- [ ] **Convert state** — replace `useState`/Redux with `this.data` + `this.setData()`
- [ ] **Convert lifecycle** — map `useEffect` → `onLoad`/`didMount`, cleanup → `didUnmount`
- [ ] **Convert routing** — React Router calls → `my.navigateTo` / `my.redirectTo` / `my.switchTab`
- [ ] **Convert HTTP** — `fetch`/`axios` → `my.request` (HTTPS, whitelisted domains)
- [ ] **Convert storage** — `localStorage` → `my.setStorage` / `my.getStorage`
- [ ] **Convert global state** — Context/Redux → `app.globalData` + `getApp()`
- [ ] **Add `"component": true`** to all component `.json` files
- [ ] **Register components in `usingComponents`** in every page/component that uses them
- [ ] **Add default values to all component `props`**
- [ ] **Whitelist all domains** in the Mini Program management console
- [ ] **Test on a real device** — simulator differs for video, maps, Lottie, and layout

---

## 7. App Lifecycle

Defined once in `app.js`. Runs for the entire Mini Program session.

```js
App({
  // Shared state accessible from any page via getApp().globalData
  globalData: {
    userId: null,
    cart: [],
    isLoggedIn: false,
  },

  // Fires once when the miniapp is first launched
  onLaunch(options) {
    // options.query = URL params if launched via deep link
    // options.scene = launch scene code
    my.getStorage({
      key: 'cart',
      success: res => { this.globalData.cart = res.data || []; },
      fail:    ()  => { this.globalData.cart = []; },
    });
  },

  // Fires every time the app comes to the foreground
  onShow(options) {
    console.log('App visible, scene:', options.scene);
  },

  // Fires every time the app goes to the background
  onHide() {
    // Always persist critical data before backgrounding
    // The OS may kill the app while backgrounded at any time
    my.setStorage({ key: 'cart', data: this.globalData.cart });
  },

  // Catches any unhandled global JS exception
  onError(error) {
    console.error('GLOBAL ERROR:', error);
    my.showToast({ content: 'Unexpected error occurred', type: 'fail' });
  },
});
```

Access globalData from any page or component:
```js
const app = getApp();
app.globalData.userId = '123';
console.log(app.globalData.cart.length);
```

---

## 8. Page Lifecycle

Defined in each page's `.js` using `Page()`.

```js
Page({
  data: {
    title: '',
    items: [],
    isLoading: false,
    hasError: false,
  },

  // Created once. query = URL params (?id=1&type=product)
  onLoad(query) {
    const { id } = query;
    this.setData({ isLoading: true });
    this.fetchItem(id);
  },

  // Fires every time the page becomes visible, including after back-navigation
  onShow() {
    // Re-read globalData changes made by other pages
    const app = getApp();
    this.setData({ cartCount: app.globalData.cart.length });
  },

  // Fires once after the first render is complete
  onReady() {
    // Safe to query element dimensions via my.createSelectorQuery here
  },

  // Fires when page is hidden (navigated away — not destroyed)
  onHide() {
    // Pause animations or timers
  },

  // Fires when page is destroyed (popped from navigation stack)
  onUnload() {
    // Clear any active timers or pending requests
  },

  // Pull-to-refresh (enable in page .json: { "pullRefresh": "YES" })
  onPullDownRefresh() {
    this.fetchItem(this.data.id);
    my.stopPullDownRefresh();
  },

  // Called when user scrolls to bottom of page
  onReachBottom() {
    this.loadNextPage();
  },

  fetchItem(id) {
    my.request({
      url: `https://api.example.com/items/${id}`,
      method: 'GET',
      success: res => {
        this.setData({ title: res.data.title, items: res.data.items, isLoading: false });
      },
      fail: err => {
        this.setData({ isLoading: false, hasError: true });
        my.showToast({ content: 'Failed to load', type: 'fail' });
      },
    });
  },
});
```

### Page lifecycle order

```
onLoad → onShow → onReady
              ↕
        onHide / onShow   (navigating away and returning)
              ↓
           onUnload        (page popped from stack)
```

---

## 9. Component Lifecycle

Defined using `Component()`. Has a distinct lifecycle from pages.

```js
Component({
  mixins: [],  // array of mixin objects for sharing behavior across components

  // External data from parent — every prop MUST have a default value
  props: {
    title: 'Default Title',
    count: 0,
    onAction: () => {},   // callback props must default to empty function
    product: null,
  },

  // Internal reactive data
  data: {
    expanded: false,
    internalCount: 0,
  },

  // Fires on creation — before first render, before props are set
  // Avoid reading this.props here
  onInit() { },

  // Fires on creation AND before every update when props or data change
  // Use to derive internal state from incoming props
  deriveDataFromProps(nextProps) {
    if (nextProps.count !== this.props.count) {
      this.setData({ internalCount: nextProps.count * 2 });
    }
  },

  // Fires once after fully mounted and rendered — like componentDidMount
  didMount() {
    // Start timers, fetch data, subscribe to events
  },

  // Fires after every re-render caused by props or data changes
  didUpdate(prevProps, prevData) {
    if (prevProps.title !== this.props.title) {
      // React to prop change
    }
  },

  // Fires when component is removed from the page tree
  didUnmount() {
    // Clear timers, cancel requests, unsubscribe
  },

  methods: {
    toggle() {
      this.setData({ expanded: !this.data.expanded });
    },
    handleAction() {
      this.props.onAction(this.data.internalCount);
    },
  },
});
```

### Component lifecycle flow

```
Creation:  onInit → deriveDataFromProps(nextProps) → [first render] → didMount
Update:    deriveDataFromProps(nextProps) → [re-render] → didUpdate(prevProps, prevData)
Destroy:   didUnmount
```

### Component .json

```json
{
  "component": true,
  "usingComponents": {
    "sub-component": "/components/SubComponent/SubComponent"
  },
  "styleIsolation": "apply-shared"
}
```

---

## 10. State Management Patterns

In Mini Programs, state lives at three levels. Choose the right level for each piece of data.

### Level 1 — Local page / component state

For UI state that belongs to one screen or component only.

```js
Page({
  data: { count: 0, items: [] },

  increment() {
    // Correct — triggers re-render
    this.setData({ count: this.data.count + 1 });
    // WRONG — view does NOT update
    // this.data.count++;
  },

  addItem(newItem) {
    // Correct way to update arrays — always create new array
    const items = [...this.data.items, newItem];
    this.setData({ items });
  },

  updateNested() {
    // setData supports dot-notation for nested updates
    this.setData({ 'user.name': 'Alice' });
  },
});
```

> `setData` is **asynchronous**. Do not read `this.data` immediately after calling it.
> Use the callback for post-update logic:
> ```js
> this.setData({ count: 5 }, () => console.log(this.data.count)); // 5
> ```

### Level 2 — Cross-page shared state (app.globalData)

For data shared between pages that does not need to survive app restarts.
Examples: session info, shopping cart, feature flags.

```js
// app.js
App({ globalData: { userId: null, cart: [] } });

// Any page — write
const app = getApp();
app.globalData.userId = '42';
app.globalData.cart.push({ id: 1, name: 'Item' });

// Any page — read
const app = getApp();
console.log(app.globalData.userId);
```

> `globalData` mutations are instant and synchronous but do **not** trigger any
> re-render. Pages must pull from `globalData` in `onShow()` to reflect changes
> made by other pages.

### Level 3 — Persistent state (my.setStorage)

For data that must survive app restarts. Examples: auth tokens, user preferences.

```js
// Save
my.setStorage({ key: 'token', data: 'abc123' });

// Read
my.getStorage({
  key: 'token',
  success: res => console.log(res.data),
  fail:    ()  => console.log('Key not found'),
});

// Delete one key
my.removeStorage({ key: 'token' });

// Synchronous variants (blocks JS thread — use sparingly)
my.setStorageSync({ key: 'theme', data: 'dark' });
const res = my.getStorageSync({ key: 'theme' }); // res.data = 'dark'
```

### Recommended pattern — initialize + persist

```js
App({
  globalData: { cart: [] },
  onLaunch() {
    my.getStorage({
      key: 'cart',
      success: r => { this.globalData.cart = r.data || []; },
    });
  },
  onHide() {
    my.setStorage({ key: 'cart', data: this.globalData.cart });
  },
});
```

---

## 11. Events

### 11.1 User interaction events

| Event          | Trigger                                        | Notes                               |
|----------------|------------------------------------------------|-------------------------------------|
| `tap`          | Quick tap and release (bubbling)               | Most common — equivalent to `click` |
| `longTap`      | Tap held > 500ms (bubbling)                    |                                     |
| `touchStart`   | Finger touches screen                          |                                     |
| `touchMove`    | Finger moves on screen                         |                                     |
| `touchEnd`     | Finger lifts from screen                       |                                     |
| `touchCancel`  | Touch interrupted (incoming call, popup)       |                                     |
| `input`        | Text input value changed character by character | Use on `<input>`, `<textarea>`     |
| `change`       | Value committed (select, slider, checkbox)     |                                     |
| `focus`        | Input gains focus                              |                                     |
| `blur`         | Input loses focus                              |                                     |
| `scroll`       | Container scrolled                             | On `<scroll-view>`                  |

### 11.2 Event object structure

```js
handleTap(e) {
  e.type              // "tap"
  e.timeStamp         // ms since app start
  e.target            // element that originally triggered the event
  e.currentTarget     // element with the handler (may differ if event bubbled)
  e.target.id         // id attribute of the triggering element
  e.target.dataset    // { key: value } from data-* attributes
  e.touches           // array of active touch points [ { clientX, clientY, … } ]
  e.changedTouches    // touch points that changed in this event
}
```

### 11.3 Page-level events

```js
Page({
  onLoad(query)             { },  // page created — URL params in query
  onShow()                  { },  // page visible (fires on back-nav too)
  onReady()                 { },  // first render complete
  onHide()                  { },  // page hidden
  onUnload()                { },  // page destroyed
  onPullDownRefresh()       { my.stopPullDownRefresh(); },
  onReachBottom()           { },  // scrolled to bottom
  onTitleClick()            { },  // title bar tapped
  onOptionMenuClick(e)      { },  // option menu item tapped
});
```

---

## 12. Navigation

### 12.1 Three approaches

**A — `<navigator>` tag (declarative, no JS)**
```xml
<navigator url="/pages/detail/detail?id={{item.id}}" open-type="navigate">
  Go to detail
</navigator>
```
> `<navigator>` does NOT support `navigateBack`. Use a button + `my.navigateBack()` instead.
> `switchTab` is unreliable in `<navigator>` — use `my.switchTab()`.

**B — JS method via event handler (imperative)**
```xml
<button onTap="goToDetail">View Details</button>
```
```js
goToDetail() {
  my.navigateTo({ url: '/pages/detail/detail?id=42' });
}
```

**C — TabBar (configured in app.json — see Section 20)**

### 12.2 Navigation methods

| Method                           | Stack effect                      | Use case                             |
|----------------------------------|-----------------------------------|--------------------------------------|
| `my.navigateTo({ url })`         | Push new page                     | Normal forward navigation            |
| `my.navigateBack({ delta })`     | Pop page(s)                       | Back button (`delta` = how many)     |
| `my.redirectTo({ url })`         | Replace current page              | Login redirect (cannot go back)      |
| `my.reLaunch({ url })`           | Close all, open one               | Post-logout, full session reset      |
| `my.switchTab({ url })`          | Switch tabBar tab, clear others   | TabBar navigation only               |
| `my.navigateToMiniProgram(opts)` | Jump to another Mini Program      | Requires config in management console |

```js
my.navigateTo({ url: '/pages/profile/profile' });
my.navigateTo({ url: '/pages/detail/detail?id=5&mode=edit' });
my.navigateBack({ delta: 2 });
my.redirectTo({ url: '/pages/login/login' });
my.reLaunch({ url: '/pages/home/home' });
my.switchTab({ url: '/pages/home/home' });  // must be a tabBar page
```

### 12.3 Passing and receiving parameters

```js
// Sender
my.navigateTo({ url: '/pages/order/order?orderId=ABC123&status=pending' });

// For complex data, stringify it
const data = JSON.stringify({ ids: [1, 2, 3], filter: 'active' });
my.navigateTo({ url: `/pages/list/list?data=${encodeURIComponent(data)}` });

// Receiver — always in onLoad
Page({
  onLoad(query) {
    const { orderId, status } = query;
    const complex = JSON.parse(decodeURIComponent(query.data));
    this.setData({ orderId, status });
  }
});
```

---

## 13. Custom Components

### 13.1 Creating a component

Right-click the target folder in the IDE → "New Mini Program Component" → enter name.
This generates all 4 files automatically.

### 13.2 Component JS

```js
Component({
  mixins: [],

  props: {
    product: null,           // default value required for every prop
    featured: false,
    onAddToCart: () => {},   // callback props default to empty function
  },

  data: {
    isFavorited: false,
  },

  didMount() {
    // Initialize, fetch component-specific data
  },

  methods: {
    toggleFavorite() {
      this.setData({ isFavorited: !this.data.isFavorited });
    },
    handleAddToCart() {
      this.props.onAddToCart(this.props.product);
    },
  },
});
```

### 13.3 Component AXML

```xml
<view class="card">
  <image src="{{product.imageUrl}}" mode="aspectFill" class="card-img" />
  <view class="card-body">
    <text class="card-title">{{product.name}}</text>
    <text class="card-price">${{product.price}}</text>
    <button type="primary" onTap="handleAddToCart">Add to Cart</button>
    <button type="default" onTap="toggleFavorite">
      {{isFavorited ? '❤️' : '🤍'}}
    </button>
  </view>
</view>
```

### 13.4 Registering and using a component

Page's `.json`:
```json
{
  "usingComponents": {
    "product-card": "/components/ProductCard/ProductCard"
  }
}
```

Page's `.axml`:
```xml
<view a:for="{{products}}" a:key="product.id" a:for-item="product">
  <product-card
    product="{{product}}"
    featured="{{product.isFeatured}}"
    onAddToCart="handleAddToCart"
  />
</view>
```

Page's `.js`:
```js
Page({
  data: { products: [] },
  handleAddToCart(product) {
    const app = getApp();
    app.globalData.cart.push(product);
    my.showToast({ content: 'Added to cart', type: 'success' });
  },
});
```

---

## 14. Slots

Slots let parent pages inject AXML content into a component — equivalent to `props.children`.

### 14.1 Default slot

```xml
<!-- Component: Modal.axml -->
<view class="modal-overlay">
  <view class="modal-box">
    <slot>
      <text>Default content if nothing is passed in</text>
    </slot>
  </view>
</view>

<!-- Parent usage — content between tags replaces the slot -->
<modal>
  <text>This is the custom modal body</text>
  <button onTap="closeModal">Close</button>
</modal>
```

### 14.2 Named slots

```xml
<!-- Component definition -->
<view class="layout">
  <view class="header"><slot name="header"><text>Default Header</text></slot></view>
  <view class="body"><slot /></view>
  <view class="footer"><slot name="footer" /></view>
</view>

<!-- Parent usage — slot="name" targets the named slot -->
<page-layout>
  <view slot="header"><text>My Page Title</text></view>
  <text>Main body content goes in the default slot</text>
  <view slot="footer"><text>© 2025 My App</text></view>
</page-layout>
```

---

## 15. Templates and Includes

### 15.1 Templates — reusable markup with dynamic data

Define once, use many times with different data. Best for repeated structures like
list items, badges, and cards.

```xml
<!-- Define the template (can be in a shared file) -->
<template name="userCard">
  <view class="user-card">
    <image src="{{user.avatar}}" class="avatar" />
    <text>{{user.name}} — {{user.role}}</text>
  </view>
</template>

<!-- Use the template with data -->
<block a:for="{{users}}" a:for-item="user">
  <template is="userCard" data="{{user: user}}" />
</block>
```

> The `data` attribute must be a key-value object. Each key becomes an available
> variable inside the template body.

### 15.2 Includes — static fragment injection

Equivalent to copy-pasting a static AXML snippet. No data binding — renders as-is.
Best for shared static fragments: headers, footers, banners.

```xml
<!-- common/footer.axml -->
<view class="footer"><text>© 2025 My App</text></view>

<!-- pages/home/home.axml -->
<view>
  <text>Page content</text>
  <include src="../../common/footer.axml" />
</view>
```

### 15.3 Template vs. Include comparison

| Feature              | `<template>`              | `<include>`             |
|----------------------|---------------------------|-------------------------|
| Accepts data         | Yes (`data` attribute)    | No                      |
| Dynamic content      | Yes (`{{}}`, `a:if`)      | No — static only        |
| Best use case        | List items, cards, badges | Header, footer, banner  |

---

## 16. Multimedia — Image, Video, Audio, Lottie

### 16.1 `<image>`

```xml
<image
  src="../../assets/img/logo.png"
  mode="aspectFit"
  class="logo"
  lazy-load="{{true}}"
  default-source="../../assets/img/placeholder.png"
  onLoad="handleImageLoad"
  onError="handleImageError"
/>
```

| `mode` value    | Behavior                                                   |
|-----------------|------------------------------------------------------------|
| `scaleToFill`   | Stretch to fill container (default) — may distort          |
| `aspectFit`     | Scale to fit inside container — shows full image, may letterbox |
| `aspectFill`    | Scale to fill container — may crop edges                   |
| `widthFix`      | Fix width, height adjusts proportionally                   |

**Image restrictions:**
- Remote images must use HTTPS.
- `lazy-load` does not work when element is hidden via `display: none` or `visibility: hidden`.
- Always provide `default-source` for critical images to handle load failures gracefully.

### 16.2 `<video>`

```xml
<video
  id="myVideo"
  src="https://example.com/video.mp4"
  poster="https://example.com/poster.jpg"
  controls="{{true}}"
  autoplay="{{false}}"
  loop="{{false}}"
  muted="{{false}}"
  style="width: 100%;"
  onPlay="handlePlay"
  onPause="handlePause"
  onEnded="handleEnded"
  onError="handleError"
  onTimeUpdate="handleTimeUpdate"
/>
```

Programmatic control:
```js
Page({
  onReady() {
    this.videoCtx = my.createVideoContext('myVideo');
  },
  play()           { this.videoCtx.play(); },
  pause()          { this.videoCtx.pause(); },
  stop()           { this.videoCtx.stop(); },
  seekTo(sec)      { this.videoCtx.seek(sec); },
  fullscreen()     { this.videoCtx.requestFullScreen({ direction: 0 }); },
  exitFullscreen() { this.videoCtx.exitFullScreen(); },
  mute(flag)       { this.videoCtx.mute(flag); },
});
```

**Video restrictions:**
- `src` must be HTTPS. Local video files are **not supported**.
- The video's domain must be whitelisted in the management console.
- `<video>` renders at the highest layer — other components cannot visually overlap it.
- `my.createVideoContext` must be called in or after `onReady`.

### 16.3 Lottie animations

```xml
<lottie
  id="myLottie"
  class="animation"
  autoplay="{{true}}"
  repeat-count="{{-1}}"
  path="https://example.com/animation.json"
  placeholder="{{placeholderImageUrl}}"
/>
```

| Attribute        | Description                                              |
|------------------|----------------------------------------------------------|
| `path`           | HTTPS URL or local path to `.json` animation file        |
| `djangoId`       | ID for `.zip` bundled animation package                  |
| `autoplay`       | Start playing immediately on load                        |
| `repeat-count`   | Number of loops. `-1` = infinite                         |
| `placeholder`    | Fallback image URL shown while animation loads           |

```js
Page({
  onReady() {
    this.lottieCtx = my.createLottieContext('myLottie');
    if (this.data.autoplay) this.lottieCtx.play();
  },
  pause()  { this.lottieCtx.pause(); },
  resume() { this.lottieCtx.resume(); },
  stop()   { this.lottieCtx.stop(); },
});
```

**Lottie restrictions:**
- Renders correctly on real devices but may behave differently in the simulator.
- `.zip` (djangoId) bundles are preferred for offline reliability.
- `my.createLottieContext` must be called in or after `onReady`.

---

## 17. Maps

The `<map>` component is native and renders at the highest layer (same as `<video>`).

```xml
<map
  id="map"
  longitude="{{center.lng}}"
  latitude="{{center.lat}}"
  scale="{{scale}}"
  markers="{{markers}}"
  polyline="{{polyline}}"
  style="width: 100%; height: 60vh;"
/>
```

```js
Page({
  data: {
    scale: 14,
    center: { lat: 30.2746, lng: 120.1263 },
    markers: [],
    polyline: [],
  },

  onReady() {
    this.mapCtx = my.createMapContext('map');
  },

  getMyLocation() {
    my.getLocation({
      success: res => {
        const { latitude: lat, longitude: lng } = res;
        this.setData({
          center: { lat, lng },
          markers: [{
            id: 1, latitude: lat, longitude: lng,
            callout: { content: 'You are here', display: 'ALWAYS' },
          }],
        });
        this.mapCtx.updateComponents({ latitude: lat, longitude: lng, scale: 16 });
      },
      fail: () => my.alert({ content: 'Could not get location' }),
    });
  },

  chooseDestination() {
    my.chooseLocation({
      success: res => {
        const lat = Number(res.latitude);
        const lng = Number(res.longitude);
        this.setData({ destination: { lat, lng } });
        this.mapCtx.updateComponents({ latitude: lat, longitude: lng });
      },
    });
  },

  drawRoute() {
    const { origin, destination } = this.data;
    if (!origin?.lat || !destination?.lat) {
      return my.showToast({ content: 'Set origin and destination', type: 'none' });
    }
    this.mapCtx.showRoute({
      startLat: origin.lat, startLng: origin.lng,
      endLat: destination.lat, endLng: destination.lng,
      searchType: 'drive',
      success: res => my.showToast({
        content: `${res.distance}m, ~${Math.round(res.duration / 60)} min`,
        type: 'success',
      }),
      fail: err => my.showToast({ content: 'Could not trace route', type: 'fail' }),
    });
  },

  resetMap() {
    try { this.mapCtx.clearRoute(); } catch (e) { }
    const init = { lat: 30.2746, lng: 120.1263 };
    this.setData({ center: init, origin: {}, destination: {}, markers: [], polyline: [] });
    this.mapCtx.updateComponents({ latitude: init.lat, longitude: init.lng, scale: 14 });
  },
});
```

**Map restrictions:**
- Each `<map>` on a page requires a unique `id`.
- `<map>` cannot be placed inside a `<scroll-view>`.
- CSS animations do not apply to `<map>`.
- `my.createMapContext` must be called in or after `onReady`.
- When zooming, reset `scale` before updating `latitude`/`longitude` to prevent the
  map from resetting to a default zoom level.
- Cannot visually overlay standard AXML components on top of `<map>`.

---

## 18. H5 / Web-View Embedding

Embed an existing web page inside a Mini Program page using `<web-view>`.

```xml
<!-- page.axml — web-view takes the full page -->
<web-view src="{{webUrl}}" onMessage="handleMessage" />
```

```js
Page({
  data: { webUrl: 'https://www.example.com/page' },
  handleMessage(e) {
    // e.detail contains data sent from the H5 via postMessage
    console.log('From H5:', e.detail);
  },
});
```

From inside the H5, communicate back to the Mini Program:
```js
// H5 JavaScript (running in the web-view)
my.postMessage({ name: 'userAction', data: { clicked: 'buy' } });
```

**Web-view restrictions:**
1. The H5 domain must be registered under "WAP URLs" in the Mini Program management
   console. This is separate from the "Server Domains" list.
2. Only HTTPS URLs are allowed as `src`.
3. `<web-view>` takes over the full page — it cannot be combined with other AXML
   components on the same page.
4. Navigation inside the web-view is independent. The Mini Program cannot intercept it.
5. The H5 page must be aware it is running inside a Mini Program to send `postMessage`.

---

## 19. Error Handling

Implement error handling at all three levels to prevent crashes and give clear feedback.

### Level 1 — Global (app.js): catches all unhandled exceptions

```js
App({
  onError(error) {
    console.error('GLOBAL ERROR:', error);
    my.showToast({ content: 'An unexpected error occurred', type: 'fail' });
    // Optionally send to an error monitoring service via my.request
  },
});
```

### Level 2 — Per-page or per-method try/catch

```js
Page({
  async loadData() {
    try {
      const res = await new Promise((resolve, reject) =>
        my.request({ url: 'https://api.example.com/data', success: resolve, fail: reject })
      );
      this.setData({ data: res.data });
    } catch (err) {
      console.error('Page error:', err);
      my.showToast({ content: 'Failed to load data', type: 'fail' });
      this.setData({ hasError: true, isLoading: false });
    }
  },
});
```

### Level 3 — API fail callbacks (always include)

```js
my.request({
  url: 'https://api.example.com/items',
  method: 'GET',
  success: res => {
    this.setData({ items: res.data });
  },
  fail: err => {
    console.error('Request failed:', err);
    my.showToast({ content: 'Network error', type: 'fail' });
  },
  complete: () => {
    // Always runs — use to stop loading spinners
    this.setData({ isLoading: false });
  },
});
```

### Error types summary

| Type                   | Description                                          | Handle with                   |
|------------------------|------------------------------------------------------|-------------------------------|
| Capturable             | Standard JS exceptions                               | `try/catch`                   |
| Controllable           | API failures with error codes                        | `fail` callback               |
| Informative            | Provide type, message, stack trace                   | Logging + user-facing toast   |
| Asynchronous           | Errors in promises or async operations               | `.catch()` or `async/await`   |
| Critical / unhandled   | Would crash the app without intervention             | `App.onError`                 |

---

## 20. TabBar Configuration

Configured in `app.json`. Supports 2–5 tabs. Icons must be local PNG/JPG files.

```json
{
  "pages": [
    "pages/home/home",
    "pages/search/search",
    "pages/cart/cart",
    "pages/profile/profile"
  ],
  "tabBar": {
    "textColor": "#999999",
    "selectedColor": "#1677ff",
    "backgroundColor": "#ffffff",
    "items": [
      {
        "pagePath": "pages/home/home",
        "name": "Home",
        "icon": "/assets/img/tab-home.png",
        "activeIcon": "/assets/img/tab-home-active.png"
      },
      {
        "pagePath": "pages/search/search",
        "name": "Search",
        "icon": "/assets/img/tab-search.png",
        "activeIcon": "/assets/img/tab-search-active.png"
      },
      {
        "pagePath": "pages/cart/cart",
        "name": "Cart",
        "icon": "/assets/img/tab-cart.png",
        "activeIcon": "/assets/img/tab-cart-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "name": "Profile",
        "icon": "/assets/img/tab-profile.png",
        "activeIcon": "/assets/img/tab-profile-active.png"
      }
    ]
  }
}
```

**TabBar restrictions and guidelines:**
- Icons must be local files — remote URLs are not supported.
- Use `my.switchTab()` to navigate to a tabBar page from JS code.
- `my.navigateTo()` to a tabBar page will **fail silently**. Always use `my.switchTab()`.
- TabBar pages are persistent — they are not destroyed when switching tabs, which means
  `onLoad` runs once, but `onShow` runs every time the tab is selected.
- A tabBar page must be included in the `items` array AND in the top-level `pages` array.

---

## 21. Hard Restrictions and Guidelines Summary

### Absolute prohibitions — these will crash or silently fail

1. **No `window` or `document`** — these globals do not exist. Access throws `ReferenceError`.
2. **No DOM manipulation** — `getElementById`, `querySelector`, `innerHTML` do not exist.
3. **No `localStorage` / `sessionStorage`** — use `my.setStorage` / `my.getStorage`.
4. **No `fetch` or `XMLHttpRequest`** — use `my.request`.
5. **No `alert`, `confirm`, `prompt`** — use `my.alert`, `my.confirm`.
6. **No direct mutation of `this.data`** — always use `this.setData({})`.
7. **No React, ReactDOM, Vue, Angular** or similar frameworks at runtime.
8. **No DOM-dependent npm packages** — any library touching `window`/`document` will crash.
9. **No HTTP requests** — `my.request` blocks all non-HTTPS URLs.
10. **No local video files** — video must come from an HTTPS URL.
11. **No `*` universal selector in ACSS** — not supported.
12. **No `:root` pseudo-class in ACSS** — not supported.
13. **No unregistered domains** — API domains and WAP domains must be whitelisted separately in console.
14. **No unlisted pages** — all pages must appear in `app.json`'s `pages` array.
15. **No `my.navigateTo()` to a tabBar page** — use `my.switchTab()` instead.
16. **No back navigation via `<navigator>`** — use `<button onTap>` + `my.navigateBack()`.
17. **No `props` without default values** in components — missing defaults cause errors.
18. **No missing `"component": true`** in component `.json` — Component() won't be recognized.

### Mandatory guidelines

1. **Use `rpx` for all sizing and spacing** — ensures responsive layout on all screen sizes.
2. **Always provide default values for every component `props` key.**
3. **Always handle the `fail` callback** on every `my.*` API call.
4. **Always include a `complete` callback** for long-running API calls to stop loading spinners.
5. **Always clean up in `onUnload` / `didUnmount`** — clear timers, cancel requests.
6. **Always read URL params from `onLoad(query)`** — not from `onShow`.
7. **Register `usingComponents` in the `.json`** of every page or component that uses custom components.
8. **Set `"component": true`** in every component's `.json`.
9. **Persist critical data in `onHide`** — the app can be killed in the background at any time.
10. **Whitelist all domains** (Server Domains + WAP URLs) before testing any network requests.
11. **Test on a real device** — the simulator does not fully replicate video, maps, Lottie, and some layout behaviors.
12. **Use `a:key` in all `a:for` loops** — prevents incorrect list diffing and UI glitches.
13. **Handle `onError` on `<image>` and `<video>`** — provide fallback UI for asset load failures.
14. **Use `styleIsolation: "apply-shared"`** on components unless you explicitly need style leakage.
15. **Use `catchTap` on inner action buttons** inside tappable containers to prevent accidental double-firing.

### Important behavioral differences from React

1. **`onShow` fires on back-navigation** — React's `useEffect` does not re-fire when returning
   to a screen. If a page needs fresh data after navigating back, fetch it in `onShow`.
2. **`setData` is asynchronous** — reading `this.data` immediately after `setData` returns
   stale values. Use the callback parameter for post-update logic.
3. **Component `props` are read-only** — never mutate `this.props`. Use `deriveDataFromProps`
   to create an internal copy if you need to modify a prop-derived value.
4. **`<map>` and `<video>` render above all other components** — you cannot visually overlay
   standard AXML elements on top of them. Redesign layout accordingly.
5. **`globalData` changes do not trigger re-renders** — pages must pull new values in `onShow`.
6. **`<web-view>` takes over the entire page** — cannot coexist with other AXML on the same page.
7. **TabBar pages are never destroyed** — `onLoad` runs once; `onShow` runs on every tab switch.

---

## 22. Common Pitfalls and Anti-patterns

| Pitfall                              | Wrong                                          | Correct                                         |
|--------------------------------------|------------------------------------------------|-------------------------------------------------|
| Mutating data directly               | `this.data.count++`                            | `this.setData({ count: this.data.count + 1 })`  |
| Sizing with px                       | `width: 320px`                                 | `width: 640rpx`                                 |
| Navigating to tabBar page            | `my.navigateTo({ url: '/pages/home/home' })`   | `my.switchTab({ url: '/pages/home/home' })`     |
| Back button in navigator             | `<navigator open-type="navigateBack">`         | `<button onTap="goBack">` + `my.navigateBack()` |
| Reading props as data                | `this.data.title` (prop from parent)           | `this.props.title`                              |
| Missing default props                | `props: { name: undefined }`                   | `props: { name: '' }`                           |
| Missing component declaration        | `{}` in component `.json`                      | `{ "component": true }`                         |
| Forgot to register component         | No `usingComponents` entry                     | Add entry in page/component `.json`             |
| HTTP in request URL                  | `url: 'http://api.example.com'`                | `url: 'https://api.example.com'`                |
| Local video source                   | `<video src="./video.mp4">`                    | `<video src="https://cdn.example.com/video.mp4">` |
| Missing `a:key` in list              | `a:for="{{items}}"`                            | `a:for="{{items}}" a:key="item.id"`             |
| Overlaying elements on map/video     | `<view>overlay</view>` on top of `<map>`       | Not supported — redesign the layout             |
| Reading `this.data` after `setData`  | `this.setData({x:1}); console.log(this.data.x)`| Use `setData` callback for post-update logic    |
| No `fail` handler on API calls       | `my.request({ success })`                      | Always include `fail` and `complete`            |
| Using `window.setTimeout` style      | `window.setTimeout(fn, 1000)`                  | `setTimeout(fn, 1000)` (no `window.` prefix)    |

---

## 23. Quick Reference Tables

### AXML tag ↔ HTML / React equivalent

| AXML                  | HTML / React equivalent              |
|-----------------------|--------------------------------------|
| `<view>`              | `<div>`                              |
| `<text>`              | `<span>`, `<p>`                      |
| `<image>`             | `<img>`                              |
| `<button>`            | `<button>`                           |
| `<input>`             | `<input>`                            |
| `<scroll-view>`       | `<div style="overflow: scroll">`     |
| `<swiper>`            | Carousel / slider component          |
| `<navigator>`         | `<Link>` (React Router) / `<a>`      |
| `<video>`             | `<video>`                            |
| `<canvas>`            | `<canvas>`                           |
| `<map>`               | Google Maps / Mapbox component       |
| `<web-view>`          | `<iframe>`                           |
| `<lottie>`            | `react-lottie` / `lottie-web`        |
| `<block>`             | `<React.Fragment>` / `<>`            |
| `<slot>`              | `props.children`                     |
| `<template>`          | Reusable functional component        |

### AXML directives

| Directive                            | Purpose                                |
|--------------------------------------|----------------------------------------|
| `{{expr}}`                           | Data binding                           |
| `a:if="{{cond}}"`                    | Conditional render                     |
| `a:elif="{{cond}}"`                  | Else-if branch                         |
| `a:else`                             | Else branch                            |
| `a:for="{{arr}}"`                    | List render                            |
| `a:for-item="alias"`                 | Rename loop item variable              |
| `a:for-index="alias"`                | Rename loop index variable             |
| `a:key="expr"`                       | Unique key for list diffing            |
| `style="{{dynamicStyle}}"`           | Inline computed styles                 |
| `class="{{cond ? 'a' : 'b'}}"`       | Dynamic class name                     |
| `data-key="{{value}}"`               | Pass data to event handlers            |

### Navigation methods

| Method             | Stack effect              | Use case                           |
|--------------------|---------------------------|------------------------------------|
| `navigateTo`       | Push                      | Normal forward navigation          |
| `navigateBack`     | Pop                       | Back button                        |
| `redirectTo`       | Replace top               | Login redirect (no back)           |
| `reLaunch`         | Clear all, open one       | Post-logout / session reset        |
| `switchTab`        | Switch tab, clear others  | TabBar navigation only             |

### Lifecycle comparison

| React                               | Page             | Component                   |
|-------------------------------------|------------------|-----------------------------|
| Initial state / constructor         | `data: {}`       | `data: {} / props: {}`      |
| `useEffect(() => {}, [])`           | `onLoad`         | `didMount`                  |
| `useEffect(() => {}, [dep])`        | `onShow`         | `didUpdate`                 |
| `useEffect(() => cleanup)`          | `onUnload`       | `didUnmount`                |
| `getDerivedStateFromProps`          | —                | `deriveDataFromProps`       |
| `componentDidMount`                 | `onLoad`         | `didMount`                  |
| `componentDidUpdate`                | `onShow`         | `didUpdate(prevP, prevD)`   |
| `componentWillUnmount`              | `onUnload`       | `didUnmount`                |

### Browser API → Mini Program API

| Browser API                         | Mini Program API                                      |
|-------------------------------------|-------------------------------------------------------|
| `fetch` / `XMLHttpRequest`          | `my.request`                                          |
| `localStorage.setItem`              | `my.setStorage`                                       |
| `localStorage.getItem`              | `my.getStorage`                                       |
| `localStorage.removeItem`           | `my.removeStorage`                                    |
| `alert(msg)`                        | `my.alert({ content: msg })`                          |
| `confirm(msg)`                      | `my.confirm({ content: msg })`                        |
| `navigator.geolocation.getCurrentPosition` | `my.getLocation`                              |
| `window.location.href = url`        | `my.navigateTo` / `my.redirectTo`                     |
| `history.push`                      | `my.navigateTo`                                       |
| `history.back()`                    | `my.navigateBack`                                     |
| `document.getElementById`           | `my.createSelectorQuery` (measurements only)          |
| `new WebSocket(url)`                | `my.connectSocket`                                    |
| `new Audio()` / `AudioContext`      | `my.createInnerAudioContext`                          |
| `canvas.getContext`                 | `my.createCanvasContext`                              |
| `video.play()`                      | `my.createVideoContext(id).play()`                    |
| `navigator.clipboard.writeText`     | `my.setClipboard({ text })`                           |
| `window.open(url)`                  | `my.navigateToMiniProgram` or `<web-view>`            |
| `navigator.onLine`                  | `my.getNetworkType`                                   |
| `Geolocation API`                   | `my.getLocation` / `my.chooseLocation`                |
| `MediaDevices.getUserMedia`         | `my.chooseImage` / `my.chooseVideo`                   |
