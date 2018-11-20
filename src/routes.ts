export default [
	{
		path: 'home',
		outlet: 'home',
		defaultRoute: true
	},
	{
		path: 'blog',
		outlet: 'blog'
	},
	{
		path: 'examples',
		outlet: 'examples'
	},
	{
		path: 'playground',
		outlet: 'playground'
	},
	{
		path: 'community',
		outlet: 'community'
	},
	{
		path: '{section}/{page}',
		outlet: 'page'
	}
];
