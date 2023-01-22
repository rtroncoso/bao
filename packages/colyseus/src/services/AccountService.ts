import { APIService } from './APIService';

export class AccountService extends APIService {
  findOne = (id: string | number) => this.instance.get(`/admin/accounts/${id}`);
}
