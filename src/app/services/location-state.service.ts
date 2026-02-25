import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocationStateService {
  private addressData: any = null;

  setAddressData(data: any) {
    this.addressData = data;
  }

  getAddressData() {
    const data = this.addressData;
    this.addressData = null;
    return data;
  }
}
