import { PlatformToken } from "./platform-tokens";

export class BuyOrder{
    public Id: string;
    public BuyingTokenId: number;
    public BuyingToken: PlatformToken;
    public CreationVolume: number;
    public BuyingVolume: number;
    public TargetTokenId: number;
    public TargetToken: PlatformToken;
    public TargetVolume: number;
    public FeeTokenId: number;
    public FeeToken: PlatformToken;
    public BuyerSign: string;
    public BuyerHash: string;
    public Created: string;
    public UserId: number;
    public BuyerAccountId: string;
    public CreationBlock: number;
    public ExpiringBlock: number;
    public Status: string;
    public EnableForOrderMatch: boolean;
}

export class SellOrder{
    public Id: string;
    public SellingTokenId: number;
    public SellingToken: PlatformToken;
    public CreationVolume: number;
    public SellingVolume: number;
    public TargetTokenId: number;
    public TargetToken: PlatformToken;
    public TargetVolume: number;
    public FeeTokenId: number;
    public FeeToken: PlatformToken;
    public SellerSign: string;
    public SellerHash: string;
    public Created: string;
    public UserId: number;
    public SellerAccountId: string;
    public CreationBlock: number;
    public ExpiringBlock: number;
    public Status: string;
    public EnableForOrderMatch: boolean;
}

export class UserOrders{
    public BuyOrders: Array<BuyOrder>;
    public SellOrders: Array<SellOrder>;
}