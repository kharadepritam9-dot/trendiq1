import { NormalizedCreatorProfile } from '../../types/normalized';

export interface InstagramAdapter {
  getProfile(): Promise<NormalizedCreatorProfile>;
}
