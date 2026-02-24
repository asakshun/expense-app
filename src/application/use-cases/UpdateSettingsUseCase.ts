import { StartDay } from '../../domain/value-objects/Period';
import { SettingsRepository } from '../repositories/SettingsRepository';

export interface UpdateSettingsInput {
  startDay: StartDay;
}

export type UpdateSettingsOutput = 
  | { success: true }
  | { success: false; error: string };

export interface UpdateSettingsUseCase {
  execute(input: UpdateSettingsInput): Promise<UpdateSettingsOutput>;
}

export class UpdateSettingsUseCaseImpl implements UpdateSettingsUseCase {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async execute(input: UpdateSettingsInput): Promise<UpdateSettingsOutput> {
    try {
      // Get current settings
      const settings = await this.settingsRepository.get();

      // Update start day
      settings.updateStartDay(input.startDay);

      // Save updated settings
      await this.settingsRepository.save(settings);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: '一時的なエラーが発生しました。\nしばらくしてから再度お試しください。'
      };
    }
  }
}
