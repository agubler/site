import { tsx } from '@dojo/framework/core/vdom';
import harness from '@dojo/framework/testing/harness';
import assertionTemplate from '@dojo/framework/testing/assertionTemplate';
import block from '@dojo/framework/core/middleware/block';
import { createMockBlockMiddleware } from '../test/util/mockBlock';

import roadmapMetadataBlock from '../scripts/roadmap-metadata.block';
import Card from '../widgets/card/Card';
import CardHeader from '../widgets/card/CardHeader';
import FontAwesomeIcon from '../widgets/icon/FontAwesomeIcon';
import LocalPage from '../widgets/page/LocalPage';
import Page from '../widgets/page/Page';

import Roadmap from './Roadmap';
import * as css from './Roadmap.m.css';

jest.mock('@dojo/framework/i18n/i18n', () => ({
	default: {
		locale: 'en-US'
	}
}));
jest.mock('../scripts/roadmap-metadata.block');

describe('Roadmap Page', () => {
	const baseAssertion = assertionTemplate(() => (
		<Page classes={{ 'dojo.io/Page': { root: [css.root], content: [css.pageContent] } }}>
			<h1 classes={css.header}>What's coming up</h1>
			<div key="timeline" classes={css.timeline} />
		</Page>
	));

	it('renders', () => {
		const roadMapBlockStub = jest.fn().mockReturnValue([
			{
				file: 'roadmap/en/dojo-6.0.0-release.md',
				title: 'Dojo 6',
				date: 'Q2 2019',
				sortDate: '2019-06-30T23:59:00.000Z',
				released: false
			},
			{
				file: 'roadmap/en/dojo-5.0.0-release.md',
				title: 'Dojo 5',
				date: 'January 2019',
				sortDate: '2019-01-31T23:59:00.000Z',
				released: true
			}
		]);
		const mockBlock = createMockBlockMiddleware([[roadmapMetadataBlock, roadMapBlockStub]]);
		const h = harness(() => <Roadmap />, { middleware: [[block, mockBlock]] });

		h.expect(
			baseAssertion.setChildren('@timeline', () => [
				<div classes={[css.timelineEntry, null]}>
					<div classes={css.timelineDate}>Q2 2019</div>
					<div classes={css.timelineDetails}>
						<div classes={css.timelineMarker}>
							<FontAwesomeIcon
								classes={{ 'dojo.io/FontAwesomeIcon': { root: [css.timelineIcon] } }}
								icon={'box'}
							/>
						</div>
						<Card
							header={
								<CardHeader
									title="Dojo 6"
									classes={{ 'dojo.io/CardHeader': { root: [css.cardHeader] } }}
								/>
							}
							classes={{ 'dojo.io/Card': { root: [css.card], content: [css.content] } }}
						>
							<LocalPage path={`roadmap/en/dojo-6.0.0-release.md`} wrapInPage={false} />
						</Card>
					</div>
				</div>,
				<div classes={[css.timelineEntry, css.released]}>
					<div classes={css.timelineDate}>January 2019</div>
					<div classes={css.timelineDetails}>
						<div classes={css.timelineMarker}>
							<FontAwesomeIcon
								classes={{ 'dojo.io/FontAwesomeIcon': { root: [css.timelineIcon] } }}
								icon={'box-open'}
							/>
						</div>
						<Card
							header={
								<CardHeader
									title="Dojo 5"
									classes={{ 'dojo.io/CardHeader': { root: [css.cardHeader] } }}
								/>
							}
							classes={{ 'dojo.io/Card': { root: [css.card], content: [css.content] } }}
						>
							<LocalPage path={`roadmap/en/dojo-5.0.0-release.md`} wrapInPage={false} />
						</Card>
					</div>
				</div>
			])
		);

		expect(roadMapBlockStub).toHaveBeenCalledWith({ locale: 'en' });
	});

	it('renders empty timeline if block returns undefined', () => {
		const roadMapBlockStub = jest.fn().mockReturnValue(undefined);
		const mockBlock = createMockBlockMiddleware([[roadmapMetadataBlock, roadMapBlockStub]]);
		const h = harness(() => <Roadmap />, { middleware: [[block, mockBlock]] });

		h.expect(baseAssertion);

		expect(roadMapBlockStub).toHaveBeenCalledWith({ locale: 'en' });
	});
});
