import { HealthCareTemplatePage } from './app.po';

describe('HealthCare App', function () {
    let page: HealthCareTemplatePage;

    beforeEach(() => {
        page = new HealthCareTemplatePage();
    });

    it('should display message saying app works', () => {
        page.navigateTo();
        expect(page.getParagraphText()).toEqual('app works!');
    });
});
