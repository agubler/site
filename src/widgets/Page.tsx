import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { tsx } from '@dojo/framework/widget-core/tsx';
import * as css from './Page.m.css';

export interface PageParameters {
	path: string;
}

export default class Page extends WidgetBase<PageParameters> {
	private _cache: any = {};
	private _getTutorial(path: string) {
		if (this._cache[path]) {
			return this._cache[path];
		}
		import(`./../generated/${path}`).then((module) => {
			console.log(module);
			this._cache[path] = module.default;
			this.invalidate();
		});
		return null;
	}

	protected render() {
		const { path } = this.properties;
		return <div classes={css.root}>{this._getTutorial(path)}</div>;
	}
}
