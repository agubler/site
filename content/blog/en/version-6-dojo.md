---
title: Announcing Dojo 6
date: 2019-07-30T08:00:00.000Z
author: Anthony Gubler
---

Since the first major Dojo release last year, we have been working to refine the features and patterns to make Dojo an even more efficient framework for building applications with TypeScript and modern web APIs.

In a world of semantic versioning where even minor breaking changes require a new version number, it is challenging to know when a new version is substantial. Today, we’re excited to announce version 6, our most ambitious set of improvements since the Dojo 2.0 release.

Version 6 of Dojo brings many new features and changes to substantially improve the development experience when creating applications with Dojo by reducing boilerplate, increasing flexibility, and further improving performance.

![The image for the blog](assets/blog/version-6-dojo/featured.png)
<!-- more -->

## Function Based Widgets and Middleware

We are very excited to introduce function-based widgets and middleware, the next evolution for creating and working with widgets in Dojo. Function-based widgets and middleware offer an alternative API for Dojo widgets to the existing class-based APIs (metas, decorators, mixins). A single API for both widgets and middleware helps improve developer ergonomics and reduce the complexity and boilerplate with previous releases of Dojo, making it even easier to get started with Dojo.

What is middleware? Middleware is the singular concept designed to replace all existing supplemental widget patterns, mixins, metas and decorators. A natural progression from the functional and reactive meta API, middleware provides a mechanism that not only facilitates working with imperative and asynchronous APIs reactively, but can get composed with other middleware and also affect a widget’s property interface.

The core primitive for working with function-based widgets and middleware is a new function, `create`, provided by the `vdom` module. The `create` function gets used for defining middleware and properties and returns a factory for creating either widgets or middleware.

> src/MyWidget.tsx
```tsx
import { create, tsx } from '@dojo/framework/core/vdom';

interface MyWidgetProperties {
	label: string;
}

const render = create().properties<MyWidgetProperties>();

export default render(function MyWidget({ properties, children }) {
  const { label } = properties();
	return (
		<div>
			<span>{label}</span>
			<div>{children()}<div>
		</div>
	);
});
```

As mentioned, the middleware design supports composition in order to create advanced custom functionality. The majority of middlewares will build on the set of core middlewares which provide hooks into Dojo’s rendering engine. For more information on the core middleware please see the [Dojo reference guide](/learn/middleware/core-render-middleware).

In addition to the core middleware, we've created a selection of [higher-level middleware](/learn/middleware/available-middleware) for function-based widgets. These middlewares provide the features and functionality found in most of the existing metas and mixins from working with class-based widgets.

A common pattern used in class-based widgets is to use class properties to store local state for the widget. With function-based widgets this presents a challenge as there is no mechanism to persist state across widget renders. This is where the `icache` middleware, meaning invalidating cache, comes to the forefront. We believe `icache` being one of the most commonly middlewares when building function-based widgets.

Example simple counter class-based widget using class properties to store the "counter" state and class methods:

> src/ClassCounter.tsx
```tsx
import { tsx } from "@dojo/framework/core/vdom";
import WidgetBase from "@dojo/framework/core/WidgetBase";
import watch from "@dojo/framework/core/decorators/watch";

import * as css from "./Counter.m.css";

interface ClassCounterProperties {
  incrementStep?: number;
}

export class ClassCounter extends WidgetBase<ClassCounterProperties> {
  @watch() private _count = 0;

  private _decrement() {
    const { incrementStep = 1 } = this.properties;
    this._count = this._count - incrementStep;
  }

  private _increment() {
    const { incrementStep = 1 } = this.properties;
    this._count = this._count + incrementStep;
  }

  protected render() {
    return (
      <div classes={[css.root]}>
        <button
          onclick={this._decrement}
          classes={[css.button, css.decrement]}
        />
        <div classes={[css.counter]}>{`${this._count}`}</div>
        <button
          onclick={this._increment}
          classes={[css.button, css.increment]}
        />
      </div>
    );
  }
}
```

Using function-based widgets, we define `icache` middleware for the widget factory so that we can store the counter state across renders. Notice that when we call set on the `icache` we don't need to manually `invalidate` the widget as `icache` implicitly invalidates when a value is set.

> src/FunctionalCounter.tsx
```tsx
interface FunctionalCounterProperties {
  incrementStep?: number;
}

const factory = create({ icache }).properties<FunctionalCounterProperties>();

export const FunctionalCounter = factory(function FunctionalCounter({
  middleware: { icache },
  properties
}) {
  const { incrementStep } = properties();
  const count = icache.get<number>("count") || 0;
  return (
    <div classes={[css.root]}>
      <button
        onclick={() => {
          icache.set("count", count - incrementStep);
        }}
        classes={[css.button, css.decrement]}
      />
      <div classes={[css.counter]}>{`${count}`}</div>
      <button
        onclick={() => {
          icache.set("count", count + incrementStep);
        }}
        classes={[css.button, css.increment]}
      />
    </div>
  );
});
```

For more information please see the [middleware reference guides](/learn/middleware/introduction) or some of the middleware examples on codesandbox:

 * [`theme` middleware](https://codesandbox.io/s/theme-middleware-4btv7)
 * [`icache` middleware](https://codesandbox.io/s/advanced-icache-middleware-teeig)

Don't worry, the existing class-based widget APIs are not going away! These enhancements are additive and backwards-compatible, providing what we believe to be an ergonomic improvement on top of the existing widget APIs.

We are really looking forward to seeing the fun and innovative middlewares from the Dojo community, and, as always, please let us know any feedback that you might have!

## Intelligent Custom Elements

Including Web Components as a first class citizen in Dojo is something that we’ve always been passionate about and now compiling your Dojo widgets to Custom Elements is _even_ easier. We’ve added support to intelligently compiling your Dojo widgets in to custom element, automatically detecting properties, attributes and events based on the widget’s property interface. 

With this enhancement there is no configuration required, other than defining the widget(s) in the `.dojorc` to instruct the `@dojo/cli-build-widget` to compile the widgets to custom elements. We think this is a significant improvement to current tooling that requires widgets to be explicitly configured with the custom element details. Doing so takes additional development effort, foresight and creates an additional maintenance burden of keep the configuration up to date with changes to widgets properties, this can be see below with the custom element configuration for an example widget.

Current configuration required for compiling a Dojo widget to a custom element:

> .dojorc
```json
{
  "build-widget": {
    "widgets": [
      "src/MyWidget"
    ]
  }
}
```

> src/MyWidget
```tsx
import { WidgetBase } from '@dojo/framework/core/WidgetBase';
import { customElement } from '@dojo/framework/core/decorators/customElement';
import { CustomElementChildType } from '@dojo/framework/core/registerCustomElement';

interface MyWidgetProperties {
  value: string;
  disabled: boolean;
  onInput: (input: value) => void;
}

@customElement<MyWidgetProperties>({
	tag: 'dojo-my-widget',
	childType: CustomElementChildType.TEXT,
	properties: ['disabled'],
	attributes: ['value'],
	events: [
		'onInput'
	]
})
class MyWidget extends WidgetBase<MyWidgetProperties> {
  protected render() {
    // rendering
  }
}
```

Using the build tool to intelligent configuration, requires only the `.dojorc` entry and will automatically include new, changed or removed properties.

> .dojorc
```json
{
  "build-widget": {
    "widgets": [
      "src/MyWidget"
    ]
  }
}
```

## BTR and Dojo Block Improvements

In version 5 of Dojo, we announced Dojo Blocks, a feature leveraging build time rendering (BTR) that brought the world of static site generation to Dojo. Since then we have been working on improving the experience including more intelligent block bundling, dynamic path registration and a full static mode. Building static and progressive websites has never been easier with Dojo.

Please check out our [example static blog site with Dojo on codesandbox](https://codesandbox.io/s/my-first-blog-bywnn).

## Widget Library Build

A long awaited and highly requested feature for Dojo has been support support for building Dojo widget libraries using the `@dojo/cli-build-widget` command. As part of Dojo 6 we're excited to include a library target for the first time. We are now using this to build the `@dojo/widgets` library and are very excited to see more Dojo widget libraries popping up throughout the community ❤️.

To build your widgets using `@dojo/cli-build-widget`, add list your widgets in the the `widgets` section of the `.dojorc` and run the build using the `--lib` option. The resulting build output is ready to be packaged consumed by other Dojo applications.

> .dojorc
```json
{
  "build-widget": {
    "widgets": [
      "src/MyWidget"
    ]
  }
}
```

> terminal
```shell
dojo build widget --lib
```

## Faster Development Builds

As projects grow in size the build time increase significantly too, the CLI build command now supports an experimental “fast” mode that can improve the build time of larger projects for development.

![experimental speed demo](assets/blog/version-6-dojo/speed.gif)

This shows an approximate saving of over 2 seconds building the [Dojo RealWorld example](https://github.com/dojo/examples/tree/master/realworld) with the experimental speed mode enabled. On larger Dojo projects we've witnessed more significant savings with development build times dropping by more than 50% having previously taking over 40 seconds, reducing to under 20 seconds using the new speed mode.

## Glob Support For Code Splitting

The `.dojorc` configuration for `bundles` has been enhanced to support globs. This especially useful for scenarios such as internationalization meaning that you don't have to define all the language bundles, instead simply define a matching pattern for each of the locales.

Consider a project with a folder structure that defines language bundles in locale named directories, ideally build tool would create a single bundle for each locale that would be loaded when users change locale. Using a glob provides a low maintenance and minimal effort way to do this over explicitly defining each language bundle modules in the `.dojorc`.

Current configuration required to create a bundle per locale:

> .dojorc
```json
{
  "build-app": {
    "bundles": {
      "fr": [ 
        "src/widgets/home/nls/fr/home.ts",
        "src/widgets/menu/nls/fr/menu.ts",
        "src/widgets/blog/nls/fr/blog.ts",
        "src/widgets/reference/nls/fr/reference.ts"
      ],
      "jp": [ 
        "src/widgets/home/nls/jp/home.ts",
        "src/widgets/menu/nls/jp/menu.ts",
        "src/widgets/blog/nls/jp/blog.ts",
        "src/widgets/reference/nls/jp/reference.ts"
      ]
    }
  }
}
```

Using the glob configuration to create a bundle per locale:

> .dojorc
```json
{
  "build-app": {
    "bundles": {
      "fr": [ "**/fr/*.ts" ],
      "jp": [ "**/jp/*.ts" ]
    }
  }
}
```

## Update to TypeScript

The minimum required TypeScript version has been updated to 3.4. Updating the core framework to use a recent version enables us to leverage the latest features that underpin the function-based widget and middleware typings.

## Revamped Doc Website

// TODO talk about the creation of the new doc website - using BTR and Blocks

## Migration

As usual all of the breaking changes introduced in Dojo 6 are carefully considered, so that we truly believe the benefits outweigh the upgrade effort. To assist with the transition we have updated the CLI upgrade command, which will automatically upgrade your Dojo dependencies, upgrade your application code where possible and highlight areas in the application that require manual intervention. For more information on what has changed in Dojo 6, please see the [migration guide](https://github.com/dojo/framework/blob/master/docs/V6-Migration-Guide.md).

## Support

See the [release notes](TODO: Add link) for more details on version 6.0.0 of Dojo!
Love what we’re doing or having a problem? We ❤️our community. [Reach out to us on Discord](https://discord.gg/M7yRngE), check out [the Dojo roadmap](/roadmap) and see where we are heading, and try out the new [Dojo on CodeSandbox][https://codesandbox.io/s/github/dojo/dojo-codesandbox-template]. We look forward to your feedback!
