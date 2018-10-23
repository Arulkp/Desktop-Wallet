import { Asset, AssetSummary } from "./asset.model";
import { Quote } from "./quote.model";

export class Portfolio{
    public AskPriceInWand: number;
    public AssetEquivalent: string;
    public Assets: Array<Asset>;
    public UserAccount: string;
    public PortfolioId: string;
    public PortfolioName: string;
    public ShortOwner: string;
    public CurrentValuationInWand: number;
    public CreationPriceInWand: number;
    public SellerHash: string;
    public SellerSignature: string;
    public CreationTimestamp: number;
    public ChartData: any;
}

export class BuyablePortfolio extends Portfolio{
    public Quotes: Array<Quote>; 
}

export class SellablePortfolio extends Portfolio{
    public Quotes: Array<Quote>; 
}
