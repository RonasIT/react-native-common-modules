import AsyncStorage from '@react-native-async-storage/async-storage';
import { isNil } from 'lodash';
import { StorageItem } from './item';

export class AsyncStorageItem implements StorageItem {
  constructor(private key: string) {}

  public async set(value: string | null): Promise<void> {
    if (isNil(value)) {
      await this.remove();
    } else {
      await AsyncStorage.setItem(this.key, value);
    }
  }

  public get(): Promise<string | null> {
    return AsyncStorage.getItem(this.key);
  }

  public async remove(): Promise<void> {
    await AsyncStorage.removeItem(this.key);
  }
}
