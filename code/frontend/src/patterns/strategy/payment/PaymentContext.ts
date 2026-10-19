/**
 * [STRATEGY PATTERN] - PaymentContext
 * Lớp điều phối (Context) trong mẫu thiết kế Strategy.
 * Chịu trách nhiệm quản lý và thực thi chiến lược thanh toán được lựa chọn tại runtime.
 */

import { IPaymentStrategy, PaymentParams, PaymentResult } from './PaymentStrategy';
import { VietQRStrategy } from './VietQRStrategy';
import { MoMoStrategy } from './MoMoStrategy';
import { VNPayStrategy } from './VNPayStrategy';
import { ZaloPayStrategy } from './ZaloPayStrategy';

export class PaymentContext {
  private strategy: IPaymentStrategy;
  private readonly strategies: Map<string, IPaymentStrategy> = new Map();

  constructor(initialStrategyId: string = 'card') {
    // Đăng ký danh sách các Strategy cụ thể vào Registry
    this.registerStrategy(new VietQRStrategy());
    this.registerStrategy(new MoMoStrategy());
    this.registerStrategy(new VNPayStrategy());
    this.registerStrategy(new ZaloPayStrategy());

    this.strategy = this.strategies.get(initialStrategyId) || new VietQRStrategy();
  }

  public registerStrategy(strategy: IPaymentStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  public setStrategy(strategyOrId: IPaymentStrategy | string): void {
    if (typeof strategyOrId === 'string') {
      const found = this.strategies.get(strategyOrId);
      if (!found) {
        console.warn(`[PaymentContext] Chiến lược thanh toán "${strategyOrId}" chưa được hỗ trợ. Dùng mặc định VietQR.`);
        this.strategy = this.strategies.get('card')!;
        return;
      }
      this.strategy = found;
    } else {
      this.strategy = strategyOrId;
    }
  }

  public getStrategy(): IPaymentStrategy {
    return this.strategy;
  }

  public getAllStrategies(): IPaymentStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Thực thi chiến lược thanh toán hiện hành
   */
  public executePayment(params: PaymentParams): PaymentResult {
    if (!this.strategy) {
      throw new Error('Chưa thiết lập phương thức thanh toán.');
    }
    return this.strategy.generatePaymentData(params);
  }
}
