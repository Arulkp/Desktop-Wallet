export class AssetSummary{
    public BTC: number;
    public ETH: number;
    public EUR: number;
    public USD: number;
    public WAND: number;
};

export class ConversionRates{
    public BTC: number;
    public ETH: number;
    public EUR: number;
    public USD: number;
};

export class Asset{
    public Available: number;
    public CoinName: string;
    public AssetId: string;
    public Symbol: string;
    public Reqbalance: string;
    public Status: string;
};

export class AssetAnalysis{
    public assets: Array<Asset>;
    public overall: AssetSummary;
}