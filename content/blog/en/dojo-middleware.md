---
title: How to use middleware to create reusable functionality across widgets
date: 2020-03-17
author: Anthony Gubler & Rene Rubalcava
---

![Dojo middleware image](assets/blog/dojo-middleware/featured.png)

<!-- more -->

Dojo provides a [middleware system](https://dojo.io/learn/middleware/introduction) for developing widgets for your applications. There is a comprehensive list of [available middleware](https://dojo.io/learn/middleware/available-middleware) for managing local widget state, styling, or DOM related information.

Middleware are really interesting because they can help you interact with the DOM or with the properties of your widget with retaining a reactive architecture.

Middleware gets created with the same factory used to create a widget, except instead of returning a `vnode`, an object or function gets returned defining the API of the middleware and can get used to do some extra work for your widget.

The Dojo documentation touches on [creating your own middleware](https://dojo.io/learn/middleware/middleware-fundamentals#creating-middleware). How could you implement your own custom middleware for your own widgets?

## Validation Middleware

Maybe we're building form-based widgets and we want to provide our own validation. For example, we might want to validate that a phone number is entered correctly.

In this case, we're interested in wrapping an input in some form of validation. First, we need to create a `PhoneValidator` widget to wrap DOM `input`. The result would look something like this:

> src/widgets/PhoneNumber.tsx

```tsx
import { create, tsx } from '@dojo/framework/core/vdom';
import icache from '@dojo/framework/core/middleware/icache';

import PhoneValidator from './PhoneValidator';

import * as css from './styles/PhoneNumber.m.css';

const factory = create({ icache });

export const PhoneNumber = factory(function PhoneNumber({ middleware: { icache } }) {
	// use local phone value to pass to validator
	const phone = icache.getOrSet('phone', '');
	return (
		<PhoneValidator phone={phone}>
			<input
				placeholder="Enter phone number"
				pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
				required
				classes={[css.root]}
				type="tel"
				onkeyup={(e) => {
					icache.set('phone', (e.target as HTMLInputElement).value);
				}}
			/>
		</PhoneValidator>
	);
});

export default PhoneNumber;
```

Here we want the `PhoneValidator` to place a red or green outline to the input to inform the user if it's a valid phone number or not. It's pretty simple, but is something that could be reused across multiple applications.

> src/widgets/PhoneValidator.tsx

```tsx
import { create, tsx } from '@dojo/framework/core/vdom';
import phoneNumber from '../middleware/phoneNumber';

import * as css from './styles/PhoneValidator.m.css';

const factory = create({ phoneNumber });

export const PhoneValidator = factory(function PhoneValidator({ children, middleware: { phoneNumber } }) {
	const { valid, value } = phoneNumber();
	const validCss = (validCss = valid ? css.valid : css.invalid);
	return <div classes={[css.root, value.length && validCss]}>{children()}</div>;
});

export default PhoneValidator;
```

The `PhoneValidator` uses middleware that returns the a `valid` property that is either `true` or `false`. The middle will also return the `value` of the phone number that was tested. Based on whether the phone number is valid or not, it will provide CSS for a red or green border.

Notice that the `phone` property to the middleware is not passed explicitly to the middleware. By providing the `phoneNumber` as a middleware to the `PhoneValidator` widget, the middleware gets access to the properties of the widget. Let's see what that looks like:

> src/middleware/phoneNumber.ts

```tsx
import { create } from '@dojo/framework/core/vdom';

const factory = create().properties<{ phone: string }>();

export const phoneNumber = factory(({ properties }) => {
	return () => {
		// extract the `phone` value from the properties of
		// the parent widget
		const { phone } = properties();
		// test the phone number
		const valid = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(phone);
		return {
			valid,
			value: phone
		};
	};
});

export default phoneNumber;
```

The middleware returns a function that tests the phone number and returns whether it is valid or not.

View this middleware example in a [sample phone validation application](https://codesandbox.io/embed/dojo-custom-middleware-ktivf?fontsize=14&module=%2Fsrc%2Fmiddleware%2FphoneNumberMiddleware.ts).

## Geolocation Middleware

You could also create some fun middleware that interacts with the DOM of your widgets. For example, there are the [`intersection`](https://dojo.io/learn/middleware/available-middleware#intersection) and [`resize`](https://dojo.io/learn/middleware/available-middleware#resize) middleware.

You could use a similar pattern to grab the browser's geolocation coordinates.

> src/middleware/geolocation.ts

```tsx
import { create } from '@dojo/framework/core/vdom';
import icache from '@dojo/framework/core/middleware/icache';

const factory = create({ icache });

type Coords = Pick<Coordinates, 'latitude' | 'longitude'>;

export const geolocation = factory(({ middleware: { icache } }) => {
	return (): Coords | undefined => {
		return icache.getOrSet('coords', async () => {
			return new Promise((resolve) => {
				if (!('geolocation' in navigator)) {
					resolve();
				}
				navigator.geolocation.getCurrentPosition(({ coords }) => {
					const { latitude, longitude } = coords;
					resolve({ latitude, longitude });
				});
			});
		});
	};
});

export default geolocation;
```

This geolocation middleware examples uses the [`icache`](https://dojo.io/learn/middleware/available-middleware#icache) middleware. When the geolocation properties get updated, `icache` will invalidate the geolocation middleware, which then invalidates the widget so the widget can get re-rendered with new geolocation data.

> src/main.tsx

```tsx
import { renderer, create, tsx } from '@dojo/framework/core/vdom';
import '@dojo/themes/dojo/index.css';

import Hello from './widgets/Hello';

import geolocation from './middleware/geolocation';

const factory = create({ geolocation });

const App = factory(function App({ middleware: { geolocation } }) {
	// get the current coordinates
	const coords = geolocation();
	return (
		<div key="container">
			<Hello name="Dojo CodeSandbox" />
			<h2>{'Start editing to see some magic happen \u2728'}</h2>
			<section>
				{coords && (
					<ul>
						<li>Latitude: {coords.latitude.toFixed(3)}</li>
						<li>Longitude: {coords.longitude.toFixed(3)}</li>
					</ul>
				)}
			</section>
		</div>
	);
});
```

View a [complete demo with geolocation middleware](https://codesandbox.io/embed/dojo-geolocation-middleware-9bnm2?fontsize=14&module=%2Fsrc%2Fmiddleware%2Fgeolocation.ts). You may need to open it in a new window to get your location.

## Summary

There are numerous ways you could build middleware for your applications. Device orientation, mouse interactivity, media queries, hardware devices, drag-n-drop, full screen, authentication, and so much more. We're looking forward to seeing all the different ways middleware can be implemented into Dojo widgets!

Adapted with permission from Rene Rubalcava's original [Dojo custom middleware post on learn-dojo](https://learn-dojo.com/dojo-custom-middleware/).
