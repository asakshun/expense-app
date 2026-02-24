import { Client } from '@notionhq/client';
import { NotionExpenseGateway } from '../gateways/NotionExpenseGateway';
import { NotionSettingsGateway } from '../gateways/NotionSettingsGateway';
import { RecordExpenseUseCaseImpl } from '../../application/use-cases/RecordExpenseUseCase';
import { GetExpenseSummaryUseCaseImpl } from '../../application/use-cases/GetExpenseSummaryUseCase';
import { UpdateSettingsUseCaseImpl } from '../../application/use-cases/UpdateSettingsUseCase';
import { UpdateExpenseCategoryUseCaseImpl } from '../../application/use-cases/UpdateExpenseCategoryUseCase';
import { WebhookPresenterImpl } from '../../presentation/presenters/WebhookPresenter';
import { LIFFPresenterImpl } from '../../presentation/presenters/LIFFPresenter';
import { getNotionConfig } from '../config/NotionConfig';

/**
 * LINE API設定
 */
export interface LineConfig {
  channelSecret: string;
  channelAccessToken: string;
}

/**
 * 環境変数からLINE設定を取得
 */
export function getLineConfig(): LineConfig {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!channelSecret) {
    throw new Error('LINE_CHANNEL_SECRET environment variable is required');
  }

  if (!channelAccessToken) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN environment variable is required');
  }

  return {
    channelSecret,
    channelAccessToken,
  };
}

/**
 * DIコンテナ
 * アプリケーション全体の依存関係を管理
 */
export class Container {
  private static instance: Container;
  
  private readonly notionClient: Client;
  private readonly notionExpenseGateway: NotionExpenseGateway;
  private readonly notionSettingsGateway: NotionSettingsGateway;
  private readonly recordExpenseUseCase: RecordExpenseUseCaseImpl;
  private readonly getExpenseSummaryUseCase: GetExpenseSummaryUseCaseImpl;
  private readonly updateSettingsUseCase: UpdateSettingsUseCaseImpl;
  private readonly updateExpenseCategoryUseCase: UpdateExpenseCategoryUseCaseImpl;
  private readonly webhookPresenter: WebhookPresenterImpl;
  private readonly liffPresenter: LIFFPresenterImpl;
  private readonly lineConfig: LineConfig;

  private constructor() {
    // Notion設定の取得
    const notionConfig = getNotionConfig();
    
    // LINE設定の取得
    this.lineConfig = getLineConfig();

    // Notionクライアントの初期化
    this.notionClient = new Client({ auth: notionConfig.apiKey });

    // ゲートウェイ（リポジトリ実装）の初期化
    this.notionExpenseGateway = new NotionExpenseGateway(
      this.notionClient,
      notionConfig.expenseDatabaseId
    );

    this.notionSettingsGateway = new NotionSettingsGateway(
      this.notionClient,
      notionConfig.settingsDatabaseId
    );

    // ユースケースの初期化
    this.recordExpenseUseCase = new RecordExpenseUseCaseImpl(
      this.notionExpenseGateway
    );

    this.getExpenseSummaryUseCase = new GetExpenseSummaryUseCaseImpl(
      this.notionExpenseGateway,
      this.notionSettingsGateway
    );

    this.updateSettingsUseCase = new UpdateSettingsUseCaseImpl(
      this.notionSettingsGateway
    );

    this.updateExpenseCategoryUseCase = new UpdateExpenseCategoryUseCaseImpl(
      this.notionExpenseGateway
    );

    // プレゼンターの初期化
    this.webhookPresenter = new WebhookPresenterImpl(
      this.recordExpenseUseCase,
      this.updateExpenseCategoryUseCase
    );

    this.liffPresenter = new LIFFPresenterImpl(
      this.getExpenseSummaryUseCase,
      this.updateSettingsUseCase
    );
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * テスト用にインスタンスをリセット
   */
  public static resetInstance(): void {
    Container.instance = undefined as any;
  }

  // Getters for dependencies
  public getNotionClient(): Client {
    return this.notionClient;
  }

  public getNotionExpenseGateway(): NotionExpenseGateway {
    return this.notionExpenseGateway;
  }

  public getNotionSettingsGateway(): NotionSettingsGateway {
    return this.notionSettingsGateway;
  }

  public getRecordExpenseUseCase(): RecordExpenseUseCaseImpl {
    return this.recordExpenseUseCase;
  }

  public getGetExpenseSummaryUseCase(): GetExpenseSummaryUseCaseImpl {
    return this.getExpenseSummaryUseCase;
  }

  public getUpdateSettingsUseCase(): UpdateSettingsUseCaseImpl {
    return this.updateSettingsUseCase;
  }

  public getUpdateExpenseCategoryUseCase(): UpdateExpenseCategoryUseCaseImpl {
    return this.updateExpenseCategoryUseCase;
  }

  public getWebhookPresenter(): WebhookPresenterImpl {
    return this.webhookPresenter;
  }

  public getLIFFPresenter(): LIFFPresenterImpl {
    return this.liffPresenter;
  }

  public getLineConfig(): LineConfig {
    return this.lineConfig;
  }
}
