import { BuyOrder, SellOrder } from "./order.model";

export class OrderTransaction{
    public Id: number;
    public TransactionId: string;
    public BuyerAccountId: string;
    public SellerAccountId: string;
    public TransactionValue: number;
    public BuyOrderId: string;
    public BuyOrder: BuyOrder;
    public SellOrderId: string;
    public SellOrder: SellOrder;
    public Created: string;
    public Status: string;
}