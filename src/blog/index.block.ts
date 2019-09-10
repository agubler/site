import { join } from 'canonical-path';
import { readdir, readFile, existsSync } from 'fs-extra';

import metadata from '../common/metadata';
import { createBlogFeed } from './rss';

const CONTENT_PATH = join(__dirname, '../../content/blog');

interface CompileBlogIndex {
	language?: string;
	locale?: string;
}

export interface BlogFile {
	sortDate: Date;
	meta: {
		[key: string]: any;
	};
	file: string;
	content: string;
}

export default async function(options: CompileBlogIndex) {
	const { language = 'en', locale = 'en' } = options;

	let languageFolder;
	let contentPath;
	if (existsSync(join(CONTENT_PATH, language))) {
		contentPath = join(CONTENT_PATH, language);
		languageFolder = language;
	} else if (existsSync(join(CONTENT_PATH, locale))) {
		contentPath = join(CONTENT_PATH, locale);
		languageFolder = locale;
	} else {
		contentPath = join(CONTENT_PATH, 'en');
		languageFolder = 'en';
	}

	const files = await readdir(contentPath);
	const blogs: BlogFile[] = [];

	for (let file of files) {
		const content = await readFile(join(contentPath, file), 'utf-8');
		const blogMetaData = metadata(content);

		blogs.push({
			sortDate: new Date(`${blogMetaData.date}`),
			meta: blogMetaData,
			file: join('blog', languageFolder, file),
			content
		});
	}

	blogs.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

	createBlogFeed(blogs, languageFolder);

	return blogs.map((blog) => blog.file);
}
