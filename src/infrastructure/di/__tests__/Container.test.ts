import { Container } from '../Container';

describe('Container', () => {
  beforeEach(() => {
    // 環境変数を設定
    process.env.NOTION_API_KEY = 'test_api_key';
    process.env.NOTION_EXPENSE_DATABASE_ID = 'test_expense_db_id';
    process.env.NOTION_SETTINGS_DATABASE_ID = 'test_settings_db_id';
    process.env.LINE_CHANNEL_SECRET = 'test_channel_secret';
    process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test_access_token';
    
    // インスタンスをリセット
    Container.resetInstance();
  });

  afterEach(() => {
    // 環境変数をクリア
    delete process.env.NOTION_API_KEY;
    delete process.env.NOTION_EXPENSE_DATABASE_ID;
    delete process.env.NOTION_SETTINGS_DATABASE_ID;
    delete process.env.LINE_CHANNEL_SECRET;
    delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
  });

  it('should create a singleton instance', () => {
    const instance1 = Container.getInstance();
    const instance2 = Container.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('should provide Notion client', () => {
    const container = Container.getInstance();
    const notionClient = container.getNotionClient();
    
    expect(notionClient).toBeDefined();
  });

  it('should provide expense gateway', () => {
    const container = Container.getInstance();
    const gateway = container.getNotionExpenseGateway();
    
    expect(gateway).toBeDefined();
  });

  it('should provide settings gateway', () => {
    const container = Container.getInstance();
    const gateway = container.getNotionSettingsGateway();
    
    expect(gateway).toBeDefined();
  });

  it('should provide record expense use case', () => {
    const container = Container.getInstance();
    const useCase = container.getRecordExpenseUseCase();
    
    expect(useCase).toBeDefined();
  });

  it('should provide get expense summary use case', () => {
    const container = Container.getInstance();
    const useCase = container.getGetExpenseSummaryUseCase();
    
    expect(useCase).toBeDefined();
  });

  it('should provide update settings use case', () => {
    const container = Container.getInstance();
    const useCase = container.getUpdateSettingsUseCase();
    
    expect(useCase).toBeDefined();
  });

  it('should provide webhook presenter', () => {
    const container = Container.getInstance();
    const presenter = container.getWebhookPresenter();
    
    expect(presenter).toBeDefined();
  });

  it('should provide LIFF presenter', () => {
    const container = Container.getInstance();
    const presenter = container.getLIFFPresenter();
    
    expect(presenter).toBeDefined();
  });

  it('should provide LINE config', () => {
    const container = Container.getInstance();
    const config = container.getLineConfig();
    
    expect(config).toBeDefined();
    expect(config.channelSecret).toBe('test_channel_secret');
    expect(config.channelAccessToken).toBe('test_access_token');
  });

  it('should throw error when NOTION_API_KEY is missing', () => {
    delete process.env.NOTION_API_KEY;
    Container.resetInstance();
    
    expect(() => Container.getInstance()).toThrow('NOTION_API_KEY environment variable is required');
  });

  it('should throw error when LINE_CHANNEL_SECRET is missing', () => {
    delete process.env.LINE_CHANNEL_SECRET;
    Container.resetInstance();
    
    expect(() => Container.getInstance()).toThrow('LINE_CHANNEL_SECRET environment variable is required');
  });
});
